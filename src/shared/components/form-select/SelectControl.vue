<template>
  <div
    class="select-control-host"
    :class="`select-control-host--${variant}`"
  >
    <v-select
      :id="id"
      :model-value="modelValue"
      class="select-control"
      :clearable="clearable"
      color="primary"
      density="compact"
      :disabled="disabled"
      :error="error"
      :error-messages="errorMessages"
      :hide-details="hideDetails"
      :item-title="itemTitle"
      :item-value="itemValue"
      :items="items"
      placeholder=""
      single-line
      variant="outlined"
      :menu-props="resolvedMenuProps"
      @update:model-value="emit('update:modelValue', $event)"
    >
      <template v-if="hasValue" #selection>
        <span class="select-control__text">
          {{ displayText }}
        </span>
      </template>
    </v-select>

    <span
      v-if="showPlaceholder"
      class="select-control-host__placeholder"
      aria-hidden="true"
    >
      {{ placeholder }}
    </span>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { hasSelectValue, resolveSelectLabel } from '@/shared/components/form-select/select-control.utils'

  const props = withDefaults(defineProps<{
    id?: string
    modelValue?: unknown
    items: readonly unknown[]
    itemTitle?: string
    itemValue?: string
    placeholder?: string
    variant?: 'form' | 'inline'
    error?: boolean
    errorMessages?: string | string[]
    clearable?: boolean
    disabled?: boolean
    hideDetails?: boolean | 'auto'
    menuClass?: string
    menuProps?: Record<string, unknown>
  }>(), {
    id: undefined,
    modelValue: undefined,
    itemTitle: 'title',
    itemValue: 'value',
    placeholder: 'Selecione',
    variant: 'form',
    error: false,
    errorMessages: '',
    clearable: false,
    disabled: false,
    hideDetails: 'auto',
    menuClass: 'select-control__menu',
    menuProps: () => ({}),
  })

  const emit = defineEmits<{
    'update:modelValue': [value: unknown]
  }>()

  const resolvedMenuProps = computed(() => ({
    contentClass: props.menuClass,
    ...props.menuProps,
  }))

  const hasValue = computed(() => hasSelectValue(props.modelValue))

  const showPlaceholder = computed(() => !hasValue.value && Boolean(props.placeholder))

  const displayText = computed(() => resolveSelectLabel(
    props.modelValue,
    props.items,
    props.itemTitle,
    props.itemValue,
    props.placeholder,
  ))
</script>

<style scoped lang="scss">
  @use '@/shared/styles/select-control' as select;

  .select-control-host {
    position: relative;
    min-width: 0;
  }

  .select-control-host--form {
    @include select.select-control-form;
  }

  .select-control-host--inline {
    @include select.select-control-inline;
  }
</style>
