import type { AuthAuditEvent, AuthAuditEventType } from '@/features/auth/types/auth.types'

const auditEvents: AuthAuditEvent[] = []

export function registerAuthAuditEvent(type: AuthAuditEventType, context: Omit<AuthAuditEvent, 'type' | 'timestamp'> = {}) {
  const event: AuthAuditEvent = {
    ...context,
    type,
    timestamp: new Date().toISOString(),
  }

  auditEvents.push(event)

  if (auditEvents.length > 200) {
    auditEvents.shift()
  }

  console.info('[auth-audit]', event)
}

export function getAuthAuditEvents() {
  return [...auditEvents]
}

export function clearAuthAuditEvents() {
  auditEvents.splice(0, auditEvents.length)
}
