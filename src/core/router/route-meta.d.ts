import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresSuperuser?: boolean
    requiresStaff?: boolean
    guestOnly?: boolean
    showChatSidebar?: boolean
    hideTopbar?: boolean
    title?: string
  }
}
