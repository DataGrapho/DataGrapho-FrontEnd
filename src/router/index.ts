/**
 * router/index.ts
 *
 * Application routes with layout support
 */

import { createRouter, createWebHistory } from 'vue-router'
import AuthLayout from '../layouts/AuthLayout.vue'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import { isAuthenticated } from '@/features/auth/services/auth.service'

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
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('@/features/auth/pages/LoginPage.vue'),
          meta: { requiresGuest: true },
        },
      ],
    },
    {
      path: '/forgot-password',
      component: AuthLayout,
      children: [
        {
          path: '',
          name: 'forgot-password',
          component: () => import('@/features/auth/pages/ForgotPasswordPage.vue'),
          meta: { requiresGuest: true },
        },
      ],
    },
    {
      path: '/reset-password',
      component: AuthLayout,
      children: [
        {
          path: '',
          name: 'reset-password',
          component: () => import('@/features/auth/pages/ResetPasswordPage.vue'),
          meta: { requiresGuest: true },
        },
      ],
    },
    {
      path: '/app',
      component: DefaultLayout,
      meta: { requiresAuth: true },
      props: route => ({
        showChatSidebar: route.meta.showChatSidebar === true,
      }),
      children: [
        {
          path: '',
          name: 'app-chat',
          meta: {
            requiresAuth: true,
            showChatSidebar: true,
            title: 'DataGrapho AI',
          },
          component: () => import('@/features/chat/pages/ChatPage.vue'),
        },
        {
          path: 'datatable',
          name: 'app-datatable',
          meta: {
            requiresAuth: true,
            hideTopbar: true,
            title: 'Datatable',
          },
          component: () => import('@/features/datatable/pages/DeparaDatatablePage.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authenticated = isAuthenticated()
  
  if (to.meta.requiresGuest && authenticated) {
    next({ name: 'app-chat' })
    return
  }
  
  if (to.meta.requiresAuth && !authenticated) {
    next({ name: 'login' })
    return
  }
  
  next()
})

export default router
