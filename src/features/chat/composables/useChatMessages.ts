import { ref } from 'vue'
import type { ChatMessage, ChatSessionState, ChatSummary, ChatViewport } from '@/features/chat/types/chat.types'
import { createChat, deleteChat, listChatMessages, listChats, renameChat, sendMessage } from '@/features/chat/services/chat.service'

export function useChatMessages () {
  return chatStore
}

const messages = ref<ChatMessage[]>([])
const chats = ref<ChatSummary[]>([])
const isResponding = ref(false)
const sessionId = ref<string | undefined>(undefined)
const searchTerm = ref('')
const activeChatId = ref<string | null>(null)
const viewport = ref<ChatViewport>('desktop')
const sessionState = ref<ChatSessionState>({
  activeChatId: null,
  visibleHistory: [],
  searchTerm: '',
  viewport: 'desktop',
})

async function sendUserMessage (content: string) {
  const userMessage = createMessage('user', content, 'complete', 'sent')
  const assistantMessage = createMessage('assistant', '', 'typing', 'processing')

  messages.value.push(userMessage, assistantMessage)
  syncSessionState()
  isResponding.value = true

  try {
    const response = await sendMessage({
      message: content,
      session_id: sessionId.value,
    })

    // Validação defensiva: garantir que response.data existe
    if (!response || !response.data) {
      throw new Error('Resposta inválida do servidor')
    }

    if (!response.data.session_id) {
      throw new Error('Session ID não retornado pelo servidor')
    }

    sessionId.value = response.data.session_id

    // Se é uma nova sessão, atualizar o activeChatId
    if (!activeChatId.value || activeChatId.value !== sessionId.value) {
      activeChatId.value = sessionId.value
      // Atualizar a lista de chats para incluir a nova sessão
      await refreshChats()
    }

    assistantMessage.createdAt = new Date()

    await streamAssistantResponse(
      assistantMessage.id,
      response.data.response,
      response.data.tools_used
    )
    
    // Atualizar a lista de chats após receber a resposta
    await refreshChats()
    
  } catch (error) {
    const target = messages.value.find((message) => message.id === assistantMessage.id)
    if (target) {
      target.content = error instanceof Error 
        ? `Desculpe, ocorreu um erro: ${error.message}` 
        : 'Desculpe, ocorreu um erro ao processar sua mensagem.'
      target.status = 'error'
      target.state = 'failed'
      target.createdAt = new Date()
    }
  } finally {
    isResponding.value = false
    syncSessionState()
  }

  return userMessage.id
}

async function streamAssistantResponse (
  messageId: string, 
  response: string,
  toolsUsed?: string[]
) {
  for (const char of response) {
    await wait(getTypingDelay(char))

    const target = messages.value.find((message) => message.id === messageId)

    if (!target) return

    target.content += char
  }

  const target = messages.value.find((message) => message.id === messageId)

  if (target) {
    target.status = 'complete'
    target.state = 'completed'
    target.toolsUsed = toolsUsed
  }
}

function clearSession() {
  sessionId.value = undefined
  messages.value = []
}

async function refreshChats () {
  try {
    chats.value = await listChats(searchTerm.value)
  } catch {
    chats.value = []
  }
}

async function startNewChat () {
  const chat = await createChat('Novo chat')
  clearSession()
  activeChatId.value = chat.id
  sessionId.value = chat.id
  await refreshChats()
  syncSessionState()
}

async function renameChatById(chatId: string, title: string) {
  await renameChat(chatId, title)
  await refreshChats()
}

async function renameActiveChat (title: string) {
  if (!activeChatId.value) return
  await renameChat(activeChatId.value, title)
  await refreshChats()
}

async function removeChat (chatId: string) {
  await deleteChat(chatId)
  if (activeChatId.value === chatId) {
    activeChatId.value = null
    clearSession()
  }
  await refreshChats()
  syncSessionState()
}

function setSearchTerm (term: string) {
  searchTerm.value = term
}

async function setActiveChat (chatId: string | null) {
  activeChatId.value = chatId
  messages.value = []

  if (!chatId) {
    sessionId.value = undefined
    syncSessionState()
    return
  }

  sessionId.value = chatId
  syncSessionState()

  try {
    const session = await listChatMessages(chatId)
    if (activeChatId.value !== chatId) return
    messages.value = session.messages.map(message => ({
      id: String(message.id),
      role: message.role,
      content: message.content,
      status: 'complete',
      state: 'completed',
      createdAt: new Date(message.createdAt),
      chatId,
    }))
  } catch {
    if (activeChatId.value === chatId) messages.value = []
  }
  syncSessionState()
}

function setViewport (value: ChatViewport) {
  viewport.value = value
}

function syncSessionState () {
  sessionState.value = {
    activeChatId: activeChatId.value,
    visibleHistory: [...messages.value],
    searchTerm: searchTerm.value,
    viewport: viewport.value,
  }
}

const chatStore = {
  activeChatId,
  chats,
  clearSession,
  isResponding,
  messages,
  refreshChats,
  removeChat,
  renameActiveChat,
  renameChatById,
  searchTerm,
  sessionState,
  sessionId,
  setActiveChat,
  setSearchTerm,
  setViewport,
  sendUserMessage,
  startNewChat,
  syncSessionState,
  viewport,
}

export function useChatMessagesStoreOnlyForTests() {
  return chatStore
}

function createMessage (
  role: ChatMessage['role'],
  content: string,
  status: ChatMessage['status'],
  state: NonNullable<ChatMessage['state']>,
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    status,
    state,
    createdAt: new Date(),
  }
}

function wait (duration: number) {
  return new Promise((resolve) => window.setTimeout(resolve, duration))
}

function getTypingDelay (char: string) {
  if (char === ' ') return 8
  if (',;:'.includes(char)) return 28
  if ('.!?'.includes(char)) return 44
  return 16
}
