import type { ChatApiResponse, ChatSessionDetail, ChatSummary, SendMessagePayload } from '@/features/chat/types/chat.types'

const mockChats = new Map<string, ChatSummary>()
const mockMessages = new Map<string, ChatSessionDetail>()

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

export function listMockChatMessages(chatId: string): ChatSessionDetail {
  const now = new Date().toISOString()
  return (
    mockMessages.get(chatId) ?? {
      id: chatId,
      title: mockChats.get(chatId)?.title ?? 'Novo chat',
      createdAt: now,
      updatedAt: now,
      messages: [],
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
  const previousMessages = mockMessages.get(chatId)?.messages ?? []
  mockMessages.set(chatId, {
    id: chatId,
    title: chat.title,
    createdAt: chat.createdAt,
    updatedAt: now,
    messages: [
      ...previousMessages,
      { id: Date.now(), role: 'user', content: payload.message, createdAt: now },
      { id: Date.now() + 1, role: 'assistant', content: responseText, createdAt: now },
    ],
  })

  return { success: true, data }
}
