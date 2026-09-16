import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AUTH_PAGE_STUBS } from '../../../helpers/auth-test-utils'
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage.vue'

const {
  resetPasswordMock,
  clearAuthenticatedSessionMock,
  registerAuthAuditEventMock,
  getPasswordPolicyMessageMock,
  getPasswordResetErrorMessageMock,
  mockRouter,
  mockRoute,
} = vi.hoisted(() => ({
  resetPasswordMock: vi.fn(),
  clearAuthenticatedSessionMock: vi.fn(),
  registerAuthAuditEventMock: vi.fn(),
  getPasswordPolicyMessageMock: vi.fn(() => ''),
  getPasswordResetErrorMessageMock: vi.fn(() => 'O link de recuperacao e invalido ou expirou. Solicite um novo link para continuar.'),
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
  resetPassword: resetPasswordMock,
}))

vi.mock('@/features/auth/services/auth-session.service', () => ({
  clearAuthenticatedSession: clearAuthenticatedSessionMock,
}))

vi.mock('@/features/auth/services/auth-audit.service', () => ({
  registerAuthAuditEvent: registerAuthAuditEventMock,
}))

vi.mock('@/features/auth/services/auth-feedback.service', () => ({
  getPasswordPolicyMessage: getPasswordPolicyMessageMock,
  getPasswordResetErrorMessage: getPasswordResetErrorMessageMock,
}))

describe('pagina de redefinicao de senha', () => {
  beforeEach(() => {
    resetPasswordMock.mockReset()
    clearAuthenticatedSessionMock.mockReset()
    registerAuthAuditEventMock.mockReset()
    getPasswordPolicyMessageMock.mockReset()
    getPasswordPolicyMessageMock.mockReturnValue('')
    getPasswordResetErrorMessageMock.mockClear()
    mockRouter.push.mockReset()
    mockRoute.query = {
      token: 'token-123',
    }
  })

  it('bloqueia envio quando token nao existe', async () => {
    mockRoute.query = {}

    const wrapper = mount(ResetPasswordPage, {
      global: {
        stubs: AUTH_PAGE_STUBS,
      },
    })

    await wrapper.find('#new-password').setValue('Password123')
    await wrapper.find('#confirm-password').setValue('Password123')
    await wrapper.find('[data-test="auth-form"]').trigger('submit')

    expect(resetPasswordMock).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('O link de recuperacao e invalido ou expirou. Solicite um novo link.')
  })

  it('valida politica de senha antes de enviar', async () => {
    getPasswordPolicyMessageMock.mockReturnValueOnce('A senha precisa incluir pelo menos um numero.')

    const wrapper = mount(ResetPasswordPage, {
      global: {
        stubs: AUTH_PAGE_STUBS,
      },
    })

    await wrapper.find('#new-password').setValue('PasswordOnly')
    await wrapper.find('#confirm-password').setValue('PasswordOnly')
    await wrapper.find('[data-test="auth-form"]').trigger('submit')

    expect(resetPasswordMock).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('A senha precisa incluir pelo menos um numero.')
  })

  it('redefine senha, limpa sessao e redireciona para login', async () => {
    resetPasswordMock.mockResolvedValueOnce(undefined)

    const wrapper = mount(ResetPasswordPage, {
      global: {
        stubs: AUTH_PAGE_STUBS,
      },
    })

    await wrapper.find('#new-password').setValue('Password123')
    await wrapper.find('#confirm-password').setValue('Password123')
    await wrapper.find('[data-test="auth-form"]').trigger('submit')

    expect(resetPasswordMock).toHaveBeenCalledWith({
      password: 'Password123',
      confirmPassword: 'Password123',
      token: 'token-123',
    })
    expect(clearAuthenticatedSessionMock).toHaveBeenCalled()
    expect(registerAuthAuditEventMock).toHaveBeenCalledWith('senha_redefinida')
    expect(mockRouter.push).toHaveBeenCalledWith({ name: 'login' })
  })

  it('exibe mensagem clara para token invalido ou expirado', async () => {
    resetPasswordMock.mockRejectedValueOnce(new Error('token expired'))

    const wrapper = mount(ResetPasswordPage, {
      global: {
        stubs: AUTH_PAGE_STUBS,
      },
    })

    await wrapper.find('#new-password').setValue('Password123')
    await wrapper.find('#confirm-password').setValue('Password123')
    await wrapper.find('[data-test="auth-form"]').trigger('submit')

    expect(getPasswordResetErrorMessageMock).toHaveBeenCalled()
    expect(wrapper.text()).toContain('O link de recuperacao e invalido ou expirou. Solicite um novo link para continuar.')
  })
})
