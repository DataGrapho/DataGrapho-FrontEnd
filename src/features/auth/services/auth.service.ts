import { ApiError, requestJson } from '@/shared/services/http'
import { authorizedRequestJson } from '@/shared/services/authorized-request'
import type {  AuthMeResponse,
  AuthUserAccess,
  ChangePasswordPayload,
  LoginPayload,
  LoginResponse,
  RequestPasswordResetPayload,
  ResetPasswordPayload,
} from '@/features/auth/types/auth.types'
type BackendLoginResponse = {
  access: string
  refresh: string
  usuario: {
    id_usuario: number
    nome?: string
    email: string
    is_active?: boolean
    is_staff?: boolean
    is_superuser?: boolean
  }
  acessos?: AuthUserAccess[]
}

export class AuthRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AuthRequestError'
  }
}

const AUTH_ENDPOINTS = {
  login: '/auth/login/',
  me: '/auth/me/',
  requestPasswordReset: '/auth/password/forgot/',
  resetPassword: '/auth/password/reset/',
  changePassword: '/auth/password/change/',
} as const

async function post<TResponse>(endpoint: string, payload: Record<string, unknown>) {
  try {
    return await requestJson<TResponse>(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    if (error instanceof ApiError) {
      throw new AuthRequestError(
        `Auth request failed with status ${error.status}`,
        error.status,
        error.details,
      )
    }

    throw error
  }
}

async function authorizedPost<TResponse>(endpoint: string, payload: Record<string, unknown>) {
  try {
    return await authorizedRequestJson<TResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  } catch (error) {
    if (error instanceof ApiError) {
      throw new AuthRequestError(
        `Auth request failed with status ${error.status}`,
        error.status,
        error.details,
      )
    }

    throw error
  }
}

export async function login(payload: LoginPayload) {
  const response = await post<BackendLoginResponse>(AUTH_ENDPOINTS.login, payload)

  return {
    access: response.access,
    refresh: response.refresh,
    usuario: response.usuario,
    acessos: response.acessos,
  } satisfies LoginResponse
}

export async function requestPasswordReset(payload: RequestPasswordResetPayload) {
  return await post<void>(AUTH_ENDPOINTS.requestPasswordReset, payload)
}

export async function resetPassword(payload: ResetPasswordPayload) {
  return await post<void>(AUTH_ENDPOINTS.resetPassword, payload)
}

export async function fetchCurrentUser() {
  return await authorizedRequestJson<AuthMeResponse>(AUTH_ENDPOINTS.me, {
    method: 'GET',
  })
}

export async function changePassword(payload: ChangePasswordPayload) {
  return await authorizedPost<void>(AUTH_ENDPOINTS.changePassword, {
    current_password: payload.currentPassword,
    password: payload.password,
    confirmPassword: payload.confirmPassword,
  })
}
