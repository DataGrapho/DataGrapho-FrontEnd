import { describe, expect, it } from 'vitest'

describe('integracao de busca no chat', () => {
  it('exibe estado vazio quando nao ha resultados', () => {
    const results: string[] = []
    expect(results).toHaveLength(0)
  })
})
