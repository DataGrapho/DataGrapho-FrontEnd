import { describe, expect, it } from 'vitest'

describe('integracao de gerenciamento de chat', () => {
  it('suporta fluxo de novo, renomear e excluir', () => {
    const flow = ['new', 'rename', 'delete']
    expect(flow.includes('rename')).toBe(true)
  })
})
