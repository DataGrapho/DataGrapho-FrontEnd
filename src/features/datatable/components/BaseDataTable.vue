<template>
  <section class="base-datatable" aria-live="polite">
    <div class="base-datatable__scroll">
      <v-table class="base-datatable__table" fixed-header>
        <thead>
          <tr>
            <th v-if="selectable" class="base-datatable__cell base-datatable__cell--select">
              <v-checkbox
                :indeterminate="isPageIndeterminate"
                :model-value="isPageFullySelected"
                color="primary"
                density="compact"
                hide-details
                @update:model-value="togglePageSelection(Boolean($event))"
              />
            </th>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="getColumnClass(column)"
              :style="getColumnStyle(column)"
            >
              <div class="base-datatable__header-cell">
                <button
                  v-if="column.sortable !== false"
                  class="base-datatable__sort-button"
                  type="button"
                  :title="getSortTitle(column)"
                  @click="toggleSort(column.key)"
                >
                  <span class="base-datatable__header-label">{{ column.label }}</span>
                  <span
                    class="base-datatable__sort-icon"
                    :class="{ 'base-datatable__sort-icon--active': sortState.key === column.key }"
                  >
                    <Icon :name="getSortIcon(column.key)" />
                  </span>
                </button>
                <span v-else class="base-datatable__header-label">
                  {{ column.label }}
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length + (selectable ? 1 : 0)" class="base-datatable__state">
              Carregando dados...
            </td>
          </tr>
          <tr v-else-if="error">
            <td :colspan="columns.length + (selectable ? 1 : 0)" class="base-datatable__state base-datatable__state--error">
              {{ error }}
            </td>
          </tr>
          <tr v-else-if="sortedRows.length === 0">
            <td :colspan="columns.length + (selectable ? 1 : 0)" class="base-datatable__state">
              {{ emptyText }}
            </td>
          </tr>
          <tr
            v-for="row in paginatedRows"
            v-else
            :key="String(row[rowKey])"
            class="base-datatable__row"
            :class="{
              'base-datatable__row--clickable': clickableRows,
              'base-datatable__row--selectable': selectable,
              'base-datatable__row--selected': selectable && isSelected(row),
            }"
            @click="handleRowClick(row, $event)"
            @contextmenu="handleRowContextMenu(row, $event)"
            @mousedown="handleRowMouseDown(row, $event)"
          >
            <td v-if="selectable" class="base-datatable__cell base-datatable__cell--select">
              <v-checkbox
                :model-value="isSelected(row)"
                color="primary"
                density="compact"
                hide-details
                @click.stop
                @mousedown="handleCheckboxPointerDown(row, $event)"
              />
            </td>
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
                {{ formatCell(column.key, row[column.key]) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <footer class="base-datatable__footer">
      <DataTableFooterMeta
        :range-text="visibleRangeText"
        :selected-count="selectedCount"
      />

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
          class="base-datatable__pagination-button"
          density="comfortable"
          variant="text"
          @click="currentPage -= 1"
        >
          <Icon name="arrow-left-s-line" />
        </v-btn>
        <span class="base-datatable__page text-body-small">
          {{ currentPage }} / {{ pageCount }}
        </span>
        <v-btn
          :disabled="currentPage >= pageCount"
          class="base-datatable__pagination-button"
          density="comfortable"
          variant="text"
          @click="currentPage += 1"
        >
          <Icon name="arrow-right-s-line" />
        </v-btn>
      </div>
    </footer>

    <v-menu
      v-model="contextMenu.open"
      :close-on-content-click="true"
      location="bottom start"
      :target="[contextMenu.x, contextMenu.y]"
    >
      <v-list class="base-datatable__context-menu" density="compact" slim>
        <v-list-item
          v-if="contextMenuShowEdit"
          title="Editar"
          @click="handleContextEdit"
        >
          <template #prepend>
            <v-icon icon="mdi-pencil-outline" size="16" />
          </template>
        </v-list-item>
        <v-list-item
          title="Excluir"
          @click="handleContextDelete"
        >
          <template #prepend>
            <v-icon icon="mdi-delete-outline" size="16" />
          </template>
        </v-list-item>
      </v-list>
    </v-menu>
  </section>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import DataTableFooterMeta from '@/features/datatable/components/DataTableFooterMeta.vue'
  import { useDataTableContextMenu } from '@/features/datatable/composables/useDataTableContextMenu'
  import { useDataTableSelection } from '@/features/datatable/composables/useDataTableSelection'
  import { formatDeparaCellValue } from '@/features/datatable/utils/depara-table-format'
  import type {
    DataTableColumn,
    DataTableRow,
  } from '@/features/datatable/types/shared-table.types'

  const props = withDefaults(defineProps<{
    columns: DataTableColumn[]
    rows: DataTableRow[]
    rowKey?: string
    loading?: boolean
    error?: string
    emptyText?: string
    selectable?: boolean
    clickableRows?: boolean
  }>(), {
    rowKey: 'id',
    loading: false,
    error: '',
    emptyText: 'Nenhum registro encontrado.',
    selectable: true,
    clickableRows: false,
  })

  const emit = defineEmits<{
    'selection-change': [rows: DataTableRow[]]
    'row-click': [row: DataTableRow]
    'edit-row': [row: DataTableRow]
    'delete-rows': [rows: DataTableRow[]]
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

  const {
    selectedKeys,
    isSelected,
    handleRowPointerDown,
    ensureRowSelected,
    handleCheckboxPointerDown,
    toggleAllVisible,
    clearSelection,
    pruneMissingRows,
  } = useDataTableSelection(paginatedRows, props.rowKey)

  const isPageFullySelected = computed(() =>
    paginatedRows.value.length > 0 && paginatedRows.value.every(row => isSelected(row)),
  )

  const isPageIndeterminate = computed(() =>
    paginatedRows.value.some(row => isSelected(row)) && !isPageFullySelected.value,
  )

  const selectedCount = computed(() => selectedKeys.value.size)

  const selectedRows = computed(() =>
    props.rows.filter(row => selectedKeys.value.has(String(row[props.rowKey]))),
  )

  watch(selectedRows, rows => {
    emit('selection-change', rows)
  })

  watch(
    () => props.rows,
    rows => {
      pruneMissingRows(new Set(rows.map(row => String(row[props.rowKey]))))
    },
    { deep: true },
  )

  function togglePageSelection (selected: boolean) {
    toggleAllVisible(paginatedRows.value, selected)
  }
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

  const { menu: contextMenu, contextRow, openContextMenu, closeContextMenu } = useDataTableContextMenu<DataTableRow>()

  const contextMenuShowEdit = computed(() => selectedCount.value <= 1)

  function handleRowContextMenu (row: DataTableRow, event: MouseEvent) {
    if (props.selectable) {
      ensureRowSelected(row)
    }
    openContextMenu(event, row)
  }

  function handleRowMouseDown (row: DataTableRow, event: MouseEvent) {
    if (!props.selectable) return
    handleRowPointerDown(row, event)
  }

  function handleRowClick (row: DataTableRow, event: MouseEvent) {
    if (!props.clickableRows) return
    if (isInteractiveTarget(event.target)) return
    emit('row-click', row)
  }

  function handleContextEdit () {
    const row = selectedRows.value[0] ?? contextRow.value
    closeContextMenu()
    if (row) emit('edit-row', row)
  }

  function handleContextDelete () {
    const rows = props.selectable && selectedRows.value.length > 0
      ? [...selectedRows.value]
      : contextRow.value
        ? [contextRow.value]
        : []
    closeContextMenu()
    if (rows.length > 0) emit('delete-rows', rows)
  }

  function isInteractiveTarget (target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false
    return Boolean(target.closest(
      'input, textarea, select, button, a, [contenteditable="true"], .v-field, .v-selection-control',
    ))
  }

  function formatCell (columnKey: string, value: unknown) {
    return formatDeparaCellValue(columnKey, value)
  }

  function getColumnStyle (column: DataTableColumn) {
    return {
      width: column.width,
      minWidth: column.minWidth ?? column.width,
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
    if (sortState.value.key !== key) return 'expand-up-down-line'
    return sortState.value.direction === 'asc' ? 'arrow-up-s-line' : 'arrow-down-s-line'
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

  defineExpose({ clearSelection })
</script>

<style scoped lang="scss">
  @use '@/features/datatable/styles/datatable-scroll' as scroll;

  .base-datatable {
    @include scroll.datatable-shell;
  }

  .base-datatable__scroll {
    @include scroll.datatable-body-scroll;
  }

  .base-datatable__table {
    @include scroll.datatable-table-fixed-header;
    width: max-content;
    min-width: 100%;
    table-layout: auto;
    background: rgb(var(--v-theme-surface));
  }

  .base-datatable__table :deep(tbody tr:last-child td) {
    border-bottom: 0;
  }

  .base-datatable__table :deep(th) {
    height: 40px;
    padding: 4px 10px;
    color: rgb(var(--v-theme-on-surface));
    font-family: var(--df-font-display);
    font-size: 0.75rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .base-datatable__header-cell {
    display: flex;
    min-width: 0;
    flex-direction: row;
    align-items: center;
    gap: 4px;
  }

  .base-datatable__cell--center .base-datatable__header-cell {
    justify-content: center;
  }

  .base-datatable__cell--end .base-datatable__header-cell {
    justify-content: flex-end;
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

  .base-datatable__cell--center .base-datatable__sort-button {
    justify-content: center;
  }

  .base-datatable__cell--end .base-datatable__sort-button {
    justify-content: flex-end;
  }

  .base-datatable__sort-icon {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    color: rgb(var(--v-theme-on-surface-variant));
    opacity: 0.58;
  }

  .base-datatable__sort-icon :deep(i) {
    font-size: 0.875rem;
    line-height: 1;
  }

  .base-datatable__sort-button:hover .base-datatable__sort-icon,
  .base-datatable__sort-icon--active {
    color: rgb(var(--v-theme-primary));
    opacity: 1;
  }

  .base-datatable__table :deep(td) {
    height: 40px;
    padding: 4px 10px;
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    color: rgb(var(--v-theme-on-surface));
    @include scroll.datatable-cell-typography;
    vertical-align: middle;
  }

  .base-datatable__table :deep(tbody tr:hover td) {
    background: rgba(var(--v-theme-primary), 0.04);
  }

  .base-datatable__row {
    cursor: default;
  }

  .base-datatable__row--clickable,
  .base-datatable__row--selectable {
    cursor: pointer;
  }

  .base-datatable__row--selected td {
    @include scroll.datatable-row-selected;
  }

  .base-datatable__cell--select {
    width: 40px;
    min-width: 40px;
    padding-inline: 6px !important;
    text-align: center;
  }

  .base-datatable__cell--select :deep(.v-selection-control) {
    justify-content: center;
  }

  .base-datatable__cell--center {
    text-align: center;
  }

  .base-datatable__cell--end {
    text-align: right;
  }

  .base-datatable__state {
    height: auto !important;
    min-height: 120px;
    padding: 32px 12px !important;
    text-align: center;
    color: rgb(var(--v-theme-on-surface-variant));
    @include scroll.datatable-cell-typography;
  }

  .base-datatable__state--error {
    color: rgb(var(--v-theme-error));
  }

  .base-datatable__footer {
    display: flex;
    flex-shrink: 0;
    min-height: 48px;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 8px 12px;
    border-top: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  }

  .base-datatable__page {
    color: rgb(var(--v-theme-on-surface-variant));
    font-family: var(--df-font-body);
    font-size: 0.8125rem;
    line-height: 1.125rem;
    letter-spacing: 0;
    white-space: nowrap;
  }

  .base-datatable__pagination {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .base-datatable__page-size :deep(.v-field__input),
  .base-datatable__page-size :deep(.v-select__selection-text) {
    font-family: var(--df-font-body);
    font-size: 0.8125rem;
    line-height: 1.125rem;
    letter-spacing: 0;
  }

  .base-datatable__page-size :deep(.v-field) {
    border-radius: var(--df-radius-base);
    background: rgb(var(--v-theme-surface));
  }

  .base-datatable__pagination-button :deep(i) {
    font-size: 1rem;
    line-height: 1;
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
  .base-datatable__select-menu .v-list-item-title,
  .base-datatable__context-menu .v-list-item-title {
    font-family: var(--df-font-body);
    font-size: 0.8125rem;
    line-height: 1.125rem;
    letter-spacing: 0;
  }

  .base-datatable__context-menu .v-list-item__prepend {
    width: auto;
    min-width: 0;
    margin-inline-end: 6px;
  }

  .base-datatable__context-menu .v-list-item__prepend > .v-icon {
    margin-inline-end: 0;
    opacity: 0.9;
  }
</style>
