import { ref } from 'vue'
import type { ChatMessage, ChatSessionState, ChatSummary, ChatViewport } from '@/features/chat/types/chat.types'
import { createChat, deleteChat, listChats, renameChat, sendMessage } from '@/features/chat/services/chat.service'

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

    sessionId.value = response.data.session_id

    assistantMessage.createdAt = new Date()

    await streamAssistantResponse(
      assistantMessage.id,
      response.data.response,
      response.data.tools_used
    )
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
  activeChatId.value = chat.id
  await refreshChats()
  clearSession()
  syncSessionState()
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

function setActiveChat (chatId: string | null) {
  activeChatId.value = chatId
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
