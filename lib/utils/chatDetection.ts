const PHONE_REGEX = /(?:\b0[8-9]\d{8,11}\b|\+62[8-9]\d{8,11}\b|62[8-9]\d{8,11}\b)/g
const EMAIL_REGEX = /\b[\w.-]+@[\w.-]+\.\w+\b/g
const IG_REGEX = /@(\w{3,30})\b/g

export interface DetectedPattern {
  type: 'phone' | 'email' | 'instagram'
  value: string
  index: number
}

export function detectPatterns(text: string): DetectedPattern[] {
  const patterns: DetectedPattern[] = []

  let match
  while ((match = PHONE_REGEX.exec(text)) !== null) {
    patterns.push({ type: 'phone', value: match[0], index: match.index })
  }

  while ((match = EMAIL_REGEX.exec(text)) !== null) {
    patterns.push({ type: 'email', value: match[0], index: match.index })
  }

  while ((match = IG_REGEX.exec(text)) !== null) {
    patterns.push({ type: 'instagram', value: match[0], index: match.index })
  }

  return patterns
}

export function maskText(text: string, patterns: DetectedPattern[]): string {
  let masked = text
  for (const p of patterns) {
    masked = masked.replace(p.value, '█'.repeat(p.value.length))
  }
  return masked
}

export function getPatternTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    phone: 'nomor telepon',
    email: 'alamat email',
    instagram: 'username Instagram',
  }
  return labels[type] || type
}
