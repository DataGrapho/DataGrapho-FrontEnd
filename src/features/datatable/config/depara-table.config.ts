import type { DataTableColumn, DataTableViewPreset } from '@/features/datatable/types/shared-table.types'

export const DEPARA_ROW_KEY = 'id_depara'

/** Colunas alinhadas ao DeparaListDto do backend. */
export const DEPARA_VIEW_PRESETS: DataTableViewPreset[] = [
  {
    id: 'compact',
    label: 'Compacta',
    columnKeys: ['catalogo_tabela', 'codigo_origem', 'codigo_destino', 'ativo'],
  },
  {
    id: 'full',
    label: 'Completa',
    columnKeys: [
      'id_depara',
      'catalogo_tabela',
      'codigo_origem',
      'descricao_origem',
      'codigo_destino',
      'descricao_destino',
      'ativo',
      'criado_em',
    ],
  },
]

export const DEPARA_FILTER_VIEW_PRESETS: DataTableViewPreset[] = [
  {
    id: 'all',
    label: 'Todos',
    columnKeys: [],
  },
  {
    id: 'active',
    label: 'Somente ativos',
    columnKeys: [],
    filters: { ativo: true },
  },
]

export function buildDeparaColumns (): DataTableColumn[] {
  return [
    {
      key: 'id_depara',
      label: 'ID',
      width: '72px',
      minWidth: '72px',
      readOnly: true,
      sortable: true,
      visibleInViews: ['full'],
    },
    {
      key: 'catalogo_tabela',
      label: 'Catalogo / Tabela',
      minWidth: '220px',
      width: '220px',
      editable: true,
      editType: 'catalog',
      apiField: 'id_catalogo',
      sortable: true,
      visibleInViews: ['compact', 'full'],
    },
    {
      key: 'codigo_origem',
      label: 'Codigo origem',
      minWidth: '160px',
      width: '160px',
      editable: true,
      editType: 'text',
      apiField: 'codigo_origem',
      sortable: true,
      visibleInViews: ['compact', 'full'],
    },
    {
      key: 'descricao_origem',
      label: 'Descricao origem',
      minWidth: '200px',
      width: '200px',
      editable: true,
      editType: 'text',
      apiField: 'descricao_origem',
      editOnly: true,
      sortable: true,
      visibleInViews: ['full'],
    },
    {
      key: 'codigo_destino',
      label: 'Codigo destino',
      minWidth: '160px',
      width: '160px',
      editable: true,
      editType: 'text',
      apiField: 'codigo_destino',
      sortable: true,
      visibleInViews: ['compact', 'full'],
    },
    {
      key: 'descricao_destino',
      label: 'Descricao destino',
      minWidth: '200px',
      width: '200px',
      editable: true,
      editType: 'text',
      apiField: 'descricao_destino',
      editOnly: true,
      sortable: true,
      visibleInViews: ['full'],
    },
    {
      key: 'ativo',
      label: 'Status',
      width: '100px',
      minWidth: '100px',
      editable: true,
      editType: 'boolean',
      apiField: 'ativo',
      sortable: true,
      visibleInViews: ['compact', 'full'],
    },
    {
      key: 'criado_em',
      label: 'Criado em',
      width: '130px',
      minWidth: '130px',
      readOnly: true,
      sortable: true,
      visibleInViews: ['full'],
    },
  ]
}

export function resolveVisibleColumns (
  allColumns: DataTableColumn[],
  viewId: string,
  options: { editMode?: boolean } = {},
) {
  const preset = DEPARA_VIEW_PRESETS.find(view => view.id === viewId)
  const allowedKeys = new Set(preset?.columnKeys ?? allColumns.map(column => column.key))

  return allColumns.filter(column => {
    if (column.editOnly && options.editMode) return true

    if (column.editOnly && !options.editMode) {
      if (!allowedKeys.has(column.key)) return false
      return column.visibleInViews?.includes(viewId) ?? false
    }

    if (!allowedKeys.has(column.key)) return false
    if (!column.visibleInViews?.length) return true
    return column.visibleInViews.includes(viewId)
  })
}

export function formatDeparaDate (value: unknown) {
  if (!value) return '-'
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}
