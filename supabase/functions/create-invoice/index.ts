import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const XENDIT_SECRET_KEY = Deno.env.get('XENDIT_SECRET_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:3000'

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://gema-app.pages.dev',
  APP_URL,
]

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
    const callerId = user.id

    const { order_id, origin } = await req.json()
    if (!order_id) {
      return new Response(
        JSON.stringify({ error: 'order_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const baseUrl = ALLOWED_ORIGINS.includes(origin) ? origin : APP_URL

    const orderRes = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?id=eq.${order_id}&select=*,customer:customer_id(full_name,email)`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    )
    const orders = await orderRes.json()
    if (!orders?.length) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const order = orders[0]

    if (order.customer_id !== callerId) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: you do not own this order' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    if (order.payment_status !== 'unpaid') {
      return new Response(
        JSON.stringify({ error: 'Order is already paid or cancelled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const xenditRes = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(XENDIT_SECRET_KEY + ':')}`,
      },
      body: JSON.stringify({
        external_id: order_id,
        amount: order.total_amount,
        description: order.service_name,
        payer_email: order.customer?.email || '',
        customer: {
          given_names: order.customer?.full_name || 'Customer',
          email: order.customer?.email || '',
        },
        customer_notification_preference: {
          invoice_paid: ['email'],
        },
        success_redirect_url: `${baseUrl}/customer/payment/success?order_id=${order_id}`,
        failure_redirect_url: `${baseUrl}/customer/payment?order_id=${order_id}`,
        currency: 'IDR',
      }),
    })

    const data = await xenditRes.json()

    if (!xenditRes.ok) {
      return new Response(
        JSON.stringify({ error: data.message || 'Xendit error' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({ invoice_url: data.invoice_url, id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
