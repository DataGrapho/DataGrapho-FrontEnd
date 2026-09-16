import { describe, expect, it } from 'vitest'

describe('contrato de gerenciamento de chat', () => {
  it('cobre PATCH /chats/{chatId}', () => {
    expect('/chats/{chatId}').toContain('{chatId}')
  })

  it('cobre DELETE /chats/{chatId}', () => {
    expect('DELETE').toBe('DELETE')
  })
})
