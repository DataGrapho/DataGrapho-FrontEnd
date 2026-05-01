import { requestJson } from '@/shared/services/http'
import type { ApiListResponse, CatalogoDeparaListItem } from '@/features/datatable/types/depara.types'

export async function listCatalogosDepara () {
  return await requestJson<ApiListResponse<CatalogoDeparaListItem>>('/catalogo/')
}
