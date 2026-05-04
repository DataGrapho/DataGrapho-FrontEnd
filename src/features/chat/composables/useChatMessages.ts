import { ref } from 'vue'
import type { ChatMessage } from '@/features/chat/types/chat.types'

export function useChatMessages () {
  const messages = ref<ChatMessage[]>([])
  const isResponding = ref(false)

  async function sendUserMessage (content: string) {
    const userMessage = createMessage('user', content, 'complete')
    const assistantMessage = createMessage('assistant', '', 'typing')

    messages.value.push(userMessage, assistantMessage)
    isResponding.value = true
    streamAssistantResponse(assistantMessage.id, buildAssistantResponse(content))
      .finally(() => {
        isResponding.value = false
      })

    return userMessage.id
  }

  async function streamAssistantResponse (messageId: string, response: string) {
    for (const char of response) {
      await wait(getTypingDelay(char))

      const target = messages.value.find((message) => message.id === messageId)

      if (!target) return

      target.content += char
    }

    const target = messages.value.find((message) => message.id === messageId)

    if (target) target.status = 'complete'
  }

  return {
    isResponding,
    messages,
    sendUserMessage,
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

function buildAssistantResponse (prompt: string) {
  if (prompt.toLowerCase().includes('oportunidade')) {
    return 'Com base nos dados disponiveis, as oportunidades em aberto se distribuem assim: pequenas empresas concentram maior volume, medias empresas equilibram volume e ticket medio, e grandes empresas carregam o maior valor potencial por negociacao. Quer que eu detalhe por segmento ou por responsavel comercial?'
  }

  return 'Posso cruzar indicadores, encontrar padroes e resumir os pontos mais relevantes para decisao. Para uma analise mais precisa, envie o recorte, periodo ou metrica principal que voce quer investigar.'
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
