import router from '../router'
import { setupRemixIcon } from './remixicon'
import type { App } from 'vue'

import vuetify from './vuetify'

export function registerPlugins (app: App) {
  app.use(vuetify)
  app.use(router)
  setupRemixIcon(app)
}