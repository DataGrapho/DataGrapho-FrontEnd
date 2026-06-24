import { requestJson } from '@/shared/services/http'
import type {
  ApiListResponse,
  ApiMutationResponse,
  CatalogoDeparaListItem,
} from '@/features/datatable/types/depara.types'

export type CatalogoCreatePayload = {
  tabela_origem: string
  descricao?: string | null
  ativo?: boolean
}

export async function listCatalogosDepara () {
  return await requestJson<ApiListResponse<CatalogoDeparaListItem>>('/catalogo/')
}

export async function createCatalogoDepara (payload: CatalogoCreatePayload) {
  return await requestJson<ApiMutationResponse<CatalogoDeparaListItem>>('/catalogo/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
