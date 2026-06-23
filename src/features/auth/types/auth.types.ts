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

export type AuthUserProfile = {
  id_perfil: number
  nome: string
  ativo?: boolean
  nivel?: number | null
}

export type AuthUserCompany = {
  id_empresa: number
  nome: string
  cnpj?: string
}

export type AuthUserBranch = {
  id_filial: number
  nome: string
}

export type AuthUserDepartment = {
  id_setor: number
  nome: string
}

export type AuthUserAccess = {
  id: number
  ativo: boolean
  empresa?: AuthUserCompany | null
  filial?: AuthUserBranch | null
  setor?: AuthUserDepartment | null
  perfil?: AuthUserProfile | null
}

export type AuthUser = {
  id_usuario: number
  nome?: string
  email: string
  is_active?: boolean
  is_staff?: boolean
  is_superuser?: boolean
}

export type LoginResponse = {
  access: string
  refresh: string
  usuario?: AuthUser
  acessos?: AuthUserAccess[]
}

export type AuthSession = {
  sessionId: string
  accountId: string
  accessToken: string
  refreshToken?: string
  expiresAt?: string
  createdAt: string
  usuario?: AuthUser
  acessos: AuthUserAccess[]
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
