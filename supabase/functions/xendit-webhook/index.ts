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

    // payment_session webhook (new format with event wrapper)
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

    // Invoice webhook (legacy format)
    const { external_id: orderId, status } = body

    if (!orderId) {
      return new Response('Missing external_id', { status: 400 })
    }

    console.log(`Webhook received: order=${orderId}, status=${status}`)

    if (status === 'PAID') {
      // Idempotency: skip if already processed
      const checkRes = await supabaseFetch(
        `/orders?id=eq.${orderId}&select=payment_status`,
      )
      const existing = await checkRes.json()
      const currentStatus = existing?.[0]?.payment_status

      if (currentStatus && currentStatus !== 'unpaid') {
        console.log(`Order ${orderId} already processed (${currentStatus}), skipping`)
        return new Response('OK', { status: 200 })
      }

      // Only set payment_status to escrow — wallet credit happens on completion
      await supabaseFetch(`/orders?id=eq.${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ payment_status: 'escrow' }),
      })

      console.log(`Order ${orderId} set to escrow`)
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
