export type LoginPayload = {
  email: string
  password: string
}

export type RequestPasswordResetPayload = {
  email: string
}

export type ResetPasswordPayload = {
  password: string
  confirmPassword: string
  token: string
}

export type LoginResponse = {
  access: string
  refresh: string
  usuario?: {
    id_usuario: number
    nome?: string
    email: string
    is_active?: boolean
  }
  acessos?: Array<{
    id: number
    ativo: boolean
  }>
}

export type AuthSession = {
  sessionId: string
  accountId: string
  accessToken: string
  refreshToken?: string
  expiresAt?: string
  createdAt: string
}

export type AuthAuditEventType =
  | 'login_sucesso'
  | 'login_falha'
  | 'recuperacao_solicitada'
  | 'senha_redefinida'

export type AuthAuditEvent = {
  type: AuthAuditEventType
  accountId?: string
  identifier?: string
  reason?: string
  timestamp: string
}
