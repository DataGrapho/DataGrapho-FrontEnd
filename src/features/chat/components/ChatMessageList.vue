<template>
  <BaseChatMessageList :messages="messages" />
</template>

<script setup lang="ts">
  import BaseChatMessageList from './chat/ChatMessageList.vue'
  import type { ChatMessage } from '@/features/chat/types/chat.types'

  defineProps<{
    messages: ChatMessage[]
  }>()
</script>
