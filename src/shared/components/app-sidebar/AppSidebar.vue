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
        :active="route.name === 'app-de-para'"
        icon="table-view"
        label="De/Para"
        to="/app/de-para"
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
      <div
        aria-hidden="true"
        class="app-sidebar__bottom-indicator"
        :style="bottomNavIndicatorStyle"
      />
      <RouterLink
        class="app-sidebar__bottom-link"
        :class="{ 'app-sidebar__bottom-link--active': route.name === 'app-settings' }"
        to="/app/configuracoes"
      >
        <Icon name="settings-3-line" />
        <span>Configuração</span>
      </RouterLink>
      <RouterLink
        class="app-sidebar__bottom-link"
        :class="{ 'app-sidebar__bottom-link--active': route.name === 'app-de-para' }"
        to="/app/de-para"
      >
        <Icon name="table-view" />
        <span>De/Para</span>
      </RouterLink>
      <RouterLink
        class="app-sidebar__bottom-link"
        :class="{ 'app-sidebar__bottom-link--active': route.name === 'app-chat' }"
        to="/app"
      >
        <Icon name="chat-ai-4-line" />
        <span>Chatbot IA</span>
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
      <RouterLink
        v-if="canAccessAdministration"
        class="app-sidebar__bottom-link"
        :class="{ 'app-sidebar__bottom-link--active': route.name === 'app-administration' }"
        to="/app/administracao"
      >
        <Icon name="building-line" />
        <span>Administracao</span>
      </RouterLink>
    </nav>

    <div class="app-sidebar__footer">
      <AppSidebarActionButton
        :icon="isDarkTheme ? 'sun-line' : 'moon-line'"
        :label="isDarkTheme ? 'Escuro' : 'Claro'"
        :title="isDarkTheme ? 'Mudar para tema claro' : 'Mudar para tema escuro'"
        @click="toggleTheme"
      />
      <AppSidebarNavLink
        :active="route.name === 'app-settings'"
        icon="settings-3-line"
        label="Configuração"
        to="/app/configuracoes"
      />
      <AppSidebarActionButton
        icon="logout-box-r-line"
        label="Sair"
        title="Sair da conta"
        @click="handleLogout"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import AppSidebarActionButton from './AppSidebarActionButton.vue'
  import AppSidebarNavLink from './AppSidebarNavLink.vue'
  import {
    hasSuperuserAccess,
    hasUserManagementAccess,
  } from '@/features/auth/services/user-permissions.service'
  import { getAuthenticatedSession, clearAuthenticatedSession } from '@/features/auth/services/auth-session.service'
  import { useAppTheme } from '@/shared/composables/useAppTheme'

  defineProps<{
    maximized: boolean
  }>()

  defineEmits<{
    toggle: []
  }>()

  const { isDarkTheme, toggleTheme } = useAppTheme()
  const route = useRoute()
  const router = useRouter()
  const session = getAuthenticatedSession()
  const canAccessAdministration = hasSuperuserAccess(session)
  const canManageUsers = hasUserManagementAccess(session)

  function handleLogout() {
    clearAuthenticatedSession()
    void router.push({ name: 'login' })
  }

  const bottomNavItemCount = computed(() => {
    let count = 3
    if (canAccessAdministration) count += 1
    if (canManageUsers) count += 1
    return count
  })

  const bottomNavColumns = computed(() => `repeat(${bottomNavItemCount.value}, 1fr)`)

  const activeBottomNavIndex = computed(() => {
    const items: string[] = ['app-settings', 'app-de-para', 'app-chat']
    if (canManageUsers) items.push('app-manage-users')
    if (canAccessAdministration) items.push('app-administration')

    const currentRoute = typeof route.name === 'string' ? route.name : ''
    const index = items.indexOf(currentRoute)
    return index >= 0 ? index : 0
  })

  const bottomNavIndicatorStyle = computed(() => {
    const count = bottomNavItemCount.value
    const slotWidth = 100 / count

    return {
      width: `${slotWidth}%`,
      transform: `translateX(${activeBottomNavIndex.value * 100}%)`,
    }
  })
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
      padding: 0 4px calc(2px + env(safe-area-inset-bottom));
      border-top: 0;
      border-right: 0;
      background: rgb(var(--v-theme-surface));
    }

    .app-sidebar__head,
    .app-sidebar__nav,
    .app-sidebar__footer {
      display: none;
    }

    .app-sidebar__bottom-nav {
      position: relative;
      display: grid;
      gap: 0;
      padding: 0;
      background: transparent;
    }

    .app-sidebar__bottom-nav::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      height: 1px;
      background: rgb(var(--v-theme-grey-lighten-3));
      pointer-events: none;
    }

    .app-sidebar__bottom-indicator {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      height: 2px;
      background: rgb(var(--v-theme-primary));
      transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
      pointer-events: none;
    }

    .app-sidebar__bottom-link {
      position: relative;
      display: flex;
      min-width: 0;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 8px 4px;
      border-radius: 0;
      color: rgba(var(--v-theme-on-surface), 0.55);
      text-decoration: none;
      font-family: var(--df-font-body);
      font-size: 0.6875rem;
      line-height: 0.875rem;
      letter-spacing: 0;
      background: transparent;
      transition: color 160ms ease;
    }

    .app-sidebar__bottom-link :deep(i),
    .app-sidebar__bottom-link :deep(svg) {
      font-size: 1.375rem;
      line-height: 1;
      transition: color 160ms ease;
    }

    .app-sidebar__bottom-link span {
      max-width: 100%;
      overflow: hidden;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 500;
    }

    .app-sidebar__bottom-link--active {
      color: rgb(var(--v-theme-primary));
      background: transparent;
    }

    .app-sidebar__bottom-link--active span {
      font-weight: 600;
    }
  }
</style>
