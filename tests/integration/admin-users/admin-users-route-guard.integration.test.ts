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
    isSessionAuthenticatedMock.mockReset()
    getAuthenticatedSessionMock.mockReset()
    ensureValidAccessTokenMock.mockReset()
    createRouterMock.mockReset()
  })

  it('redireciona para chat quando rota requer permissao admin e usuario nao tem acesso', async () => {
    isSessionAuthenticatedMock.mockReturnValue(true)
    ensureValidAccessTokenMock.mockResolvedValue('valid-access-token')
    getAuthenticatedSessionMock.mockReturnValue({
      acessos: [],
      usuario: { id_usuario: 1, email: 'user@datagrapho.local', is_superuser: false },
    })

    let guard: ((to: any) => unknown) | null = null
    createRouterMock.mockReturnValue({
      beforeEach: (handler: (to: any) => unknown) => { guard = handler },
    })

    await import('@/core/router/index')
    const result = await guard?.({
      meta: { requiresAuth: true, requiresAdminPermission: true },
      fullPath: '/app/admin-users',
    })

    expect(result).toEqual({ name: 'app-chat' })
  })
})
