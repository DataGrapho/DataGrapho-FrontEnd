import { describe, expect, it } from 'vitest'
import { useChatMessages } from '@/features/chat/composables/useChatMessages'

describe('estados do useChatMessages', () => {
  it('inicia com historico vazio e sem resposta em andamento', () => {
    const { messages, isResponding } = useChatMessages()
    expect(messages.value).toEqual([])
    expect(isResponding.value).toBe(false)
  })

  it('expoe estado de sessao com viewport e busca', () => {
    const { sessionState } = useChatMessages()
    expect(sessionState.value.viewport).toBe('desktop')
    expect(sessionState.value.searchTerm).toBe('')
  })
})
