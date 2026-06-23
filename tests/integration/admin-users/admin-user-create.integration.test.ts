import { describe, expect, it, vi } from 'vitest'
import { useAdminUserForm } from '@/features/admin-users/composables/useAdminUserForm'
import { buildAdminSession, buildRegisterSchema } from '../../helpers/admin-users-test-utils'

const {
  getAuthenticatedSessionMock,
  getAdminUsersRegisterSchemaMock,
  createAdminUserMock,
} = vi.hoisted(() => ({
  getAuthenticatedSessionMock: vi.fn(),
  getAdminUsersRegisterSchemaMock: vi.fn(),
  createAdminUserMock: vi.fn(),
}))

vi.mock('@/features/auth/services/auth-session.service', () => ({
  getAuthenticatedSession: getAuthenticatedSessionMock,
}))

vi.mock('@/features/admin-users/services/admin-users.service', () => ({
  getAdminUsersRegisterSchema: getAdminUsersRegisterSchemaMock,
  createAdminUser: createAdminUserMock,
}))

describe('integracao do fluxo de criacao de usuario', () => {
  it('envia payload valido para criacao', async () => {
    getAuthenticatedSessionMock.mockReturnValue(buildAdminSession())
    getAdminUsersRegisterSchemaMock.mockResolvedValue(buildRegisterSchema())
    createAdminUserMock.mockResolvedValue({
      usuario: { id_usuario: 90, email: 'novo@datagrapho.local', nome: 'Novo', is_active: true },
      acessos: [{ id: 1, ativo: true }],
    })

    const store = useAdminUserForm()
    await store.loadSchema()

    store.form.value.email = 'novo@datagrapho.local'
    store.form.value.cpf = '529.982.247-25'
    store.form.value.nome = 'Novo Usuario'
    store.form.value.password = 'SenhaSegura123'
    store.addAccess()
    store.form.value.acessos[0].id_empresa = 1
    store.form.value.acessos[0].id_perfil = 2

    await store.submit()

    expect(createAdminUserMock).toHaveBeenCalled()
    expect(store.successMessage.value).toContain('sucesso')
  })

  it('permite criar usuario sem acessos', async () => {
    getAuthenticatedSessionMock.mockReturnValue(buildAdminSession())
    getAdminUsersRegisterSchemaMock.mockResolvedValue(buildRegisterSchema())
    createAdminUserMock.mockResolvedValue({
      usuario: { id_usuario: 91, email: 'sem.acesso@datagrapho.local', nome: 'Sem Acesso', is_active: true },
      acessos: [],
    })

    const store = useAdminUserForm()
    await store.loadSchema()

    store.form.value.email = 'sem.acesso@datagrapho.local'
    store.form.value.cpf = '529.982.247-25'
    store.form.value.nome = 'Sem Acesso'
    store.form.value.password = 'SenhaSegura123'

    await store.submit()

    expect(createAdminUserMock).toHaveBeenCalledWith({
      email: 'sem.acesso@datagrapho.local',
      cpf: '529.982.247-25',
      nome: 'Sem Acesso',
      password: 'SenhaSegura123',
      is_active: true,
      is_superuser: false,
    })
    expect(store.successMessage.value).toContain('sucesso')
  })

  it('envia is_superuser true quando superusuario esta marcado', async () => {
    getAuthenticatedSessionMock.mockReturnValue(buildAdminSession())
    getAdminUsersRegisterSchemaMock.mockResolvedValue(buildRegisterSchema())
    createAdminUserMock.mockResolvedValue({
      usuario: { id_usuario: 92, email: 'admin.novo@datagrapho.local', nome: 'Admin Novo', is_active: true },
      acessos: [],
    })

    const store = useAdminUserForm()
    await store.loadSchema()

    store.form.value.email = 'admin.novo@datagrapho.local'
    store.form.value.cpf = '529.982.247-25'
    store.form.value.nome = 'Admin Novo'
    store.form.value.password = 'SenhaSegura123'
    store.form.value.is_superuser = true

    await store.submit()

    expect(createAdminUserMock).toHaveBeenCalledWith({
      email: 'admin.novo@datagrapho.local',
      cpf: '529.982.247-25',
      nome: 'Admin Novo',
      password: 'SenhaSegura123',
      is_active: true,
      is_superuser: true,
    })
  })
})
