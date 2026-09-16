import { hasSuperuserAccess } from '@/features/auth/services/user-permissions.service'
import { getAuthenticatedSession } from '@/features/auth/services/auth-session.service'
import { ApiError } from '@/shared/services/http'
import { authorizedRequestJson } from '@/shared/services/authorized-request'
import { mapHttpStatusMessage, mapRecordFieldErrors } from '@/shared/services/api-error.mapper'
import { listActiveOrganizationOptions } from '@/shared/services/organization.service'
import { buildManageUsersRegisterSchema } from '@/features/manage-users/services/manage-users-schema.builder'
import type {
  ManageUsersBranch,
  ManageUsersCompany,
  ManageUsersCreatePayload,
  ManageUsersCreateResponse,
  ManageUsersDepartment,
  ManageUsersFieldErrorMap,
  ManageUsersListItem,
  ManageUsersProfile,
  ManageUsersRegisterSchema,
  ManageUsersUpdatePayload,
} from '@/features/manage-users/types/manage-users.types'

const MANAGE_USERS_ENDPOINTS = {
  register: '/auth/register/',
  usuarios: '/auth/usuarios/',
} as const

type ApiListResponse<T> = {
  success?: boolean
  count?: number
  data?: T[]
}

type ApiUsuarioRecord = {
  id_usuario: number
  cpf?: string
  email: string
  nome: string
  is_active?: boolean
  is_staff?: boolean
  is_superuser?: boolean
  data_criacao?: string
  acessos?: Array<{
    id?: number
    ativo?: boolean
    empresa?: { id_empresa: number; nome: string; cnpj?: string } | null
    filial?: { id_filial: number; nome: string } | null
    setor?: { id_setor: number; nome: string } | null
    perfil?: { id_perfil: number; nome: string; ativo?: boolean } | null
  }>
}

const MANAGE_USER_FIELD_KEYS = ['email', 'cpf', 'nome', 'password', 'acessos'] as const

export class ManageUsersRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fieldErrors: ManageUsersFieldErrorMap = {},
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ManageUsersRequestError'
  }
}

function mapBackendFieldErrors(details: unknown): ManageUsersFieldErrorMap {
  return mapRecordFieldErrors(details, MANAGE_USER_FIELD_KEYS)
}

function formatAccessSummary(acessos: ApiUsuarioRecord['acessos']) {
  if (!acessos?.length) return '—'

  return acessos
    .map((access) => {
      const empresa = access.empresa?.nome ?? 'Empresa'
      const perfil = access.perfil?.nome ?? 'Perfil'
      return `${empresa} / ${perfil}`
    })
    .join('; ')
}

function mapUsuarioToListItem(record: ApiUsuarioRecord): ManageUsersListItem {
  return {
    id_usuario: record.id_usuario,
    cpf: record.cpf ?? '',
    email: record.email,
    nome: record.nome,
    status: record.is_active === false ? 'inativo' : 'ativo',
    acessos: formatAccessSummary(record.acessos),
    criado_em: record.data_criacao ?? '',
    is_active: record.is_active !== false,
    is_staff: record.is_staff === true,
    is_superuser: record.is_superuser === true,
    acessos_detalhes: (record.acessos ?? []).map((access) => ({
      id_empresa: access.empresa?.id_empresa ?? 0,
      id_filial: access.filial?.id_filial ?? null,
      id_setor: access.setor?.id_setor ?? null,
      id_perfil: access.perfil?.id_perfil ?? 0,
      ativo: access.ativo !== false,
    })).filter((access) => access.id_empresa > 0 && access.id_perfil > 0),
  }
}

async function fetchOrganizationOptions() {
  const { empresas, filiais, setores, perfis } = await listActiveOrganizationOptions()

  const empresas_atribuiveis: ManageUsersCompany[] = empresas.map((item) => ({
    id_empresa: item.id_empresa,
    nome: item.nome,
    cnpj: item.cnpj,
  }))

  const filiais_atribuiveis: ManageUsersBranch[] = filiais.map((item) => ({
    id_filial: item.id_filial,
    nome: item.nome,
    id_empresa: item.empresa,
  }))

  const setores_atribuiveis: ManageUsersDepartment[] = setores.map((item) => ({
    id_setor: item.id_setor,
    nome: item.nome,
    id_filial: item.filial,
  }))

  const perfis_atribuiveis: ManageUsersProfile[] = perfis.map((item) => ({
    id_perfil: item.id_perfil,
    nome: item.nome,
    ativo: item.ativo ?? true,
  }))

  return {
    empresas_atribuiveis,
    filiais_atribuiveis,
    setores_atribuiveis,
    perfis_atribuiveis,
  }
}

function throwManageUsersRequestError(error: ApiError) {
  const fieldErrors = mapBackendFieldErrors(error.details)
  throw new ManageUsersRequestError(
    mapHttpStatusMessage(error.status, error.details, { context: 'users' }),
    error.status,
    fieldErrors,
    error.details,
  )
}

export async function getManageUsersRegisterSchema(): Promise<ManageUsersRegisterSchema> {
  const session = getAuthenticatedSession()
  const baseSchema = buildManageUsersRegisterSchema()

  if (!hasSuperuserAccess(session)) {
    return baseSchema
  }

  try {
    const organizationOptions = await fetchOrganizationOptions()
    return {
      ...baseSchema,
      ...organizationOptions,
    }
  } catch {
    return baseSchema
  }
}

export async function listManageUsers() {
  const response = await authorizedRequestJson<ApiListResponse<ApiUsuarioRecord>>(
    MANAGE_USERS_ENDPOINTS.usuarios,
  )

  return (response.data ?? []).map(mapUsuarioToListItem)
}

export async function createManageUser(payload: ManageUsersCreatePayload) {
  try {
    return await authorizedRequestJson<ManageUsersCreateResponse>(MANAGE_USERS_ENDPOINTS.register, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  } catch (error) {
    if (error instanceof ApiError) throwManageUsersRequestError(error)
    throw error
  }
}

export async function updateManageUser(idUsuario: number, payload: ManageUsersUpdatePayload) {
  try {
    await authorizedRequestJson(`${MANAGE_USERS_ENDPOINTS.usuarios}${idUsuario}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  } catch (error) {
    if (error instanceof ApiError) throwManageUsersRequestError(error)
    throw error
  }
}

export async function deleteManageUser(idUsuario: number) {
  try {
    await authorizedRequestJson(`${MANAGE_USERS_ENDPOINTS.usuarios}${idUsuario}/`, {
      method: 'DELETE',
    })
  } catch (error) {
    if (error instanceof ApiError) throwManageUsersRequestError(error)
    throw error
  }
}
