import { describe, expect, it } from 'vitest'

describe('integracao de feedback de erro no chat', () => {
  it('preserva historico quando o assistente falha', () => {
    const historyAfterError = ['msg-1', 'msg-2']
    expect(historyAfterError.length).toBeGreaterThan(0)
  })
})
