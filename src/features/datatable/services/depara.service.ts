import { requestJson } from '@/shared/services/http'
import type { ApiListResponse, DeparaListItem } from '@/features/datatable/types/depara.types'

export async function listDepara () {
  return await requestJson<ApiListResponse<DeparaListItem>>('/depara/')
}
