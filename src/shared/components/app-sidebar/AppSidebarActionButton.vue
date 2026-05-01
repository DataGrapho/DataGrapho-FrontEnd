<template>
  <button
    class="app-sidebar-action"
    type="button"
    :title="title || label"
    @click="$emit('click')"
  >
    <span class="app-sidebar-action__rail-slot">
      <slot name="icon">
        <v-icon class="app-sidebar-action__icon" size="20">
          <Icon :name="icon" />
        </v-icon>
      </slot>
    </span>
    <span class="app-sidebar-action__label text-body-small">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
  defineProps<{
    icon?: string
    label: string
    title?: string
  }>()

  defineEmits<{
    click: []
  }>()
</script>

<style scoped>
  .app-sidebar-action {
    display: flex;
    width: 100%;
    height: 32px;
    align-items: center;
    padding: 0 12px 0 0;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: rgb(var(--v-theme-on-surface));
    cursor: pointer;
    overflow: hidden;
    transition: background 180ms ease;
  }

  .app-sidebar-action:hover {
    background: rgb(var(--v-theme-surface-variant));
  }

  .app-sidebar-action__rail-slot {
    position: relative;
    display: inline-flex;
    width: 20px;
    min-width: 20px;
    align-items: center;
    justify-content: center;
    margin-left: var(--rail-padding-left);
  }

  .app-sidebar-action__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    flex-shrink: 0;
  }

  .app-sidebar-action__label {
    margin-left: var(--icon-label-gap);
    min-width: 0;
    white-space: nowrap;
    opacity: 1;
    transition: opacity 180ms ease;
  }
</style>
