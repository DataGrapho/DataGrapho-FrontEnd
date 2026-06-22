import { ensureValidAccessToken } from '@/features/auth/services/auth-token-refresh.service'
import { ApiError, requestJson } from '@/shared/services/http'
import { buildAdminUsersRegisterSchema } from '@/features/admin-users/services/admin-users-schema.builder'
import type {
  AdminUsersCreatePayload,
  AdminUsersCreateResponse,
  AdminUsersFieldErrorMap,
  AdminUsersRegisterSchema,
} from '@/features/admin-users/types/admin-users.types'

const ADMIN_USERS_ENDPOINTS = {
  register: '/auth/register/',
} as const

export class AdminUsersRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fieldErrors: AdminUsersFieldErrorMap = {},
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AdminUsersRequestError'
  }
}

async function getAuthHeaders() {
  const accessToken = await ensureValidAccessToken()
  const headers: Record<string, string> = {}
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`
  return headers
}

function getDetailMessage(details: unknown) {
  if (!details || typeof details !== 'object') return null
  const detail = (details as Record<string, unknown>).detail
  return typeof detail === 'string' ? detail : null
}

function readErrorMessage(value: unknown) {
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  if (typeof value === 'string') return value
  return null
}

function mapBackendFieldErrors(details: unknown): AdminUsersFieldErrorMap {
  if (!details || typeof details !== 'object') return {}
  const source = details as Record<string, unknown>
  const fieldErrors: AdminUsersFieldErrorMap = {}

  const emailError = readErrorMessage(source.email)
  if (emailError) fieldErrors.email = emailError

  const cpfError = readErrorMessage(source.cpf)
  if (cpfError) fieldErrors.cpf = cpfError

  const nomeError = readErrorMessage(source.nome)
  if (nomeError) fieldErrors.nome = nomeError

  const passwordError = readErrorMessage(source.password)
  if (passwordError) fieldErrors.password = passwordError

  const accessError = readErrorMessage(source.acessos)
  if (accessError) fieldErrors.acessos = accessError

  const detailError = getDetailMessage(details)
  if (detailError) fieldErrors.form = detailError

  return fieldErrors
}

function mapErrorMessage(status: number, details: unknown) {
  if (status === 400) return 'Nao foi possivel criar o usuario. Corrija os campos destacados.'
  if (status === 401) return 'Sessao expirada. Faca login novamente.'
  if (status === 403) return 'Permissao insuficiente para criar usuario com os acessos informados.'
  if (status >= 500) return 'Erro interno no servidor. Tente novamente em instantes.'

  return getDetailMessage(details) ?? `Falha ao processar requisicao administrativa (${status}).`
}

export async function getAdminUsersRegisterSchema(): Promise<AdminUsersRegisterSchema> {
  return buildAdminUsersRegisterSchema()
}

export async function createAdminUser(payload: AdminUsersCreatePayload) {
  try {
    return await requestJson<AdminUsersCreateResponse>(ADMIN_USERS_ENDPOINTS.register, {
      method: 'POST',
      headers: {
        ...(await getAuthHeaders()),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    if (error instanceof ApiError) {
      const fieldErrors = mapBackendFieldErrors(error.details)
      throw new AdminUsersRequestError(
        mapErrorMessage(error.status, error.details),
        error.status,
        fieldErrors,
        error.details,
      )
    }

    throw error
  }
}
