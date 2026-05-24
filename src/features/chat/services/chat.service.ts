import { API_BASE_URL } from '@/shared/config/api'
import type { ChatApiResponse, SendMessagePayload } from '@/features/chat/types/chat.types'

const CHAT_ENDPOINTS = {
  sendMessage: '/api/chatbot/chat/',
} as const

function getAuthToken(): string | null {
  const authData = localStorage.getItem('auth')
  if (!authData) return null
  
  try {
    const parsed = JSON.parse(authData)
    return parsed.access || null
  } catch {
    return null
  }
}

export async function sendMessage(payload: SendMessagePayload): Promise<ChatApiResponse> {
  const token = getAuthToken()
  
  if (!token) {
    throw new Error('Usuário não autenticado')
  }

  const response = await fetch(`${API_BASE_URL}${CHAT_ENDPOINTS.sendMessage}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Sessão expirada. Faça login novamente.')
    }
    if (response.status === 429) {
      throw new Error('Muitas requisições. Aguarde um momento.')
    }
    throw new Error(`Erro ao enviar mensagem: ${response.status}`)
  }

  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'Erro ao processar mensagem')
  }

  return data
}
