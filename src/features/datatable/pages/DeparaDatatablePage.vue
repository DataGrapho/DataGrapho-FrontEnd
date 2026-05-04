<template>
  <main class="datatable-page">
    <header class="datatable-page__header">
      <div>
        <h1 class="datatable-page__title text-display-h4">Datatable</h1>
        <p v-if="isMockMode" class="datatable-page__mock-flag text-body-small">Modo mock ativo</p>
      </div>

      <div class="datatable-page__actions">
        <v-text-field
          v-model="globalSearch"
          class="datatable-page__search"
          clearable
          density="comfortable"
          hide-details
          placeholder="Buscar em todas as colunas"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
        />
        <v-btn
          :loading="loading"
          class="datatable-page__refresh"
          density="comfortable"
          icon="mdi-refresh"
          title="Atualizar dados"
          variant="text"
          @click="loadData"
        />
      </div>
    </header>

    <BaseDataTable
      v-model:filters="columnFilters"
      :columns="columns"
      :empty-text="emptyText"
      :error="errorMessage"
      :loading="loading"
      :rows="filteredRows"
      row-key="id_depara"
    >
      <template #cell-id_depara="{ value }">
        <span class="datatable-page__numeric">{{ value }}</span>
      </template>

      <template #cell-id_catalogo="{ value }">
        <span class="datatable-page__numeric">{{ value }}</span>
      </template>

      <template #cell-relation_label="{ row, value }">
        <div
          class="datatable-page__relation"
          :class="{ 'datatable-page__relation--child': Boolean(row.id_depara_pai) }"
        >
          <v-icon size="18">
            {{ row.id_depara_pai ? 'mdi-file-tree-outline' : 'mdi-minus' }}
          </v-icon>
          <span>{{ value }}</span>
        </div>
      </template>

      <template #cell-ativo="{ value }">
        <DataTableStatusChip :active="Boolean(value)" />
      </template>

      <template #cell-criado_em="{ value }">
        {{ formatDate(value) }}
      </template>
    </BaseDataTable>
  </main>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import BaseDataTable from '@/features/datatable/components/BaseDataTable.vue'
  import DataTableStatusChip from '@/features/datatable/components/DataTableStatusChip.vue'
  import { CATALOGO_DEPARA_MOCK, DEPARA_MOCK } from '@/features/datatable/mocks/depara.mock'
  import { listCatalogosDepara } from '@/features/datatable/services/catalogo-depara.service'
  import { listDepara } from '@/features/datatable/services/depara.service'
  import type { CatalogoDeparaListItem, DeparaListItem } from '@/features/datatable/types/depara.types'
  import type { DataTableColumn, DataTableFilters } from '@/features/datatable/types/shared-table.types'
  import { buildDeparaTableRows, filterDeparaRows } from '@/features/datatable/utils/depara-table'

  const deparaItems = ref<DeparaListItem[]>([])
  const catalogos = ref<CatalogoDeparaListItem[]>([])
  const loading = ref(false)
  const errorMessage = ref('')
  const isMockMode = ref(false)
  const globalSearch = ref('')
  const columnFilters = ref<DataTableFilters>({})

  const tableRows = computed(() => buildDeparaTableRows(deparaItems.value))
  const filteredRows = computed(() => filterDeparaRows(tableRows.value, columnFilters.value, globalSearch.value))
  const emptyText = computed(() => tableRows.value.length > 0 ? 'Nenhuma linha corresponde aos filtros.' : 'Nenhuma linha encontrada.')
  const catalogoOptions = computed(() => catalogos.value.map(catalogo => ({
    label: `${catalogo.id_catalogo} - ${catalogo.tabela_origem}`,
    value: catalogo.id_catalogo,
  })))

  const columns = computed<DataTableColumn[]>(() => [
    { key: 'id_depara', label: 'ID', width: '88px', filterable: true, filterType: 'number', filterPlaceholder: 'ID' },
    {
      key: 'id_catalogo',
      label: 'Catalogo',
      width: '180px',
      filterable: true,
      filterType: catalogoOptions.value.length > 0 ? 'select' : 'number',
      filterOptions: catalogoOptions.value,
      filterPlaceholder: 'Catalogo',
    },
    { key: 'catalogo_tabela', label: 'Tabela', minWidth: '160px', filterable: true, filterPlaceholder: 'Tabela' },
    { key: 'codigo_origem', label: 'Codigo origem', minWidth: '150px', filterable: true, filterPlaceholder: 'Origem' },
    { key: 'codigo_destino', label: 'Codigo destino', minWidth: '150px', filterable: true, filterPlaceholder: 'Destino' },
    { key: 'relation_label', label: 'Linha pai repetida', minWidth: '230px', filterable: true, filterPlaceholder: 'Pai' },
    { key: 'parent_catalogo_tabela', label: 'Tabela pai', minWidth: '150px', filterable: true, filterPlaceholder: 'Tabela pai' },
    {
      key: 'ativo',
      label: 'Status',
      width: '128px',
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Ativo', value: true },
        { label: 'Inativo', value: false },
      ],
    },
    { key: 'criado_em', label: 'Criado em', width: '150px', filterable: true, filterPlaceholder: 'Data' },
  ])

  async function loadData () {
    loading.value = true
    errorMessage.value = ''
    isMockMode.value = false

    try {
      const [deparaResponse, catalogoResponse] = await Promise.all([
        listDepara(),
        listCatalogosDepara(),
      ])

      if (!deparaResponse.success) {
        throw new Error(deparaResponse.error ?? 'Nao foi possivel listar DePara.')
      }

      deparaItems.value = deparaResponse.data
      catalogos.value = catalogoResponse.success ? catalogoResponse.data : []

      if (deparaItems.value.length === 0) {
        deparaItems.value = DEPARA_MOCK
        catalogos.value = CATALOGO_DEPARA_MOCK
        isMockMode.value = true
      }
    } catch {
      deparaItems.value = DEPARA_MOCK
      catalogos.value = CATALOGO_DEPARA_MOCK
      isMockMode.value = true
      errorMessage.value = ''
    } finally {
      loading.value = false
    }
  }

  function formatDate (value: unknown) {
    if (!value) return '-'
    const date = new Date(String(value))
    if (Number.isNaN(date.getTime())) return String(value)
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
  }

  onMounted(() => {
    void loadData()
  })
