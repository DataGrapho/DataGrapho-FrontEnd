<template>
  <div :class="['input-wrapper', { 'input-wrapper--with-field-label': !!fieldLabel }]">
    <label v-if="fieldLabel" :for="id" class="input-field-label text-label-base">{{ fieldLabel }}</label>

    <v-text-field
      v-bind="attrs"
      :id="id"
      :model-value="modelValue"
      :label="label"
      :placeholder="placeholder"
      :type="type"
      :disabled="disabled"
      :readonly="readonly"
      :error="error"
      :error-messages="errorMessages"
      :hint="hint"
      :persistent-hint="persistentHint"
      :clearable="clearable"
      variant="outlined"
      color="primary"
      class="input"
      hide-details="auto"
      @update:model-value="onUpdate"
    />
  </div>
</template>

<script lang="ts" setup>
  import { useAttrs } from 'vue'

  defineOptions({
    inheritAttrs: false,
  })

  const attrs = useAttrs()

  const props = withDefaults(defineProps<{
    id?: string
    modelValue?: string
    label?: string
    fieldLabel?: string
    placeholder?: string
    type?: string
    disabled?: boolean
    readonly?: boolean
    error?: boolean
    errorMessages?: string | string[]
    hint?: string
    persistentHint?: boolean
    clearable?: boolean
  }>(), {
    id: undefined,
    modelValue: '',
    label: '',
    fieldLabel: '',
    placeholder: '',
    type: 'text',
    disabled: false,
    readonly: false,
    error: false,
    errorMessages: '',
    hint: '',
    persistentHint: false,
    clearable: false,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  function onUpdate(value: string) {
    emit('update:modelValue', value)
  }
</script>

<style scoped>
  .input-wrapper--with-field-label {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .input-field-label {
    color: rgb(var(--v-theme-on-surface-variant));
  }

  .input {
    --v-field-border-width: 1px;
  }

  .input :deep(.v-field) {
    border-radius: var(--df-radius-base);
    background-color: rgb(var(--v-theme-surface));
  }

  .input :deep(.v-field__outline) {
    color: var(--v-border-color);
  }

  .input :deep(.v-field__input),
  .input :deep(.v-label) {
    font-family: 'Sansation', sans-serif;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0;
  }

  .input :deep(.v-input__details) {
    padding-inline: 0;
  }

  .input :deep(.v-messages__message) {
    font-family: var(--df-font-body);
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 400;
    text-align: left;
  }

  .input :deep(.v-input--error .v-messages__message) {
    color: rgb(var(--v-theme-error));
  }
</style>
