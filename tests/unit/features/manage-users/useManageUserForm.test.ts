import { describe, expect, it, vi } from 'vitest'
import { useManageUserForm } from '@/features/manage-users/composables/useManageUserForm'
import { buildAdminSession, buildRegisterSchema } from '../../../helpers/manage-users-test-utils'

const {
  getAuthenticatedSessionMock,
  getManageUsersRegisterSchemaMock,
  createManageUserMock,
} = vi.hoisted(() => ({
  getAuthenticatedSessionMock: vi.fn(),
  getManageUsersRegisterSchemaMock: vi.fn(),
  createManageUserMock: vi.fn(),
}))

vi.mock('@/features/auth/services/auth-session.service', () => ({
  getAuthenticatedSession: getAuthenticatedSessionMock,
}))

vi.mock('@/features/manage-users/services/manage-users.service', () => ({
  getManageUsersRegisterSchema: getManageUsersRegisterSchemaMock,
  createManageUser: createManageUserMock,
}))

describe('useManageUserForm', () => {
  it('valida campos obrigatorios antes de enviar', async () => {
    getAuthenticatedSessionMock.mockReturnValue(buildAdminSession())
    getManageUsersRegisterSchemaMock.mockResolvedValue(buildRegisterSchema())

    const formStore = useManageUserForm()
    await formStore.loadSchema()
    await formStore.submit()

    expect(createManageUserMock).not.toHaveBeenCalled()
    expect(formStore.fieldErrors.value.email).toContain('Informe')
    expect(formStore.fieldErrors.value.cpf).toContain('Informe')
  })
})
