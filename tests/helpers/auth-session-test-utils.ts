import type { AuthSession } from '@/features/auth/types/auth.types'

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
      is_superuser: true,
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
      is_superuser: false,
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

export function buildStaffSession(overrides: Partial<AuthSession> = {}): AuthSession {
  return buildAdminSession({
    usuario: {
      id_usuario: 3,
      email: 'staff@datagrapho.local',
      nome: 'Staff',
      is_superuser: false,
      is_staff: true,
    },
    ...overrides,
  })
}