</script>

<style scoped>
  .datatable-page {
    display: flex;
    min-width: 0;
    min-height: 0;
    height: 100%;
    flex: 1;
    flex-direction: column;
    gap: 16px;
    padding: 24px;
    overflow: hidden;
    box-sizing: border-box;
  }

  .datatable-page__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .datatable-page__title {
    margin: 0;
    color: rgb(var(--v-theme-on-surface));
  }

  .datatable-page__mock-flag {
    margin: 4px 0 0;
    color: rgb(var(--v-theme-on-surface-variant));
    font-family: var(--df-font-body);
    letter-spacing: 0;
  }

  .datatable-page__actions {
    display: flex;
    width: min(100%, 480px);
    align-items: center;
    gap: 8px;
  }

  .datatable-page__search {
    min-width: 0;
    flex: 1;
  }

  .datatable-page__search :deep(.v-field) {
    border-radius: var(--df-radius-base);
    background: rgb(var(--v-theme-surface));
  }

  .datatable-page__search :deep(.v-field__input),
  .datatable-page__search :deep(.v-field__input input),
  .datatable-page__search :deep(input::placeholder) {
    font-family: var(--df-font-body);
    font-size: 0.875rem;
    line-height: 1.25rem;
    letter-spacing: 0;
  }

  .datatable-page__search :deep(input::placeholder) {
    color: rgb(var(--v-theme-on-surface-variant));
    opacity: 0.72;
  }

  .datatable-page__refresh {
    flex: 0 0 auto;
  }

  .datatable-page__numeric {
    font-family: var(--df-font-body);
    font-variant-numeric: tabular-nums;
  }

  .datatable-page__relation {
    display: inline-flex;
    max-width: 100%;
    align-items: center;
    gap: 6px;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  .datatable-page__relation span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .datatable-page__relation--child {
    color: rgb(var(--v-theme-primary));
    font-weight: 700;
  }

  @media (max-width: 900px) {
    .datatable-page {
      padding: 12px;
    }

    .datatable-page__header {
      align-items: stretch;
      flex-direction: column;
    }

    .datatable-page__actions {
      width: 100%;
    }
  }
</style>
