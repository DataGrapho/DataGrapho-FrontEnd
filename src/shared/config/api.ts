const DEFAULT_PROD_API_BASE_URL = 'https://pendengas.com.br/api'
const DEFAULT_LOCAL_API_BASE_URL = 'https://pendengas.com.br/api'

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.trim().replace(/\/+$/, '')
}

function isLocalHostname(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

function resolveApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (configuredBaseUrl) {
    return normalizeBaseUrl(configuredBaseUrl)
  }

  if (typeof window !== 'undefined' && isLocalHostname(window.location.hostname)) {
    return DEFAULT_LOCAL_API_BASE_URL
  }

  return DEFAULT_PROD_API_BASE_URL
}

export const API_BASE_URL = resolveApiBaseUrl()
