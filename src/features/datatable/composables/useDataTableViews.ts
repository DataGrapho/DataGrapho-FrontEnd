import { computed, ref, watch } from 'vue'
import {
  DEPARA_FILTER_VIEW_PRESETS,
} from '@/features/datatable/config/depara-table.config'
import type { DeparaListQuery } from '@/features/datatable/types/depara.types'
import type { DataTableFilters } from '@/features/datatable/types/shared-table.types'

const STORAGE_KEY = 'datatable-depara-preferences'

type StoredPreferences = {
  columnViewId: string
  filterViewId: string
  selectedCatalogoId: number | null
}

function readPreferences (): StoredPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { columnViewId: 'full', filterViewId: 'all', selectedCatalogoId: null }
    }
    return JSON.parse(raw) as StoredPreferences
  } catch {
    return { columnViewId: 'full', filterViewId: 'all', selectedCatalogoId: null }
  }
}

function writePreferences (preferences: StoredPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
}

export function useDataTableViews () {
  const validColumnViews = ['compact', 'full']
  const stored = readPreferences()
  const columnViewId = ref(validColumnViews.includes(stored.columnViewId) ? stored.columnViewId : 'full')
  const filterViewId = ref(stored.filterViewId)
  const selectedCatalogoId = ref<number | null>(stored.selectedCatalogoId)
  const globalSearch = ref('')

  const columnViewOptions = [
    { title: 'Completa — codigos, descricoes e status', value: 'full' },
    { title: 'Compacta — codigos e status', value: 'compact' },
  ]

  const filterViewOptions = [
    { title: 'Todos os registros', value: 'all' },
    { title: 'Apenas ativos', value: 'active' },
    { title: 'Por catalogo', value: 'catalog' },
  ]

  const listQuery = computed<DeparaListQuery>(() => {
    const query: DeparaListQuery = {}
    const filterPreset = DEPARA_FILTER_VIEW_PRESETS.find(view => view.id === filterViewId.value)

    if (filterPreset?.filters?.ativo !== undefined && typeof filterPreset.filters.ativo === 'boolean') {
      query.ativo = filterPreset.filters.ativo
    }

    if (filterViewId.value === 'catalog' && selectedCatalogoId.value) {
      query.id_catalogo = selectedCatalogoId.value
    }

    const search = (globalSearch.value ?? '').trim()
    if (search) query.search = search

    return query
  })

  const hasCatalogFilter = computed(() => filterViewId.value === 'catalog')

  watch([columnViewId, filterViewId, selectedCatalogoId], () => {
    writePreferences({
      columnViewId: columnViewId.value,
      filterViewId: filterViewId.value,
      selectedCatalogoId: selectedCatalogoId.value,
    })
  })

  return {
    columnViewId,
    filterViewId,
    selectedCatalogoId,
    globalSearch,
    columnViewOptions,
    filterViewOptions,
    listQuery,
    hasCatalogFilter,
  }
}

export function filterRowsClientSide<T extends Record<string, unknown>> (
  rows: T[],
  globalSearch: string,
  extraFilters: DataTableFilters = {},
) {
  const search = (globalSearch ?? '').trim().toLocaleLowerCase('pt-BR')

  return rows.filter(row => {
    if (search) {
      const matchesSearch = Object.values(row).some(value => {
        if (value === null || value === undefined) return false
        return String(value).toLocaleLowerCase('pt-BR').includes(search)
      })
      if (!matchesSearch) return false
    }

    return Object.entries(extraFilters).every(([key, value]) => {
      if (value === null || value === '') return true
      return row[key] === value
    })
  })
}
