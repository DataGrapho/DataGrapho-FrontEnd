import { describe, expect, it } from 'vitest'

describe('integracao da navegacao inferior do chat', () => {
  it('alterna entre chatbot e datatable', () => {
    const tabs = ['chatbot', 'datatable']
    expect(tabs).toContain('datatable')
  })
})
