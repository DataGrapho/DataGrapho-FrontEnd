<template>
  <section class="editable-datatable" aria-live="polite">
    <div class="editable-datatable__scroll">
      <v-table class="editable-datatable__table" fixed-header>
        <thead>
          <tr>
            <th v-if="selectable" class="editable-datatable__cell editable-datatable__cell--select">
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
              <div class="editable-datatable__header-cell">
                <button
                  v-if="column.sortable !== false"
                  class="editable-datatable__sort-button"
                  type="button"
                  :title="getSortTitle(column.label, column.key)"
                  @click="toggleSort(column.key)"
                >
                  <span class="editable-datatable__header-label">{{ column.label }}</span>
                  <span
                    class="editable-datatable__sort-icon"
                    :class="{ 'editable-datatable__sort-icon--active': sortState.key === column.key }"
                  >
                    <Icon :name="getSortIcon(column.key)" />
                  </span>
                </button>
                <span v-else class="editable-datatable__header-label">
                  {{ column.label }}
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length + (selectable ? 1 : 0)" class="editable-datatable__state">
              Carregando dados...
            </td>
          </tr>
          <tr v-else-if="error">
            <td :colspan="columns.length + (selectable ? 1 : 0)" class="editable-datatable__state editable-datatable__state--error">
              {{ error }}
            </td>
          </tr>
          <tr v-else-if="paginatedEditableRows.length === 0">
            <td :colspan="columns.length + (selectable ? 1 : 0)" class="editable-datatable__state">
              {{ emptyText }}
            </td>
          </tr>
          <tr
            v-for="row in paginatedEditableRows"
            v-else
            :key="row._rowKey"
            class="editable-datatable__row"
            :class="{
              'editable-datatable__row--dirty': row._isDirty || row._isNew,
              'editable-datatable__row--selected': isSelected(row),
            }"
            @contextmenu="handleRowContextMenu(row, $event)"
            @mousedown="handleRowPointerDown(row, $event)"
          >
            <td v-if="selectable" class="editable-datatable__cell editable-datatable__cell--select">
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
              :key="`${row._rowKey}-${column.key}`"
              :class="getColumnClass(column)"
            >
              <DataTableCatalogCell
                v-if="column.editable && column.editType === 'catalog'"
                :catalogo-id="Number(row.id_catalogo) || null"
                :catalogo-tabela="String(row.catalogo_tabela ?? '')"
                :catalogos="catalogos"
                :error-message="resolveCellErrorMessage(row, column.key)"
                :invalid="isRequiredFieldInvalid(row, column.key)"
                :new-catalogo-tabela="row.newCatalogoTabela"
                @change="emit('catalog-update', row._rowKey, $event)"
              />
              <component
                :is="resolveEditor(column)"
                v-else-if="column.editable"
                :error-message="resolveCellErrorMessage(row, column.key)"
                :invalid="isRequiredFieldInvalid(row, column.key)"
                :model-value="row[column.key]"
                :options="column.editOptions ?? []"
                @update:model-value="emit('cell-update', row._rowKey, column.key, $event)"
              />
              <slot
                v-else
                :name="`cell-${column.key}`"
                :row="row"
                :value="row[column.key]"
              >
                {{ formatCell(column.key, row[column.key]) }}
              </slot>
            </td>
          </tr>
          <tr v-if="showAddRow && !loading && !error" class="editable-datatable__add-row">
            <td :colspan="columns.length + (selectable ? 1 : 0)">
              <button class="editable-datatable__add-button" type="button" @click="emit('add-row')">
                <v-icon icon="mdi-plus" size="18" />
                Adicionar item
              </button>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <footer class="editable-datatable__footer">
      <DataTableFooterMeta
        :range-text="visibleRangeText"
        :selected-count="selectedCount"
      />

      <div class="editable-datatable__pagination">
        <v-select
          v-model="itemsPerPage"
          :items="itemsPerPageOptions"
          class="editable-datatable__page-size"
          density="compact"
          hide-details
          :menu-props="{ contentClass: 'editable-datatable__select-menu' }"
          variant="outlined"
        />
        <v-btn
          :disabled="currentPage <= 1"
          class="editable-datatable__pagination-button"
          density="comfortable"
          variant="text"
          @click="currentPage -= 1"
        >
          <Icon name="arrow-left-s-line" />
        </v-btn>
        <span class="editable-datatable__page text-body-small">
          {{ currentPage }} / {{ pageCount }}
        </span>
        <v-btn
          :disabled="currentPage >= pageCount"
          class="editable-datatable__pagination-button"
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
      <v-list class="editable-datatable__context-menu" density="compact" slim>
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
  import { computed, watch } from 'vue'
  import DataTableFooterMeta from '@/features/datatable/components/DataTableFooterMeta.vue'
  import DataTableBooleanCell from '@/features/datatable/components/cells/DataTableBooleanCell.vue'
  import DataTableCatalogCell from '@/features/datatable/components/cells/DataTableCatalogCell.vue'
  import DataTableNumberCell from '@/features/datatable/components/cells/DataTableNumberCell.vue'
  import DataTableSelectCell from '@/features/datatable/components/cells/DataTableSelectCell.vue'
  import DataTableTextCell from '@/features/datatable/components/cells/DataTableTextCell.vue'
  import { useDataTableContextMenu } from '@/features/datatable/composables/useDataTableContextMenu'
  import { useDataTableSelection } from '@/features/datatable/composables/useDataTableSelection'
  import { useDataTableState } from '@/features/datatable/composables/useDataTableState'
  import { formatDeparaCellValue } from '@/features/datatable/utils/depara-table-format'
  import {
    DEPARA_REQUIRED_FIELD_LABELS,
    isDeparaRequiredFieldEmpty,
  } from '@/features/datatable/utils/depara-row-validation'
  import type { CatalogoDeparaListItem, EditableDeparaRow } from '@/features/datatable/types/depara.types'
  import type { DataTableColumn } from '@/features/datatable/types/shared-table.types'

  const props = withDefaults(defineProps<{
    columns: DataTableColumn[]
    rows: EditableDeparaRow[]
    loading?: boolean
    error?: string
    emptyText?: string
    rowErrors?: Record<string, Record<string, string>>
    catalogos?: CatalogoDeparaListItem[]
    showAddRow?: boolean
    selectable?: boolean
  }>(), {
    loading: false,
    error: '',
    emptyText: 'Nenhum registro encontrado.',
    rowErrors: () => ({}),
    catalogos: () => [],
    showAddRow: true,
    selectable: true,
  })

  const emit = defineEmits<{
    'cell-update': [rowKey: string, columnKey: string, value: unknown]
    'catalog-update': [rowKey: string, value: {
      id_catalogo: number | null
      catalogo_tabela: string
      newCatalogoTabela: string | null
    }]
    'delete-rows': [rows: EditableDeparaRow[]]
    'edit-row': [row: EditableDeparaRow]
    'add-row': []
    'selection-change': [rows: EditableDeparaRow[]]
  }>()

  const editableRowsRef = computed(() => props.rows)

  const {
    currentPage,
    itemsPerPage,
    itemsPerPageOptions,
    sortState,
    paginatedRows,
    pageCount,
    visibleRangeText,
    toggleSort,
    getSortIcon,
    getSortTitle,
  } = useDataTableState(editableRowsRef)

  const paginatedEditableRows = computed(() => paginatedRows.value as EditableDeparaRow[])

  const {
    selectedKeys,
    isSelected,
    handleRowPointerDown,
    ensureRowSelected,
    handleCheckboxPointerDown,
    toggleAllVisible,
    clearSelection,
    pruneMissingRows,
  } = useDataTableSelection(paginatedEditableRows, '_rowKey')

  const isPageFullySelected = computed(() =>
    paginatedEditableRows.value.length > 0 && paginatedEditableRows.value.every(row => isSelected(row)),
  )

  const isPageIndeterminate = computed(() =>
    paginatedEditableRows.value.some(row => isSelected(row)) && !isPageFullySelected.value,
  )

  const selectedCount = computed(() => selectedKeys.value.size)

  const selectedRows = computed(() =>
    props.rows.filter(row => selectedKeys.value.has(row._rowKey)),
  )

  watch(selectedRows, rows => {
    emit('selection-change', rows)
  })

  watch(
    () => props.rows,
    rows => {
      pruneMissingRows(new Set(rows.map(row => row._rowKey)))
    },
    { deep: true },
  )

  function togglePageSelection (selected: boolean) {
    toggleAllVisible(paginatedEditableRows.value, selected)
  }

  const { menu: contextMenu, contextRow, openContextMenu, closeContextMenu } = useDataTableContextMenu<EditableDeparaRow>()

  const contextMenuShowEdit = computed(() => selectedCount.value <= 1)

  function handleRowContextMenu (row: EditableDeparaRow, event: MouseEvent) {
    ensureRowSelected(row)
    openContextMenu(event, row)
  }

  function handleContextEdit () {
    const row = selectedRows.value[0] ?? contextRow.value
    closeContextMenu()
    if (row) emit('edit-row', row)
  }

  function handleContextDelete () {
    const rows = selectedRows.value.length > 0
      ? [...selectedRows.value]
      : contextRow.value
        ? [contextRow.value]
        : []
    closeContextMenu()
    if (rows.length > 0) emit('delete-rows', rows)
  }

  defineExpose({ clearSelection })

  function isRequiredFieldInvalid (row: EditableDeparaRow, columnKey: string) {
    return columnKey in DEPARA_REQUIRED_FIELD_LABELS
      && isDeparaRequiredFieldEmpty(row, columnKey)
  }

  function resolveCellErrorMessage (row: EditableDeparaRow, columnKey: string) {
    return props.rowErrors[row._rowKey]?.[columnKey] ?? ''
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
      'editable-datatable__cell',
      `editable-datatable__cell--${column.align ?? 'start'}`,
    ]
  }

  function resolveEditor (column: DataTableColumn) {
    if (column.editType === 'catalog') return DataTableCatalogCell
    if (column.editType === 'select') return DataTableSelectCell
    if (column.editType === 'boolean') return DataTableBooleanCell
    if (column.editType === 'number') return DataTableNumberCell
    return DataTableTextCell
  }
