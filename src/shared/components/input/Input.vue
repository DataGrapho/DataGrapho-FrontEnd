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
      density="compact"
      single-line
      variant="outlined"
      color="primary"
      class="input-wrapper__control"
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

  withDefaults(defineProps<{
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

<style scoped lang="scss">
  @use '@/shared/styles/form-vuetify-control' as form-control;

  .input-wrapper--with-field-label {
    @include form-control.form-field-label;
  }

  .input-field-label {
    color: rgb(var(--v-theme-on-surface-variant));
    font-family: var(--df-font-body);
  }

  .input-wrapper__control {
    @include form-control.form-vuetify-control;
  }
</style>
