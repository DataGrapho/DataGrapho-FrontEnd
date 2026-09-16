export type AdministrationEmpresa = {
  id_empresa: number
  nome: string
  cnpj: string
  endereco?: string | null
  ativo: boolean
  criado_em?: string
}

export type AdministrationFilial = {
  id_filial: number
  empresa: number
  nome: string
  endereco?: string | null
  ativo: boolean
  criado_em?: string
}

export type AdministrationSetor = {
  id_setor: number
  filial: number
  nome: string
  descricao?: string | null
  ativo: boolean
}

export type AdministrationPerfil = {
  id_perfil: number
  nome: string
  descricao?: string | null
  ativo: boolean
}

export type AdministrationListResponse<T> = {
  success: boolean
  count: number
  data: T[]
}

export type AdministrationItemResponse<T> = {
  success: boolean
  message?: string
  data: T
}

export type EmpresaFormDraft = {
  nome: string
  cnpj: string
  endereco: string
  ativo: boolean
}

export type FilialFormDraft = {
  empresa: number | null
  nome: string
  endereco: string
  ativo: boolean
}

export type SetorFormDraft = {
  filial: number | null
  nome: string
  descricao: string
  ativo: boolean
}

export type PerfilFormDraft = {
  nome: string
  descricao: string
  ativo: boolean
}
