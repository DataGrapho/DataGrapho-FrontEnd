export type ApiListResponse<TData> = {
  success: boolean
  count: number
  data: TData[]
  error?: string
}

export type ApiDetailResponse<TData> = {
  success: boolean
  data: TData
  error?: string
  message?: string
}

export type ApiMutationResponse<TData> = {
  success: boolean
  data?: TData
  error?: string
  message?: string
}

export type CatalogoDeparaListItem = {
  id_catalogo: number
  tabela_origem: string
  descricao: string | null
  ativo: boolean
}

/** Campos retornados por GET /depara/ (DeparaListDto). */
export type DeparaListItem = {
  id_depara: number
  id_catalogo: number
  catalogo_tabela: string
  codigo_origem: string
  descricao_origem: string | null
  codigo_destino: string
  descricao_destino: string | null
  ativo: boolean
  criado_em: string
}

/** Campos extras em GET /depara/{id}/ (DeparaDetailDto). */
export type DeparaDetailItem = DeparaListItem & {
  id_acesso: number | null
  atualizado_em: string
  catalogo?: {
    id_catalogo: number
    tabela_origem: string
    descricao: string | null
    ativo: boolean
  }
}

/** Payload de POST/PATCH (DeparaDto — descricoes opcionais). */
export type DeparaCreatePayload = {
  id_catalogo: number
  codigo_origem: string
  codigo_destino: string
  descricao_origem?: string | null
  descricao_destino?: string | null
  ativo?: boolean
}

export type DeparaUpdatePayload = Partial<DeparaCreatePayload>

export type DeparaListQuery = {
  id_catalogo?: number
  ativo?: boolean
  codigo_origem?: string
  codigo_destino?: string
  search?: string
}

export type EditableDeparaRow = DeparaListItem & {
  newCatalogoTabela?: string | null
  _rowKey: string
  _isNew?: boolean
  _isDirty?: boolean
  [key: string]: unknown
}
