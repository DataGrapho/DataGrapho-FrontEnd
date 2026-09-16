export type ManageUsersCompany = {
  id_empresa: number
  nome: string
  cnpj?: string
}

export type ManageUsersBranch = {
  id_filial: number
  nome: string
  id_empresa?: number
}

export type ManageUsersDepartment = {
  id_setor: number
  nome: string
  id_filial?: number
}

export type ManageUsersProfile = {
  id_perfil: number
  nome: string
  ativo?: boolean
}

export type ManageUsersRoleType = 'comum' | 'administrador' | 'superusuario'

export type ManageUsersRegisterSchema = {
  perfis_atribuiveis: ManageUsersProfile[]
  empresas_atribuiveis: ManageUsersCompany[]
  filiais_atribuiveis?: ManageUsersBranch[]
  setores_atribuiveis?: ManageUsersDepartment[]
}

export type ManageUsersAccessCreatePayload = {
  id_empresa: number
  id_filial?: number | null
  id_setor?: number | null
  id_perfil: number
  ativo: boolean
}

export type ManageUsersCreatePayload = {
  email: string
  cpf: string
  nome: string
  password: string
  is_active: boolean
  is_staff?: boolean
  is_superuser?: boolean
  acessos?: ManageUsersAccessCreatePayload[]
}

export type ManageUsersUpdatePayload = {
  email?: string
  cpf?: string
  nome?: string
  password?: string
  is_active?: boolean
  is_staff?: boolean
  is_superuser?: boolean
  acessos?: ManageUsersAccessCreatePayload[]
}

export type ManageUsersFieldErrorMap = Partial<Record<'email' | 'cpf' | 'nome' | 'password' | 'acessos', string>>

export type ManageUsersCreateResponse = {
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

export type ManageUsersStatus = 'ativo' | 'inativo'

export type ManageUsersListItem = {
  id_usuario: number
  cpf: string
  email: string
  nome: string
  status: ManageUsersStatus
  acessos: string
  criado_em: string
  is_active: boolean
  is_staff?: boolean
  is_superuser?: boolean
  acessos_detalhes?: ManageUsersAccessCreatePayload[]
}

export type ManageUsersAccessDraft = {
  id: string
  id_empresa: number | null
  id_filial: number | null
  id_setor: number | null
  id_perfil: number | null
  ativo: boolean
}

export type ManageUsersFormDraft = {
  id_usuario?: number | null
  email: string
  cpf: string
  nome: string
  password: string
  roleType: ManageUsersRoleType
  is_active: boolean
  acessos: ManageUsersAccessDraft[]
}
