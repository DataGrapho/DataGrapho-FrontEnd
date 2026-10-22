import { authorizedRequestJson } from '@/shared/services/authorized-request'
import type { DominioAcessoNivel, DominioAcessoResponse } from '@/features/administration/types/dominio-acesso.types'

const ENDPOINT = '/auth/dominio-acessos/'

export async function getDominioAcessos(nivel: DominioAcessoNivel, alvoId: number) {
  const response = await authorizedRequestJson<{ success: boolean, data: DominioAcessoResponse }>(
    `${ENDPOINT}?nivel=${nivel}&alvo=${alvoId}`,
  )
  return response.data
}

export async function concederDominio(dominio: string, nivel: DominioAcessoNivel, alvoId: number) {
  return authorizedRequestJson(ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({ dominio, nivel, alvo: alvoId }),
  })
}

export async function retirarDominio(concessaoId: number) {
  return authorizedRequestJson(`${ENDPOINT}${concessaoId}/`, { method: 'DELETE' })
}
