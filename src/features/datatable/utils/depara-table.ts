import type { DeparaListItem, DeparaTableRow } from '@/features/datatable/types/depara.types'
import type { DataTableFilters, DataTableFilterValue } from '@/features/datatable/types/shared-table.types'

export function buildDeparaTableRows (items: DeparaListItem[]): DeparaTableRow[] {
  const rowsById = new Map(items.map(item => [item.id_depara, item]))

  return items.map(item => {
    const parent = item.id_depara_pai ? rowsById.get(item.id_depara_pai) : undefined

    return {
      ...item,
      parent_codigo_origem: parent?.codigo_origem ?? '',
      parent_codigo_destino: parent?.codigo_destino ?? '',
      parent_catalogo_tabela: parent?.catalogo_tabela ?? '',
      relation_label: parent
        ? `${parent.codigo_origem} -> ${parent.codigo_destino}`
        : item.id_depara_pai
          ? `Pai #${item.id_depara_pai}`
          : 'Sem pai',
    }
  })
}

export function filterDeparaRows (
  rows: DeparaTableRow[],
  filters: DataTableFilters,
  globalSearch: string,
) {
  const normalizedGlobalSearch = normalizeSearchValue(globalSearch)

  return rows.filter(row => {
    if (normalizedGlobalSearch && !matchesGlobalSearch(row, normalizedGlobalSearch)) {
      return false
    }

    return Object.entries(filters).every(([key, value]) => {
      if (isEmptyFilter(value)) return true

      const rowValue = row[key as keyof DeparaTableRow]
      if (typeof value === 'boolean') return rowValue === value

      return normalizeSearchValue(rowValue).includes(normalizeSearchValue(value))
    })
  })
}

function matchesGlobalSearch (row: DeparaTableRow, search: string) {
  const searchableValues = [
    row.id_depara,
    row.id_catalogo,
    row.catalogo_tabela,
    row.codigo_origem,
    row.codigo_destino,
    row.parent_codigo_origem,
    row.parent_codigo_destino,
    row.parent_catalogo_tabela,
    row.relation_label,
  ]

  return searchableValues.some(value => normalizeSearchValue(value).includes(search))
}

function isEmptyFilter (value: DataTableFilterValue) {
  return value === null || value === ''
}

function normalizeSearchValue (value: unknown) {
  return String(value ?? '')
    .trim()
    .toLocaleLowerCase('pt-BR')
}
