<template>
  <button class="chat-sidebar__action" type="button" v-bind="$attrs">
    <div class="chat-sidebar__rail-slot">
      <i :class="[iconClass, 'chat-sidebar__icon']" />
    </div>
    <span class="chat-sidebar__label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
  defineProps<{
    iconClass: string
    label: string
  }>()
</script>

<style scoped>
  .chat-sidebar__rail-slot {
    display: inline-flex;
    width: 20px;
    min-width: 20px;
    align-items: center;
    justify-content: center;
    margin-left: var(--rail-padding-left);
  }

  .chat-sidebar__action {
    display: flex;
    width: 100%;
    height: 36px;
    min-height: 36px;
    flex-shrink: 0;
    align-items: center;
    padding: 0 10px 0 0;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: rgb(var(--v-theme-on-surface));
    cursor: pointer;
    text-align: left;
    overflow: hidden;
    transition: background 180ms ease;
  }

  .chat-sidebar__action:hover {
    background: rgb(var(--v-theme-surface-variant));
  }

  .chat-sidebar__icon {
    font-size: var(--df-sidebar-icon-size);
    line-height: 1;
    transition: opacity 180ms ease;
  }

  .chat-sidebar__label {
    flex: 1;
    white-space: nowrap;
    font-size: 16px;
    font-family: 'Sansation', sans-serif;
    font-weight: 400;
    line-height: 24px;
    color: rgb(var(--v-theme-on-surface));
    opacity: 1;
    transition: opacity 120ms ease;
    overflow: hidden;
    margin-left: var(--icon-label-gap);
  }
</style>
