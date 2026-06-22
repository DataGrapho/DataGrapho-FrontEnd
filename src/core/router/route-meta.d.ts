import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresAdminPermission?: boolean
    guestOnly?: boolean
    showChatSidebar?: boolean
    hideTopbar?: boolean
    title?: string
  }
}
