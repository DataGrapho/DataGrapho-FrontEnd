import { describe, expect, it, vi } from 'vitest'
import { useManageUserForm } from '@/features/manage-users/composables/useManageUserForm'
import { buildAdminSession, buildRegisterSchema } from '../../helpers/manage-users-test-utils'

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

describe('integracao do fluxo de criacao de usuario', () => {
  it('envia payload valido para criacao', async () => {
    getAuthenticatedSessionMock.mockReturnValue(buildAdminSession())
    getManageUsersRegisterSchemaMock.mockResolvedValue(buildRegisterSchema())
    createManageUserMock.mockResolvedValue({
      usuario: { id_usuario: 90, email: 'novo@datagrapho.local', nome: 'Novo', is_active: true },
      acessos: [{ id: 1, ativo: true }],
    })

    const store = useManageUserForm()
    await store.loadSchema()

    store.form.value.email = 'novo@datagrapho.local'
    store.form.value.cpf = '529.982.247-25'
    store.form.value.nome = 'Novo Usuario'
    store.form.value.password = 'SenhaSegura123'
    store.addAccess()
    store.form.value.acessos[0].id_empresa = 1
    store.form.value.acessos[0].id_perfil = 2

    const saved = await store.submit()

    expect(saved).toBe(true)
    expect(createManageUserMock).toHaveBeenCalledWith({
      email: 'novo@datagrapho.local',
      cpf: '529.982.247-25',
      nome: 'Novo Usuario',
      password: 'SenhaSegura123',
      is_active: true,
      is_staff: false,
      is_superuser: false,
      acessos: [{ id_empresa: 1, id_filial: null, id_setor: null, id_perfil: 2, ativo: true }],
    })
  })

  it('permite criar usuario sem acessos', async () => {
    getAuthenticatedSessionMock.mockReturnValue(buildAdminSession())
    getManageUsersRegisterSchemaMock.mockResolvedValue(buildRegisterSchema())
    createManageUserMock.mockResolvedValue({
      usuario: { id_usuario: 91, email: 'sem.acesso@datagrapho.local', nome: 'Sem Acesso', is_active: true },
      acessos: [],
    })

    const store = useManageUserForm()
    await store.loadSchema()

    store.form.value.email = 'sem.acesso@datagrapho.local'
    store.form.value.cpf = '529.982.247-25'
    store.form.value.nome = 'Sem Acesso'
    store.form.value.password = 'SenhaSegura123'

    await store.submit()

    expect(createManageUserMock).toHaveBeenCalledWith({
      email: 'sem.acesso@datagrapho.local',
      cpf: '529.982.247-25',
      nome: 'Sem Acesso',
      password: 'SenhaSegura123',
      is_active: true,
      is_staff: false,
      is_superuser: false,
    })
  })

  it('envia is_staff true quando tipo administrador esta selecionado', async () => {
    getAuthenticatedSessionMock.mockReturnValue(buildAdminSession())
    getManageUsersRegisterSchemaMock.mockResolvedValue(buildRegisterSchema())
    createManageUserMock.mockResolvedValue({
      usuario: { id_usuario: 92, email: 'admin.novo@datagrapho.local', nome: 'Admin Novo', is_active: true },
      acessos: [],
    })

    const store = useManageUserForm()
    await store.loadSchema()

    store.form.value.email = 'admin.novo@datagrapho.local'
    store.form.value.cpf = '529.982.247-25'
    store.form.value.nome = 'Admin Novo'
    store.form.value.password = 'SenhaSegura123'
    store.form.value.roleType = 'administrador'

    await store.submit()

    expect(createManageUserMock).toHaveBeenCalledWith({
      email: 'admin.novo@datagrapho.local',
      cpf: '529.982.247-25',
      nome: 'Admin Novo',
      password: 'SenhaSegura123',
      is_active: true,
      is_staff: true,
      is_superuser: false,
    })
  })
})
