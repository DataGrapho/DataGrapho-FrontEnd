import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearAuthenticatedSession,
  setAuthenticatedSessionFromLogin,
} from '@/features/auth/services/auth-session.service'
import { ensureValidAccessToken } from '@/features/auth/services/auth-token-refresh.service'

function buildToken(payload: Record<string, unknown>) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')

  return `${header}.${body}.signature`
}

describe('auth token refresh service', () => {
  beforeEach(() => {
    clearAuthenticatedSession()
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renova access token quando expirado e refresh e valido', async () => {
    const expiredAccess = buildToken({ exp: Math.floor(Date.now() / 1000) - 60 })
    const validRefresh = buildToken({ exp: Math.floor(Date.now() / 1000) + 3600 })
    const renewedAccess = buildToken({ exp: Math.floor(Date.now() / 1000) + 1800 })

    setAuthenticatedSessionFromLogin({
      access: expiredAccess,
      refresh: validRefresh,
      usuario: {
        id_usuario: 1,
        email: 'admin@datagrapho.local',
        is_staff: true,
      },
      acessos: [],
    })

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ access: renewedAccess }),
    } as Response)

    const accessToken = await ensureValidAccessToken()

    expect(accessToken).toBe(renewedAccess)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/refresh/'),
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
