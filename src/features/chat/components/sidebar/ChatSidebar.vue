<template>
  <aside
    class="chat-sidebar"
    :class="{ 'chat-sidebar--collapsed': collapsed }"
  >
    <div class="chat-sidebar__header">
      <div class="chat-sidebar__toggle-anchor">
        <button
          class="chat-sidebar__icon-btn"
          type="button"
          :title="collapsed ? 'Expandir sidebar' : 'Recolher sidebar'"
          @click="$emit('toggle')"
        >
          <Icon class="chat-sidebar__icon" :class="{ 'chat-sidebar__icon--hidden': !collapsed }" name="sidebar-unfold-line" />
          <Icon class="chat-sidebar__icon" :class="{ 'chat-sidebar__icon--hidden': collapsed }" name="sidebar-fold-line" />
        </button>
      </div>
    </div>

    <div class="chat-sidebar__content">
      <div class="chat-sidebar__actions">
        <ChatSidebarActionButton icon-class="ri-search-line" label="Procurar" />
        <ChatSidebarActionButton icon-class="ri-edit-box-line" label="Novo Chat" />
      </div>

      <section class="chat-sidebar__recent">
        <button class="chat-sidebar__recent-title" type="button">
          <span class="chat-sidebar__recent-title-text">Chats recentes</span>
          <v-icon icon="mdi-chevron-down" size="14" />
        </button>

        <ChatSidebarRecentItem
          v-for="chat in recentChats"
          :key="chat.id"
          :active="chat.active"
          :label="chat.label"
        />
      </section>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import ChatSidebarActionButton from '@/features/chat/components/sidebar/ChatSidebarActionButton.vue'
  import ChatSidebarRecentItem from '@/features/chat/components/sidebar/ChatSidebarRecentItem.vue'

  defineProps<{
    collapsed: boolean
  }>()

  defineEmits<{
    toggle: []
  }>()

  const recentChats = [
    { id: 1, label: 'Como posso melhorar min...', active: true },
    { id: 2, label: 'Quais são as melhores estratégias para otimizar o fluxo de trabalho?', active: false },
    { id: 3, label: 'Quais são as melhores ferramentas para priorizar tarefas?', active: false },
  ]

</script>

<style scoped>

  .chat-sidebar {
    --rail-padding-left: 10.5px;
    --icon-label-gap: var(--df-sidebar-icon-label-gap);
    --sidebar-active-bg: rgba(var(--v-theme-primary), 0.2);

    display: flex;
    height: 100%;
    flex-direction: column;
    gap: 8px;
    padding: 16px 8px 8px;
    overflow: hidden;
    border-right: 1px solid rgb(var(--v-theme-grey-lighten-3));
    background: rgb(var(--v-theme-surface));
  }

  .chat-sidebar:not(.chat-sidebar--collapsed) {
    padding-right: calc(8px + var(--rail-padding-left));
  }

  .chat-sidebar__icon-btn {
    display: inline-flex;
    width: 20px;
    height: 20px;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: rgb(var(--v-theme-on-surface));
    cursor: pointer;
    transition: background 180ms ease;
  }

  .chat-sidebar__icon-btn:hover {
    background: rgb(var(--v-theme-surface-variant));
  }

  .chat-sidebar__icon {
    font-size: var(--df-sidebar-icon-size);
    line-height: 1;
    transition: opacity 180ms ease;
  }

  .chat-sidebar__icon--hidden {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .chat-sidebar__header {
    position: relative;
    width: 100%;
    height: 36px;
  }


  .chat-sidebar__toggle-anchor {
    position: absolute;
    top: 8px;
    left: var(--rail-padding-left);
    transition: left 420ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .chat-sidebar:not(.chat-sidebar--collapsed) .chat-sidebar__toggle-anchor {
    left: calc(100% - 30px);
  }

  .chat-sidebar__actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .chat-sidebar__content {
    display: flex;
    flex-direction: column;
    gap: var(--df-space-lg);
  }

  .chat-sidebar--collapsed :deep(.chat-sidebar__label) {
    opacity: 0;
    transition-duration: 60ms;
  }

  .chat-sidebar__recent {
    display: flex;
    flex-direction: column;
    gap: 2px;
    opacity: 1;
    transition: opacity 120ms ease;
    overflow: hidden;
  }

  .chat-sidebar--collapsed .chat-sidebar__recent {
    opacity: 0;
    pointer-events: none;
    transition-duration: 60ms;
  }

  .chat-sidebar__recent-title {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    padding: 4px;
    padding-left: var(--rail-padding-left);
    border: 0;
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    text-align: left;
  }

  .chat-sidebar__recent-title:hover {
    background: rgb(var(--v-theme-surface-variant));
  }

  .chat-sidebar__recent-title-text {
    font-size: 12px;
    font-family: 'Sansation', sans-serif;
    color: rgb(var(--v-theme-on-surface));
    opacity: 0.6;
    white-space: nowrap;
  }

</style>
