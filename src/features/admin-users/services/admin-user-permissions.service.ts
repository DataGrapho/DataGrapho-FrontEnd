import type { AuthSession } from '@/features/auth/types/auth.types'

export function hasAdministrativeAccess(session: Pick<AuthSession, 'usuario'> | null) {
  if (!session) return false
  return session.usuario?.is_staff === true
}
