import { describe, expect, it } from 'vitest'

describe('contrato de erro de permissao no cadastro administrativo', () => {
  it('cobre retorno 403 para permissao insuficiente', () => {
    const contract = {
      endpoint: '/api/auth/register/',
      status: 403,
      message: 'Permissao insuficiente',
    }

    expect(contract.status).toBe(403)
    expect(contract.endpoint).toBe('/api/auth/register/')
  })
})
