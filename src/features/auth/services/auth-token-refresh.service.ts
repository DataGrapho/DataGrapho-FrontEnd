import {
  clearAuthenticatedSession,
  getAuthenticatedSession,
  updateAuthenticatedSessionTokens,
} from '@/features/auth/services/auth-session.service'
import { buildApiUrl } from '@/shared/services/api-url'
import { isJwtExpired } from '@/shared/utils/jwt'

const REFRESH_ENDPOINT = '/auth/refresh/'
const REFRESH_BUFFER_MS = 60_000

type RefreshResponse = {
  access: string
  refresh?: string
}

let refreshPromise: Promise<string | null> | null = null

function hasAuthorizationHeader(headers?: HeadersInit) {
  if (!headers) return false

  if (headers instanceof Headers) {
    return headers.has('Authorization')
  }

  if (Array.isArray(headers)) {
    return headers.some(([key]) => key.toLowerCase() === 'authorization')
  }

  return Object.keys(headers).some((key) => key.toLowerCase() === 'authorization')
}

function isRefreshRequest(path: string) {
  return path.includes(REFRESH_ENDPOINT)
}

export function redirectToLogin() {
  clearAuthenticatedSession()

  if (typeof window === 'undefined') return

  const loginPath = '/login'
  if (window.location.pathname === loginPath) return

  window.location.href = loginPath
}

async function requestTokenRefresh(refreshToken: string) {
  try {
    const response = await fetch(buildApiUrl(REFRESH_ENDPOINT), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    if (!response.ok) return null

    const body = await response.json() as RefreshResponse
    if (!body?.access) return null

    return body
  } catch {
    return null
  }
}

function accessTokenNeedsRefresh(accessToken: string | undefined, now = Date.now()) {
  if (!accessToken) return true

  return isJwtExpired(accessToken, now + REFRESH_BUFFER_MS)
}

function canRefreshSession(session: NonNullable<ReturnType<typeof getAuthenticatedSession>>) {
  return Boolean(session.refreshToken && !isJwtExpired(session.refreshToken))
}

async function refreshAccessTokenInternal() {
  const session = getAuthenticatedSession()
  if (!session) return null

  if (!canRefreshSession(session)) {
    redirectToLogin()
    return null
  }

  const tokens = await requestTokenRefresh(session.refreshToken!)
  if (!tokens) {
    redirectToLogin()
    return null
  }

  updateAuthenticatedSessionTokens(tokens.access, tokens.refresh)
  return tokens.access
}

export async function ensureValidAccessToken() {
  try {
    const session = getAuthenticatedSession()
    if (!session) return null

    if (!accessTokenNeedsRefresh(session.accessToken)) {
      return session.accessToken
    }

    if (!refreshPromise) {
      refreshPromise = refreshAccessTokenInternal().finally(() => {
        refreshPromise = null
      })
    }

    return await refreshPromise
  } catch {
    redirectToLogin()
    return null
  }
}

export async function retryRequestAfterUnauthorized<TResponse>(
  path: string,
  options: RequestInit & { query?: Record<string, string | number | boolean | null | undefined> },
  execute: (path: string, options: RequestInit & { query?: Record<string, string | number | boolean | null | undefined> }) => Promise<TResponse>,
) {
  if (isRefreshRequest(path) || !hasAuthorizationHeader(options.headers)) {
    return null
  }

  const session = getAuthenticatedSession()
  if (!session || !canRefreshSession(session)) {
    return null
  }

  const accessToken = await refreshAccessTokenInternal()
  if (!accessToken) return null

  const retryHeaders = new Headers(options.headers)
  retryHeaders.set('Authorization', `Bearer ${accessToken}`)

  return execute(path, {
    ...options,
    headers: retryHeaders,
  })
}

export async function resolveAuthorizedHeaders(headers?: HeadersInit) {
  if (!hasAuthorizationHeader(headers)) {
    return headers
  }

  const accessToken = await ensureValidAccessToken()
  if (!accessToken) return headers

  const nextHeaders = new Headers(headers)
  nextHeaders.set('Authorization', `Bearer ${accessToken}`)
  return nextHeaders
}

export async function fetchWithBearerAuth(url: string, init: RequestInit = {}) {
  const token = await ensureValidAccessToken()
  if (!token) throw new Error('Usuario nao autenticado')

  const buildInit = (accessToken: string) => ({
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.headers || {}),
    },
  })

  let response = await fetch(url, buildInit(token))

  if (response.status === 401) {
    const refreshedToken = await refreshAccessTokenInternal()
    if (refreshedToken) {
      response = await fetch(url, buildInit(refreshedToken))
    }

    if (response.status === 401) {
      redirectToLogin()
    }
  }

  return response
}
