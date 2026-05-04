import type { CatalogoDeparaListItem, DeparaListItem } from '@/features/datatable/types/depara.types'

export const CATALOGO_DEPARA_MOCK: CatalogoDeparaListItem[] = [
  { id_catalogo: 1, tabela_origem: 'EXAMES_LAB', descricao: 'Exames laboratoriais', ativo: true },
  { id_catalogo: 2, tabela_origem: 'PROCEDIMENTOS', descricao: 'Procedimentos clínicos', ativo: true },
]

export const DEPARA_MOCK: DeparaListItem[] = [
  {
    id_depara: 101,
    id_catalogo: 1,
    id_depara_pai: null,
    catalogo_tabela: 'EXAMES_LAB',
    codigo_origem: 'HORMONIO',
    codigo_destino: 'GRUPO_HORMONIO',
    ativo: true,
    criado_em: '2026-04-20T09:00:00Z',
  },
  {
    id_depara: 102,
    id_catalogo: 1,
    id_depara_pai: 101,
    catalogo_tabela: 'EXAMES_LAB',
    codigo_origem: 'TESTOSTERONA_TOTAL',
    codigo_destino: 'EXAME_TESTOSTERONA_TOTAL',
    ativo: true,
    criado_em: '2026-04-20T09:10:00Z',
  },
  {
    id_depara: 103,
    id_catalogo: 1,
    id_depara_pai: 101,
    catalogo_tabela: 'EXAMES_LAB',
    codigo_origem: 'T4_LIVRE',
    codigo_destino: 'EXAME_T4_LIVRE',
    ativo: true,
    criado_em: '2026-04-20T09:15:00Z',
  },
  {
    id_depara: 201,
    id_catalogo: 2,
    id_depara_pai: null,
    catalogo_tabela: 'PROCEDIMENTOS',
    codigo_origem: 'CARDIO',
    codigo_destino: 'GRUPO_CARDIO',
    ativo: false,
    criado_em: '2026-04-21T10:00:00Z',
  },
  {
    id_depara: 202,
    id_catalogo: 2,
    id_depara_pai: 201,
    catalogo_tabela: 'PROCEDIMENTOS',
    codigo_origem: 'ELETROCARDIOGRAMA',
    codigo_destino: 'PROC_ECG',
    ativo: true,
    criado_em: '2026-04-21T10:20:00Z',
  },
]
