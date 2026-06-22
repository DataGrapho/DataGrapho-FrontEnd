import { describe, expect, it, vi } from 'vitest'
import { buildAdminUsersRegisterSchema } from '@/features/admin-users/services/admin-users-schema.builder'
import { buildAdminSession } from '../../../helpers/admin-users-test-utils'

const { getAuthenticatedSessionMock } = vi.hoisted(() => ({
  getAuthenticatedSessionMock: vi.fn(),
}))

vi.mock('@/features/auth/services/auth-session.service', () => ({
  getAuthenticatedSession: getAuthenticatedSessionMock,
}))

describe('schema de cadastro administrativo', () => {
  it('monta opcoes apenas a partir dos acessos da sessao', () => {
    getAuthenticatedSessionMock.mockReturnValue(buildAdminSession())

    const schema = buildAdminUsersRegisterSchema()

    expect(schema.empresas_atribuiveis).toEqual([
      { id_empresa: 1, nome: 'Datafit Holding' },
    ])
    expect(schema.perfis_atribuiveis).toEqual([
      { id_perfil: 1, nome: 'Administrador', ativo: true },
    ])
  })

  it('retorna listas vazias quando a sessao nao tem acessos', () => {
    getAuthenticatedSessionMock.mockReturnValue(buildAdminSession({ acessos: [] }))

    const schema = buildAdminUsersRegisterSchema()

    expect(schema.empresas_atribuiveis).toEqual([])
    expect(schema.perfis_atribuiveis).toEqual([])
    expect(schema.filiais_atribuiveis).toEqual([])
    expect(schema.setores_atribuiveis).toEqual([])
  })
})
