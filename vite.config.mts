import { fileURLToPath, URL } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import Fonts from 'unplugin-fonts/vite'
import { defineConfig } from 'vite'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/shared/styles/settings.scss',
      },
    }),
    Fonts({
      fontsource: {
        families: [
          {
            name: 'Roboto',
            weights: [100, 300, 400, 500, 700, 900],
            styles: ['normal', 'italic'],
          },
        ],
      },
    }),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['pendengas.com.br'],
    hmr: {
      host: 'localhost',
      clientPort: 3000,
    },
    watch: {
      usePolling: true,
      interval: 100,
    },
    warmup: {
      clientFiles: [
        './src/features/auth/pages/LoginPage.vue',
        './src/features/auth/pages/ForgotPasswordPage.vue',
        './src/features/auth/pages/ResetPasswordPage.vue',
        './src/features/chat/pages/ChatPage.vue',
        './src/features/datatable/pages/DeparaDatatablePage.vue',
        './src/features/manage-users/pages/ManageUsersPage.vue',
        './src/features/administration/pages/AdministrationPage.vue',
        './src/features/settings/pages/SettingsPage.vue',
      ],
    },
  },
  optimizeDeps: {
    include: [
      'vuetify/components/VApp',
      'vuetify/components/VMain',
      'vuetify/components/VBtn',
      'vuetify/components/VIcon',
      'vuetify/components/VList',
      'vuetify/components/VMenu',
      'vuetify/components/VCard',
      'vuetify/components/VCardTitle',
      'vuetify/components/VCardText',
      'vuetify/components/VCardActions',
      'vuetify/components/VForm',
      'vuetify/components/VTextField',
      'vuetify/components/VTextarea',
      'vuetify/components/VSelect',
      'vuetify/components/VAutocomplete',
      'vuetify/components/VAlert',
      'vuetify/components/VDialog',
      'vuetify/components/VSwitch',
      'vuetify/components/VTable',
      'vuetify/components/VChip',
      'vuetify/components/VSheet',
      'vuetify/components/VNavigationDrawer',
      'vuetify/components/VAppBar',
      'vuetify/components/VToolbar',
      'vuetify/components/VTabs',
      'vuetify/components/VTab',
      'vuetify/components/VWindow',
      'vuetify/components/VWindowItem',
      'vuetify/components/VCheckbox',
      'vuetify/directives',
    ],
  },
})
