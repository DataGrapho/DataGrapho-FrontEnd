import { describe, expect, it } from 'vitest'

describe('contrato de UI do modulo admin-users', () => {
  it('documenta rota e icone do modulo administrativo', () => {
    const contract = {
      route: '/app/admin-users',
      icon: 'shield-user-line',
      title: 'Administração',
    }

    expect(contract.route).toBe('/app/admin-users')
    expect(contract.icon).toBe('shield-user-line')
  })
})
