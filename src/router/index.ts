/**
 * router/index.ts
 *
 * Application routes with layout support
 */

import { createRouter, createWebHistory } from 'vue-router'
import AuthLayout from '../layouts/AuthLayout.vue'
import DefaultLayout from '../layouts/DefaultLayout.vue'

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
        },
      ],
    },
    {
      path: '/app',
      component: DefaultLayout,
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
      ],
    },
  ],
})

export default router
