export type AdminSchemaFieldType = 'text' | 'email' | 'password' | 'boolean' | 'select'

export type AdminUsersCompany = {
  id_empresa: number
  nome: string
  cnpj?: string
}

export type AdminUsersBranch = {
  id_filial: number
  nome: string
  id_empresa?: number
}

export type AdminUsersDepartment = {
  id_setor: number
  nome: string
  id_filial?: number
}

export type AdminUsersProfile = {
  id_perfil: number
  nome: string
  ativo?: boolean
}

export type AdminUsersSchemaField = {
  nome: string
  rotulo: string
  tipo: AdminSchemaFieldType
  obrigatorio: boolean
  max_length?: number | null
  min_length?: number | null
  mensagem_validacao?: string | null
}

export type AdminUsersRegisterSchema = {
  campos: AdminUsersSchemaField[]
  perfis_atribuiveis: AdminUsersProfile[]
  empresas_atribuiveis: AdminUsersCompany[]
  filiais_atribuiveis?: AdminUsersBranch[]
  setores_atribuiveis?: AdminUsersDepartment[]
}

export type AdminUsersAccessCreatePayload = {
  id_empresa: number
  id_filial?: number | null
  id_setor?: number | null
  id_perfil: number
  ativo: boolean
}

export type AdminUsersCreatePayload = {
  email: string
  cpf: string
  nome: string
  password: string
  is_active: boolean
  is_staff?: boolean
  acessos?: AdminUsersAccessCreatePayload[]
}

export type AdminUsersFieldErrorMap = Partial<Record<'email' | 'cpf' | 'nome' | 'password' | 'acessos' | 'form', string>>

export type AdminUsersCreateResponse = {
  usuario: {
    id_usuario: number
    email: string
    nome: string
    is_active: boolean
  }
  acessos: Array<{
    id: number
    ativo: boolean
  }>
}

export type AdminUsersStatus = 'ativo' | 'inativo'

export type AdminUsersListItem = {
  id_usuario: number
  cpf: string
  email: string
  nome: string
  status: AdminUsersStatus
  acessos: string
  criado_por: string
  criado_em: string
  atualizado_em: string
  password_hint?: string
  is_active: boolean
  acessos_detalhes?: AdminUsersAccessCreatePayload[]
}

export type AdminUsersListResponse = {
  count?: number
  results?: Array<{
    id_usuario: number
    cpf?: string
    email: string
    nome: string
    is_active?: boolean
    created_by?: string
    created_at?: string
    updated_at?: string
    acessos?: Array<{
      id_empresa?: number
      id_filial?: number | null
      id_setor?: number | null
      id_perfil?: number
      perfil?: {
        nome?: string
      } | null
    }>
  }>
}

export type AdminUsersAccessDraft = {
  id: string
  id_empresa: number | null
  id_filial: number | null
  id_setor: number | null
  id_perfil: number | null
  ativo: boolean
}

export type AdminUsersFormDraft = {
  email: string
  cpf: string
  nome: string
  password: string
  is_staff: boolean
  acessos: AdminUsersAccessDraft[]
}
