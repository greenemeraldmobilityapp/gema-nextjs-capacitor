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

serve(async (req) => {
  try {
    const callbackToken = req.headers.get('x-callback-token')
    if (callbackToken !== XENDIT_WEBHOOK_TOKEN) {
      console.error('Invalid webhook token')
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { external_id: orderId, status, paid_amount } = body

    if (!orderId) {
      return new Response('Missing external_id', { status: 400 })
    }

    console.log(`Webhook received: order=${orderId}, status=${status}`)

    if (status === 'PAID') {
      await supabaseFetch(`/orders?id=eq.${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ payment_status: 'escrow' }),
      })

      const orderRes = await supabaseFetch(
        `/orders?id=eq.${orderId}&select=vendor_id,vendor_payout`,
      )
      const orders = await orderRes.json()
      const order = orders?.[0]

      if (order?.vendor_id) {
        const walletRes = await supabaseFetch(
          `/wallets?user_id=eq.${order.vendor_id}&select=id,balance`,
        )
        const wallets = await walletRes.json()
        const wallet = wallets?.[0]

        if (wallet?.id) {
          await supabaseFetch('/wallet_transactions', {
            method: 'POST',
            body: JSON.stringify({
              wallet_id: wallet.id,
              type: 'payment',
              amount: paid_amount || order.vendor_payout,
              status: 'success',
            }),
          })

          await supabaseFetch(`/wallets?id=eq.${wallet.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
              balance: Number(wallet.balance) + Number(paid_amount || order.vendor_payout),
            }),
          })

          console.log(`Wallet ${wallet.id} updated: +${paid_amount || order.vendor_payout}`)
        }
      }
    } else if (status === 'EXPIRED') {
      console.log(`Invoice expired for order ${orderId}`)
    } else {
      console.log(`Unhandled webhook status: ${status} for order ${orderId}`)
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
})
