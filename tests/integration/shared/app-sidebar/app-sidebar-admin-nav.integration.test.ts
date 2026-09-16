import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import AppSidebar from '@/shared/components/app-sidebar/AppSidebar.vue'
import { buildAdminSession, buildStaffSession } from '../../../helpers/auth-session-test-utils'

const { getAuthenticatedSessionMock } = vi.hoisted(() => ({
  getAuthenticatedSessionMock: vi.fn(),
}))

vi.mock('@/features/auth/services/auth-session.service', () => ({
  getAuthenticatedSession: getAuthenticatedSessionMock,
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ name: 'app-chat' }),
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/shared/composables/useAppTheme', () => ({
  useAppTheme: () => ({
    isDarkTheme: { value: false },
    toggleTheme: vi.fn(),
  }),
}))

describe('integracao da sidebar administrativa', () => {
  it('renderiza administracao e gerenciar usuarios para superusuario', () => {
    getAuthenticatedSessionMock.mockReturnValue(buildAdminSession())

    const wrapper = mount(AppSidebar, {
      props: {
        maximized: true,
      },
      global: {
        stubs: {
          AppSidebarActionButton: { template: '<button><slot /></button>' },
          AppSidebarNavLink: {
            props: ['label', 'to'],
            template: '<a :href="to">{{ label }}</a>',
          },
          RouterLink: {
            props: ['to'],
            template: '<a :href="to"><slot /></a>',
          },
          Icon: {
            props: ['name'],
            template: '<i :data-icon="name"></i>',
          },
          'v-icon': { template: '<i><slot /></i>' },
        },
      },
    })

    expect(wrapper.text()).toContain('Administracao')
    expect(wrapper.text()).toContain('Gerenciar usuarios')
    expect(wrapper.text()).toContain('Configuração')
  })

  it('renderiza apenas gerenciar usuarios para staff', () => {
    getAuthenticatedSessionMock.mockReturnValue(buildStaffSession())

    const wrapper = mount(AppSidebar, {
      props: {
        maximized: true,
      },
      global: {
        stubs: {
          AppSidebarActionButton: { template: '<button><slot /></button>' },
          AppSidebarNavLink: {
            props: ['label', 'to'],
            template: '<a :href="to">{{ label }}</a>',
          },
          RouterLink: {
            props: ['to'],
            template: '<a :href="to"><slot /></a>',
          },
          Icon: {
            props: ['name'],
            template: '<i :data-icon="name"></i>',
          },
          'v-icon': { template: '<i><slot /></i>' },
        },
      },
    })

    expect(wrapper.text()).not.toContain('Administracao')
    expect(wrapper.text()).toContain('Gerenciar usuarios')
  })
})
