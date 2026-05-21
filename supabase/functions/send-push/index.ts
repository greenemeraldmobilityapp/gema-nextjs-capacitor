import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { sendMulticast } from '../_shared/fcm.ts'

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

interface PushPayload {
  userId: string
  category: 'order' | 'chat' | 'promo' | 'system'
  title: string
  body: string
  url?: string
  metadata?: Record<string, unknown>
}

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { status: 200 })
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const token = authHeader.slice(7)
    if (token !== SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
    }

    const payload: PushPayload = await req.json()

    if (!payload.userId || !payload.title || !payload.body || !payload.category) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, title, body, category' }),
        { status: 400 },
      )
    }

    // 1. Check notification preference
    const prefRes = await supabaseFetch(
      `/notification_preferences?user_id=eq.${payload.userId}&channel=eq.${payload.category}&select=push_enabled`,
    )
    const prefs = await prefRes.json()
    const pref = prefs?.[0]

    if (pref?.push_enabled === false) {
      return new Response(JSON.stringify({ sent: false, reason: 'disabled_by_user' }), { status: 200 })
    }

    // 2. Fetch all tokens for this user
    const tokenRes = await supabaseFetch(
      `/push_tokens?user_id=eq.${payload.userId}&select=token`,
    )
    const tokens: { token: string }[] = await tokenRes.json()

    if (!tokens?.length) {
      return new Response(JSON.stringify({ sent: false, reason: 'no_tokens' }), { status: 200 })
    }

    const tokenList = tokens.map((t) => t.token)

    // 3. Send via FCM
    const { sent, invalid } = await sendMulticast(tokenList, {
      title: payload.title,
      body: payload.body,
      url: payload.url,
      category: payload.category,
      metadata: payload.metadata,
    })

    // 4. Remove invalid tokens
    if (invalid.length > 0) {
      for (const badToken of invalid) {
        await supabaseFetch(`/push_tokens?token=eq.${badToken}`, {
          method: 'DELETE',
        })
      }
    }

    // 5. Save to notifications table
    await supabaseFetch('/notifications', {
      method: 'POST',
      body: JSON.stringify({
        user_id: payload.userId,
        category: payload.category,
        title: payload.title,
        body: payload.body,
        url: payload.url || null,
        metadata: payload.metadata || null,
      }),
    })

    return new Response(
      JSON.stringify({ sent: true, delivered: sent, failed: invalid.length }),
      { status: 200 },
    )
  } catch (error) {
    console.error('send-push error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
