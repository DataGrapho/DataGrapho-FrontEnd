<template>
  <div
    class="form-select"
    :class="{ 'form-select--labeled': Boolean(fieldLabel) }"
  >
    <label
      v-if="fieldLabel"
      class="form-select__label text-label-base"
      :for="id"
    >
      {{ fieldLabel }}
    </label>

    <SelectControl
      :id="id"
      class="form-select__control"
      :clearable="clearable"
      :disabled="disabled"
      :error="error"
      :error-messages="errorMessages"
      hide-details="auto"
      :item-title="itemTitle"
      :item-value="itemValue"
      :items="items"
      :menu-class="menuClass"
      :menu-props="menuProps"
      :model-value="modelValue"
      :placeholder="resolvedPlaceholder"
      variant="form"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import SelectControl from '@/shared/components/form-select/SelectControl.vue'

  defineOptions({ inheritAttrs: false })

  const props = withDefaults(defineProps<{
    id?: string
    modelValue?: unknown
    items: readonly unknown[]
    itemTitle?: string
    itemValue?: string
    placeholder?: string
    fieldLabel?: string
    error?: boolean
    errorMessages?: string | string[]
    clearable?: boolean
    disabled?: boolean
    menuClass?: string
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
    menuClass: 'form-select__menu',
    menuProps: () => ({}),
  })

  const emit = defineEmits<{
    'update:modelValue': [value: unknown]
  }>()

  const resolvedPlaceholder = computed(() => {
    if (!props.placeholder) return ''
    if (!props.fieldLabel) return props.placeholder
    return props.placeholder.trim().toLowerCase() === props.fieldLabel.trim().toLowerCase()
      ? ''
      : props.placeholder
  })
</script>

<style scoped lang="scss">
  @use '@/shared/styles/form-vuetify-control' as form-control;

  .form-select {
    min-width: 0;
  }

  .form-select--labeled {
    @include form-control.form-field-label;
  }

  .form-select__label {
    color: rgb(var(--v-theme-on-surface-variant));
    font-family: var(--df-font-body);
  }
</style>

<style>
  .form-select__menu .v-list-item-title,
  .select-control__menu .v-list-item-title {
    font-family: var(--df-font-body);
    font-size: 0.875rem;
    line-height: 1.25rem;
    letter-spacing: 0;
  }
</style>
