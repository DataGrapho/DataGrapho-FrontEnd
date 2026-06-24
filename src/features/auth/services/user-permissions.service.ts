import type { AuthSession } from '@/features/auth/types/auth.types'

export function hasSuperuserAccess(session: Pick<AuthSession, 'usuario'> | null) {
  if (!session) return false
  return session.usuario?.is_superuser === true
}

export function hasUserManagementAccess(session: Pick<AuthSession, 'usuario'> | null) {
  if (!session) return false
  return session.usuario?.is_superuser === true || session.usuario?.is_staff === true
}
