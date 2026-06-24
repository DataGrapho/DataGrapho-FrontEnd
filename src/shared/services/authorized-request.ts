import { ensureValidAccessToken } from '@/features/auth/services/auth-token-refresh.service'
import { requestJson } from '@/shared/services/http'

async function getAuthHeaders() {
  const accessToken = await ensureValidAccessToken()
  const headers: Record<string, string> = {}
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`
  return headers
}

export async function authorizedRequestJson<T>(
  path: string,
  options: RequestInit = {},
) {
  return requestJson<T>(path, {
    ...options,
    headers: {
      ...(await getAuthHeaders()),
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
}
