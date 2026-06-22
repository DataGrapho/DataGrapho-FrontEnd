import { describe, expect, it, vi } from 'vitest'
import { useAdminUserForm } from '@/features/admin-users/composables/useAdminUserForm'
import { buildAdminSession, buildRegisterSchema } from '../../../helpers/admin-users-test-utils'

const {
  getAuthenticatedSessionMock,
  getAdminUsersRegisterSchemaMock,
  createAdminUserMock,
  listAdminUsersMock,
  updateAdminUserMock,
  deleteAdminUserMock,
} = vi.hoisted(() => ({
  getAuthenticatedSessionMock: vi.fn(),
  getAdminUsersRegisterSchemaMock: vi.fn(),
  createAdminUserMock: vi.fn(),
  listAdminUsersMock: vi.fn(),
  updateAdminUserMock: vi.fn(),
  deleteAdminUserMock: vi.fn(),
}))

vi.mock('@/features/auth/services/auth-session.service', () => ({
  getAuthenticatedSession: getAuthenticatedSessionMock,
}))

vi.mock('@/features/admin-users/services/admin-users.service', () => ({
  getAdminUsersRegisterSchema: getAdminUsersRegisterSchemaMock,
  createAdminUser: createAdminUserMock,
  listAdminUsers: listAdminUsersMock,
  updateAdminUser: updateAdminUserMock,
  deleteAdminUser: deleteAdminUserMock,
}))

describe('formulario de criacao de usuario administrativo', () => {
  it('valida campos obrigatorios antes de enviar', async () => {
    getAuthenticatedSessionMock.mockReturnValue(buildAdminSession())
    getAdminUsersRegisterSchemaMock.mockResolvedValue(buildRegisterSchema())

    const formStore = useAdminUserForm()
    await formStore.loadSchema()
    await formStore.submit()

    expect(createAdminUserMock).not.toHaveBeenCalled()
    expect(formStore.fieldErrors.value.email).toContain('Informe')
    expect(formStore.fieldErrors.value.cpf).toContain('Informe')
  })
})
