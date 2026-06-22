import { getAuthenticatedSession } from '@/features/auth/services/auth-session.service'
import type { AuthUserAccess } from '@/features/auth/types/auth.types'
import type {
  AdminUsersBranch,
  AdminUsersCompany,
  AdminUsersDepartment,
  AdminUsersProfile,
  AdminUsersRegisterSchema,
} from '@/features/admin-users/types/admin-users.types'

const REGISTER_DTO_FIELDS: AdminUsersRegisterSchema['campos'] = [
  { nome: 'email', rotulo: 'Email', tipo: 'email', obrigatorio: true, max_length: 255 },
  { nome: 'cpf', rotulo: 'CPF', tipo: 'text', obrigatorio: true, max_length: 14 },
  { nome: 'nome', rotulo: 'Nome completo', tipo: 'text', obrigatorio: true, max_length: 200 },
  { nome: 'password', rotulo: 'Senha', tipo: 'password', obrigatorio: true, min_length: 6 },
]

type AccessWithHierarchy = AuthUserAccess & {
  empresa?: { id_empresa: number; nome: string; cnpj?: string } | null
  filial?: { id_filial: number; nome: string } | null
  setor?: { id_setor: number; nome: string } | null
}

function uniqueCompanies(accesses: AccessWithHierarchy[]): AdminUsersCompany[] {
  const companies = new Map<number, AdminUsersCompany>()

  for (const access of accesses) {
    const empresa = access.empresa
    if (!empresa?.id_empresa || !empresa.nome) continue
    companies.set(empresa.id_empresa, {
      id_empresa: empresa.id_empresa,
      nome: empresa.nome,
      cnpj: empresa.cnpj,
    })
  }

  return Array.from(companies.values())
}

function uniqueBranches(accesses: AccessWithHierarchy[]): AdminUsersBranch[] {
  const branches = new Map<number, AdminUsersBranch>()

  for (const access of accesses) {
    const filial = access.filial
    const empresa = access.empresa
    if (!filial?.id_filial || !filial.nome) continue
    branches.set(filial.id_filial, {
      id_filial: filial.id_filial,
      nome: filial.nome,
      id_empresa: empresa?.id_empresa,
    })
  }

  return Array.from(branches.values())
}

function uniqueDepartments(accesses: AccessWithHierarchy[]): AdminUsersDepartment[] {
  const departments = new Map<number, AdminUsersDepartment>()

  for (const access of accesses) {
    const setor = access.setor
    const filial = access.filial
    if (!setor?.id_setor || !setor.nome) continue
    departments.set(setor.id_setor, {
      id_setor: setor.id_setor,
      nome: setor.nome,
      id_filial: filial?.id_filial,
    })
  }

  return Array.from(departments.values())
}

function uniqueProfiles(accesses: AccessWithHierarchy[]): AdminUsersProfile[] {
  const profiles = new Map<number, AdminUsersProfile>()

  for (const access of accesses) {
    const perfil = access.perfil
    if (!perfil?.id_perfil || !perfil.nome) continue
    profiles.set(perfil.id_perfil, {
      id_perfil: perfil.id_perfil,
      nome: perfil.nome,
      ativo: perfil.ativo ?? true,
    })
  }

  return Array.from(profiles.values())
}

export function buildAdminUsersRegisterSchema(): AdminUsersRegisterSchema {
  const session = getAuthenticatedSession()
  const sessionAccesses = (session?.acessos ?? []) as AccessWithHierarchy[]
  const activeAccesses = sessionAccesses.filter((access) => access.ativo)

  return {
    campos: REGISTER_DTO_FIELDS,
    perfis_atribuiveis: uniqueProfiles(activeAccesses),
    empresas_atribuiveis: uniqueCompanies(activeAccesses),
    filiais_atribuiveis: uniqueBranches(activeAccesses),
    setores_atribuiveis: uniqueDepartments(activeAccesses),
  }
}
