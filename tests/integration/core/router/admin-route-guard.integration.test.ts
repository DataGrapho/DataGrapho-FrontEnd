import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  isSessionAuthenticatedMock,
  getAuthenticatedSessionMock,
  ensureValidAccessTokenMock,
  createRouterMock,
} = vi.hoisted(() => ({
  isSessionAuthenticatedMock: vi.fn(),
  getAuthenticatedSessionMock: vi.fn(),
  ensureValidAccessTokenMock: vi.fn(),
  createRouterMock: vi.fn(),
}))

vi.mock('@/features/auth/services/auth-session.service', () => ({
  isSessionAuthenticated: isSessionAuthenticatedMock,
  getAuthenticatedSession: getAuthenticatedSessionMock,
}))

vi.mock('@/features/auth/services/auth-token-refresh.service', () => ({
  ensureValidAccessToken: ensureValidAccessTokenMock,
}))

vi.mock('vue-router', () => ({
  createWebHistory: vi.fn(() => ({})),
  createRouter: createRouterMock,
}))

describe('integracao da guarda de rota administrativa', () => {
  beforeEach(() => {
    vi.resetModules()
    isSessionAuthenticatedMock.mockReset()
    getAuthenticatedSessionMock.mockReset()
    ensureValidAccessTokenMock.mockReset()
    createRouterMock.mockReset()
  })

  it('redireciona para chat quando rota requer superuser e usuario nao tem acesso', async () => {
    isSessionAuthenticatedMock.mockReturnValue(true)
    ensureValidAccessTokenMock.mockResolvedValue('valid-access-token')
    getAuthenticatedSessionMock.mockReturnValue({
      acessos: [],
      usuario: { id_usuario: 1, email: 'user@datagrapho.local', is_superuser: false, is_staff: true },
    })

    let guard: ((to: { meta: Record<string, boolean>; fullPath: string }) => unknown) | null = null
    createRouterMock.mockReturnValue({
      beforeEach: (handler: (to: { meta: Record<string, boolean>; fullPath: string }) => unknown) => { guard = handler },
      afterEach: vi.fn(),
    })

    await import('@/core/router/index')
    const result = await guard?.({
      meta: { requiresAuth: true, requiresSuperuser: true },
      fullPath: '/app/administracao',
    })

    expect(result).toEqual({ name: 'app-chat' })
  }, 15_000)

  it('redireciona para chat quando rota requer staff e usuario nao tem acesso', async () => {
    isSessionAuthenticatedMock.mockReturnValue(true)
    ensureValidAccessTokenMock.mockResolvedValue('valid-access-token')
    getAuthenticatedSessionMock.mockReturnValue({
      acessos: [],
      usuario: { id_usuario: 1, email: 'user@datagrapho.local', is_superuser: false, is_staff: false },
    })

    let guard: ((to: { meta: Record<string, boolean>; fullPath: string }) => unknown) | null = null
    createRouterMock.mockReturnValue({
      beforeEach: (handler: (to: { meta: Record<string, boolean>; fullPath: string }) => unknown) => { guard = handler },
      afterEach: vi.fn(),
    })

    await import('@/core/router/index')
    const result = await guard?.({
      meta: { requiresAuth: true, requiresStaff: true },
      fullPath: '/app/gerenciar-usuarios',
    })

    expect(result).toEqual({ name: 'app-chat' })
  })
})
