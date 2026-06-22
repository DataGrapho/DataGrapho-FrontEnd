<template>
  <div
    class="inline-message text-body-small"
    :class="[
      `inline-message--${variant}`,
      `inline-message--align-${align}`,
    ]"
    :role="variant === 'error' ? 'alert' : 'status'"
    aria-live="polite"
  >
    <p
      v-for="message in normalizedMessages"
      :key="message"
      class="inline-message__text"
    >
      {{ message }}
    </p>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'

  type InlineMessageVariant = 'error' | 'success' | 'info' | 'warning'
  type InlineMessageAlign = 'center' | 'start'

  const props = withDefaults(defineProps<{
    messages: string | string[]
    variant?: InlineMessageVariant
    align?: InlineMessageAlign
  }>(), {
    messages: '',
    variant: 'error',
    align: 'center',
  })

  const normalizedMessages = computed(() =>
    (Array.isArray(props.messages) ? props.messages : [props.messages]).filter(Boolean),
  )
</script>

<style scoped>
  .inline-message {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-family: var(--df-font-body);
    letter-spacing: 0;
  }

  .inline-message--align-center {
    margin: calc(var(--df-space-xs) * -1) 0 0;
    text-align: center;
  }

  .inline-message--align-start {
    margin: 0;
    text-align: start;
  }

  .inline-message__text {
    margin: 0;
  }

  .inline-message--error {
    color: rgb(var(--v-theme-error));
  }

  .inline-message--success {
    color: rgb(var(--v-theme-success));
  }

  .inline-message--info,
  .inline-message--warning {
    color: rgb(var(--v-theme-on-surface-variant));
  }
</style>
