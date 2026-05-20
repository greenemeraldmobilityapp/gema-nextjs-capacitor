import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const token = authHeader.slice(7)
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_SERVICE_ROLE_KEY },
    })

    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const user = await userRes.json()
    const callerId = user.id

    const { order_id } = await req.json()
    if (!order_id) {
      return new Response(JSON.stringify({ error: 'order_id is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const orderRes = await supabaseFetch(
      `/orders?id=eq.${order_id}&select=*,vendor_id,order_status,payment_status,vendor_payout`,
    )
    const orders = await orderRes.json()
    const order = orders?.[0]

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (order.vendor_id !== callerId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (order.order_status !== 'in_progress') {
      return new Response(JSON.stringify({ error: 'Order is not in progress' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (order.payment_status !== 'escrow') {
      return new Response(JSON.stringify({ error: 'Payment is not in escrow' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const now = new Date().toISOString()

    await supabaseFetch(`/orders?id=eq.${order_id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        order_status: 'completed',
        payment_status: 'released',
        completed_at: now,
      }),
    })

    const walletRes = await supabaseFetch(
      `/wallets?user_id=eq.${order.vendor_id}&select=id,balance`,
    )
    const wallets = await walletRes.json()
    const wallet = wallets?.[0]

    if (wallet?.id) {
      const credited = await supabaseFetch(`/rpc/credit_wallet`, {
        method: 'POST',
        body: JSON.stringify({ p_wallet_id: wallet.id, p_amount: order.vendor_payout }),
      })

      if (credited.ok) {
        await supabaseFetch('/wallet_transactions', {
          method: 'POST',
          body: JSON.stringify({
            wallet_id: wallet.id,
            type: 'escrow_release',
            amount: order.vendor_payout,
            status: 'success',
          }),
        })
      } else {
        console.error(`release-payment: failed to credit wallet ${wallet.id}`)
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('release-payment error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
