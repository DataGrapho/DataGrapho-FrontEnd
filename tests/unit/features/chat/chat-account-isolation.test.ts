import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearAuthenticatedSession,
  setAuthenticatedSessionFromLogin,
} from '@/features/auth/services/auth-session.service'
import { useChatMessages } from '@/features/chat/composables/useChatMessages'
import { listChats } from '@/features/chat/services/chat.service'

vi.mock('@/features/chat/services/chat.service', () => ({
  createChat: vi.fn(),
  deleteChat: vi.fn(),
  listChatMessages: vi.fn(),
  listChats: vi.fn().mockResolvedValue([]),
  renameChat: vi.fn(),
  sendMessage: vi.fn(),
}))

function login(idUsuario: number) {
  setAuthenticatedSessionFromLogin({
    access: 'access-token',
    refresh: 'refresh-token',
    usuario: { id_usuario: idUsuario, email: `user${idUsuario}@teste.com`, nome: `Usuario ${idUsuario}` },
    acessos: [],
  } as never)
}

describe('isolamento do chat entre contas', () => {
  beforeEach(() => {
    clearAuthenticatedSession()
    vi.mocked(listChats).mockReset().mockResolvedValue([])
  })

  it('nao exibe mensagens da conta anterior ao logar com outro usuario', () => {
    login(1)
    const chat = useChatMessages()
    chat.messages.value.push({
      id: 'm1',
      role: 'assistant',
      content: 'Resposta da conta 1',
      status: 'complete',
      state: 'completed',
      createdAt: new Date(),
    } as never)
    chat.sessionId.value = 'sessao-da-conta-1'
    chat.activeChatId.value = 'sessao-da-conta-1'

    clearAuthenticatedSession()
    login(2)

    const next = useChatMessages()
    expect(next.messages.value).toEqual([])
    expect(next.sessionId.value).toBeUndefined()
    expect(next.activeChatId.value).toBeNull()
    expect(next.sessionState.value.visibleHistory).toEqual([])
  })

  it('mantem o estado enquanto a mesma conta continua logada', () => {
    login(1)
    const chat = useChatMessages()
    chat.messages.value.push({ id: 'm1', role: 'user', content: 'oi', status: 'complete', state: 'completed', createdAt: new Date() } as never)

    const again = useChatMessages()
    expect(again.messages.value).toHaveLength(1)
  })
})
