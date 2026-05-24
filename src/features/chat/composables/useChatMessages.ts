import { ref } from 'vue'
import type { ChatMessage } from '@/features/chat/types/chat.types'
import { sendMessage } from '@/features/chat/services/chat.service'

export function useChatMessages () {
  const messages = ref<ChatMessage[]>([])
  const isResponding = ref(false)
  const sessionId = ref<string | undefined>(undefined)

  async function sendUserMessage (content: string) {
    const userMessage = createMessage('user', content, 'complete')
    const assistantMessage = createMessage('assistant', '', 'typing')

    messages.value.push(userMessage, assistantMessage)
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
        target.createdAt = new Date()
      }
    } finally {
      isResponding.value = false
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
      target.toolsUsed = toolsUsed
    }
  }

  function clearSession() {
    sessionId.value = undefined
    messages.value = []
  }

  return {
    isResponding,
    messages,
    sessionId,
    sendUserMessage,
    clearSession,
  }
}

function createMessage (
  role: ChatMessage['role'],
  content: string,
  status: ChatMessage['status'],
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    status,
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