</script>

<style scoped lang="scss">
  @use '@/features/datatable/styles/datatable-scroll' as scroll;
  @use '@/features/datatable/styles/datatable-field' as field;

  .editable-datatable {
    @include scroll.datatable-shell;
  }

  .editable-datatable__scroll {
    @include scroll.datatable-body-scroll;
  }

  .editable-datatable__table {
    @include scroll.datatable-table-fixed-header;
    width: max-content;
    min-width: 100%;
    table-layout: auto;
    background: rgb(var(--v-theme-surface));
  }

  .editable-datatable__table :deep(tbody tr:last-child td) {
    border-bottom: 0;
  }

  .editable-datatable__table :deep(th),
  .editable-datatable__table :deep(td) {
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    color: rgb(var(--v-theme-on-surface));
    vertical-align: middle;
  }

  .editable-datatable__table :deep(th) {
    height: 36px;
    padding: 2px 8px;
    font-family: var(--df-font-display);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0;
    white-space: nowrap;
  }

  .editable-datatable__table :deep(td) {
    min-height: 34px;
    padding: 2px 6px;
    @include scroll.datatable-cell-typography;
  }

  .editable-datatable__row {
    cursor: pointer;
  }

  .editable-datatable__row--selected td {
    @include scroll.datatable-row-selected;
  }

  .editable-datatable__row--dirty td {
    @include scroll.datatable-row-dirty;
  }

  .editable-datatable__cell--select {
    width: 40px;
    min-width: 40px;
    padding-inline: 6px !important;
    text-align: center;
  }

  .editable-datatable__cell--select :deep(.v-selection-control) {
    justify-content: center;
  }

  .editable-datatable__header-cell {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .editable-datatable__header-label {
    font-family: var(--df-font-display);
    font-size: 0.75rem;
    letter-spacing: 0;
  }

  .editable-datatable__sort-button {
    display: inline-flex;
    width: 100%;
    align-items: center;
    gap: 4px;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }

  .editable-datatable__sort-icon--active {
    color: rgb(var(--v-theme-primary));
  }

  .editable-datatable__state {
    height: auto !important;
    min-height: 120px;
    padding: 32px 12px !important;
    text-align: center;
    color: rgb(var(--v-theme-on-surface-variant));
    @include scroll.datatable-cell-typography;
  }

  .editable-datatable__state--error {
    color: rgb(var(--v-theme-error));
  }

  .editable-datatable__footer {
    display: flex;
    flex-shrink: 0;
    min-height: 48px;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 8px 12px;
    border-top: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  }

  .editable-datatable__page {
    color: rgb(var(--v-theme-on-surface-variant));
    font-family: var(--df-font-body);
    font-size: 0.8125rem;
    white-space: nowrap;
  }

  .editable-datatable__pagination {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .editable-datatable__page-size {
    width: 92px;
  }

  .editable-datatable__add-row td {
    padding: 0 !important;
    border-bottom: none !important;
  }

  .editable-datatable__add-button {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border: 0;
    background: rgba(var(--v-theme-primary), 0.04);
    color: rgb(var(--v-theme-primary));
    font-family: var(--df-font-body);
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0;
    cursor: pointer;
  }

  .editable-datatable__add-button:hover {
    background: rgba(var(--v-theme-primary), 0.08);
  }
</style>

<style>
  .editable-datatable__select-menu .v-list-item-title,
  .editable-datatable__context-menu .v-list-item-title {
    font-family: var(--df-font-body);
    font-size: 0.8125rem;
    line-height: 1.125rem;
    letter-spacing: 0;
  }

  .editable-datatable__context-menu .v-list-item__prepend {
    width: auto;
    min-width: 0;
    margin-inline-end: 6px;
  }

  .editable-datatable__context-menu .v-list-item__prepend > .v-icon {
    margin-inline-end: 0;
    opacity: 0.9;
  }
</style>
