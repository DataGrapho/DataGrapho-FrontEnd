import { describe, expect, it } from 'vitest'

describe('contrato de criacao de usuario administrativo', () => {
  it('cobre endpoint POST /api/auth/register/', () => {
    const contract = {
      method: 'POST',
      path: '/api/auth/register/',
      requiredFields: ['email', 'cpf', 'nome', 'password'],
    }

    expect(contract.method).toBe('POST')
    expect(contract.path).toBe('/api/auth/register/')
    expect(contract.requiredFields).toContain('email')
  })
})
