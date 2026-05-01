<template>
  <v-btn
    class="chat-icon-button"
    density="compact"
    icon
    variant="text"
    :aria-label="label"
    v-bind="$attrs"
  >
    <Icon class="chat-message__action-icon" :name="icon" :size="size" />
  </v-btn>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      label: string
      icon: string
      size?: number
    }>(),
    {
      size: 16,
    },
  )
</script>

<style scoped>
  .chat-icon-button {
    width: auto;
    height: auto;
    min-width: 0;
    padding: 0;
    margin: 0;
    color: rgb(var(--v-theme-on-surface));
  }

  .chat-message__action-icon {
    line-height: 1;
  }
</style>
