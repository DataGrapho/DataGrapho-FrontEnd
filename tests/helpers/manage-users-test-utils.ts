import type { ManageUsersRegisterSchema } from '@/features/manage-users/types/manage-users.types'

export function buildRegisterSchema(overrides: Partial<ManageUsersRegisterSchema> = {}): ManageUsersRegisterSchema {
  return {
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

export {
  buildAdminSession,
  buildNonAdminSession,
  buildStaffSession,
} from './auth-session-test-utils'
