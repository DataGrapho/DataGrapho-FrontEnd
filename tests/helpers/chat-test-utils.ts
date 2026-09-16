import type { ChatMessage } from '@/features/chat/types/chat.types'

export function buildMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: 'Mensagem de teste',
    status: 'complete',
    state: 'completed',
    createdAt: new Date(),
    ...overrides,
  }
}
