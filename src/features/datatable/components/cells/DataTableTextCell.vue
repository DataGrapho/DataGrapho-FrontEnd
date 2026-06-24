<template>
  <v-tooltip
    :disabled="!errorMessage"
    location="top"
    :text="errorMessage"
    content-class="datatable-cell-error-tooltip"
  >
    <template #activator="{ props: tooltipProps }">
      <v-text-field
        v-bind="tooltipProps"
        :error="invalid"
        class="datatable-text-cell"
        density="compact"
        hide-details
        :model-value="stringValue"
        placeholder="Digite..."
        variant="outlined"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps<{
    modelValue: unknown
    errorMessage?: string
    invalid?: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const stringValue = computed(() => {
    if (props.modelValue === null || props.modelValue === undefined) return ''
    return String(props.modelValue)
  })

  const invalid = computed(() => props.invalid || Boolean(props.errorMessage))
</script>

<style scoped lang="scss">
  @use '@/features/datatable/styles/datatable-field' as field;

  .datatable-text-cell {
    @include field.datatable-inline-field;
  }
</style>

<style>
  .datatable-cell-error-tooltip {
    font-family: var(--df-font-body);
    font-size: 0.8125rem;
    line-height: 1.125rem;
    letter-spacing: 0;
  }
</style>
