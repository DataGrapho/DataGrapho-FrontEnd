import { authorizedRequestJson } from '@/shared/services/authorized-request'
import type {
  AdministrationEmpresa,
  AdministrationFilial,
  AdministrationListResponse,
  AdministrationPerfil,
  AdministrationSetor,
} from '@/features/administration/types/administration.types'

const ENDPOINTS = {
  empresas: '/auth/empresas/',
  filiais: '/auth/filiais/',
  setores: '/auth/setores/',
  perfis: '/auth/perfis/',
} as const

export async function listOrganizationEmpresas() {
  const response = await authorizedRequestJson<AdministrationListResponse<AdministrationEmpresa>>(
    ENDPOINTS.empresas,
  )
  return response.data ?? []
}

export async function listOrganizationFiliais() {
  const response = await authorizedRequestJson<AdministrationListResponse<AdministrationFilial>>(
    ENDPOINTS.filiais,
  )
  return response.data ?? []
}

export async function listOrganizationSetores() {
  const response = await authorizedRequestJson<AdministrationListResponse<AdministrationSetor>>(
    ENDPOINTS.setores,
  )
  return response.data ?? []
}

export async function listOrganizationPerfis() {
  const response = await authorizedRequestJson<AdministrationListResponse<AdministrationPerfil>>(
    ENDPOINTS.perfis,
  )
  return response.data ?? []
}

export async function listActiveOrganizationOptions() {
  const [empresas, filiais, setores, perfis] = await Promise.all([
    listOrganizationEmpresas(),
    listOrganizationFiliais(),
    listOrganizationSetores(),
    listOrganizationPerfis(),
  ])

  return {
    empresas: empresas.filter((item) => item.ativo !== false),
    filiais: filiais.filter((item) => item.ativo !== false),
    setores: setores.filter((item) => item.ativo !== false),
    perfis: perfis.filter((item) => item.ativo !== false),
  }
}
