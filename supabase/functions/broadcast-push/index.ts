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

async function isAdmin(jwt: string): Promise<boolean> {
  try {
    // Validate JWT via GoTrue API
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${jwt}`,
      },
    })
    if (!res.ok) return false
    const { id } = await res.json()
    if (!id) return false

    const roleRes = await supabaseFetch(`/users?id=eq.${id}&select=role`)
    const users: { role: string }[] = await roleRes.json()
    return users?.[0]?.role === 'admin'
  } catch {
    return false
  }
}

interface BroadcastPayload {
  title: string
  body: string
  url?: string
  target: 'all' | 'customers' | 'vendors'
  category?: 'order' | 'chat' | 'promo' | 'system'
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

    const jwt = authHeader.slice(7)

    // Allow either service_role key (internal) or valid admin JWT
    if (jwt !== SUPABASE_SERVICE_ROLE_KEY) {
      const admin = await isAdmin(jwt)
      if (!admin) {
        return new Response(JSON.stringify({ error: 'Forbidden — admin only' }), { status: 403 })
      }
    }

    const payload: BroadcastPayload = await req.json()

    if (!payload.title || !payload.body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title, body' }),
        { status: 400 },
      )
    }

    const category = payload.category || 'promo'

    // 1. Get target user IDs
    let userFilter = ''
    if (payload.target === 'customers') {
      userFilter = `&role=eq.customer`
    } else if (payload.target === 'vendors') {
      userFilter = `&role=eq.vendor`
    }

    const userRes = await supabaseFetch(`/users?select=id${userFilter}`)
    const users: { id: string }[] = await userRes.json()

    if (!users?.length) {
      return new Response(JSON.stringify({ sent: false, reason: 'no_users' }), { status: 200 })
    }

    // 2. Check notification preferences
    const prefRes = await supabaseFetch(
      `/notification_preferences?channel=eq.${category}&select=user_id,push_enabled`,
    )
    const prefs: { user_id: string; push_enabled: boolean }[] = await prefRes.json()
    const prefMap = new Map(prefs.map((p) => [p.user_id, p.push_enabled]))

    const eligibleUsers = users.filter((u) => {
      const enabled = prefMap.get(u.id)
      return enabled === undefined || enabled === true
    })

    if (!eligibleUsers.length) {
      return new Response(JSON.stringify({ sent: false, reason: 'all_disabled' }), { status: 200 })
    }

    // 3. Batch fetch push tokens
    const userIds = eligibleUsers.map((u) => u.id)
    const BATCH_SIZE = 50
    let allTokens: { token: string; user_id: string }[] = []

    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      const batch = userIds.slice(i, i + BATCH_SIZE)
      const orClause = batch.map((id) => `user_id.eq.${id}`).join(',')
      const tokenRes = await supabaseFetch(
        `/push_tokens?select=token,user_id&or=(${orClause})`,
      )
      const tokens: { token: string; user_id: string }[] = await tokenRes.json()
      allTokens = allTokens.concat(tokens)
    }

    if (!allTokens.length) {
      return new Response(JSON.stringify({ sent: false, reason: 'no_tokens' }), { status: 200 })
    }

    // 4. Deduplicate tokens while keeping all users per token
    const uniqueTokens = [...new Set(allTokens.map((t) => t.token))]
    const tokenUserIds = new Map<string, string[]>()
    for (const t of allTokens) {
      const existing = tokenUserIds.get(t.token) || []
      if (!existing.includes(t.user_id)) {
        existing.push(t.user_id)
      }
      tokenUserIds.set(t.token, existing)
    }

    // 5. Send via FCM
    const { sent, invalid } = await sendMulticast(uniqueTokens, {
      title: payload.title,
      body: payload.body,
      url: payload.url,
      category,
    })

    // 6. Remove invalid tokens
    if (invalid.length > 0) {
      for (const badToken of invalid) {
        await supabaseFetch(`/push_tokens?token=eq.${badToken}`, {
          method: 'DELETE',
        })
      }
    }

    // 7. Save notification per user (preserve all users even if token shared)
    const insertedUsers = new Set<string>()
    for (const token of uniqueTokens) {
      const userIds = tokenUserIds.get(token) || []
      for (const userId of userIds) {
        if (!insertedUsers.has(userId)) {
          insertedUsers.add(userId)
          await supabaseFetch('/notifications', {
            method: 'POST',
            body: JSON.stringify({
              user_id: userId,
              category,
              title: payload.title,
              body: payload.body,
              url: payload.url || null,
            }),
          })
        }
      }
    }

    return new Response(
      JSON.stringify({
        sent: true,
        total_users: eligibleUsers.length,
        tokens_found: uniqueTokens.length,
        delivered: sent,
        failed: invalid.length,
        notifications_created: insertedUsers.size,
      }),
      { status: 200 },
    )
  } catch (error) {
    console.error('broadcast-push error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
