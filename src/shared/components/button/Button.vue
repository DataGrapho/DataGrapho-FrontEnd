<template>
  <v-btn
    :variant="resolvedVariant"
    :color="resolvedColor"
    :size="resolvedSize"
    :block="block"
    :disabled="disabled"
    :loading="loading"
    :type="type"
    :to="to"
    :class="['button', `button--${variant}`, `button--${color}`]"
  >
    <slot />
  </v-btn>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import type { RouteLocationRaw } from 'vue-router'

  type ButtonColor = 'primary' | 'secondary' | 'on-surface'
  type ButtonVariant = 'filled' | 'outlined' | 'text'
  type ButtonSize = 'sm' | 'md' | 'lg'

  const props = withDefaults(defineProps<{
    color?: ButtonColor
    variant?: ButtonVariant
    size?: ButtonSize
    block?: boolean
    disabled?: boolean
    loading?: boolean
    type?: 'button' | 'submit' | 'reset'
    to?: RouteLocationRaw
  }>(), {
    color: 'primary',
    variant: 'filled',
    size: 'md',
    block: false,
    disabled: false,
    loading: false,
    type: 'button',
    to: undefined,
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

  const resolvedColor = computed(() => {
    if (props.variant === 'filled' && props.color === 'primary') {
      return undefined
    }

    return props.color
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

  .button--filled.button--primary {
    background: var(--df-gradient-brand-primary-secondary);
    color: rgb(var(--v-theme-on-primary));
  }

  .button--text.button--on-surface {
    color: rgb(var(--v-theme-on-surface));
  }

  .button.v-btn--size-small {
    min-height: 32px;
    padding-inline: var(--df-space-sm);
  }

  .button.v-btn--size-large {
    min-height: 49px;
    padding-inline: var(--df-space-lg);
  }
</style>
