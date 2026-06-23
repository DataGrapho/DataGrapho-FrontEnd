import { describe, expect, it } from 'vitest'
import { hasAdministrativeAccess } from '@/features/admin-users/services/admin-user-permissions.service'
import { buildAdminSession, buildNonAdminSession } from '../../../helpers/admin-users-test-utils'

describe('permissoes administrativas de usuario', () => {
  it('libera administracao para superusuario', () => {
    expect(hasAdministrativeAccess(buildAdminSession())).toBe(true)
  })

  it('nega administracao para usuario sem is_superuser', () => {
    expect(hasAdministrativeAccess(buildNonAdminSession())).toBe(false)
  })

  it('nega administracao quando nao ha sessao', () => {
    expect(hasAdministrativeAccess(null)).toBe(false)
  })
})
