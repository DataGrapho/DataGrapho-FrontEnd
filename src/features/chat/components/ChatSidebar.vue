<template>
  <BaseChatSidebar
    :collapsed="collapsed"
    @toggle="$emit('toggle')"
  />
</template>

<script setup lang="ts">
  import BaseChatSidebar from './sidebar/ChatSidebar.vue'

  defineProps<{
    collapsed: boolean
  }>()

  defineEmits<{
    toggle: []
  }>()
</script>
