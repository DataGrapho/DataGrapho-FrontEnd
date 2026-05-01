<template>
  <button
    class="chat-sidebar__recent-item"
    :class="{ 'chat-sidebar__recent-item--active': active }"
    type="button"
  >
    <span class="chat-sidebar__recent-item-text">{{ label }}</span>
    <ActionMenu :items="recentActions" title="Acoes do chat">
      <template #activator="{ props: menuProps }">
        <button
          class="chat-sidebar__recent-item-menu"
          type="button"
          title="Acoes do chat"
          v-bind="menuProps"
          @click.stop
        >
          <v-icon icon="mdi-dots-horizontal" size="18" />
        </button>
      </template>
    </ActionMenu>
  </button>
</template>

<script setup lang="ts">
  import ActionMenu, { type ActionMenuItem } from '@/shared/components/action-menu/ActionMenu.vue'

  defineProps<{
    label: string
    active?: boolean
  }>()

  const recentActions: ActionMenuItem[] = [
    { label: 'Renomear', value: 'rename', icon: 'mdi-pencil-outline' },
    { label: 'Excluir', value: 'delete', icon: 'mdi-delete-outline' },
  ]
</script>

<style scoped>
  .chat-sidebar__recent-item {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    padding: 6px 4px;
    padding-left: var(--rail-padding-left);
    border: 0;
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    text-align: left;
    transition: background 180ms ease;
  }

  .chat-sidebar__recent-item-menu {
    display: inline-flex;
    width: 22px;
    height: 22px;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: rgb(var(--v-theme-on-surface));
    opacity: 0;
    pointer-events: none;
    transition: opacity 140ms ease;
  }

  .chat-sidebar__recent-item:hover .chat-sidebar__recent-item-menu {
    opacity: 1;
    pointer-events: auto;
  }

  .chat-sidebar__recent-item-menu:hover {
    background: rgb(var(--v-theme-surface-variant));
  }

  .chat-sidebar__recent-item:hover {
    background: rgb(var(--v-theme-surface-variant));
  }

  .chat-sidebar__recent-item--active {
    background: var(--sidebar-active-bg);
  }

  .chat-sidebar__recent-item-text {
    flex: 1;
    font-size: 14px;
    font-family: 'Sansation', sans-serif;
    color: rgb(var(--v-theme-on-surface));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }
</style>
