<template>
  <v-btn
    :variant="resolvedVariant"
    :color="color"
    :size="resolvedSize"
    :block="block"
    :disabled="disabled"
    :loading="loading"
    class="button"
  >
    <slot />
  </v-btn>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'

  type ButtonColor = 'primary' | 'secondary'
  type ButtonVariant = 'filled' | 'outlined' | 'text'
  type ButtonSize = 'sm' | 'md' | 'lg'

  const props = withDefaults(defineProps<{
    color?: ButtonColor
    variant?: ButtonVariant
    size?: ButtonSize
    block?: boolean
    disabled?: boolean
    loading?: boolean
  }>(), {
    color: 'primary',
    variant: 'filled',
    size: 'md',
    block: false,
    disabled: false,
    loading: false,
  })

  const resolvedVariant = computed(() => {
    if (props.variant === 'filled') return 'flat'
    if (props.variant === 'outlined') return 'outlined'
    return 'text'
  })

  const resolvedSize = computed(() => {
    if (props.size === 'sm') return 'small'
    if (props.size === 'lg') return 'large'
    return 'default'
  })
</script>

<style scoped>
  .button {
    border-radius: var(--df-radius-base);
    font-family: var(--df-font-body);
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    text-transform: none;
    min-height: 40px;
    padding-inline: var(--df-space-md);
  }

  .button.v-btn--size-small {
    min-height: 32px;
    padding-inline: var(--df-space-sm);
  }

  .button.v-btn--size-large {
    min-height: 48px;
    padding-inline: var(--df-space-lg);
  }
</style>
