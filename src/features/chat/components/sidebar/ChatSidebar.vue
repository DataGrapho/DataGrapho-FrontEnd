<template>
  <aside
    class="chat-sidebar"
    :class="{
      'chat-sidebar--collapsed': effectiveCollapsed,
      'chat-sidebar--mobile-open': mobileOpen,
    }"
  >
    <div class="chat-sidebar__header">
      <div v-if="!isMobileViewport" class="chat-sidebar__toggle-anchor">
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

      <button v-if="isMobileViewport" class="chat-sidebar__close-mobile" type="button" @click="$emit('close-mobile')">
        <v-icon icon="mdi-close" size="18" />
      </button>
    </div>

    <div class="chat-sidebar__content">
      <div class="chat-sidebar__actions">
        <Transition name="chat-sidebar-actions" mode="out-in">
          <div v-if="isSearchOpen" key="search" class="chat-sidebar__search-row">
            <button class="chat-sidebar__search-back" type="button" @click="closeSearch">
              <v-icon icon="mdi-arrow-left" size="18" />
            </button>
            <input
              :value="localSearch"
              class="chat-sidebar__search text-body-small"
              placeholder="Procurar"
              type="text"
              @input="handleSearchInput"
            >
          </div>

          <div v-else key="default" class="chat-sidebar__default-actions">
            <ChatSidebarActionButton icon-class="ri-search-line" label="Procurar" @click="openSearch" />
            <ChatSidebarActionButton icon-class="ri-edit-box-line" label="Novo Chat" @click="$emit('new-chat')" />
          </div>
        </Transition>
      </div>

      <section class="chat-sidebar__recent">
        <button class="chat-sidebar__recent-title" type="button">
          <span class="chat-sidebar__recent-title-text">Chats recentes</span>
          <v-icon icon="mdi-chevron-down" size="14" />
        </button>

        <ChatSidebarRecentItem
          v-for="chat in chats"
          :key="chat.id"
          :active="chat.id === activeChatId"
          :label="chat.title"
          @select="$emit('select-chat', chat.id)"
          @rename="$emit('rename-chat', chat.id)"
          @delete="$emit('delete-chat', chat.id)"
        />
      </section>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import ChatSidebarActionButton from '@/features/chat/components/sidebar/ChatSidebarActionButton.vue'
  import ChatSidebarRecentItem from '@/features/chat/components/sidebar/ChatSidebarRecentItem.vue'

  const props = withDefaults(defineProps<{
    collapsed: boolean
    activeChatId?: string | null
    chats?: { id: string; title: string }[]
    searchTerm?: string
    mobileOpen?: boolean
  }>(), {
    activeChatId: null,
    chats: () => [],
    searchTerm: '',
    mobileOpen: false,
  })

  const emit = defineEmits<{
    toggle: []
    search: [value: string]
    'new-chat': []
    'select-chat': [chatId: string]
    'rename-chat': [chatId: string]
    'delete-chat': [chatId: string]
    'close-mobile': []
  }>()

  const isMobileViewport = ref(window.innerWidth <= 900)
  const isSearchOpen = ref(false)
  const shouldOpenSearchAfterExpand = ref(false)
  const localSearch = ref(props.searchTerm)
  const effectiveCollapsed = computed(() => !isMobileViewport.value && props.collapsed)

  function openSearch () {
    if (effectiveCollapsed.value) {
      shouldOpenSearchAfterExpand.value = true
      emit('toggle')
      void nextTick(() => {
        if (!effectiveCollapsed.value && shouldOpenSearchAfterExpand.value) {
          shouldOpenSearchAfterExpand.value = false
          openSearch()
        }
      })
      return
    }

    isSearchOpen.value = true
    localSearch.value = props.searchTerm
  }

  function closeSearch () {
    isSearchOpen.value = false
    localSearch.value = ''
    emit('search', '')
  }

  function handleSearchInput (event: Event) {
    const nextValue = (event.target as HTMLInputElement).value
    localSearch.value = nextValue
    emit('search', nextValue)
  }

  function syncViewportState () {
    isMobileViewport.value = window.innerWidth <= 900
    if (!isMobileViewport.value) {
      isSearchOpen.value = false
    }
  }

  onMounted(() => {
    window.addEventListener('resize', syncViewportState)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', syncViewportState)
  })

  watch(
    () => props.searchTerm,
    (nextValue) => {
      if (!isSearchOpen.value) {
        localSearch.value = nextValue
      }
    },
  )

  watch(
    () => props.mobileOpen,
    (open) => {
      if (!open) {
        isSearchOpen.value = false
        localSearch.value = ''
      }
    },
  )

  watch(
    () => effectiveCollapsed.value,
    (collapsed) => {
      if (collapsed) {
        isSearchOpen.value = false
        shouldOpenSearchAfterExpand.value = false
        return
      }

      if (shouldOpenSearchAfterExpand.value) {
        shouldOpenSearchAfterExpand.value = false
        openSearch()
      }
    },
  )
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

  .chat-sidebar__content {
    display: flex;
    flex-direction: column;
    gap: var(--df-space-lg);
  }

  .chat-sidebar__actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .chat-sidebar__default-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .chat-sidebar-actions-enter-active,
  .chat-sidebar-actions-leave-active {
    transition: opacity 180ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .chat-sidebar-actions-enter-from,
  .chat-sidebar-actions-leave-to {
    opacity: 0;
    transform: translateY(-6px);
  }

  .chat-sidebar--collapsed :deep(.chat-sidebar__label) {
    opacity: 0;
    transition-duration: 60ms;
  }

  .chat-sidebar__search-row {
    position: relative;
    display: block;
    width: 100%;
    box-sizing: border-box;
  }

  .chat-sidebar:not(.chat-sidebar--collapsed) .chat-sidebar__search-row {
    padding-left: calc(var(--rail-padding-left) - 2px);
  }

  .chat-sidebar__search {
    width: 100%;
    box-sizing: border-box;
    padding: 8px 10px 8px 31px;
    border: 1px solid rgb(var(--v-theme-grey-lighten-3));
    border-radius: 6px;
    color: rgb(var(--v-theme-on-surface));
    background: rgb(var(--v-theme-surface));
    font-family: var(--df-font-body);
    line-height: 1.25rem;
    outline: 0;
  }

  .chat-sidebar__search::placeholder {
    color: rgb(var(--v-theme-on-surface-variant));
    opacity: 0.72;
  }

  .chat-sidebar__search-back {
    position: absolute;
    top: 50%;
    left: 9px;
    transform: translateY(-50%);
    display: inline-flex;
    width: 28px;
    height: 28px;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: rgb(var(--v-theme-on-surface));
    cursor: pointer;
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
    font-family: var(--df-font-body);
    font-size: 0.75rem;
    line-height: 1rem;
    color: rgb(var(--v-theme-on-surface));
    opacity: 0.6;
    white-space: nowrap;
    letter-spacing: 0;
  }

  .chat-sidebar__close-mobile {
    display: none;
  }

  @media (max-width: 900px) {
    .chat-sidebar {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 70;
      width: 100vw;
      height: 100dvh;
      padding-top: 12px;
      transform: translateX(-105%);
      transition: transform 220ms ease;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    .chat-sidebar--mobile-open {
      transform: translateX(0);
    }

    .chat-sidebar__close-mobile {
      display: inline-flex;
      position: absolute;
      top: 8px;
      right: 8px;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      padding: 0;
      border: 0;
      border-radius: 6px;
      background: rgb(var(--v-theme-surface-variant));
      color: rgb(var(--v-theme-on-surface));
    }

    .chat-sidebar--collapsed :deep(.chat-sidebar__label) {
      opacity: 1;
    }

    .chat-sidebar--collapsed .chat-sidebar__recent {
      opacity: 1;
      pointer-events: auto;
    }
  }
</style>
