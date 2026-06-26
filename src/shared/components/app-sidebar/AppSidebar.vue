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
      <AppSidebarNavLink
        :active="route.name === 'app-chat'"
        icon="chat-ai-4-line"
        label="Chatbot IA"
        to="/app"
      />
      <AppSidebarNavLink
        :active="route.name === 'app-datatable'"
        icon="table-view"
        label="Datatable"
        to="/app/datatable"
      />
      <AppSidebarNavLink
        v-if="canAccessAdministration"
        :active="route.name === 'app-administration'"
        icon="building-line"
        label="Administracao"
        to="/app/administracao"
      />
      <AppSidebarNavLink
        v-if="canManageUsers"
        :active="route.name === 'app-manage-users'"
        icon="shield-user-line"
        label="Gerenciar usuarios"
        to="/app/gerenciar-usuarios"
      />
    </nav>

    <nav class="app-sidebar__bottom-nav" :style="{ gridTemplateColumns: bottomNavColumns }">
      <RouterLink
        class="app-sidebar__bottom-link"
        :class="{ 'app-sidebar__bottom-link--active': route.name === 'app-chat' }"
        to="/app"
      >
        <Icon name="chat-ai-4-line" />
        <span>Chatbot IA</span>
      </RouterLink>
      <RouterLink
        class="app-sidebar__bottom-link"
        :class="{ 'app-sidebar__bottom-link--active': route.name === 'app-datatable' }"
        to="/app/datatable"
      >
        <Icon name="table-view" />
        <span>Datatable</span>
      </RouterLink>
      <RouterLink
        v-if="canAccessAdministration"
        class="app-sidebar__bottom-link"
        :class="{ 'app-sidebar__bottom-link--active': route.name === 'app-administration' }"
        to="/app/administracao"
      >
        <Icon name="building-line" />
        <span>Administracao</span>
      </RouterLink>
      <RouterLink
        v-if="canManageUsers"
        class="app-sidebar__bottom-link"
        :class="{ 'app-sidebar__bottom-link--active': route.name === 'app-manage-users' }"
        to="/app/gerenciar-usuarios"
      >
        <Icon name="shield-user-line" />
        <span>Usuarios</span>
      </RouterLink>
    </nav>

    <div class="app-sidebar__footer">
      <AppSidebarActionButton
        :icon="isDarkTheme ? 'sun-line' : 'moon-line'"
        :label="isDarkTheme ? 'Escuro' : 'Claro'"
        :title="isDarkTheme ? 'Mudar para tema claro' : 'Mudar para tema escuro'"
        @click="toggleTheme"
      />
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
  import { computed, defineComponent, h } from 'vue'
  import { useRoute } from 'vue-router'
  import AppSidebarActionButton from './AppSidebarActionButton.vue'
  import AppSidebarNavLink from './AppSidebarNavLink.vue'
  import {
    hasSuperuserAccess,
    hasUserManagementAccess,
  } from '@/features/auth/services/user-permissions.service'
  import { getAuthenticatedSession } from '@/features/auth/services/auth-session.service'
  import { useAppTheme } from '@/shared/composables/useAppTheme'

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
  const route = useRoute()
  const session = getAuthenticatedSession()
  const canAccessAdministration = hasSuperuserAccess(session)
  const canManageUsers = hasUserManagementAccess(session)

  const bottomNavItemCount = computed(() => {
    let count = 2
    if (canAccessAdministration) count += 1
    if (canManageUsers) count += 1
    return count
  })

  const bottomNavColumns = computed(() => `repeat(${bottomNavItemCount.value}, 1fr)`)

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

  .app-sidebar__bottom-nav {
    display: none;
  }

  .app-sidebar--collapsed :deep(.app-sidebar-item__label),
  .app-sidebar--collapsed :deep(.app-sidebar-action__label) {
    width: 0;
    margin-left: 0;
    opacity: 0;
    pointer-events: none;
    overflow: hidden;
  }

  @media (max-width: 900px) {
    .app-sidebar {
      position: fixed;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 60;
      height: auto;
      padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
      border-top: 1px solid rgb(var(--v-theme-grey-lighten-3));
      border-right: 0;
    }

    .app-sidebar__head,
    .app-sidebar__nav,
    .app-sidebar__footer {
      display: none;
    }

    .app-sidebar__bottom-nav {
      display: grid;
      gap: 8px;
    }

    .app-sidebar__bottom-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px;
      border-radius: 8px;
      color: rgb(var(--v-theme-on-surface));
      text-decoration: none;
      font-family: var(--df-font-body);
      font-size: 0.875rem;
      line-height: 1.25rem;
      letter-spacing: 0;
      background: rgb(var(--v-theme-surface-variant));
    }

    .app-sidebar__bottom-link--active {
      background: rgba(var(--v-theme-primary), 0.16);
      color: rgb(var(--v-theme-primary));
    }
  }
</style>
