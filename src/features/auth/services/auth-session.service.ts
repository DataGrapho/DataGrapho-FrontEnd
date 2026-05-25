import type { AuthSession, LoginResponse } from '@/features/auth/types/auth.types'

const AUTH_SESSION_STORAGE_KEY = 'datafit.auth.session'
let inMemorySession: AuthSession | null = null

function safeParseSession(rawValue: string | null) {
  if (!rawValue) return null

  try {
    return JSON.parse(rawValue) as AuthSession
  } catch {
    return null
  }
}

function writeSession(session: AuthSession | null) {
  inMemorySession = session

  if (typeof window === 'undefined') return

  if (!session) {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session))
}

function createSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `session-${Date.now()}`
}

export function getAuthenticatedSession() {
  if (inMemorySession) return inMemorySession

  if (typeof window === 'undefined') return null

  const session = safeParseSession(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY))
  inMemorySession = session
  return session
}

export function setAuthenticatedSessionFromLogin(loginResponse: LoginResponse) {
  const accountId = loginResponse.usuario?.id_usuario
  if (!accountId) {
    throw new Error('Resposta de login sem usuario valido.')
  }

  const session: AuthSession = {
    sessionId: createSessionId(),
    accountId: String(accountId),
    accessToken: loginResponse.access,
    refreshToken: loginResponse.refresh,
    expiresAt: undefined,
    createdAt: new Date().toISOString(),
  }

  writeSession(session)
  return session
}

export function clearAuthenticatedSession() {
  writeSession(null)
}

export function isSessionAuthenticated() {
  const session = getAuthenticatedSession()
  if (!session) return false

  if (!session.expiresAt) return true

  return Number(new Date(session.expiresAt)) > Date.now()
}
