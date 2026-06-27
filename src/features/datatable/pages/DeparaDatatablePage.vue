<template>
  <main class="datatable-page">
    <header class="datatable-page__header">
      <div class="datatable-page__header-main">
        <div class="datatable-page__title-block">
          <h1 class="datatable-page__title text-display-h4">De/Para</h1>
          <p class="datatable-page__subtitle text-body-small">
            Edite em grade ou adicione itens pelo formulario.
          </p>
        </div>

        <div class="datatable-page__header-actions">
          <v-text-field
            :model-value="searchText"
            class="datatable-page__search"
            clearable
            density="comfortable"
            hide-details
            placeholder="Buscar nesta lista"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            @update:model-value="searchText = $event ?? ''"
          />
        </div>
      </div>
    </header>

    <DataTableToolbar
      v-model:column-view-id="columnViewId"
      v-model:filter-view-id="filterViewId"
      v-model:selected-catalogo-id="toolbarSelectedCatalogoId"
      :catalogo-options="catalogoOptions"
      :column-view-options="columnViewOptions"
      :edit-mode="editMode"
      :filter-view-options="filterViewOptions"
      :has-catalog-filter="hasCatalogFilter"
      :has-pending-changes="hasPendingChanges"
      :save-error="saveError"
      :save-message="saveMessage"
      :saving="saving"
      @discard="handleDiscard"
      @new-item="openCreateDialog"
      @refresh="handleRefresh"
      @toggle-edit-mode="handleToggleEditMode"
    />

    <div class="datatable-page__table">
      <BaseDataTable
        v-if="!editMode"
        :columns="visibleColumns"
        :empty-text="emptyText"
        :error="errorMessage"
        :loading="loading"
        :rows="deparaItems"
        row-key="id_depara"
        @delete-rows="handleDeleteViewRows"
        @edit-row="handleEditViewRow"
      >
      <template #cell-id_depara="{ value }">
        <span class="datatable-page__numeric">{{ formatDeparaCellValue('id_depara', value) }}</span>
      </template>

      <template #cell-ativo="{ value }">
        <DataTableStatusChip :active="Boolean(value)" />
      </template>

      <template #cell-criado_em="{ value }">
        {{ formatDeparaDate(value) }}
      </template>
      </BaseDataTable>

      <EditableDataTable
        v-else
        :catalogos="catalogos"
        :columns="editableColumns"
        :empty-text="emptyText"
        :error="errorMessage"
        :loading="loading || loadingDetails"
        :row-errors="rowErrors"
        :rows="editableRows"
        show-add-row
        @add-row="addRow"
        @catalog-update="updateCatalogCell"
        @cell-update="updateCell"
        @delete-rows="handleDeleteRows"
        @edit-row="openEditDialog"
      >
      <template #cell-criado_em="{ value }">
        {{ formatDeparaDate(value) }}
      </template>
      </EditableDataTable>
    </div>

    <DeparaItemDialog
      v-model="showItemDialog"
      :catalogos="catalogos"
      :edit-item="editDialogItem"
      @catalog-created="handleCatalogCreated"
      @saved="handleItemSaved"
    />
  </main>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import BaseDataTable from '@/features/datatable/components/BaseDataTable.vue'
  import DataTableStatusChip from '@/features/datatable/components/DataTableStatusChip.vue'
  import DataTableToolbar from '@/features/datatable/components/DataTableToolbar.vue'
  import DeparaItemDialog from '@/features/datatable/components/DeparaItemDialog.vue'
  import EditableDataTable from '@/features/datatable/components/EditableDataTable.vue'
  import {
    buildDeparaColumns,
    formatDeparaDate,
    resolveVisibleColumns,
  } from '@/features/datatable/config/depara-table.config'
  import { formatDeparaCellValue } from '@/features/datatable/utils/depara-table-format'
  import { useDataTableEdit } from '@/features/datatable/composables/useDataTableEdit'
  import { useDataTableViews } from '@/features/datatable/composables/useDataTableViews'
  import { listCatalogosDepara } from '@/features/datatable/services/catalogo-depara.service'
  import { getDepara, listDepara, deleteDepara } from '@/features/datatable/services/depara.service'
  import type {
    CatalogoDeparaListItem,
    DeparaListItem,
    EditableDeparaRow,
  } from '@/features/datatable/types/depara.types'
  import type { DeparaDialogItem } from '@/features/datatable/types/depara-dialog.types'
  import type { DataTableRow } from '@/features/datatable/types/shared-table.types'
  import { ApiError } from '@/shared/services/http'

  const deparaItems = ref<DeparaListItem[]>([])
  const catalogos = ref<CatalogoDeparaListItem[]>([])
  const loading = ref(false)
  const errorMessage = ref('')
  const showItemDialog = ref(false)
  const editDialogItem = ref<DeparaDialogItem | null>(null)

  const {
    columnViewId,
    filterViewId,
    selectedCatalogoId,
    globalSearch,
    columnViewOptions,
    filterViewOptions,
    listQuery,
    hasCatalogFilter,
  } = useDataTableViews()

  const allColumns = computed(() => buildDeparaColumns())
  const visibleColumns = computed(() => resolveVisibleColumns(allColumns.value, columnViewId.value))
  const editableColumns = computed(() =>
    resolveVisibleColumns(allColumns.value, columnViewId.value, { editMode: true }),
  )
  const emptyText = computed(() =>
    errorMessage.value
      ? 'Nao foi possivel carregar os dados.'
      : deparaItems.value.length > 0
        ? 'Nenhuma linha corresponde aos filtros.'
        : 'Nenhum mapeamento cadastrado.',
  )

  const defaultCatalogoId = computed(() =>
    selectedCatalogoId.value ?? catalogos.value[0]?.id_catalogo ?? null,
  )

  const catalogoOptions = computed(() =>
    catalogos.value.map(catalogo => ({
      title: catalogo.tabela_origem,
      value: catalogo.id_catalogo,
    })),
  )

  const toolbarSelectedCatalogoId = computed({
    get () {
      const id = selectedCatalogoId.value
      if (id === null) return null
      return catalogos.value.some(catalogo => catalogo.id_catalogo === id) ? id : null
    },
    set (value: number | null) {
      selectedCatalogoId.value = value
    },
  })

  function syncCatalogFilterSelection () {
    if (filterViewId.value !== 'catalog') return

    const catalogIds = catalogos.value.map(catalogo => catalogo.id_catalogo)
    if (catalogIds.length === 0) {
      selectedCatalogoId.value = null
      return
    }

    if (!selectedCatalogoId.value || !catalogIds.includes(selectedCatalogoId.value)) {
      selectedCatalogoId.value = catalogIds[0]
    }
  }

  const searchText = computed({
    get: () => globalSearch.value ?? '',
    set: (value: string | null) => {
      globalSearch.value = value ?? ''
    },
  })

  const {
    editMode,
    editableRows,
    rowErrors,
    saving,
    saveMessage,
    saveError,
    hasPendingChanges,
    loadingDetails,
    enterEditMode,
    exitEditMode,
    discardChanges,
    addRow,
    updateCell,
    updateCatalogCell,
    deleteExistingRows,
    reloadEditSession,
  } = useDataTableEdit(deparaItems, editableColumns, defaultCatalogoId, catalogos)

  let searchDebounce: ReturnType<typeof setTimeout> | undefined

  function resolveLoadError (error: unknown) {
    if (error instanceof ApiError) {
      if (error.status === 401) return 'Sessao expirada. Faca login novamente.'
      if (error.status >= 500) return 'Erro no servidor. Verifique se o backend esta rodando.'
      return 'Nao foi possivel carregar os dados da API.'
    }

    if (error instanceof Error && error.message) return error.message
    return 'Nao foi possivel conectar ao backend.'
  }

  async function loadData (options: { keepEditMode?: boolean } = {}) {
    if (editMode.value && !options.keepEditMode) return

    loading.value = true
    errorMessage.value = ''

    try {
      const [deparaResponse, catalogoResponse] = await Promise.all([
        listDepara(listQuery.value),
        listCatalogosDepara(),
      ])

      if (!deparaResponse.success) {
        throw new Error(deparaResponse.error ?? 'Nao foi possivel listar DePara.')
      }

      if (!catalogoResponse.success) {
        throw new Error(catalogoResponse.error ?? 'Nao foi possivel listar catalogos.')
      }

      deparaItems.value = deparaResponse.data
      catalogos.value = catalogoResponse.data
      syncCatalogFilterSelection()
    } catch (error) {
      deparaItems.value = []
      catalogos.value = []
      errorMessage.value = resolveLoadError(error)
    } finally {
      loading.value = false
    }
  }

  async function handleToggleEditMode (enabled: boolean) {
    if (enabled) {
      void enterEditMode()
      return
    }

    exitEditMode()
  }

  async function handleDiscard () {
    if (!hasPendingChanges.value) return
    await discardChanges()
  }

  async function handleRefresh () {
    if (editMode.value) {
      await loadData({ keepEditMode: true })
      await reloadEditSession()
      return
    }

    await loadData()
  }

  function asDeparaRow (row: DataTableRow): DeparaListItem {
    return row as DeparaListItem
  }

  function handleDeleteViewRows (rows: DataTableRow[]) {
    void handleDeleteRows(rows.map(asDeparaRow))
  }

  function handleEditViewRow (row: DataTableRow) {
    void openEditDialog(asDeparaRow(row))
  }

  function openCreateDialog () {
    editDialogItem.value = null
    showItemDialog.value = true
  }

  async function openEditDialog (row: DeparaListItem | EditableDeparaRow) {
    if (row.id_depara > 0) {
      const response = await getDepara(row.id_depara)
      if (response.success) {
        const catalogo = catalogos.value.find(item => item.id_catalogo === response.data.id_catalogo)
        editDialogItem.value = {
          id_depara: response.data.id_depara,
          id_catalogo: response.data.id_catalogo,
          catalogo_tabela: catalogo?.tabela_origem ?? String(row.catalogo_tabela ?? ''),
          codigo_origem: response.data.codigo_origem,
          codigo_destino: response.data.codigo_destino,
          descricao_origem: response.data.descricao_origem,
          descricao_destino: response.data.descricao_destino,
          ativo: response.data.ativo,
        }
      } else {
        editDialogItem.value = {
          id_depara: row.id_depara,
          id_catalogo: row.id_catalogo,
          catalogo_tabela: String(row.catalogo_tabela ?? ''),
          codigo_origem: row.codigo_origem,
          codigo_destino: row.codigo_destino,
          descricao_origem: 'descricao_origem' in row ? row.descricao_origem ?? '' : '',
          descricao_destino: 'descricao_destino' in row ? row.descricao_destino ?? '' : '',
          ativo: row.ativo,
        }
      }
    } else {
      editDialogItem.value = {
        id_depara: row.id_depara,
        id_catalogo: row.id_catalogo,
        catalogo_tabela: String(row.catalogo_tabela ?? ''),
        newCatalogoTabela: 'newCatalogoTabela' in row ? row.newCatalogoTabela ?? null : null,
        codigo_origem: row.codigo_origem,
        codigo_destino: row.codigo_destino,
        descricao_origem: 'descricao_origem' in row ? row.descricao_origem ?? '' : '',
        descricao_destino: 'descricao_destino' in row ? row.descricao_destino ?? '' : '',
        ativo: row.ativo,
      }
    }

    showItemDialog.value = true
  }

  async function handleDeleteRows (rows: Array<DeparaListItem | EditableDeparaRow>) {
    if (rows.length === 0) return

    const message = rows.length === 1
      ? 'Excluir este item da lista?'
      : `Excluir ${rows.length} itens selecionados?`
    const confirmed = window.confirm(message)
    if (!confirmed) return

    if (!editMode.value) {
      for (const row of rows) {
        try {
          const response = await deleteDepara(row.id_depara)
          if (!response.success) {
            errorMessage.value = response.error ?? 'Nao foi possivel excluir a linha.'
            continue
          }
          deparaItems.value = deparaItems.value.filter(item => item.id_depara !== row.id_depara)
        } catch {
          errorMessage.value = 'Erro ao excluir linha.'
        }
      }
      return
    }

    const editableTargets = rows.map(row => {
      if ('_rowKey' in row) return row as EditableDeparaRow

      return {
        ...row,
        _rowKey: String(row.id_depara),
        _isNew: false,
        _isDirty: false,
      } satisfies EditableDeparaRow
    })

    await deleteExistingRows(editableTargets)
  }

  function handleCatalogCreated (catalogo: CatalogoDeparaListItem) {
    catalogos.value = [...catalogos.value, catalogo]
  }

  async function handleItemSaved () {
    await loadData({ keepEditMode: editMode.value })

    if (editMode.value) {
      await reloadEditSession()
    }
  }

  watch(
    [filterViewId, selectedCatalogoId, columnViewId],
    () => {
      void loadData()
    },
  )

  watch([filterViewId, catalogos], () => {
    syncCatalogFilterSelection()
  })

  watch(globalSearch, () => {
    if (searchDebounce) clearTimeout(searchDebounce)
    searchDebounce = setTimeout(() => {
      void loadData()
    }, 400)
  })

  onMounted(() => {
    void loadData()
  })
