import { API_BASE_URL } from '@/shared/config/api'

type QueryValue = string | number | boolean | null | undefined

export class ApiError extends Error {
  constructor (
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function buildApiUrl (path: string, query?: Record<string, QueryValue>) {
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

export async function requestJson<TResponse> (
  path: string,
  options: RequestInit & { query?: Record<string, QueryValue> } = {},
) {
  const { query, headers, ...requestOptions } = options
  const response = await fetch(buildApiUrl(path, query), {
    ...requestOptions,
    headers: {
      Accept: 'application/json',
      ...headers,
    },
  })

  const contentType = response.headers.get('content-type') ?? ''
  const body = contentType.includes('application/json') ? await response.json() : undefined

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`, response.status, body)
  }

  return body as TResponse
}
