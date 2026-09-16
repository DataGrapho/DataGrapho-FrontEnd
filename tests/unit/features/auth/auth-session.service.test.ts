import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearAuthenticatedSession,
  getAuthenticatedSession,
  isSessionAuthenticated,
  setAuthenticatedSessionFromLogin,
} from '@/features/auth/services/auth-session.service'

function buildToken(payload: Record<string, unknown>) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')

  return `${header}.${body}.signature`
}

describe('auth session service', () => {
  beforeEach(() => {
    clearAuthenticatedSession()
    window.localStorage.clear()
  })

  it('persiste expiracao do access token no login', () => {
    const expiresAt = new Date('2030-01-01T00:00:00.000Z')
    const access = buildToken({ exp: Math.floor(expiresAt.getTime() / 1000) })

    setAuthenticatedSessionFromLogin({
      access,
      refresh: 'refresh-token',
      usuario: {
        id_usuario: 1,
        email: 'admin@datagrapho.local',
        is_staff: true,
      },
      acessos: [],
    })

    const session = getAuthenticatedSession()
    expect(session?.expiresAt).toBe(expiresAt.toISOString())
    expect(isSessionAuthenticated()).toBe(true)
  })

  it('invalida sessao quando o access token expirou', () => {
    const access = buildToken({ exp: Math.floor(Date.now() / 1000) - 60 })
    const refresh = buildToken({ exp: Math.floor(Date.now() / 1000) - 60 })

    setAuthenticatedSessionFromLogin({
      access,
      refresh,
      usuario: {
        id_usuario: 1,
        email: 'admin@datagrapho.local',
        is_staff: true,
      },
      acessos: [],
    })

    expect(isSessionAuthenticated()).toBe(false)
    expect(getAuthenticatedSession()).toBeNull()
    expect(window.localStorage.getItem('datafit.auth.session')).toBeNull()
  })

  it('mantem sessao quando access expirou mas refresh ainda e valido', () => {
    const access = buildToken({ exp: Math.floor(Date.now() / 1000) - 60 })
    const refresh = buildToken({ exp: Math.floor(Date.now() / 1000) + 3600 })

    setAuthenticatedSessionFromLogin({
      access,
      refresh,
      usuario: {
        id_usuario: 1,
        email: 'admin@datagrapho.local',
        is_staff: true,
      },
      acessos: [],
    })

    expect(isSessionAuthenticated()).toBe(true)
    expect(getAuthenticatedSession()?.refreshToken).toBe(refresh)
  })
})
