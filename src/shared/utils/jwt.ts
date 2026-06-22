type JwtPayload = {
  exp?: number
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4))

  if (typeof atob === 'undefined') return null

  try {
    return atob(`${normalized}${padding}`)
  } catch {
    return null
  }
}

function readJwtPayload(accessToken: string): JwtPayload | null {
  const [, payloadSegment] = accessToken.split('.')
  if (!payloadSegment) return null

  const decoded = decodeBase64Url(payloadSegment)
  if (!decoded) return null

  try {
    return JSON.parse(decoded) as JwtPayload
  } catch {
    return null
  }
}

export function getAccessTokenExpiresAt(accessToken: string): string | null {
  const payload = readJwtPayload(accessToken)
  if (!payload?.exp) return null

  return new Date(payload.exp * 1000).toISOString()
}

export function isAccessTokenExpired(accessToken: string, now = Date.now()) {
  return isJwtExpired(accessToken, now)
}

export function isJwtExpired(token: string, now = Date.now()) {
  const payload = readJwtPayload(token)
  if (!payload?.exp) return false

  return payload.exp * 1000 <= now
}
