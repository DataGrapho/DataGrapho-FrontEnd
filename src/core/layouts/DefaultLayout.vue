<template>
  <v-app>
    <div class="app-shell" :class="{ 'app-shell--mobile': isMobileViewport }" :style="{ gridTemplateColumns: shellGridColumns }">
      <aside v-if="showAppSidebar" class="app-sidebar-wrapper">
        <slot name="app-sidebar" :toggle-maximized="toggleSiteSidebar">
          <AppSidebar
            :maximized="siteSidebarMaximized"
            @toggle="toggleSiteSidebar"
          />
        </slot>
      </aside>

      <aside v-if="shouldShowChatSidebar" class="chat-sidebar-wrapper">
        <slot name="chat-sidebar" :toggle-collapsed="toggleChatSidebar">
          <ChatSidebar
            :active-chat-id="activeChatId"
            :chats="sidebarChats"
            :collapsed="isMobileViewport ? false : chatSidebarCollapsed"
            :mobile-open="isMobileChatMenuOpen"
            :search-term="searchTerm"
            @close-mobile="isMobileChatMenuOpen = false"
            @delete-chat="handleDeleteChat"
            @new-chat="handleNewChat"
            @rename-chat="handleRenameChat"
            @search="handleSearchChat"
            @select-chat="handleSelectChat"
            @toggle="toggleChatSidebar"
          />
        </slot>
      </aside>

      <main class="app-main">
        <header
          v-if="showTopbar"
          class="app-main__topbar"
          :class="{
            'app-main__topbar--chat': route.name === 'app-chat',
            'app-main__topbar--chat-mobile': route.name === 'app-chat' && isMobileViewport,
          }"
        >
          <button
            v-if="route.name === 'app-chat' && isMobileViewport"
            class="app-main__chat-menu-trigger"
            type="button"
            aria-label="Abrir menu de chats"
            @click="isMobileChatMenuOpen = true"
          >
            <i class="ri-menu-line" />
          </button>
          <h1 class="text-label-large">
            {{ pageTitle }}
          </h1>
        </header>

        <section class="app-main__content">
          <router-view />
        </section>
      </main>
    </div>

  </v-app>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import AppSidebar from '@/shared/components/app-sidebar/AppSidebar.vue'
  import ChatSidebar from '@/features/chat/components/sidebar/ChatSidebar.vue'
  import { useAppTheme } from '@/shared/composables/useAppTheme'
  import { useChatMessages } from '@/features/chat/composables/useChatMessages'

  const props = withDefaults(
    defineProps<{
      showAppSidebar?: boolean
      showChatSidebar?: boolean
    }>(),
    {
      showAppSidebar: true,
      showChatSidebar: false,
    },
  )

  const siteSidebarMaximized = ref(true)
  const chatSidebarCollapsed = ref(true)
  const { initTheme } = useAppTheme()
  const isMobileChatMenuOpen = ref(false)
  const isMobileViewport = ref(window.innerWidth <= 900)
  const route = useRoute()
  const {
    activeChatId,
    chats,
    refreshChats,
    removeChat,
    renameChatById,
    searchTerm,
    setActiveChat,
    setSearchTerm,
    startNewChat,
  } = useChatMessages()
  const sidebarChats = computed(() => chats.value.map((chat) => ({ id: chat.id, title: chat.title })))
  const pageTitle = computed(() => typeof route.meta.title === 'string' ? route.meta.title : 'DataGrapho AI')
  const showTopbar = computed(() => route.meta.hideTopbar !== true)
  const shouldShowChatSidebar = computed(() => route.name === 'app-chat' && props.showChatSidebar)

  const shellGridColumns = computed(() => {
    if (isMobileViewport.value) {
      return 'minmax(0, 1fr)'
    }

    const columns = []

    if (props.showAppSidebar) {
      columns.push(`var(${siteSidebarMaximized.value ? '--df-app-sidebar-width' : '--df-app-sidebar-collapsed-width'})`)
    }

    if (shouldShowChatSidebar.value) {
      columns.push(`${chatSidebarCollapsed.value ? 57 : 240}px`)
    }

    columns.push('minmax(0, 1fr)')

    return columns.join(' ')
  })

  function toggleSiteSidebar () {
    siteSidebarMaximized.value = !siteSidebarMaximized.value
  }

  function toggleChatSidebar () {
    chatSidebarCollapsed.value = !chatSidebarCollapsed.value
  }

  function handleSearchChat(value: string) {
    setSearchTerm(value)
    void refreshChats()
  }

  function handleSelectChat(chatId: string) {
    setActiveChat(chatId)
    isMobileChatMenuOpen.value = false
  }

  function handleNewChat() {
    void startNewChat()
  }

  function handleRenameChat(chatId: string) {
    const currentTitle = chats.value.find((chat) => chat.id === chatId)?.title ?? ''
    const title = window.prompt('Renomear chat', currentTitle)
    if (!title?.trim()) return
    void renameChatById(chatId, title.trim())
  }

  function handleDeleteChat(chatId: string) {
    void removeChat(chatId)
  }

  function syncViewportState () {
    isMobileViewport.value = window.innerWidth <= 900
    if (!isMobileViewport.value) {
      isMobileChatMenuOpen.value = false
    }
  }

  onMounted(() => {
    syncViewportState()
    initTheme()
    window.addEventListener('resize', syncViewportState)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', syncViewportState)
  })
