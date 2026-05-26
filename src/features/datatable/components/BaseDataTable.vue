<template>
  <section class="base-datatable" aria-live="polite">
    <div class="base-datatable__scroll">
      <v-table class="base-datatable__table" fixed-header>
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="getColumnClass(column)"
              :style="getColumnStyle(column)"
            >
              <div class="base-datatable__header-cell">
                <button
                  class="base-datatable__sort-button"
                  type="button"
                  :title="getSortTitle(column)"
                  @click="toggleSort(column.key)"
                >
                  <span class="base-datatable__header-label">{{ column.label }}</span>
                  <v-icon
                    class="base-datatable__sort-icon"
                    :class="{ 'base-datatable__sort-icon--active': sortState.key === column.key }"
                    size="16"
                  >
                    {{ getSortIcon(column.key) }}
                  </v-icon>
                </button>

                <template v-if="column.filterable">
                  <v-select
                    v-if="column.filterType === 'select'"
                    :items="column.filterOptions ?? []"
                    :model-value="filters[column.key] ?? null"
                    class="base-datatable__filter"
                    clearable
                    density="compact"
                    hide-details
                    item-title="label"
                    item-value="value"
                    :menu-props="{ contentClass: 'base-datatable__select-menu' }"
                    variant="outlined"
                    @update:model-value="updateFilter(column.key, $event)"
                  />
                  <v-text-field
                    v-else
                    :model-value="filters[column.key] ?? ''"
                    :placeholder="column.filterPlaceholder ?? 'Filtrar'"
                    :type="column.filterType === 'number' ? 'number' : 'text'"
                    class="base-datatable__filter"
                    clearable
                    density="compact"
                    hide-details
                    variant="outlined"
                    @update:model-value="updateFilter(column.key, $event)"
                  />
                </template>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length" class="base-datatable__state">
              Carregando dados...
            </td>
          </tr>
          <tr v-else-if="error">
            <td :colspan="columns.length" class="base-datatable__state base-datatable__state--error">
              {{ error }}
            </td>
          </tr>
          <tr v-else-if="sortedRows.length === 0">
            <td :colspan="columns.length" class="base-datatable__state">
              {{ emptyText }}
            </td>
          </tr>
          <tr
            v-for="row in paginatedRows"
            v-else
            :key="String(row[rowKey])"
          >
            <td
              v-for="column in columns"
              :key="`${row[rowKey]}-${column.key}`"
              :class="getColumnClass(column)"
            >
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :value="row[column.key]"
              >
                {{ formatCell(row[column.key]) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <footer class="base-datatable__footer">
      <span class="base-datatable__count text-body-small">
        {{ visibleRangeText }}
      </span>

      <div class="base-datatable__pagination">
        <v-select
          v-model="itemsPerPage"
          :items="itemsPerPageOptions"
          class="base-datatable__page-size"
          density="compact"
          hide-details
          :menu-props="{ contentClass: 'base-datatable__select-menu' }"
          variant="outlined"
        />
        <v-btn
          :disabled="currentPage <= 1"
          density="comfortable"
          icon="mdi-chevron-left"
          variant="text"
          @click="currentPage -= 1"
        />
        <span class="base-datatable__page text-body-small">
          {{ currentPage }} / {{ pageCount }}
        </span>
        <v-btn
          :disabled="currentPage >= pageCount"
          density="comfortable"
          icon="mdi-chevron-right"
          variant="text"
          @click="currentPage += 1"
        />
      </div>
    </footer>
  </section>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import type {
    DataTableColumn,
    DataTableFilterValue,
    DataTableFilters,
    DataTableRow,
  } from '@/features/datatable/types/shared-table.types'

  const props = withDefaults(defineProps<{
    columns: DataTableColumn[]
    rows: DataTableRow[]
    filters: DataTableFilters
    rowKey?: string
    loading?: boolean
    error?: string
    emptyText?: string
  }>(), {
    rowKey: 'id',
    loading: false,
    error: '',
    emptyText: 'Nenhum registro encontrado.',
  })

  const emit = defineEmits<{
    'update:filters': [filters: DataTableFilters]
  }>()

  const currentPage = ref(1)
  const itemsPerPage = ref(25)
  const itemsPerPageOptions = [10, 25, 50, 100]
  const sortState = ref<{
    key: string
    direction: 'asc' | 'desc'
  }>({
    key: '',
    direction: 'asc',
  })

  const sortedRows = computed(() => {
    if (!sortState.value.key) return props.rows

    const directionMultiplier = sortState.value.direction === 'asc' ? 1 : -1
    const key = sortState.value.key

    return [...props.rows].sort((leftRow, rightRow) => {
      return compareValues(leftRow[key], rightRow[key]) * directionMultiplier
    })
  })
  const pageCount = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / itemsPerPage.value)))
  const firstItemIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
  const paginatedRows = computed(() => sortedRows.value.slice(firstItemIndex.value, firstItemIndex.value + itemsPerPage.value))
  const visibleRangeText = computed(() => {
    if (sortedRows.value.length === 0) return '0 registros'

    const first = firstItemIndex.value + 1
    const last = Math.min(firstItemIndex.value + itemsPerPage.value, sortedRows.value.length)
    return `${first}-${last} de ${sortedRows.value.length} registros`
  })

  watch(
    () => [props.rows.length, itemsPerPage.value],
    () => {
      currentPage.value = Math.min(currentPage.value, pageCount.value)
    },
  )

  watch(
    () => props.filters,
    () => {
      currentPage.value = 1
    },
    { deep: true },
  )

  function updateFilter (key: string, value: DataTableFilterValue) {
    emit('update:filters', {
      ...props.filters,
      [key]: value,
    })
  }

  function formatCell (value: unknown) {
    if (value === null || value === undefined || value === '') return '-'
    return String(value)
  }

  function getColumnStyle (column: DataTableColumn) {
    return {
      width: column.width,
      minWidth: column.minWidth,
    }
  }

  function getColumnClass (column: DataTableColumn) {
    return [
      'base-datatable__cell',
      `base-datatable__cell--${column.align ?? 'start'}`,
    ]
  }

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
    if (sortState.value.key !== key) return 'mdi-swap-vertical'
    return sortState.value.direction === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down'
  }

  function getSortTitle (column: DataTableColumn) {
    if (sortState.value.key !== column.key) return `Ordenar por ${column.label}`
    return sortState.value.direction === 'asc'
      ? `Ordenar ${column.label} do maior para o menor`
      : `Ordenar ${column.label} do menor para o maior`
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
</script>

<style scoped>
  .base-datatable {
    display: flex;
    min-width: 0;
    min-height: 0;
    flex: 1;
    flex-direction: column;
    border: 1px solid rgb(var(--v-theme-grey-lighten-3));
    border-radius: var(--df-radius-base);
    background: rgb(var(--v-theme-surface));
    overflow: hidden;
  }

  .base-datatable__scroll {
    min-height: 0;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }

  .base-datatable__table {
    height: 100%;
    min-width: 1120px;
    background: rgb(var(--v-theme-surface));
  }

  .base-datatable__table :deep(.v-table__wrapper) {
    min-height: 0;
    overflow-x: auto;
    overflow-y: auto;
  }

  .base-datatable__table :deep(th) {
    height: 92px;
    padding: 8px 12px;
    border-bottom: 1px solid rgb(var(--v-theme-grey-lighten-3));
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    font-family: var(--df-font-display);
    font-size: 0.8rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .base-datatable__header-cell {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 8px;
  }

  .base-datatable__header-label {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .base-datatable__sort-button {
    display: inline-flex;
    width: 100%;
    min-width: 0;
    align-items: center;
    justify-content: flex-start;
    gap: 4px;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    letter-spacing: 0;
    text-align: inherit;
    cursor: pointer;
  }

  .base-datatable__sort-icon {
    flex: 0 0 auto;
    color: rgb(var(--v-theme-on-surface-variant));
    opacity: 0.58;
  }

  .base-datatable__sort-button:hover .base-datatable__sort-icon,
  .base-datatable__sort-icon--active {
    color: rgb(var(--v-theme-primary));
    opacity: 1;
  }

  .base-datatable__table :deep(td) {
    height: 48px;
    padding: 8px 12px;
    border-bottom: 1px solid rgb(var(--v-theme-grey-lighten-3));
    color: rgb(var(--v-theme-on-surface));
    font-family: var(--df-font-body);
    font-size: 0.875rem;
    line-height: 1.25rem;
    vertical-align: middle;
  }

  .base-datatable__table :deep(tbody tr:hover td) {
    background: rgba(var(--v-theme-primary), 0.04);
  }

  .base-datatable__filter {
    min-width: 112px;
  }

  .base-datatable__filter :deep(.v-field__input),
  .base-datatable__filter :deep(.v-field__input input),
  .base-datatable__filter :deep(.v-select__selection-text),
  .base-datatable__page-size :deep(.v-field__input),
  .base-datatable__page-size :deep(.v-select__selection-text),
  .base-datatable__filter :deep(.v-field__input::placeholder),
  .base-datatable__filter :deep(input::placeholder) {
    font-family: var(--df-font-body);
    font-size: 0.8125rem;
    line-height: 1.125rem;
    letter-spacing: 0;
  }

  .base-datatable__filter :deep(input::placeholder) {
    color: rgb(var(--v-theme-on-surface-variant));
    opacity: 0.72;
  }

  .base-datatable__filter :deep(.v-field) {
    border-radius: var(--df-radius-base);
    background: rgb(var(--v-theme-surface));
  }

  .base-datatable__cell--center {
    text-align: center;
  }

  .base-datatable__cell--center .base-datatable__filter :deep(.v-field__input) {
    text-align: center;
  }

  .base-datatable__cell--end {
    text-align: right;
  }

  .base-datatable__cell--end .base-datatable__filter :deep(.v-field__input) {
    text-align: right;
  }

  .base-datatable__state {
    height: 160px !important;
    text-align: center;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  .base-datatable__state--error {
    color: rgb(var(--v-theme-error));
  }

  .base-datatable__footer {
    display: flex;
    min-height: 56px;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 8px 12px;
    border-top: 1px solid rgb(var(--v-theme-grey-lighten-3));
  }

  .base-datatable__count,
  .base-datatable__page {
    color: rgb(var(--v-theme-on-surface-variant));
    font-family: var(--df-font-body);
    font-size: 0.875rem;
    line-height: 1.25rem;
    letter-spacing: 0;
    white-space: nowrap;
  }

  .base-datatable__pagination {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .base-datatable__page-size {
    width: 92px;
  }

  @media (max-width: 760px) {
    .base-datatable__footer {
      align-items: stretch;
      flex-direction: column;
    }

    .base-datatable__pagination {
      justify-content: space-between;
    }
  }
</style>

<style>
  .base-datatable__select-menu .v-list-item-title {
    font-family: var(--df-font-body);
    font-size: 0.875rem;
    line-height: 1.25rem;
    letter-spacing: 0;
  }
</style>
