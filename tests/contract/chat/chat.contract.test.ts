import { describe, expect, it } from 'vitest'

describe('contratos de chat', () => {
  it('documenta formato do contrato GET /chats', () => {
    const contract = { method: 'GET', path: '/chats' }
    expect(contract.path).toBe('/chats')
  })

  it('documenta formato do contrato GET /chats/{chatId}/messages', () => {
    const contract = { method: 'GET', path: '/chats/{chatId}/messages' }
    expect(contract.path).toBe('/chats/{chatId}/messages')
  })
})
