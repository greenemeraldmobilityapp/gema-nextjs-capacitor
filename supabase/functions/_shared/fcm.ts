const FCM_SERVER_KEY = Deno.env.get('FCM_SERVER_KEY')!

interface FcmPayload {
  title: string
  body: string
  icon?: string
  url?: string
  category?: string
  metadata?: Record<string, unknown>
}

export async function sendToDevice(token: string, payload: FcmPayload): Promise<boolean> {
  const res = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `key=${FCM_SERVER_KEY}`,
    },
    body: JSON.stringify({
      to: token,
      notification: {
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icon.png',
      },
      data: {
        url: payload.url || '/',
        category: payload.category || 'system',
        ...(payload.metadata as Record<string, string> | undefined),
      },
      webpush: {
        fcm_options: { link: payload.url || '/' },
      },
    }),
  })

  return res.ok
}

export async function sendMulticast(tokens: string[], payload: FcmPayload): Promise<{ sent: number; invalid: string[] }> {
  const invalid: string[] = []
  let sent = 0
  const CONCURRENCY = 10

  for (let i = 0; i < tokens.length; i += CONCURRENCY) {
    const batch = tokens.slice(i, i + CONCURRENCY)
    const results = await Promise.allSettled(
      batch.map(async (token) => {
        for (let attempt = 0; attempt < 3; attempt++) {
          const ok = await sendToDevice(token, payload)
          if (ok) return true
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)))
          }
        }
        return false
      }),
    )
    for (let j = 0; j < results.length; j++) {
      const r = results[j]
      if (r.status === 'fulfilled' && r.value) {
        sent++
      } else {
        invalid.push(batch[j])
      }
    }
  }

  return { sent, invalid }
}