</script>

<style scoped lang="scss">
  @use '@/shared/styles/content-page' as content-page;
  @use '@/shared/styles/page-vuetify-fields' as page-fields;

  .datatable-page {
    @include content-page.content-page-shell;
    overflow: hidden;
    gap: 12px;

    @media (max-width: 900px) {
      gap: 8px;
    }
  }

  .datatable-page__table {
    @include content-page.content-page-table-host;
  }

  .datatable-page__header,
  .datatable-page :deep(.datatable-toolbar) {
    flex-shrink: 0;
  }

  .datatable-page__header {
    @include content-page.content-page-header;
    margin-bottom: 0;
  }

  .datatable-page__header-main {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    width: 100%;
  }

  .datatable-page__title-block {
    min-width: 0;
    flex: 1 1 auto;
  }

  .datatable-page__header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: auto;
    width: min(100%, 520px);
  }

  .datatable-page__search {
    flex: 1;
    min-width: 0;
    @include page-fields.page-search-field;
  }

  @media (max-width: 760px) {
    .datatable-page__header-main {
      flex-direction: column;
      align-items: stretch;
    }

    .datatable-page__header-actions {
      margin-left: 0;
      width: 100%;
    }
  }

  .datatable-page__title {
    @include content-page.content-page-title;
  }

  .datatable-page__subtitle {
    margin: 4px 0 0;
    color: rgb(var(--v-theme-on-surface-variant));
    font-family: var(--df-font-body);
    letter-spacing: 0;
  }

  .datatable-page__numeric {
    font-family: var(--df-font-body);
    font-variant-numeric: tabular-nums;
  }
</style>


