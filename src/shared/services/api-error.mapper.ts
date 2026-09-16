import { ApiError } from '@/shared/services/http'

export type ApiErrorContext = 'administration' | 'users'

function readFieldMessage(value: unknown) {
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  if (typeof value === 'string') return value
  return null
}

export function getApiDetailMessage(details: unknown) {
  if (!details || typeof details !== 'object') return null
  const detail = (details as Record<string, unknown>).detail
  return typeof detail === 'string' ? detail : null
}

export function mapHttpStatusMessage(
  status: number,
  details: unknown,
  options: { context?: ApiErrorContext; fallback?: string } = {},
) {
  if (status === 400) {
    return options.context === 'users'
      ? 'Nao foi possivel processar o usuario. Corrija os campos destacados.'
      : 'Nao foi possivel processar a solicitacao. Corrija os campos destacados.'
  }

  if (status === 401) return 'Sessao expirada. Faca login novamente.'

  if (status === 403) {
    return options.context === 'users'
      ? 'Permissao insuficiente para gerenciar usuarios com os acessos informados.'
      : 'Permissao insuficiente para esta operacao.'
  }

  if (status === 404) return 'Registro nao encontrado. Ele pode ter sido removido.'

  if (status >= 500) return 'Erro interno no servidor. Tente novamente em instantes.'

  return getApiDetailMessage(details)
    ?? options.fallback
    ?? `Falha ao processar requisicao (${status}).`
}

export function mapApiErrorMessage(
  error: unknown,
  fallback: string,
  options: { context?: ApiErrorContext } = {},
) {
  if (error instanceof ApiError) {
    return mapHttpStatusMessage(error.status, error.details, {
      context: options.context,
      fallback,
    })
  }

  return error instanceof Error ? error.message : fallback
}

export function isApiNotFoundError(error: unknown) {
  return error instanceof ApiError && error.status === 404
}

export function mapRecordFieldErrors<T extends string>(
  details: unknown,
  fields: readonly T[],
): Partial<Record<T, string>> {
  if (!details || typeof details !== 'object') return {}
  const source = details as Record<string, unknown>
  const fieldErrors: Partial<Record<T, string>> = {}

  for (const field of fields) {
    const message = readFieldMessage(source[field])
    if (message) fieldErrors[field] = message
  }

  return fieldErrors
}
