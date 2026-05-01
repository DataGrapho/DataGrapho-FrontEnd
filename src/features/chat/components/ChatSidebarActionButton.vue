<template>
  <BaseChatSidebarActionButton
    :icon-class="iconClass"
    :label="label"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
  import BaseChatSidebarActionButton from './sidebar/ChatSidebarActionButton.vue'

  defineProps<{
    iconClass: string
    label: string
  }>()
</script>
