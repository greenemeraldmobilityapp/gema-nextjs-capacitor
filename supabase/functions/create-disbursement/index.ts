import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const XENDIT_SECRET_KEY = Deno.env.get('XENDIT_SECRET_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const AUTO_DISBURSE_MAX = 5_000_000

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

async function verifyUser(authHeader: string | null): Promise<{ id: string; role: string; isVerified: boolean }> {
  if (!authHeader?.startsWith('Bearer ')) {
    throw { status: 401, message: 'Unauthorized' }
  }
  const token = authHeader.slice(7)
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_SERVICE_ROLE_KEY },
  })
  if (!userRes.ok) {
    throw { status: 401, message: 'Invalid token' }
  }
  const user = await userRes.json()

  const profileRes = await supabaseFetch(`/users?id=eq.${user.id}&select=role`)
  const profileData = await profileRes.json()
  const role = profileData?.[0]?.role || 'customer'

  let isVerified = false
  if (role === 'vendor') {
    const vendorRes = await supabaseFetch(`/vendor_profiles?user_id=eq.${user.id}&select=is_verified`)
    const vendorData = await vendorRes.json()
    isVerified = vendorData?.[0]?.is_verified === true
  }

  return { id: user.id, role, isVerified }
}

async function deductBalance(txId: string, walletId: string, amount: number): Promise<void> {
  const rpcRes = await supabaseFetch(`/rpc/credit_wallet`, {
    method: 'POST',
    body: JSON.stringify({ p_wallet_id: walletId, p_amount: -amount }),
  })
  if (!rpcRes.ok) {
    const errBody = await rpcRes.text()
    throw new Error(`Gagal debit saldo: ${errBody}`)
  }
}

async function refundBalance(walletId: string, amount: number): Promise<void> {
  const rpcRes = await supabaseFetch(`/rpc/credit_wallet`, {
    method: 'POST',
    body: JSON.stringify({ p_wallet_id: walletId, p_amount: amount }),
  })
  if (!rpcRes.ok) {
    console.error(`Refund failed for wallet ${walletId}: ${await rpcRes.text()}`)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const caller = await verifyUser(authHeader)

    const { tx_id } = await req.json()
    if (!tx_id) {
      return new Response(
        JSON.stringify({ error: 'tx_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const txRes = await supabaseFetch(
      `/wallet_transactions?id=eq.${tx_id}&select=*,wallets!inner(user_id)`,
    )
    const txData = await txRes.json()
    const tx = txData?.[0]

    if (!tx) {
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    if (tx.type !== 'withdrawal') {
      return new Response(
        JSON.stringify({ error: 'Not a withdrawal transaction' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    if (tx.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Transaction already processed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    if (!tx.bank_name || !tx.account_number || !tx.account_holder) {
      return new Response(
        JSON.stringify({ error: 'Bank details missing from transaction' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const amount = Math.abs(tx.amount)
    const walletId = tx.wallet_id

    // Authorization: admin always allowed
    // Verified vendor allowed if amount ≤ threshold AND tx belongs to them
    const isOwner = tx.wallets?.user_id === caller.id
    if (caller.role !== 'admin') {
      if (caller.role !== 'vendor' || !caller.isVerified || amount > AUTO_DISBURSE_MAX || !isOwner) {
        return new Response(
          JSON.stringify({ error: 'Forbidden: admin only, or verified vendor with amount ≤ Rp 5.000.000' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }
    }

    // Step 1: Deduct wallet balance (atomic, server-side)
    try {
      await deductBalance(tx_id, walletId, amount)
    } catch (deductErr) {
      return new Response(
        JSON.stringify({ error: `Gagal debit saldo: ${deductErr.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Step 2: Call Xendit Disbursement API
    const disbursementBody: Record<string, unknown> = {
      external_id: `wd_${tx_id}`,
      amount,
      bank_code: tx.bank_name.toUpperCase(),
      account_number: tx.account_number,
      account_holder_name: tx.account_holder,
      description: `Penarikan GEMA Wallet - Rp ${amount.toLocaleString('id-ID')}`,
    }

    const xenditRes = await fetch('https://api.xendit.co/v2/disbursements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(XENDIT_SECRET_KEY + ':')}`,
      },
      body: JSON.stringify(disbursementBody),
    })

    const xenditData = await xenditRes.json()

    if (!xenditRes.ok) {
      // Refund balance since Xendit failed
      console.error('Xendit disbursement error:', xenditData)
      await supabaseFetch(`/wallet_transactions?id=eq.${tx_id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'failed' }),
      })
      await refundBalance(walletId, amount)
      return new Response(
        JSON.stringify({
          error: xenditData.message || 'Gagal memproses disbursement',
          xendit_status: xenditData.status,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Step 3: Update transaction to success
    await supabaseFetch(`/wallet_transactions?id=eq.${tx_id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'success' }),
    })

    console.log(`Disbursement ${tx_id} processed: ${amount} to ${tx.bank_name} ${tx.account_number}`)

    return new Response(
      JSON.stringify({
        success: true,
        disbursement_id: xenditData.id,
        status: xenditData.status,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('create-disbursement error:', error)
    return new Response(
      JSON.stringify({ error: error.message || error }),
      { status: error.status || 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
