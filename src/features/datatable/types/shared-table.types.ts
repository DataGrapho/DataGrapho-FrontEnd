export type DataTableFilterValue = string | number | boolean | null

export type DataTableFilters = Record<string, DataTableFilterValue>

export type DataTableFilterOption = {
  label: string
  value: DataTableFilterValue
}

export type DataTableEditType = 'text' | 'number' | 'boolean' | 'select' | 'catalog'

export type DataTableColumn = {
  key: string
  label: string
  width?: string
  minWidth?: string
  align?: 'start' | 'center' | 'end'
  sortable?: boolean
  filterable?: boolean
  filterType?: 'text' | 'number' | 'select'
  filterPlaceholder?: string
  filterOptions?: DataTableFilterOption[]
  editable?: boolean
  editType?: DataTableEditType
  editOptions?: DataTableFilterOption[]
  apiField?: string
  readOnly?: boolean
  visibleInViews?: string[]
  editOnly?: boolean
}

export type DataTableRow = Record<string, unknown>

export type DataTableViewPreset = {
  id: string
  label: string
  columnKeys: string[]
  filters?: DataTableFilters
}

export type DataTableSortState = {
  key: string
  direction: 'asc' | 'desc'
}
