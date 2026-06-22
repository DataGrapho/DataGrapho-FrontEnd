import type { AuthSession } from '@/features/auth/types/auth.types'
import type { AdminUsersRegisterSchema } from '@/features/admin-users/types/admin-users.types'

export function buildAdminSession(overrides: Partial<AuthSession> = {}): AuthSession {
  return {
    sessionId: 'session-admin',
    accountId: '1',
    accessToken: 'token',
    refreshToken: 'refresh',
    createdAt: new Date().toISOString(),
    usuario: {
      id_usuario: 1,
      email: 'admin@datagrapho.local',
      nome: 'Admin',
      is_staff: true,
    },
    acessos: [
      {
        id: 1,
        ativo: true,
        empresa: {
          id_empresa: 1,
          nome: 'Datafit Holding',
        },
        perfil: {
          id_perfil: 1,
          nome: 'Administrador',
          ativo: true,
        },
      },
    ],
    ...overrides,
  }
}

export function buildNonAdminSession(overrides: Partial<AuthSession> = {}): AuthSession {
  return buildAdminSession({
    usuario: {
      id_usuario: 2,
      email: 'user@datagrapho.local',
      nome: 'User',
      is_staff: false,
    },
    acessos: [
      {
        id: 2,
        ativo: true,
        perfil: {
          id_perfil: 3,
          nome: 'Analista',
          ativo: true,
        },
      },
    ],
    ...overrides,
  })
}

export function buildRegisterSchema(overrides: Partial<AdminUsersRegisterSchema> = {}): AdminUsersRegisterSchema {
  return {
    campos: [
      { nome: 'email', rotulo: 'Email', tipo: 'email', obrigatorio: true },
      { nome: 'cpf', rotulo: 'CPF', tipo: 'text', obrigatorio: true },
      { nome: 'nome', rotulo: 'Nome', tipo: 'text', obrigatorio: true },
      { nome: 'password', rotulo: 'Senha', tipo: 'password', obrigatorio: true },
    ],
    perfis_atribuiveis: [
      { id_perfil: 1, nome: 'Administrador', ativo: true },
      { id_perfil: 2, nome: 'Gestor', ativo: true },
      { id_perfil: 3, nome: 'Analista', ativo: true },
    ],
    empresas_atribuiveis: [
      { id_empresa: 1, nome: 'Datafit Holding' },
    ],
    filiais_atribuiveis: [],
    setores_atribuiveis: [],
    ...overrides,
  }
}
