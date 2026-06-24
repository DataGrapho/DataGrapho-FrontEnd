<template>
  <div
    class="datatable-form-select"
    :class="{ 'datatable-form-select--labeled': Boolean(fieldLabel) }"
  >
    <label
      v-if="fieldLabel"
      class="datatable-form-select__label text-label-base"
      :for="id"
    >
      {{ fieldLabel }}
    </label>

    <v-select
      :id="id"
      :model-value="modelValue"
      class="datatable-form-select__control"
      :clearable="clearable"
      :density="density"
      :disabled="disabled"
      :error="error"
      :error-messages="errorMessages"
      hide-details="auto"
      :item-title="itemTitle"
      :item-value="itemValue"
      :items="items"
      :placeholder="placeholder"
      variant="outlined"
      :menu-props="resolvedMenuProps"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  defineOptions({ inheritAttrs: false })

  const props = withDefaults(defineProps<{
    id?: string
    modelValue?: unknown
    items: unknown[]
    itemTitle?: string
    itemValue?: string
    placeholder?: string
    fieldLabel?: string
    error?: boolean
    errorMessages?: string | string[]
    clearable?: boolean
    disabled?: boolean
    density?: 'default' | 'comfortable' | 'compact'
    menuProps?: Record<string, unknown>
  }>(), {
    id: undefined,
    modelValue: undefined,
    itemTitle: 'title',
    itemValue: 'value',
    placeholder: 'Selecione',
    fieldLabel: '',
    error: false,
    errorMessages: '',
    clearable: false,
    disabled: false,
    density: 'compact',
    menuProps: () => ({}),
  })

  const emit = defineEmits<{
    'update:modelValue': [value: unknown]
  }>()

  const resolvedMenuProps = computed(() => ({
    contentClass: 'datatable-form-select__menu',
    ...props.menuProps,
  }))
</script>

<style scoped lang="scss">
  @use '@/features/datatable/styles/datatable-field' as field;

  .datatable-form-select {
    min-width: 0;
  }

  .datatable-form-select--labeled {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .datatable-form-select__label {
    color: rgb(var(--v-theme-on-surface-variant));
    font-family: var(--df-font-body);
  }

  .datatable-form-select__control {
    @include field.datatable-form-field;
  }
</style>

<style>
  .datatable-form-select__menu .v-list-item-title {
    font-family: var(--df-font-body);
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0;
  }
</style>
