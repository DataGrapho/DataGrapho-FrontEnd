import type { ManageUsersRoleType } from '@/features/manage-users/types/manage-users.types'

export type ManageUsersRoleOption = {
  title: string
  value: ManageUsersRoleType
}

const ROLE_OPTIONS: Record<ManageUsersRoleType, ManageUsersRoleOption> = {
  comum: { title: 'Comum', value: 'comum' },
  administrador: { title: 'Administrador', value: 'administrador' },
  superusuario: { title: 'Super usuario', value: 'superusuario' },
}

export function roleToFlags(role: ManageUsersRoleType) {
  switch (role) {
    case 'superusuario':
      return { is_staff: true, is_superuser: true }
    case 'administrador':
      return { is_staff: true, is_superuser: false }
    case 'comum':
    default:
      return { is_staff: false, is_superuser: false }
  }
}

export function resolveRoleType(flags: { is_staff?: boolean; is_superuser?: boolean }): ManageUsersRoleType {
  if (flags.is_superuser) return 'superusuario'
  if (flags.is_staff) return 'administrador'
  return 'comum'
}

export function getManageUsersRoleOptions(canAssignAnyCompany: boolean, isEditing: boolean): ManageUsersRoleOption[] {
  if (!canAssignAnyCompany) {
    return [ROLE_OPTIONS.comum]
  }

  if (isEditing) {
    return [ROLE_OPTIONS.comum, ROLE_OPTIONS.administrador, ROLE_OPTIONS.superusuario]
  }

  return [ROLE_OPTIONS.comum, ROLE_OPTIONS.administrador]
}
