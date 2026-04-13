<template>
  <v-text-field
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
</template>

<script lang="ts" setup>
  const props = withDefaults(defineProps<{
    modelValue?: string
    label?: string
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
    modelValue: '',
    label: '',
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
</style>
