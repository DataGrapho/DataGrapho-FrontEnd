import {
  redirectToLogin,
  resolveAuthorizedHeaders,
  retryRequestAfterUnauthorized,
} from '@/features/auth/services/auth-token-refresh.service'
import { buildApiUrl } from '@/shared/services/api-url'

export { buildApiUrl } from '@/shared/services/api-url'

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

async function executeFetch(
  path: string,
  options: RequestInit & { query?: Record<string, QueryValue> } = {},
) {
  const { query, headers, ...requestOptions } = options
  const authorizedHeaders = await resolveAuthorizedHeaders(headers)

  return fetch(buildApiUrl(path, query), {
    ...requestOptions,
    headers: {
      Accept: 'application/json',
      ...Object.fromEntries(new Headers(authorizedHeaders).entries()),
    },
  })
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? ''
  const body = contentType.includes('application/json') ? await response.json() : undefined
  return body
}

export async function requestJson<TResponse> (
  path: string,
  options: RequestInit & { query?: Record<string, QueryValue> } = {},
) {
  let response = await executeFetch(path, options)
  let body = await parseResponse(response)

  if (response.status === 401) {
    const retriedBody = await retryRequestAfterUnauthorized(path, options, async (retryPath, retryOptions) => {
      const retryResponse = await executeFetch(retryPath, retryOptions)
      if (!retryResponse.ok) return null

      return parseResponse(retryResponse) as TResponse
    })

    if (retriedBody !== null) {
      return retriedBody
    }

    redirectToLogin()
    throw new ApiError(`Request failed with status ${response.status}`, response.status, body)
  }

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`, response.status, body)
  }

  return body as TResponse
}
