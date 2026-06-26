import { describe, expect, it } from 'vitest'
import {
  getManageUsersRoleOptions,
  resolveRoleType,
  roleToFlags,
} from '@/features/manage-users/config/manage-users-role.config'

describe('manage-users-role.config', () => {
  it('mapeia tipo de usuario e flags', () => {
    expect(roleToFlags('comum')).toEqual({ is_staff: false, is_superuser: false })
    expect(roleToFlags('administrador')).toEqual({ is_staff: true, is_superuser: false })
    expect(roleToFlags('superusuario')).toEqual({ is_staff: true, is_superuser: true })

    expect(resolveRoleType({ is_staff: false, is_superuser: false })).toBe('comum')
    expect(resolveRoleType({ is_staff: true, is_superuser: false })).toBe('administrador')
    expect(resolveRoleType({ is_staff: true, is_superuser: true })).toBe('superusuario')
  })

  it('limita opcoes para administrador staff', () => {
    expect(getManageUsersRoleOptions(false, false)).toEqual([{ title: 'Comum', value: 'comum' }])
    expect(getManageUsersRoleOptions(false, true)).toEqual([{ title: 'Comum', value: 'comum' }])
  })

  it('expoe opcoes corretas para superusuario', () => {
    expect(getManageUsersRoleOptions(true, false).map((item) => item.value)).toEqual(['comum', 'administrador'])
    expect(getManageUsersRoleOptions(true, true).map((item) => item.value)).toEqual([
      'comum',
      'administrador',
      'superusuario',
    ])
  })
})
