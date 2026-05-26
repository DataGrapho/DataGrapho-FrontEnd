export type ChatInterfaceState = 'initial' | 'expanded' | 'interacting' | 'exploring'

export type ChatRole = 'user' | 'assistant'

export type ChatResponseStatus = 'complete' | 'typing' | 'error'

export type ChatViewport = 'mobile' | 'tablet' | 'desktop'
export type ChatStatus = 'active' | 'archived'
export type MessageState = 'sent' | 'processing' | 'completed' | 'failed'

export interface ChatSummary {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  lastMessagePreview: string
  totalMessages: number
  status: ChatStatus
}

export interface ChatSessionState {
  activeChatId: string | null
  visibleHistory: ChatMessage[]
  searchTerm: string
  viewport: ChatViewport
}

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  status: ChatResponseStatus
  state?: MessageState
  createdAt: Date
  chatId?: string
  toolsUsed?: string[]
}

export type ChatScrollDirection = 'up' | 'down' | 'idle'

export interface SendMessagePayload {
  message: string
  session_id?: string
}

export interface ChatApiResponse {
  success: boolean
  data: {
    response: string
    session_id: string
    tools_used: string[]
    tool_calls_count: number
  }
  error?: string
}
