export type DeparaDialogItem = {
  id_depara?: number
  id_catalogo: number
  catalogo_tabela: string
  newCatalogoTabela?: string | null
  codigo_origem: string
  codigo_destino: string
  descricao_origem?: string | null
  descricao_destino?: string | null
  ativo: boolean
}
