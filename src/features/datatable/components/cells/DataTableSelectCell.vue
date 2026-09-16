<template>
  <v-tooltip
    :disabled="!errorMessage"
    location="top"
    :text="errorMessage"
    content-class="datatable-cell-error-tooltip"
  >
    <template #activator="{ props: tooltipProps }">
      <v-select
        v-bind="tooltipProps"
        :error="invalid"
        class="datatable-select-cell"
        density="compact"
        hide-details
        item-title="label"
        item-value="value"
        :items="options"
        :model-value="modelValue"
        placeholder="Selecione"
        variant="outlined"
        :menu-props="{ contentClass: 'datatable-select-cell__menu' }"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { DataTableFilterOption } from '@/features/datatable/types/shared-table.types'

  const props = defineProps<{
    modelValue: unknown
    options: DataTableFilterOption[]
    errorMessage?: string
    invalid?: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: unknown]
  }>()

  const invalid = computed(() => props.invalid || Boolean(props.errorMessage))
</script>

<style scoped lang="scss">
  @use '@/features/datatable/styles/datatable-field' as field;

  .datatable-select-cell {
    @include field.datatable-inline-field;
  }
</style>

<style>
  .datatable-select-cell__menu .v-list-item-title {
    font-family: var(--df-font-body);
    font-size: 0.8125rem;
    line-height: 1.125rem;
    letter-spacing: 0;
  }
</style>
