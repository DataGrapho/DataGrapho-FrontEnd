import { API_BASE_URL } from '@/shared/config/api'
import type {
  LoginPayload,
  LoginResponse,
  RequestPasswordResetPayload,
  ResetPasswordPayload,
} from '@/features/auth/types/auth.types'

// TODO: Trocar AUTH_ENDPOINTS com as rotas reais de autenticação do backend.

const AUTH_ENDPOINTS = {
  login: '/auth/login',
  requestPasswordReset: '/auth/password/forgot',
  resetPassword: '/auth/password/reset',
} as const

async function post<TResponse>(endpoint: string, payload: Record<string, unknown>) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Auth request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  return await response.json() as TResponse
}

export async function login(payload: LoginPayload) {
  return await post<LoginResponse>(AUTH_ENDPOINTS.login, payload)
}

export async function requestPasswordReset(payload: RequestPasswordResetPayload) {
  return await post<void>(AUTH_ENDPOINTS.requestPasswordReset, payload)
}

export async function resetPassword(payload: ResetPasswordPayload) {
  return await post<void>(AUTH_ENDPOINTS.resetPassword, payload)
}
