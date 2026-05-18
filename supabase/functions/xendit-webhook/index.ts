import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const XENDIT_WEBHOOK_TOKEN = Deno.env.get('XENDIT_WEBHOOK_TOKEN')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabaseFetch = (path: string, options: RequestInit = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      ...options.headers,
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
  })

async function creditWallet(walletId: string, amount: number): Promise<boolean> {
  const rpcRes = await supabaseFetch(`/rpc/credit_wallet`, {
    method: 'POST',
    body: JSON.stringify({ p_wallet_id: walletId, p_amount: amount }),
  })
  if (rpcRes.ok) return true
  // Fallback: direct update
  const walletRes = await supabaseFetch(`/wallets?id=eq.${walletId}&select=balance`)
  const walletData = await walletRes.json()
  const currentBalance = walletData?.[0]?.balance || 0
  const updateRes = await supabaseFetch(`/wallets?id=eq.${walletId}`, {
    method: 'PATCH',
    body: JSON.stringify({ balance: currentBalance + amount }),
  })
  return updateRes.ok
}

serve(async (req) => {
  try {
    const callbackToken = req.headers.get('x-callback-token')
    if (callbackToken !== XENDIT_WEBHOOK_TOKEN) {
      console.error('Invalid webhook token')
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()

    // ------------------------------------------------------------------
    // 1. payment_session webhook (new format with event wrapper)
    // ------------------------------------------------------------------
    if (body.event) {
      const event = body.event
      console.log(`Webhook received: event=${event}`)

      if (event === 'payment_session.expired') {
        const orderId = body.data?.reference_id
        if (!orderId) {
          return new Response('Missing reference_id', { status: 400 })
        }
        console.log(`Payment session expired for order ${orderId}`)
      } else {
        console.log(`Unhandled event: ${event}`)
      }

      return new Response('OK', { status: 200 })
    }

    const { external_id, status } = body

    if (!external_id) {
      // Might be a raw disbursement callback without external_id
      console.log('Webhook without external_id:', JSON.stringify(body))
      return new Response('OK', { status: 200 })
    }

    console.log(`Webhook received: external_id=${external_id}, status=${status}`)

    // ------------------------------------------------------------------
    // 2. DISBURSEMENT CALLBACK (external_id format: wd_{tx_id})
    // ------------------------------------------------------------------
    if (external_id.startsWith('wd_')) {
      const txId = external_id.replace('wd_', '')

      if (status === 'COMPLETED') {
        // Log success — transaction already marked success in create-disbursement EF
        console.log(`Disbursement ${txId} completed by Xendit`)
      } else if (status === 'FAILED') {
        console.log(`Disbursement ${txId} failed by Xendit`)

        // Get transaction to check current status
        const txRes = await supabaseFetch(
          `/wallet_transactions?id=eq.${txId}&select=status,wallet_id,amount`,
        )
        const txData = await txRes.json()
        const tx = txData?.[0]
        if (!tx) {
          console.error(`Disbursement tx ${txId} not found`)
          return new Response('Transaction not found', { status: 404 })
        }

        // Skip if already handled
        if (tx.status === 'failed') {
          console.log(`Disbursement ${txId} already marked failed, skipping`)
          return new Response('OK', { status: 200 })
        }

        // Refund wallet balance (amount is negative, so we add abs(amount) to refund)
        const refundAmount = Math.abs(tx.amount)
        await creditWallet(tx.wallet_id, refundAmount)

        // Mark transaction as failed
        await supabaseFetch(`/wallet_transactions?id=eq.${txId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'failed' }),
        })

        console.log(`Disbursement ${txId} refunded ${refundAmount} to wallet ${tx.wallet_id}`)
      } else {
        console.log(`Unhandled disbursement status: ${status} for ${external_id}`)
      }

      return new Response('OK', { status: 200 })
    }

    // ------------------------------------------------------------------
    // 3. INVOICE WEBHOOK — TOPUP FLOW (external_id starts with 'topup_')
    // ------------------------------------------------------------------
    if (status === 'PAID') {
      if (external_id.startsWith('topup_')) {
        const txId = external_id.replace('topup_', '')

        const checkRes = await supabaseFetch(
          `/wallet_transactions?id=eq.${txId}&select=status`,
        )
        const existing = await checkRes.json()
        if (existing?.[0]?.status === 'success') {
          console.log(`Topup ${txId} already processed, skipping`)
          return new Response('OK', { status: 200 })
        }

        const txRes = await supabaseFetch(
          `/wallet_transactions?id=eq.${txId}&select=wallet_id,amount`,
        )
        const txData = await txRes.json()
        const tx = txData?.[0]
        if (!tx) {
          console.error(`Topup transaction ${txId} not found`)
          return new Response('Transaction not found', { status: 404 })
        }

        await supabaseFetch(`/wallet_transactions?id=eq.${txId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'success' }),
        })

        const credited = await creditWallet(tx.wallet_id, tx.amount)
        if (credited) {
          console.log(`Topup ${txId} processed: ${tx.amount} credited to wallet ${tx.wallet_id}`)
        } else {
          console.error(`Topup ${txId}: failed to credit wallet ${tx.wallet_id}`)
        }
        return new Response('OK', { status: 200 })
      }

      // --- ORDER PAYMENT FLOW ---
      const orderId = external_id

      const checkRes = await supabaseFetch(
        `/orders?id=eq.${orderId}&select=payment_status`,
      )
      const existing = await checkRes.json()
      const currentStatus = existing?.[0]?.payment_status

      if (currentStatus && currentStatus !== 'unpaid') {
        console.log(`Order ${orderId} already processed (${currentStatus}), skipping`)
        return new Response('OK', { status: 200 })
      }

      await supabaseFetch(`/orders?id=eq.${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ payment_status: 'escrow' }),
      })

      console.log(`Order ${orderId} set to escrow`)
    } else if (status === 'EXPIRED') {
      if (external_id.startsWith('topup_')) {
        const txId = external_id.replace('topup_', '')
        await supabaseFetch(`/wallet_transactions?id=eq.${txId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'failed' }),
        })
        console.log(`Topup ${txId} expired, status set to failed`)
      } else {
        console.log(`Invoice expired for order ${external_id}`)
      }
    } else {
      console.log(`Unhandled webhook status: ${status} for ${external_id}`)
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
})
