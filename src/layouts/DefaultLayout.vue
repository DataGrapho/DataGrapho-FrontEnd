<template>
  <v-app>
    <div
      class="app-shell"
      :style="{ gridTemplateColumns: shellGridColumns }"
    >
      <!-- App Sidebar (always present by default) -->
      <aside v-if="showAppSidebar" class="app-sidebar-wrapper">
        <slot name="app-sidebar" :toggle-maximized="toggleSiteSidebar">
          <AppSidebar
            :maximized="siteSidebarMaximized"
            @toggle="toggleSiteSidebar"
          />
        </slot>
      </aside>

      <!-- Chat Sidebar (optional by default, enabled for /app route) -->
      <aside v-if="showChatSidebar" class="chat-sidebar-wrapper">
        <slot
          name="chat-sidebar"
          :collapsed="chatSidebarCollapsed"
          :toggle-collapsed="toggleChatSidebar"
        />
      </aside>

      <!-- Main Content -->
      <main class="app-main">
        <header class="app-main__topbar">
          <h1 class="text-label-large">
            DataGrapho AI
          </h1>
          <v-menu location="bottom end">
            <template #activator="{ props: menuProps }">
              <v-btn
                density="compact"
                icon="mdi-dots-horizontal"
                variant="text"
                v-bind="menuProps"
              />
            </template>
            <v-list class="app-main__actions-menu" density="compact" min-width="160">
              <v-list-item prepend-icon="mdi-pencil-outline" title="Renomear" />
              <v-list-item prepend-icon="mdi-delete-outline" title="Excluir" />
            </v-list>
          </v-menu>
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
  import AppSidebar from '@/shared/components/app-sidebar/AppSidebar.vue'
  import { useAppTheme } from '@/composables/useAppTheme'

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

  const shellGridColumns = computed(() => {
    const appSidebarWidth = props.showAppSidebar ? (siteSidebarMaximized.value ? 188 : 61) : 0
    const chatSidebarWidth = props.showChatSidebar ? (chatSidebarCollapsed.value ? 57 : 240) : 0

    return `${appSidebarWidth}px ${chatSidebarWidth}px minmax(0, 1fr)`
  })

  function toggleSiteSidebar () {
    siteSidebarMaximized.value = !siteSidebarMaximized.value
  }

  function toggleChatSidebar () {
    chatSidebarCollapsed.value = !chatSidebarCollapsed.value
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
  }

  .app-main__actions-menu :deep(.v-list-item-title) {
    font-family: var(--df-font-body);
    font-size: 0.875rem;
  }

  .app-main__actions-menu :deep(.v-list-item__prepend) {
    margin-inline-end: 8px;
  }

</style>
