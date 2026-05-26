import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AUTH_PAGE_STUBS } from '../../../helpers/auth-test-utils'
import LoginPage from '@/features/auth/pages/LoginPage.vue'

const {
  loginMock,
  setAuthenticatedSessionFromLoginMock,
  registerAuthAuditEventMock,
  getLoginErrorMessageMock,
  mockRouter,
  mockRoute,
} = vi.hoisted(() => ({
  loginMock: vi.fn(),
  setAuthenticatedSessionFromLoginMock: vi.fn(),
  registerAuthAuditEventMock: vi.fn(),
  getLoginErrorMessageMock: vi.fn(() => 'Credenciais invalidas. Verifique o email e a senha informados.'),
  mockRouter: {
    push: vi.fn(),
  },
  mockRoute: {
    query: {} as Record<string, unknown>,
  },
}))

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRoute,
}))

vi.mock('@/features/auth/services/auth.service', () => ({
  login: loginMock,
}))

vi.mock('@/features/auth/services/auth-session.service', () => ({
  setAuthenticatedSessionFromLogin: setAuthenticatedSessionFromLoginMock,
}))

vi.mock('@/features/auth/services/auth-audit.service', () => ({
  registerAuthAuditEvent: registerAuthAuditEventMock,
}))

vi.mock('@/features/auth/services/auth-feedback.service', () => ({
  getLoginErrorMessage: getLoginErrorMessageMock,
}))

describe('pagina de login', () => {
  beforeEach(() => {
    loginMock.mockReset()
    mockRouter.push.mockReset()
    setAuthenticatedSessionFromLoginMock.mockReset()
    registerAuthAuditEventMock.mockReset()
    getLoginErrorMessageMock.mockClear()
    mockRoute.query = {}
  })

  it('valida campos obrigatorios antes de autenticar', async () => {
    const wrapper = mount(LoginPage, {
      global: {
        stubs: AUTH_PAGE_STUBS,
      },
    })

    await wrapper.find('[data-test="auth-form"]').trigger('submit')

    expect(loginMock).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Informe seu email para continuar.')
    expect(wrapper.text()).toContain('Informe sua senha para continuar.')
  })

  it('exibe erro seguro para falha de autenticacao', async () => {
    loginMock.mockRejectedValueOnce({ status: 401 })

    const wrapper = mount(LoginPage, {
      global: {
        stubs: AUTH_PAGE_STUBS,
      },
    })

    await wrapper.find('#login-email').setValue('user@example.com')
    await wrapper.find('#login-password').setValue('invalid-password')
    await wrapper.find('[data-test="auth-form"]').trigger('submit')

    expect(getLoginErrorMessageMock).toHaveBeenCalled()
    expect(registerAuthAuditEventMock).toHaveBeenCalledWith(
      'login_falha',
      expect.objectContaining({ identifier: 'user@example.com' }),
    )
    expect(wrapper.text()).toContain('Credenciais invalidas. Verifique o email e a senha informados.')
  })

  it('persiste sessao e redireciona para rota protegida no sucesso', async () => {
    mockRoute.query = {
      redirect: '/app/datatable',
    }
    loginMock.mockResolvedValueOnce({
      access: 'token',
      refresh: 'refresh',
      usuario: {
        id_usuario: 1,
        email: 'user@example.com',
      },
    })

    const wrapper = mount(LoginPage, {
      global: {
        stubs: AUTH_PAGE_STUBS,
      },
    })

    await wrapper.find('#login-email').setValue('user@example.com')
    await wrapper.find('#login-password').setValue('Password123')
    await wrapper.find('[data-test="auth-form"]').trigger('submit')

    expect(setAuthenticatedSessionFromLoginMock).toHaveBeenCalledWith(
      expect.objectContaining({
        access: 'token',
      }),
    )
    expect(registerAuthAuditEventMock).toHaveBeenCalledWith(
      'login_sucesso',
      expect.objectContaining({ accountId: '1' }),
    )
    expect(mockRouter.push).toHaveBeenCalledWith('/app/datatable')
  })
})
