import { describe, expect, it } from 'vitest'

describe('contrato de schema de cadastro administrativo', () => {
  it('documenta pendencia do endpoint /api/auth/register/schema/', () => {
    const contract = {
      method: 'GET',
      path: '/api/auth/register/schema/',
      status: 'PENDENTE_BACKEND',
    }

    expect(contract.path).toContain('/register/schema/')
    expect(contract.status).toBe('PENDENTE_BACKEND')
  })
})
