export function extractApiErrorMessage (details: unknown, fallback: string) {
  if (!details || typeof details !== 'object') return fallback

  const payload = details as Record<string, unknown>
  if (typeof payload.error === 'string' && payload.error) return payload.error
  if (typeof payload.detail === 'string' && payload.detail) return payload.detail

  for (const [field, value] of Object.entries(payload)) {
    if (Array.isArray(value) && typeof value[0] === 'string') {
      return `${field}: ${value[0]}`
    }
    if (typeof value === 'string') return `${field}: ${value}`
  }

  return fallback
}
