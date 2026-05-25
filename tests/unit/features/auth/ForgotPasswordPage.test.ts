import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AUTH_PAGE_STUBS } from '../../../helpers/auth-test-utils'
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage.vue'

const {
  requestPasswordResetMock,
  registerAuthAuditEventMock,
  getNeutralRecoveryMessageMock,
  getPasswordResetRequestMessageMock,
} = vi.hoisted(() => ({
  requestPasswordResetMock: vi.fn(),
  registerAuthAuditEventMock: vi.fn(),
  getNeutralRecoveryMessageMock: vi.fn(() => 'Se o email informado for valido, voce recebera instrucoes de recuperacao em instantes.'),
  getPasswordResetRequestMessageMock: vi.fn(() => 'Nao foi possivel processar sua solicitacao agora. Tente novamente em instantes.'),
}))

vi.mock('@/features/auth/services/auth.service', () => ({
  requestPasswordReset: requestPasswordResetMock,
}))

vi.mock('@/features/auth/services/auth-audit.service', () => ({
  registerAuthAuditEvent: registerAuthAuditEventMock,
}))

vi.mock('@/features/auth/services/auth-feedback.service', () => ({
  getNeutralRecoveryMessage: getNeutralRecoveryMessageMock,
  getPasswordResetRequestMessage: getPasswordResetRequestMessageMock,
}))

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    requestPasswordResetMock.mockReset()
    registerAuthAuditEventMock.mockReset()
    getNeutralRecoveryMessageMock.mockClear()
    getPasswordResetRequestMessageMock.mockClear()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('exibe confirmacao neutra apos solicitacao de recuperacao', async () => {
    requestPasswordResetMock.mockResolvedValueOnce(undefined)

    const wrapper = mount(ForgotPasswordPage, {
      global: {
        stubs: AUTH_PAGE_STUBS,
      },
    })

    await wrapper.find('#forgot-email').setValue('user@example.com')
    await wrapper.find('[data-test="auth-form"]').trigger('submit')

    expect(requestPasswordResetMock).toHaveBeenCalledWith({ email: 'user@example.com' })
    expect(registerAuthAuditEventMock).toHaveBeenCalledWith(
      'recuperacao_solicitada',
      expect.objectContaining({ identifier: 'user@example.com' }),
    )
    expect(wrapper.text()).toContain('Se o email informado for valido, voce recebera instrucoes de recuperacao em instantes.')
    expect(wrapper.text()).toContain('Reenviar link de redefinicao')
    expect(wrapper.text()).toContain('Voce podera reenviar em 30s.')
  })

  it('trata falhas sem vazar existencia de conta', async () => {
    requestPasswordResetMock.mockRejectedValueOnce(new Error('server unavailable'))

    const wrapper = mount(ForgotPasswordPage, {
      global: {
        stubs: AUTH_PAGE_STUBS,
      },
    })

    await wrapper.find('#forgot-email').setValue('user@example.com')
    await wrapper.find('[data-test="auth-form"]').trigger('submit')

    expect(getPasswordResetRequestMessageMock).toHaveBeenCalled()
    expect(registerAuthAuditEventMock).toHaveBeenCalledWith(
      'recuperacao_solicitada',
      expect.objectContaining({
        identifier: 'user@example.com',
        reason: 'request_failed',
      }),
    )
    expect(wrapper.text()).toContain('Nao foi possivel processar sua solicitacao agora. Tente novamente em instantes.')
    expect(wrapper.text()).toContain('Reenviar link de redefinicao')
  })

  it('desabilita o botao durante cooldown e reabilita apos contagem', async () => {
    requestPasswordResetMock.mockResolvedValueOnce(undefined)

    const wrapper = mount(ForgotPasswordPage, {
      global: {
        stubs: AUTH_PAGE_STUBS,
      },
    })

    await wrapper.find('#forgot-email').setValue('user@example.com')
    await wrapper.find('[data-test="auth-form"]').trigger('submit')

    const button = wrapper.find('button[type="submit"]')
    expect(button.attributes('disabled')).toBeDefined()

    vi.advanceTimersByTime(30000)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('Voce podera reenviar em')
    expect(button.attributes('disabled')).toBeUndefined()
  })
})
