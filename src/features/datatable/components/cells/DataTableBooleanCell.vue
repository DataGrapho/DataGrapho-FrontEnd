<template>
  <button
    class="datatable-status-toggle"
    :class="{
      'datatable-status-toggle--active': Boolean(modelValue),
      'datatable-status-toggle--inactive': !Boolean(modelValue),
    }"
    type="button"
    @click.stop="emit('update:modelValue', !Boolean(modelValue))"
  >
    {{ Boolean(modelValue) ? 'Ativo' : 'Inativo' }}
  </button>
</template>

<script setup lang="ts">
  defineProps<{
    modelValue: unknown
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
  }>()
</script>

<style scoped>
  .datatable-status-toggle {
    display: inline-flex;
    min-width: 68px;
    align-items: center;
    justify-content: center;
    padding: 2px 10px;
    border: 1px solid currentColor;
    border-radius: var(--df-radius-base);
    background: transparent;
    font-family: var(--df-font-body);
    font-size: 0.75rem;
    font-weight: 700;
    line-height: 1.125rem;
    letter-spacing: 0;
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  .datatable-status-toggle--active {
    color: rgb(var(--v-theme-success));
    border-color: rgba(var(--v-theme-success), 0.5);
    background: rgba(var(--v-theme-success), 0.08);
  }

  .datatable-status-toggle--inactive {
    color: rgb(var(--v-theme-on-surface-variant));
    border-color: rgba(var(--v-theme-on-surface), 0.24);
    background: rgba(var(--v-theme-on-surface), 0.04);
  }

  .datatable-status-toggle:hover {
    filter: brightness(1.05);
  }
</style>
