export type DataTableFilterValue = string | number | boolean | null

export type DataTableFilters = Record<string, DataTableFilterValue>

export type DataTableFilterOption = {
  label: string
  value: DataTableFilterValue
}

export type DataTableColumn = {
  key: string
  label: string
  width?: string
  minWidth?: string
  align?: 'start' | 'center' | 'end'
  filterable?: boolean
  filterType?: 'text' | 'number' | 'select'
  filterPlaceholder?: string
  filterOptions?: DataTableFilterOption[]
}

export type DataTableRow = Record<string, unknown>
