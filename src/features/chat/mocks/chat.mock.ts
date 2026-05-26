import type { ChatApiResponse, ChatSummary, SendMessagePayload } from '@/features/chat/types/chat.types'

const mockChats = new Map<string, ChatSummary>()
const mockMessages = new Map<string, ChatApiResponse['data']>()

export function listMockChats(search: string): ChatSummary[] {
  const term = search.trim().toLowerCase()
  const allChats = [...mockChats.values()].sort((a, b) => Number(new Date(b.updatedAt)) - Number(new Date(a.updatedAt)))
  if (!term) return allChats
  return allChats.filter((chat) => chat.title.toLowerCase().includes(term))
}

export function createMockChat(title?: string): ChatSummary {
  const now = new Date().toISOString()
  const id = crypto.randomUUID()
  const chat: ChatSummary = {
    id,
    title: title?.trim() || 'Novo chat',
    createdAt: now,
    updatedAt: now,
    lastMessagePreview: '',
    totalMessages: 0,
    status: 'active',
  }
  mockChats.set(id, chat)
  return chat
}

export function renameMockChat(chatId: string, title: string): ChatSummary {
  const existing = mockChats.get(chatId)
  if (!existing) {
    return createMockChat(title)
  }

  const updated: ChatSummary = {
    ...existing,
    title: title.trim() || existing.title,
    updatedAt: new Date().toISOString(),
  }
  mockChats.set(chatId, updated)
  return updated
}

export function deleteMockChat(chatId: string) {
  mockChats.delete(chatId)
  mockMessages.delete(chatId)
}

export function listMockChatMessages(chatId: string): ChatApiResponse['data'] {
  return (
    mockMessages.get(chatId) ?? {
      response: '',
      session_id: chatId,
      tools_used: [],
      tool_calls_count: 0,
    }
  )
}

export function buildMockChatResponse(payload: SendMessagePayload): ChatApiResponse {
  const now = new Date().toISOString()
  const sessionId = payload.session_id || crypto.randomUUID()
  const responseText = 'Mock ativo: backend de chat ainda não implementado.'

  const chatId = sessionId
  const existingChat = mockChats.get(chatId)
  const chat: ChatSummary = existingChat
    ? {
      ...existingChat,
      updatedAt: now,
      totalMessages: existingChat.totalMessages + 2,
      lastMessagePreview: responseText,
    }
    : {
      id: chatId,
      title: 'Novo chat',
      createdAt: now,
      updatedAt: now,
      lastMessagePreview: responseText,
      totalMessages: 2,
      status: 'active',
    }

  mockChats.set(chatId, chat)

  const data: ChatApiResponse['data'] = {
    response: responseText,
    session_id: sessionId,
    tools_used: ['mock-chat-service'],
    tool_calls_count: 0,
  }
  mockMessages.set(chatId, data)

  return { success: true, data }
}
