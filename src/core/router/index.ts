import { createRouter, createWebHistory, type RouteLocationNormalizedLoaded } from 'vue-router'
import AuthLayout from '@/core/layouts/AuthLayout.vue'
import DefaultLayout from '@/core/layouts/DefaultLayout.vue'
import {
  getAuthenticatedSession,
  isSessionAuthenticated,
} from '@/features/auth/services/auth-session.service'
import { ensureValidAccessToken } from '@/features/auth/services/auth-token-refresh.service'
import { hasAdministrativeAccess } from '@/features/admin-users/services/admin-user-permissions.service'

const APP_NAME = 'DataGrapho'

function resolvePageTitle (route: RouteLocationNormalizedLoaded) {
  const matched = [...route.matched].reverse().find(record => typeof record.meta.title === 'string')
  return matched?.meta.title
}

function syncDocumentTitle (route: RouteLocationNormalizedLoaded) {
  const pageTitle = resolvePageTitle(route)
  document.title = pageTitle ? `${pageTitle} | ${APP_NAME}` : APP_NAME
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      component: AuthLayout,
      meta: {
        guestOnly: true,
      },
      children: [
        {
          path: '',
          name: 'login',
          meta: {
            title: 'Entrar',
          },
          component: () => import('@/features/auth/pages/LoginPage.vue'),
        },
      ],
    },
    {
      path: '/forgot-password',
      component: AuthLayout,
      meta: {
        guestOnly: true,
      },
      children: [
        {
          path: '',
          name: 'forgot-password',
          meta: {
            title: 'Esqueci a senha',
          },
          component: () => import('@/features/auth/pages/ForgotPasswordPage.vue'),
        },
      ],
    },
    {
      path: '/reset-password',
      component: AuthLayout,
      meta: {
        guestOnly: true,
      },
      children: [
        {
          path: '',
          name: 'reset-password',
          meta: {
            title: 'Redefinir senha',
          },
          component: () => import('@/features/auth/pages/ResetPasswordPage.vue'),
        },
      ],
    },
    {
      path: '/app',
      component: DefaultLayout,
      meta: {
        requiresAuth: true,
      },
      props: route => ({
        showChatSidebar: route.meta.showChatSidebar === true,
      }),
      children: [
        {
          path: '',
          name: 'app-chat',
          meta: {
            showChatSidebar: true,
            title: 'DataGrapho AI',
          },
          component: () => import('@/features/chat/pages/ChatPage.vue'),
        },
        {
          path: 'de-para',
          name: 'app-de-para',
          meta: {
            hideTopbar: true,
            title: 'De/Para',
          },
          component: () => import('@/features/datatable/pages/DeparaDatatablePage.vue'),
        },
        {
          path: 'datatable',
          redirect: { name: 'app-de-para' },
        },
        {
          path: 'admin-users',
          name: 'app-admin-users',
          meta: {
            requiresAdminPermission: true,
            hideTopbar: true,
            title: 'Administração',
          },
          component: () => import('@/features/admin-users/pages/AdminUsersPage.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const isAuthenticated = isSessionAuthenticated()
  const session = getAuthenticatedSession()

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      return {
        name: 'login',
        query: {
          redirect: to.fullPath,
        },
      }
    }

    const accessToken = await ensureValidAccessToken()
    if (!accessToken) {
      return {
        name: 'login',
        query: {
          redirect: to.fullPath,
        },
      }
    }
  }

  if (to.meta.guestOnly && isAuthenticated) {
    return {
      name: 'app-chat',
    }
  }

  if (to.meta.requiresAdminPermission && !hasAdministrativeAccess(session)) {
    return {
      name: 'app-chat',
    }
  }

  return true
})

router.afterEach((to) => {
  syncDocumentTitle(to)
})

export default router
