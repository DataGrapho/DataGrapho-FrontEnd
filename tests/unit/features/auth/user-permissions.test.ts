import { describe, expect, it } from 'vitest'
import {
  hasSuperuserAccess,
  hasUserManagementAccess,
} from '@/features/auth/services/user-permissions.service'
import { buildAdminSession, buildNonAdminSession, buildStaffSession } from '../../../helpers/auth-session-test-utils'

describe('permissoes administrativas de usuario', () => {
  it('libera administracao para superusuario', () => {
    expect(hasSuperuserAccess(buildAdminSession())).toBe(true)
  })

  it('nega administracao para usuario sem is_superuser', () => {
    expect(hasSuperuserAccess(buildNonAdminSession())).toBe(false)
  })

  it('libera gerenciamento de usuarios para staff', () => {
    expect(hasUserManagementAccess(buildStaffSession())).toBe(true)
  })

  it('libera gerenciamento de usuarios para superusuario', () => {
    expect(hasUserManagementAccess(buildAdminSession())).toBe(true)
  })

  it('nega gerenciamento de usuarios para usuario comum', () => {
    expect(hasUserManagementAccess(buildNonAdminSession())).toBe(false)
  })

  it('nega administracao quando nao ha sessao', () => {
    expect(hasSuperuserAccess(null)).toBe(false)
    expect(hasUserManagementAccess(null)).toBe(false)
  })
})
