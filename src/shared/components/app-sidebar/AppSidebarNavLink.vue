<template>
  <RouterLink
    class="app-sidebar-item"
    :class="{ 'app-sidebar-item--active': active }"
    :to="to"
  >
    <span class="app-sidebar-item__rail-slot">
      <v-icon class="app-sidebar-item__icon" size="20">
        <Icon :name="icon" />
      </v-icon>
    </span>
    <span class="app-sidebar-item__label text-body-small">{{ label }}</span>
  </RouterLink>
</template>

<script setup lang="ts">
  defineProps<{
    to: string
    icon: string
    label: string
    active?: boolean
  }>()
</script>

<style scoped>
  .app-sidebar-item {
    display: flex;
    width: 100%;
    height: 40px;
    align-items: center;
    padding: 0 12px 0 0;
    border-radius: 6px;
    color: rgb(var(--v-theme-on-surface));
    text-decoration: none;
    overflow: hidden;
    transition: background 180ms ease;
  }

  .app-sidebar-item:hover {
    background: rgb(var(--v-theme-surface-variant));
  }

  .app-sidebar-item--active {
    background: var(--sidebar-active-bg);
  }

  .app-sidebar-item__rail-slot {
    position: relative;
    display: inline-flex;
    width: 20px;
    min-width: 20px;
    align-items: center;
    justify-content: center;
    margin-left: var(--rail-padding-left);
  }

  .app-sidebar-item__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    flex-shrink: 0;
  }

  .app-sidebar-item__label {
    margin-left: var(--icon-label-gap);
    min-width: 0;
    white-space: nowrap;
    opacity: 1;
    transition: opacity 180ms ease;
  }
</style>
