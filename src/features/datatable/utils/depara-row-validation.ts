export function isDeparaRequiredFieldEmpty (
  row: {
    id_catalogo?: number
    catalogo_tabela?: string
    newCatalogoTabela?: string | null
    codigo_origem?: string
    codigo_destino?: string
  },
  columnKey: string,
) {
  if (columnKey === 'catalogo_tabela') {
    const hasCatalog = (row.id_catalogo && row.id_catalogo > 0)
      || Boolean(row.newCatalogoTabela?.trim())
      || Boolean(String(row.catalogo_tabela ?? '').trim())
    return !hasCatalog
  }

  if (columnKey === 'codigo_origem') {
    return !String(row.codigo_origem ?? '').trim()
  }

  if (columnKey === 'codigo_destino') {
    return !String(row.codigo_destino ?? '').trim()
  }

  return false
}

export const DEPARA_REQUIRED_FIELD_LABELS: Record<string, string> = {
  catalogo_tabela: 'Catalogo / tabela obrigatorio.',
  codigo_origem: 'Codigo origem obrigatorio.',
  codigo_destino: 'Codigo destino obrigatorio.',
}
