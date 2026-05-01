/**
 * plugins/remixicon.ts
 * 
 * Registra o componente Icon globalmente para usar Remix Icons
 * Importa os estilos do remixicon
 */

import type { App } from 'vue'
import Icon from '@/shared/components/icon/Icon.vue'
import 'remixicon/fonts/remixicon.css'

export function setupRemixIcon(app: App) {
  app.component('Icon', Icon)
}
