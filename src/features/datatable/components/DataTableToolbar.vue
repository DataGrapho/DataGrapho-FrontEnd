<template>
  <header class="datatable-toolbar">
    <div class="datatable-toolbar__desktop">
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

        <SelectControl
          id="datatable-columns"
          class="datatable-toolbar__select"
          hide-details
          item-title="title"
          item-value="value"
          :items="columnViewOptions"
          menu-class="datatable-toolbar__menu"
          :model-value="columnViewId"
          placeholder="Colunas"
          variant="form"
          @update:model-value="emit('update:columnViewId', String($event ?? ''))"
        />

        <SelectControl
          id="datatable-filter"
          class="datatable-toolbar__select"
          hide-details
          item-title="title"
          item-value="value"
          :items="filterViewOptions"
          menu-class="datatable-toolbar__menu"
          :model-value="filterViewId"
          placeholder="Filtrar"
          variant="form"
          @update:model-value="emit('update:filterViewId', String($event ?? ''))"
        />

        <SelectControl
          v-if="hasCatalogFilter"
          id="datatable-catalog"
          class="datatable-toolbar__select datatable-toolbar__select--wide"
          hide-details
          item-title="title"
          item-value="value"
          :items="catalogoOptions"
          menu-class="datatable-toolbar__menu"
          :model-value="selectedCatalogoId"
          placeholder="Catalogo"
          variant="form"
          @update:model-value="emit('update:selectedCatalogoId', $event === null || $event === '' ? null : Number($event))"
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
    </div>

    <div class="datatable-toolbar__mobile">
      <div class="datatable-toolbar__mobile-actions">
        <button
          class="datatable-toolbar__mobile-action"
          type="button"
          @click="emit('new-item')"
        >
          <Icon name="add-line" />
          <span>Novo</span>
        </button>

        <button
          class="datatable-toolbar__mobile-action"
          type="button"
          @click="emit('toggle-edit-mode', !editMode)"
        >
          <Icon :name="editMode ? 'close-line' : 'edit-box-line'" />
          <span>{{ editMode ? 'Sair' : 'Grade' }}</span>
        </button>

        <button
          v-if="editMode"
          class="datatable-toolbar__mobile-action"
          :disabled="!hasPendingChanges"
          type="button"
          @click="emit('discard')"
        >
          <Icon name="arrow-go-back-line" />
          <span>Desfazer</span>
        </button>

        <button
          class="datatable-toolbar__mobile-action"
          :disabled="saving"
          type="button"
          @click="emit('refresh')"
        >
          <Icon name="refresh-line" />
          <span>Atualizar</span>
        </button>
      </div>

      <details class="datatable-toolbar__mobile-filters">
        <summary class="datatable-toolbar__mobile-filters-toggle">
          <Icon name="filter-3-line" />
          <span>Visualizacao e filtros</span>
          <Icon class="datatable-toolbar__mobile-filters-chevron" name="arrow-down-s-line" />
        </summary>

        <div class="datatable-toolbar__mobile-filters-body">
          <FormSelect
            id="datatable-columns-mobile"
            field-label="Colunas"
            item-title="title"
            item-value="value"
            :items="columnViewOptions"
            menu-class="datatable-toolbar__menu"
            :model-value="columnViewId"
            placeholder="Colunas"
            @update:model-value="emit('update:columnViewId', String($event ?? ''))"
          />

          <FormSelect
            id="datatable-filter-mobile"
            field-label="Filtrar"
            item-title="title"
            item-value="value"
            :items="filterViewOptions"
            menu-class="datatable-toolbar__menu"
            :model-value="filterViewId"
            placeholder="Filtrar"
            @update:model-value="emit('update:filterViewId', String($event ?? ''))"
          />

          <FormSelect
            v-if="hasCatalogFilter"
            id="datatable-catalog-mobile"
            field-label="Catalogo"
            item-title="title"
            item-value="value"
            :items="catalogoOptions"
            menu-class="datatable-toolbar__menu"
            :model-value="selectedCatalogoId"
            placeholder="Catalogo"
            @update:model-value="emit('update:selectedCatalogoId', $event === null || $event === '' ? null : Number($event))"
          />
        </div>
      </details>
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
  import FormSelect from '@/shared/components/form-select/FormSelect.vue'
  import SelectControl from '@/shared/components/form-select/SelectControl.vue'
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
  .datatable-toolbar {
    display: flex;
    width: 100%;
    min-width: 0;
    flex-direction: column;
    gap: 8px;
    flex-shrink: 0;
  }

  .datatable-toolbar__mobile {
    display: none;
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
    flex: 1 1 0;
    min-width: 0;
    align-self: center;
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

  @media (max-width: 1060px) {
    .datatable-toolbar__desktop {
      display: none;
    }

    .datatable-toolbar__mobile {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .datatable-toolbar__mobile-actions {
      display: flex;
      align-items: stretch;
      gap: 0;
      padding: 4px;
      border-radius: var(--df-radius-base);
      background: rgb(var(--v-theme-surface));
      border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    }

    .datatable-toolbar__mobile-action {
      display: flex;
      min-width: 0;
      flex: 1 1 0;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      padding: 6px 2px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: rgb(var(--v-theme-on-surface));
      font-family: var(--df-font-body);
      font-size: 0.625rem;
      line-height: 0.875rem;
      letter-spacing: 0;
      cursor: pointer;
    }

    .datatable-toolbar__mobile-action:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .datatable-toolbar__mobile-action :deep(i),
    .datatable-toolbar__mobile-action :deep(svg) {
      font-size: 1.125rem;
      line-height: 1;
    }

    .datatable-toolbar__mobile-action span {
      max-width: 100%;
      overflow: hidden;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .datatable-toolbar__mobile-filters {
      border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
      border-radius: var(--df-radius-base);
      background: rgb(var(--v-theme-surface));
      overflow: hidden;
    }

    .datatable-toolbar__mobile-filters-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      color: rgb(var(--v-theme-on-surface));
      font-family: var(--df-font-body);
      font-size: 0.8125rem;
      line-height: 1.125rem;
      letter-spacing: 0;
      cursor: pointer;
      list-style: none;
      user-select: none;
    }

    .datatable-toolbar__mobile-filters-toggle::-webkit-details-marker {
      display: none;
    }

    .datatable-toolbar__mobile-filters-chevron {
      margin-left: auto;
      transition: transform 180ms ease;
    }

    .datatable-toolbar__mobile-filters[open] .datatable-toolbar__mobile-filters-chevron {
      transform: rotate(180deg);
    }

    .datatable-toolbar__mobile-filters-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px;
      border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
    }

    .datatable-toolbar__mobile-filters-body :deep(.form-select) {
      width: 100%;
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
