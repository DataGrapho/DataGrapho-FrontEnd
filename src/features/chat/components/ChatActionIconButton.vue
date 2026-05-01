<template>
  <BaseChatActionIconButton
    :icon="icon"
    :label="label"
    :size="size"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
  import BaseChatActionIconButton from './chat/ChatActionIconButton.vue'

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
