<template>
  <div class="auth-alert text-body-small" role="alert" aria-live="polite">
    <p v-for="message in normalizedMessages" :key="message" class="auth-alert__message">
      {{ message }}
    </p>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'

  const props = withDefaults(defineProps<{
    messages: string | string[]
  }>(), {
    messages: '',
  })

  const normalizedMessages = computed(() =>
    (Array.isArray(props.messages) ? props.messages : [props.messages]).filter(Boolean)
  )
</script>

<style scoped>
  .auth-alert {
    margin: calc(var(--df-space-xs) * -1) 0 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    text-align: center;
    color: rgb(var(--v-theme-error));
  }

  .auth-alert__message {
    margin: 0;
  }
</style>
