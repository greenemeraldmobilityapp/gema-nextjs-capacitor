import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const XENDIT_SECRET_KEY = Deno.env.get('XENDIT_SECRET_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const token = authHeader.slice(7)
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_SERVICE_ROLE_KEY },
    })
    if (!userRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const user = await userRes.json()

    // Verify admin role
    const profileRes = await supabaseFetch(`/users?id=eq.${user.id}&select=role`)
    const profileData = await profileRes.json()
    if (profileData?.[0]?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: admin only' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const { tx_id } = await req.json()
    if (!tx_id) {
      return new Response(
        JSON.stringify({ error: 'tx_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Get transaction details
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

    // Call Xendit Disbursement API
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
      console.error('Xendit disbursement error:', xenditData)
      return new Response(
        JSON.stringify({ error: xenditData.message || 'Gagal memproses disbursement' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Update transaction to success
    const walletId = tx.wallet_id
    await supabaseFetch(`/wallet_transactions?id=eq.${tx_id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'success' }),
    })

    // Wallet balance was already deducted when transaction was created
    // (amount was stored as negative), so no need to deduct again.
    // If balance was NOT pre-deducted, uncomment below:
    // const walletRes = await supabaseFetch(`/wallets?id=eq.${walletId}&select=balance`)
    // const walletData = await walletRes.json()
    // await supabaseFetch(`/wallets?id=eq.${walletId}`, {
    //   method: 'PATCH',
    //   body: JSON.stringify({ balance: (walletData?.[0]?.balance || 0) - amount }),
    // })

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
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
