<template>
  <section class="administration-section">
    <div class="administration-section__toolbar">
      <v-text-field
        :model-value="searchModel"
        class="administration-section__search"
        clearable
        density="comfortable"
        hide-details
        :placeholder="searchPlaceholder"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        @update:model-value="emit('update:searchModel', $event ?? '')"
      />
      <Button type="button" @click="emit('add')">
        <Icon name="add-line" />
        <span>{{ addLabel }}</span>
      </Button>
    </div>

    <BaseDataTable
      :columns="columns"
      :rows="rows"
      :row-key="rowKey"
      :loading="loading"
      :error="error"
      :empty-text="emptyText"
      :selectable="false"
      clickable-rows
      @row-click="(row) => emit('row-click', row)"
      @edit-row="(row) => emit('edit-row', row)"
      @delete-rows="(rows) => emit('delete-rows', rows)"
    >
      <template #cell-ativo="{ value }">
        <DataTableStatusChip :active="Boolean(value)" />
      </template>
    </BaseDataTable>
  </section>
</template>

<script setup lang="ts">
  import Button from '@/shared/components/button/Button.vue'
  import BaseDataTable from '@/features/datatable/components/BaseDataTable.vue'
  import DataTableStatusChip from '@/features/datatable/components/DataTableStatusChip.vue'
  import type { DataTableColumn, DataTableRow } from '@/features/datatable/types/shared-table.types'

  defineProps<{
    searchModel: string
    searchPlaceholder: string
    addLabel: string
    columns: DataTableColumn[]
    rows: DataTableRow[]
    rowKey: string
    emptyText: string
    loading: boolean
    error: string
  }>()

  const emit = defineEmits<{
    'update:searchModel': [value: string]
    add: []
    'row-click': [row: DataTableRow]
    'edit-row': [row: DataTableRow]
    'delete-rows': [rows: DataTableRow[]]
  }>()
</script>

<style scoped lang="scss">
  @use '@/shared/styles/page-vuetify-fields' as page-fields;

  .administration-section {
    display: grid;
    gap: var(--df-space-md);
  }

  .administration-section__toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    @include page-fields.page-toolbar-button;
  }

  .administration-section__search {
    flex: 1;
    min-width: 0;
    @include page-fields.page-search-field;
  }

  @media (max-width: 900px) {
    .administration-section__toolbar {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
