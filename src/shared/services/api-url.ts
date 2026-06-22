import { API_BASE_URL } from '@/shared/config/api'

type QueryValue = string | number | boolean | null | undefined

export function buildApiUrl(path: string, query?: Record<string, QueryValue>) {
  const baseUrl = API_BASE_URL.replace(/\/+$/, '')
  const apiBaseUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${apiBaseUrl}${normalizedPath}`)

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return
    url.searchParams.set(key, String(value))
  })

  return url.toString()
}
