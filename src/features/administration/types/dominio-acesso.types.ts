export type DominioAcessoNivel = 'empresa' | 'filial' | 'setor' | 'usuario'

export type DominioAcessoDireto = {
  id: number
  dominio: string
  nome: string
}

export type DominioAcessoHerdado = {
  dominio: string
  nome: string
  nivel: DominioAcessoNivel
  origem: string
}

export type DominioAcessoDisponivel = {
  chave: string
  nome: string
}

export type DominioAcessoResponse = {
  alvo: { nivel: DominioAcessoNivel, id: number, nome: string }
  diretos: DominioAcessoDireto[]
  herdados: DominioAcessoHerdado[]
  dominios_ativos: DominioAcessoDisponivel[]
}
