import { computed, ref, watch, type Ref } from 'vue'
import type { DataTableRow, DataTableSortState } from '@/features/datatable/types/shared-table.types'

export function useDataTableState (rows: Ref<DataTableRow[]>) {
  const currentPage = ref(1)
  const itemsPerPage = ref(25)
  const itemsPerPageOptions = [10, 25, 50, 100]
  const sortState = ref<DataTableSortState>({ key: '', direction: 'asc' })

  const sortedRows = computed(() => {
    if (!sortState.value.key) return rows.value

    const directionMultiplier = sortState.value.direction === 'asc' ? 1 : -1
    const key = sortState.value.key

    return [...rows.value].sort((leftRow, rightRow) => {
      return compareValues(leftRow[key], rightRow[key]) * directionMultiplier
    })
  })

  const pageCount = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / itemsPerPage.value)))
  const firstItemIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
  const paginatedRows = computed(() =>
    sortedRows.value.slice(firstItemIndex.value, firstItemIndex.value + itemsPerPage.value),
  )

  const visibleRangeText = computed(() => {
    if (sortedRows.value.length === 0) return '0 registros'
    const first = firstItemIndex.value + 1
    const last = Math.min(firstItemIndex.value + itemsPerPage.value, sortedRows.value.length)
    return `${first}-${last} de ${sortedRows.value.length} registros`
  })

  watch(
    () => [rows.value.length, itemsPerPage.value],
    () => {
      currentPage.value = Math.min(currentPage.value, pageCount.value)
    },
  )

  function toggleSort (key: string) {
    currentPage.value = 1

    if (sortState.value.key !== key) {
      sortState.value = { key, direction: 'asc' }
      return
    }

    sortState.value = {
      key,
      direction: sortState.value.direction === 'asc' ? 'desc' : 'asc',
    }
  }

  function getSortIcon (key: string) {
    if (sortState.value.key !== key) return 'expand-up-down-line'
    return sortState.value.direction === 'asc' ? 'arrow-up-s-line' : 'arrow-down-s-line'
  }

  function getSortTitle (label: string, key: string) {
    if (sortState.value.key !== key) return `Ordenar por ${label}`
    return sortState.value.direction === 'asc'
      ? `Ordenar ${label} do maior para o menor`
      : `Ordenar ${label} do menor para o maior`
  }

  return {
    currentPage,
    itemsPerPage,
    itemsPerPageOptions,
    sortState,
    sortedRows,
    paginatedRows,
    pageCount,
    visibleRangeText,
    toggleSort,
    getSortIcon,
    getSortTitle,
  }
}

function compareValues (leftValue: unknown, rightValue: unknown) {
  if (leftValue === rightValue) return 0
  if (leftValue === null || leftValue === undefined || leftValue === '') return 1
  if (rightValue === null || rightValue === undefined || rightValue === '') return -1

  if (typeof leftValue === 'number' && typeof rightValue === 'number') {
    return leftValue - rightValue
  }

  if (typeof leftValue === 'boolean' && typeof rightValue === 'boolean') {
    return Number(leftValue) - Number(rightValue)
  }

  const leftDate = Date.parse(String(leftValue))
  const rightDate = Date.parse(String(rightValue))
  if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
    return leftDate - rightDate
  }

  return String(leftValue).localeCompare(String(rightValue), 'pt-BR', {
    numeric: true,
    sensitivity: 'base',
  })
}
