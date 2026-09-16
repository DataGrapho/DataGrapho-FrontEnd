import type { AuthSession, LoginResponse } from '@/features/auth/types/auth.types'
import { getAccessTokenExpiresAt, isAccessTokenExpired, isJwtExpired } from '@/shared/utils/jwt'

const AUTH_SESSION_STORAGE_KEY = 'datafit.auth.session'
let inMemorySession: AuthSession | null = null

function createSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `session-${Date.now()}`
}

function safeParseSession(rawValue: string | null) {
  if (!rawValue) return null

  try {
    const parsed = JSON.parse(rawValue) as Partial<AuthSession>
    if (!parsed || typeof parsed !== 'object') return null
    if (!parsed.accountId || !parsed.accessToken || !parsed.createdAt) return null

    const session = {
      sessionId: parsed.sessionId ?? createSessionId(),
      accountId: String(parsed.accountId),
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      expiresAt: parsed.expiresAt,
      createdAt: parsed.createdAt,
      usuario: parsed.usuario,
      acessos: parsed.acessos ?? [],
    } satisfies AuthSession

    return {
      ...session,
      expiresAt: resolveSessionExpiresAt(session),
    }
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

function resolveSessionExpiresAt(session: Pick<AuthSession, 'expiresAt' | 'accessToken'>) {
  if (session.expiresAt) return session.expiresAt

  if (!session.accessToken) return undefined

  return getAccessTokenExpiresAt(session.accessToken) ?? undefined
}

function isSessionFullyExpired(session: AuthSession) {
  const hasValidAccess = Boolean(
    session.accessToken && !isAccessTokenExpired(session.accessToken),
  )
  if (hasValidAccess) return false

  const hasValidRefresh = Boolean(
    session.refreshToken && !isJwtExpired(session.refreshToken),
  )

  return !hasValidRefresh
}

function readStoredSession() {
  if (inMemorySession) return inMemorySession
  if (typeof window === 'undefined') return null

  const session = safeParseSession(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY))
  inMemorySession = session
  return session
}

export function updateAuthenticatedSessionTokens(accessToken: string, refreshToken?: string) {
  const session = readStoredSession()
  if (!session) return null

  const nextSession: AuthSession = {
    ...session,
    accessToken,
    refreshToken: refreshToken ?? session.refreshToken,
    expiresAt: getAccessTokenExpiresAt(accessToken) ?? undefined,
  }

  writeSession(nextSession)
  return nextSession
}

export function getAuthenticatedSession() {
  const session = readStoredSession()
  if (!session) return null

  if (isSessionFullyExpired(session)) {
    clearAuthenticatedSession()
    return null
  }

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
    expiresAt: getAccessTokenExpiresAt(loginResponse.access) ?? undefined,
    createdAt: new Date().toISOString(),
    usuario: loginResponse.usuario,
    acessos: loginResponse.acessos ?? [],
  }

  writeSession(session)
  return session
}

export function clearAuthenticatedSession() {
  writeSession(null)
}

export function isSessionAuthenticated() {
  return getAuthenticatedSession() !== null
}
