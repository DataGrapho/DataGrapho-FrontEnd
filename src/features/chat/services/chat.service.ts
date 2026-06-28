import { API_BASE_URL } from '@/shared/config/api'
import { fetchWithBearerAuth } from '@/features/auth/services/auth-token-refresh.service'
import {
  buildMockChatResponse,
  createMockChat,
  deleteMockChat,
  listMockChatMessages,
  listMockChats,
  renameMockChat,
} from '@/features/chat/mocks/chat.mock'
import type { ChatApiResponse, ChatSummary, SendMessagePayload } from '@/features/chat/types/chat.types'

const CHAT_ENDPOINTS = {
  chats: '/chatbot/sessions/',
  chatMessages: (chatId: string) => `/chatbot/sessions/${chatId}/`,
  renameChat: (chatId: string) => `/chatbot/sessions/${chatId}/`,
  deleteChat: (chatId: string) => `/chatbot/sessions/${chatId}/`,
  sendMessage: '/chatbot/chat/',
} as const

async function fetchWithAuth(endpoint: string, init: RequestInit): Promise<Response> {
  return fetchWithBearerAuth(`${API_BASE_URL}${endpoint}`, init)
}

export async function sendMessage(payload: SendMessagePayload): Promise<ChatApiResponse> {
  try {
    const response = await fetchWithAuth(CHAT_ENDPOINTS.sendMessage, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return await parseJsonResponse<ChatApiResponse>(response)
  } catch (error) {
    if (!isChatNotFoundError(error)) throw error
    return buildMockChatResponse(payload)
  }
}

export async function listChats(search = ''): Promise<ChatSummary[]> {
  try {
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    const endpoint = `${CHAT_ENDPOINTS.chats}${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetchWithAuth(endpoint, { method: 'GET' })
    return await parseJsonResponse<ChatSummary[]>(response)
  } catch (error) {
    if (!isChatNotFoundError(error)) throw error
    return listMockChats(search)
  }
}

export async function createChat(title?: string): Promise<ChatSummary> {
  try {
    const response = await fetchWithAuth(CHAT_ENDPOINTS.chats, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    return await parseJsonResponse<ChatSummary>(response)
  } catch (error) {
    if (!isChatNotFoundError(error)) throw error
    return createMockChat(title)
  }
}

export async function renameChat(chatId: string, title: string): Promise<ChatSummary> {
  try {
    const response = await fetchWithAuth(CHAT_ENDPOINTS.renameChat(chatId), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    return await parseJsonResponse<ChatSummary>(response)
  } catch (error) {
    if (!isChatNotFoundError(error)) throw error
    return renameMockChat(chatId, title)
  }
}

export async function deleteChat(chatId: string): Promise<void> {
  try {
    const response = await fetchWithAuth(CHAT_ENDPOINTS.deleteChat(chatId), { method: 'DELETE' })
    if (!response.ok) throw await buildApiError(response)
  } catch (error) {
    if (!isChatNotFoundError(error)) throw error
    deleteMockChat(chatId)
  }
}

export async function listChatMessages(chatId: string): Promise<ChatApiResponse['data']> {
  try {
    const response = await fetchWithAuth(CHAT_ENDPOINTS.chatMessages(chatId), { method: 'GET' })
    return await parseJsonResponse<ChatApiResponse['data']>(response)
  } catch (error) {
    if (!isChatNotFoundError(error)) throw error
    return listMockChatMessages(chatId)
  }
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) throw await buildApiError(response)
  const data = await response.json()
  if (data?.success === false) throw new Error(data.error || 'Erro ao processar requisição')
  return (data?.data ?? data) as T
}

async function buildApiError(response: Response): Promise<Error> {
  const suffix = await safeResponseMessage(response)
  if (response.status === 400) return new Error(suffix || 'Dados inválidos para processar a solicitação.')
  if (response.status === 401) return new Error('Sessão expirada. Faça login novamente.')
  if (response.status === 403) return new Error('Você não tem permissão para executar esta ação.')
  if (response.status === 404) return new Error('Recurso de chat não encontrado.')
  if (response.status === 409) return new Error(suffix || 'Conflito de dados ao processar o chat.')
  if (response.status === 422) return new Error(suffix || 'Falha de validação no fluxo de chat.')
  if (response.status === 429) return new Error('Muitas requisições. Aguarde um momento.')
  return new Error(suffix || `Erro ao processar requisição: ${response.status}`)
}

async function safeResponseMessage(response: Response): Promise<string | null> {
  try {
    const body = await response.clone().json()
    return body?.error || body?.message || null
  } catch {
    return null
  }
}

function isChatNotFoundError(error: unknown): boolean {
  return error instanceof Error && error.message === 'Recurso de chat não encontrado.'
}
