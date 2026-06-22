import { createRouter, createWebHistory } from 'vue-router'
import AuthLayout from '@/core/layouts/AuthLayout.vue'
import DefaultLayout from '@/core/layouts/DefaultLayout.vue'
import {
  getAuthenticatedSession,
  isSessionAuthenticated,
} from '@/features/auth/services/auth-session.service'
import { ensureValidAccessToken } from '@/features/auth/services/auth-token-refresh.service'
import { hasAdministrativeAccess } from '@/features/admin-users/services/admin-user-permissions.service'

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
          path: 'datatable',
          name: 'app-datatable',
          meta: {
            hideTopbar: true,
            title: 'Datatable',
          },
          component: () => import('@/features/datatable/pages/DeparaDatatablePage.vue'),
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

export default router
