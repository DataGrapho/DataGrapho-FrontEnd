import { requestJson } from '@/shared/services/http'
import type {
  ApiDetailResponse,
  ApiListResponse,
  ApiMutationResponse,
  DeparaCreatePayload,
  DeparaDetailItem,
  DeparaListItem,
  DeparaListQuery,
  DeparaUpdatePayload,
} from '@/features/datatable/types/depara.types'

const DEPARA_ENDPOINTS = {
  list: '/depara/',
  detail: (id: number | string) => `/depara/${id}/`,
  activate: (id: number | string) => `/depara/${id}/activate/`,
  deactivate: (id: number | string) => `/depara/${id}/deactivate/`,
} as const

export async function listDepara (query: DeparaListQuery = {}) {
  return await requestJson<ApiListResponse<DeparaListItem>>(DEPARA_ENDPOINTS.list, { query })
}

export async function getDepara (id: number | string) {
  return await requestJson<ApiDetailResponse<DeparaDetailItem>>(DEPARA_ENDPOINTS.detail(id))
}

export async function createDepara (payload: DeparaCreatePayload) {
  return await requestJson<ApiMutationResponse<DeparaDetailItem>>(DEPARA_ENDPOINTS.list, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function updateDepara (id: number | string, payload: DeparaUpdatePayload) {
  return await requestJson<ApiMutationResponse<DeparaDetailItem>>(DEPARA_ENDPOINTS.detail(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function deleteDepara (id: number | string) {
  return await requestJson<ApiMutationResponse<null>>(DEPARA_ENDPOINTS.detail(id), {
    method: 'DELETE',
  })
}

export async function activateDepara (id: number | string) {
  return await requestJson<ApiMutationResponse<DeparaDetailItem>>(DEPARA_ENDPOINTS.activate(id), {
    method: 'POST',
  })
}

export async function deactivateDepara (id: number | string) {
  return await requestJson<ApiMutationResponse<DeparaDetailItem>>(DEPARA_ENDPOINTS.deactivate(id), {
    method: 'POST',
  })
}
