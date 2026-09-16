import { describe, expect, it } from 'vitest'
import { getAccessTokenExpiresAt, isAccessTokenExpired } from '@/shared/utils/jwt'

function buildToken(payload: Record<string, unknown>) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')

  return `${header}.${body}.signature`
}

describe('jwt utils', () => {
  it('extrai expiracao do access token', () => {
    const expiresAt = new Date('2030-01-01T00:00:00.000Z')
    const token = buildToken({ exp: Math.floor(expiresAt.getTime() / 1000) })

    expect(getAccessTokenExpiresAt(token)).toBe(expiresAt.toISOString())
    expect(isAccessTokenExpired(token)).toBe(false)
  })

  it('identifica token expirado', () => {
    const token = buildToken({ exp: Math.floor(Date.now() / 1000) - 60 })

    expect(isAccessTokenExpired(token)).toBe(true)
  })
})
