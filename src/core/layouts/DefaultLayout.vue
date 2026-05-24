<template>
  <v-app>
    <div
      class="app-shell"
      :style="{ gridTemplateColumns: shellGridColumns }"
    >
      <aside v-if="showAppSidebar" class="app-sidebar-wrapper">
        <slot name="app-sidebar" :toggle-maximized="toggleSiteSidebar">
          <AppSidebar
            :maximized="siteSidebarMaximized"
            @toggle="toggleSiteSidebar"
            @logout="handleLogout"
          />
        </slot>
      </aside>

      <aside v-if="shouldShowChatSidebar" class="chat-sidebar-wrapper">
        <slot name="chat-sidebar" :toggle-collapsed="toggleChatSidebar">
          <ChatSidebar
            :collapsed="chatSidebarCollapsed"
            @toggle="toggleChatSidebar"
          />
        </slot>
      </aside>

      <main class="app-main">
        <header v-if="showTopbar" class="app-main__topbar">
          <h1 class="text-label-large">
            {{ pageTitle }}
          </h1>
          <ActionMenu :items="topbarActions" />
        </header>

        <section class="app-main__content">
          <router-view />
        </section>
      </main>
    </div>

  </v-app>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import AppSidebar from '@/shared/components/app-sidebar/AppSidebar.vue'
  import ActionMenu, { type ActionMenuItem } from '@/shared/components/action-menu/ActionMenu.vue'
  import ChatSidebar from '@/features/chat/components/sidebar/ChatSidebar.vue'
  import { useAppTheme } from '@/shared/composables/useAppTheme'
  import { clearAuthenticatedSession } from '@/features/auth/services/auth-session.service'

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
  const topbarActions: ActionMenuItem[] = [
    { label: 'Renomear', value: 'rename', icon: 'mdi-pencil-outline' },
    { label: 'Excluir', value: 'delete', icon: 'mdi-delete-outline' },
  ]
  const route = useRoute()
  const router = useRouter()
  const pageTitle = computed(() => typeof route.meta.title === 'string' ? route.meta.title : 'DataGrapho AI')
  const showTopbar = computed(() => route.meta.hideTopbar !== true)
  const shouldShowChatSidebar = computed(() => route.name === 'app-chat' && props.showChatSidebar)

  const shellGridColumns = computed(() => {
    const columns = []

    if (props.showAppSidebar) {
      columns.push(`${siteSidebarMaximized.value ? 188 : 61}px`)
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

  function handleLogout() {
    clearAuthenticatedSession()
    router.push({ name: 'login' })
  }

  onMounted(() => {
    initTheme()
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

  .app-main__topbar h1 {
    margin: 0;
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
</style>
