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
    const { wallet_id, amount, origin } = await req.json()
    if (!wallet_id || !amount) {
      return new Response(
        JSON.stringify({ error: 'wallet_id and amount are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }
    const baseUrl = origin || 'http://localhost:3000'

    if (amount < 10000) {
      return new Response(
        JSON.stringify({ error: 'Minimum topup is Rp 10.000' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 1. Create pending wallet transaction
    const txRes = await supabaseFetch('/wallet_transactions', {
      method: 'POST',
      headers: {
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        wallet_id,
        type: 'topup',
        amount,
        status: 'pending',
      }),
    })

    if (!txRes.ok) {
      const err = await txRes.text()
      console.error('Failed to create transaction:', err)
      throw new Error('Failed to create wallet transaction')
    }

    const transactions = await txRes.json()
    const transaction = transactions[0]

    // 2. Create Xendit invoice with external_id = topup_<tx_id>
    const externalId = `topup_${transaction.id}`
    const xenditRes = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(XENDIT_SECRET_KEY + ':')}`,
      },
      body: JSON.stringify({
        external_id: externalId,
        amount,
        description: `Top Up GEMA Wallet - Rp ${amount.toLocaleString('id-ID')}`,
        success_redirect_url: `${baseUrl}/wallet/topup/success?tx_id=${transaction.id}`,
        failure_redirect_url: `${baseUrl}/wallet/topup`,
        currency: 'IDR',
      }),
    })

    const data = await xenditRes.json()

    if (!xenditRes.ok) {
      // Rollback: delete pending transaction
      await supabaseFetch(`/wallet_transactions?id=eq.${transaction.id}`, {
        method: 'DELETE',
      })
      return new Response(
        JSON.stringify({ error: data.message || 'Gagal membuat invoice Xendit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({
        invoice_url: data.invoice_url,
        id: data.id,
        tx_id: transaction.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
