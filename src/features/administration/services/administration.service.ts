import { authorizedRequestJson } from '@/shared/services/authorized-request'
import { mapApiErrorMessage } from '@/shared/services/api-error.mapper'
import type {
  AdministrationEmpresa,
  AdministrationFilial,
  AdministrationItemResponse,
  AdministrationListResponse,
  AdministrationPerfil,
  AdministrationSetor,
  EmpresaFormDraft,
  FilialFormDraft,
  PerfilFormDraft,
  SetorFormDraft,
} from '@/features/administration/types/administration.types'

const ENDPOINTS = {
  empresas: '/auth/empresas/',
  filiais: '/auth/filiais/',
  setores: '/auth/setores/',
  perfis: '/auth/perfis/',
} as const

export async function listEmpresas() {
  const response = await authorizedRequestJson<AdministrationListResponse<AdministrationEmpresa>>(ENDPOINTS.empresas)
  return response.data ?? []
}

export async function createEmpresa(payload: EmpresaFormDraft) {
  const response = await authorizedRequestJson<AdministrationItemResponse<AdministrationEmpresa>>(ENDPOINTS.empresas, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function updateEmpresa(idEmpresa: number, payload: Partial<EmpresaFormDraft>) {
  const response = await authorizedRequestJson<AdministrationItemResponse<AdministrationEmpresa>>(
    `${ENDPOINTS.empresas}${idEmpresa}/`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  )
  return response.data
}

export async function deleteEmpresa(idEmpresa: number) {
  await authorizedRequestJson(`${ENDPOINTS.empresas}${idEmpresa}/`, {
    method: 'DELETE',
  })
}

export async function listFiliais() {
  const response = await authorizedRequestJson<AdministrationListResponse<AdministrationFilial>>(ENDPOINTS.filiais)
  return response.data ?? []
}

export async function createFilial(payload: FilialFormDraft & { empresa: number }) {
  const response = await authorizedRequestJson<AdministrationItemResponse<AdministrationFilial>>(ENDPOINTS.filiais, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function updateFilial(idFilial: number, payload: Partial<FilialFormDraft & { empresa: number }>) {
  const response = await authorizedRequestJson<AdministrationItemResponse<AdministrationFilial>>(
    `${ENDPOINTS.filiais}${idFilial}/`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  )
  return response.data
}

export async function deleteFilial(idFilial: number) {
  await authorizedRequestJson(`${ENDPOINTS.filiais}${idFilial}/`, {
    method: 'DELETE',
  })
}

export async function listSetores() {
  const response = await authorizedRequestJson<AdministrationListResponse<AdministrationSetor>>(ENDPOINTS.setores)
  return response.data ?? []
}

export async function createSetor(payload: SetorFormDraft & { filial: number }) {
  const response = await authorizedRequestJson<AdministrationItemResponse<AdministrationSetor>>(ENDPOINTS.setores, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function updateSetor(idSetor: number, payload: Partial<SetorFormDraft & { filial: number }>) {
  const response = await authorizedRequestJson<AdministrationItemResponse<AdministrationSetor>>(
    `${ENDPOINTS.setores}${idSetor}/`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  )
  return response.data
}

export async function deleteSetor(idSetor: number) {
  await authorizedRequestJson(`${ENDPOINTS.setores}${idSetor}/`, {
    method: 'DELETE',
  })
}

export async function listPerfis() {
  const response = await authorizedRequestJson<AdministrationListResponse<AdministrationPerfil>>(ENDPOINTS.perfis)
  return response.data ?? []
}

export async function createPerfil(payload: PerfilFormDraft) {
  const response = await authorizedRequestJson<AdministrationItemResponse<AdministrationPerfil>>(ENDPOINTS.perfis, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function updatePerfil(idPerfil: number, payload: Partial<PerfilFormDraft>) {
  const response = await authorizedRequestJson<AdministrationItemResponse<AdministrationPerfil>>(
    `${ENDPOINTS.perfis}${idPerfil}/`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  )
  return response.data
}

export async function deletePerfil(idPerfil: number) {
  await authorizedRequestJson(`${ENDPOINTS.perfis}${idPerfil}/`, {
    method: 'DELETE',
  })
}

export function mapAdministrationError(error: unknown, fallback: string) {
  return mapApiErrorMessage(error, fallback, { context: 'administration' })
}
