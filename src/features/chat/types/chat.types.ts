export type ChatInterfaceState = 'initial' | 'expanded' | 'interacting' | 'exploring'

export type ChatRole = 'user' | 'assistant'

export type ChatResponseStatus = 'complete' | 'typing'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  status: ChatResponseStatus
  createdAt: Date
}

export type ChatScrollDirection = 'up' | 'down' | 'idle'