</script>

<style scoped>
  .app-shell {
    display: grid;
    width: 100vw;
    height: 100vh;
    background: rgb(var(--v-theme-surface-variant));
    color: rgb(var(--v-theme-on-surface));
    transition: 420ms cubic-bezier(0.22, 1, 0.36, 1);
    transition-property: grid-template-columns;
    overflow: hidden;
  }

  .app-shell--mobile {
    display: block;
    padding-bottom: 60px;
  }

  .app-shell--mobile .app-sidebar-wrapper,
  .app-shell--mobile .chat-sidebar-wrapper {
    position: fixed;
    inset: 0;
    height: auto;
    overflow: visible;
    pointer-events: none;
  }

  .app-shell--mobile .app-sidebar-wrapper {
    z-index: 60;
  }

  .app-shell--mobile .chat-sidebar-wrapper {
    z-index: 70;
  }

  .app-shell--mobile :deep(.app-sidebar),
  .app-shell--mobile :deep(.chat-sidebar) {
    pointer-events: auto;
  }

  .app-sidebar-wrapper,
  .chat-sidebar-wrapper {
    height: 100%;
    overflow: hidden;
  }

  .app-main {
    display: flex;
    min-width: 0;
    min-height: 0;
    flex-direction: column;
  }

  .app-main__topbar {
    display: flex;
    height: 60px;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    border-bottom: 0;
    background: transparent;
  }

  .app-main__chat-menu-trigger {
    display: none;
    width: 36px;
    height: 36px;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 8px;
    color: rgb(var(--v-theme-on-surface));
    background: transparent;
    font-size: 1.25rem;
  }

  .app-main__topbar h1 {
    margin: 0;
  }

  .app-main__topbar--chat {
    justify-content: center;
  }

  .app-main__topbar--chat h1 {
    width: 100%;
    text-align: center;
  }

  .app-main__content {
    display: flex;
    min-height: 0;
    flex: 1;
    overflow: hidden;
  }

  .app-main__content > * {
    min-width: 0;
    min-height: 0;
    flex: 1 1 auto;
  }

  @media (max-width: 900px) {
    .app-shell--mobile .app-main {
      height: calc(100dvh - 60px);
      max-height: calc(100dvh - 60px);
      overflow: hidden;
    }

    .app-main__topbar {
      position: sticky;
      top: 0;
      z-index: 20;
      padding: 0 12px;
      background: rgb(var(--v-theme-surface-variant));
    }

    .app-main__topbar--chat-mobile {
      position: relative;
      justify-content: flex-start;
    }

    .app-main__topbar--chat-mobile h1 {
      position: absolute;
      left: 50%;
      width: auto;
      max-width: calc(100% - 96px);
      transform: translateX(-50%);
      text-align: center;
      pointer-events: none;
    }

    .app-main__topbar--chat-mobile .app-main__chat-menu-trigger {
      position: relative;
      z-index: 1;
    }

    .app-main__chat-menu-trigger {
      display: inline-flex;
    }

    .app-main__topbar h1 {
      text-align: center;
    }

    .app-main__content {
      overflow: hidden;
    }
  }
</style>
