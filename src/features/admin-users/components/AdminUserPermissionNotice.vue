<template>
  <InlineMessage
    :messages="message"
    variant="warning"
    align="start"
  />
</template>

<script setup lang="ts">
  import InlineMessage from '@/shared/components/inline-message/InlineMessage.vue'

  defineProps<{
    message: string
  }>()
</script>
