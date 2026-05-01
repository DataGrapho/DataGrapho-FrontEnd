<template>
  <aside
    class="app-sidebar"
    :class="{ 'app-sidebar--collapsed': !maximized }"
  >
    <div class="app-sidebar__head">
      <button
        class="app-sidebar__logo-button"
        type="button"
        :title="maximized ? 'Recolher sidebar' : 'Expandir sidebar'"
        @click="$emit('toggle')"
      >
        <span class="app-sidebar__rail-slot">
          <img
            alt=""
            class="app-sidebar__logo"
            src="@/assets/images/Icone datafit.webp"
          >
          <v-icon class="app-sidebar__toggle-icon-rail app-sidebar__icon" size="20">
            <Icon name="sidebar-unfold-line" />
          </v-icon>
        </span>
        <v-icon class="app-sidebar__toggle-icon-right app-sidebar__icon" size="20">
          <Icon name="sidebar-fold-line" />
        </v-icon>
      </button>
    </div>

    <nav class="app-sidebar__nav">
      <AppSidebarNavLink active icon="chat-ai-4-line" label="Chatbot IA" to="/app" />
      <AppSidebarNavLink icon="table-view" label="Arquivo" to="/app" />
    </nav>

    <div class="app-sidebar__footer">
      <AppSidebarActionButton
        :icon="isDarkTheme ? 'sun-line' : 'moon-line'"
        :label="isDarkTheme ? 'Escuro' : 'Claro'"
        :title="isDarkTheme ? 'Mudar para tema claro' : 'Mudar para tema escuro'"
        @click="toggleTheme"
      />
      <AppSidebarActionButton icon="question-line" label="Ajuda" title="Ajuda" />
      <AppSidebarActionButton label="Sair" title="Sair" @click="$emit('logout')">
        <template #icon>
          <v-icon class="app-sidebar__icon" size="20">
            <x-ri-logout-box-r-line />
          </v-icon>
        </template>
      </AppSidebarActionButton>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { defineComponent, h } from 'vue'
  import AppSidebarActionButton from './AppSidebarActionButton.vue'
  import AppSidebarNavLink from './AppSidebarNavLink.vue'
  import { useAppTheme } from '@/composables/useAppTheme'

  const XRiLogoutBoxRLine = defineComponent({
    name: 'XRiLogoutBoxRLine',
    setup () {
      return () => h('i', { class: 'ri-logout-box-r-line', 'aria-hidden': 'true' })
    },
  })

  defineProps<{
    maximized: boolean
  }>()

  defineEmits<{
    toggle: []
    logout: []
  }>()

  const { isDarkTheme, toggleTheme } = useAppTheme()

</script>

<style scoped>
  .app-sidebar {
    --rail-padding-left: 12.5px;
    --icon-label-gap: var(--df-sidebar-icon-label-gap);
    --sidebar-active-bg: rgba(var(--v-theme-primary), 0.2);

    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: space-between;
    padding: 16px 8px;
    overflow: hidden;
    border-right: 1px solid rgb(var(--v-theme-grey-lighten-3));
    background: rgb(var(--v-theme-surface));
  }

  .app-sidebar__head {
    width: 100%;
  }

  .app-sidebar__logo-button {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: 36px;
    padding: 0;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: rgb(var(--v-theme-on-surface));
    cursor: pointer;
    transition: background 180ms ease;
  }

  .app-sidebar__logo-button:hover {
    background: rgb(var(--v-theme-surface-variant));
  }

  .app-sidebar__rail-slot {
    position: relative;
    display: inline-flex;
    width: 20px;
    min-width: 20px;
    align-items: center;
    justify-content: center;
    margin-left: var(--rail-padding-left);
  }

  .app-sidebar__logo {
    width: 20px;
    height: 20px;
    object-fit: contain;
    opacity: 1;
    transition: opacity 180ms ease;
  }

  .app-sidebar__toggle-icon-rail {
    position: absolute;
    inset: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 180ms ease;
  }

  .app-sidebar__toggle-icon-right {
    position: absolute;
    top: 50%;
    right: 4px;
    opacity: 1;
    transform: translateY(-50%);
    transition: opacity 180ms ease;
  }

  .app-sidebar--collapsed .app-sidebar__toggle-icon-right {
    opacity: 0;
  }

  .app-sidebar--collapsed .app-sidebar__logo {
    opacity: 1;
  }

  .app-sidebar--collapsed .app-sidebar__logo-button:hover .app-sidebar__logo {
    opacity: 0;
  }

  .app-sidebar--collapsed .app-sidebar__logo-button:hover .app-sidebar__toggle-icon-rail {
    opacity: 1;
  }

  .app-sidebar__nav {
    display: flex;
    width: 100%;
    flex: 1;
    flex-direction: column;
    gap: 8px;
    margin-top: 24px;
  }

  .app-sidebar__footer {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .app-sidebar--collapsed :deep(.app-sidebar-item__label),
  .app-sidebar--collapsed :deep(.app-sidebar-action__label) {
    width: 0;
    margin-left: 0;
    opacity: 0;
    pointer-events: none;
    overflow: hidden;
  }
</style>
