<template>
  <header class="datatable-toolbar">
    <div class="datatable-toolbar__row">
      <Button
        class="datatable-toolbar__btn datatable-toolbar__btn--fit"
        color="on-surface"
        size="md"
        variant="outlined"
        @click="emit('new-item')"
      >
        <Icon name="add-line" />
        Adicionar novo item
      </Button>

      <Button
        class="datatable-toolbar__btn datatable-toolbar__btn--fit"
        size="md"
        variant="outlined"
        color="on-surface"
        @click="emit('toggle-edit-mode', !editMode)"
      >
        <Icon :name="editMode ? 'close-line' : 'edit-box-line'" />
        {{ editMode ? 'Sair da grade' : 'Editar em grade' }}
      </Button>

      <Button
        v-if="editMode"
        class="datatable-toolbar__btn datatable-toolbar__btn--fit"
        size="md"
        variant="outlined"
        color="on-surface"
        :disabled="!hasPendingChanges"
        @click="emit('discard')"
      >
        <Icon name="arrow-go-back-line" />
        Desfazer
      </Button>

      <v-select
        id="datatable-columns"
        :items="columnViewOptions"
        class="datatable-toolbar__select"
        density="comfortable"
        hide-details
        item-title="title"
        item-value="value"
        :model-value="columnViewId"
        placeholder="Colunas"
        variant="outlined"
        :menu-props="{ contentClass: 'datatable-toolbar__menu' }"
        @update:model-value="emit('update:columnViewId', $event)"
      />

      <v-select
        id="datatable-filter"
        :items="filterViewOptions"
        class="datatable-toolbar__select"
        density="comfortable"
        hide-details
        item-title="title"
        item-value="value"
        :model-value="filterViewId"
        placeholder="Filtrar"
        variant="outlined"
        :menu-props="{ contentClass: 'datatable-toolbar__menu' }"
        @update:model-value="emit('update:filterViewId', $event)"
      />

      <v-select
        v-if="hasCatalogFilter"
        id="datatable-catalog"
        :items="catalogoOptions"
        class="datatable-toolbar__select datatable-toolbar__select--wide"
        density="comfortable"
        hide-details
        item-title="title"
        item-value="value"
        :model-value="selectedCatalogoId"
        placeholder="Catalogo"
        variant="outlined"
        :menu-props="{ contentClass: 'datatable-toolbar__menu' }"
        @update:model-value="emit('update:selectedCatalogoId', $event)"
      />

      <button
        class="datatable-toolbar__refresh"
        :disabled="saving"
        title="Atualizar"
        type="button"
        @click="emit('refresh')"
      >
        <Icon name="refresh-line" />
      </button>
    </div>

    <InlineMessage
      v-if="saveMessage"
      :messages="saveMessage"
      variant="success"
      align="start"
    />
    <InlineMessage
      v-if="saveError"
      :messages="saveError"
      align="start"
    />
  </header>
</template>

<script setup lang="ts">
  import Button from '@/shared/components/button/Button.vue'
  import InlineMessage from '@/shared/components/inline-message/InlineMessage.vue'

  defineProps<{
    columnViewId: string
    filterViewId: string
    selectedCatalogoId: number | null
    columnViewOptions: { title: string, value: string }[]
    filterViewOptions: { title: string, value: string }[]
    catalogoOptions: { title: string, value: number }[]
    hasCatalogFilter: boolean
    editMode: boolean
    hasPendingChanges: boolean
    saving: boolean
    saveMessage: string
    saveError: string
  }>()

  const emit = defineEmits<{
    'update:columnViewId': [value: string]
    'update:filterViewId': [value: string]
    'update:selectedCatalogoId': [value: number | null]
    'toggle-edit-mode': [enabled: boolean]
    'new-item': []
    discard: []
    refresh: []
  }>()
</script>

<style scoped lang="scss">
  @use '@/features/datatable/styles/datatable-field' as field;

  .datatable-toolbar {
    display: flex;
    width: 100%;
    min-width: 0;
    flex-direction: column;
    gap: 8px;
    flex-shrink: 0;
  }

  .datatable-toolbar__row {
    display: flex;
    width: 100%;
    min-width: 0;
    flex-wrap: wrap;
    align-items: stretch;
    gap: 8px;
  }

  .datatable-toolbar__row :deep(.datatable-toolbar__btn.button) {
    height: 40px;
    min-height: 40px;
    max-height: 40px;
    padding-inline: 10px;
  }

  .datatable-toolbar__row :deep(.datatable-toolbar__btn--fit.button) {
    flex: 0 0 auto;
    width: fit-content;
    max-width: 100%;
  }

  .datatable-toolbar__row :deep(.datatable-toolbar__btn--fit .v-btn__content) {
    gap: 6px;
    white-space: nowrap;
    text-align: center;
    line-height: 1.15;
  }

  .datatable-toolbar__row :deep(.datatable-toolbar__btn .v-btn__content) {
    gap: 6px;
    white-space: normal;
    text-align: center;
    line-height: 1.15;
  }

  .datatable-toolbar__row :deep(.button--outlined.button--on-surface) {
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    border-color: rgba(var(--v-theme-on-surface), 0.16);
  }

  .datatable-toolbar__select {
    @include field.datatable-toolbar-select;
    flex: 1 1 0;
    min-width: 0;
    height: 40px;
  }

  .datatable-toolbar__select--wide {
    flex: 1.25 1 0;
  }

  .datatable-toolbar__refresh {
    display: inline-flex;
    width: 40px;
    height: 40px;
    flex: 0 0 40px;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.16);
    border-radius: var(--df-radius-base);
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    cursor: pointer;
  }

  .datatable-toolbar__refresh:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 900px) {
    .datatable-toolbar__row :deep(.datatable-toolbar__btn--fit) {
      flex: 0 0 auto;
      width: fit-content;
      max-width: 100%;
      font-size: 13px;
    }

    .datatable-toolbar__select {
      flex: 1 1 calc(50% - 4px);
    }

    .datatable-toolbar__refresh {
      flex: 0 0 40px;
    }
  }
</style>

<style>
  .datatable-toolbar__menu .v-list-item-title {
    font-family: var(--df-font-body);
    font-size: 0.875rem;
    line-height: 1.25rem;
    letter-spacing: 0;
  }
</style>
