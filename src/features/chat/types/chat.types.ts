export type ChatInterfaceState = 'initial' | 'expanded' | 'interacting' | 'exploring'

export type ChatRole = 'user' | 'assistant'

export type ChatResponseStatus = 'complete' | 'typing' | 'error'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  status: ChatResponseStatus
  createdAt: Date
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
