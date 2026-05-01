export type ApiListResponse<TData> = {
  success: boolean
  count: number
  data: TData[]
  error?: string
}

export type CatalogoDeparaListItem = {
  id_catalogo: number
  tabela_origem: string
  descricao: string | null
  ativo: boolean
}

export type DeparaListItem = {
  id_depara: number
  id_catalogo: number
  id_depara_pai?: number | null
  catalogo_tabela: string
  codigo_origem: string
  codigo_destino: string
  ativo: boolean
  criado_em: string
}

export type DeparaTableRow = DeparaListItem & {
  parent_codigo_origem: string
  parent_codigo_destino: string
  parent_catalogo_tabela: string
  relation_label: string
}
