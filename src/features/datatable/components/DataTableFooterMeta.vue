<template>
  <div class="datatable-footer-meta">
    <template v-if="selectedCount > 0">
      <p class="datatable-footer-meta__selection text-body-small">
        {{ selectedCount }} {{ selectedCount === 1 ? 'item selecionado' : 'itens selecionados' }}
      </p>
      <p class="datatable-footer-meta__hint text-body-caption">
        Use Ctrl ou Shift para selecionar varios.
      </p>
    </template>
    <p v-else class="datatable-footer-meta__range text-body-small">
      {{ rangeText }}
    </p>
  </div>
</template>

<script setup lang="ts">
  withDefaults(defineProps<{
    selectedCount?: number
    rangeText: string
  }>(), {
    selectedCount: 0,
  })
</script>

<style scoped>
  .datatable-footer-meta {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 2px;
  }

  .datatable-footer-meta__selection,
  .datatable-footer-meta__range {
    margin: 0;
    color: rgb(var(--v-theme-on-surface));
    font-family: var(--df-font-body);
    letter-spacing: 0;
    white-space: nowrap;
  }

  .datatable-footer-meta__range {
    color: rgb(var(--v-theme-on-surface-variant));
  }

  .datatable-footer-meta__hint {
    margin: 0;
    color: rgb(var(--v-theme-on-surface-variant));
    font-family: var(--df-font-body);
    letter-spacing: 0;
  }
</style>
