import type { DataTableColumn } from '@/features/datatable/types/shared-table.types'

export function buildManageUsersColumns(): DataTableColumn[] {
  return [
    { key: 'nome', label: 'Nome', minWidth: '180px' },
    { key: 'email', label: 'Email', minWidth: '200px' },
    { key: 'cpf', label: 'CPF', minWidth: '140px' },
    { key: 'acessos', label: 'Acessos', minWidth: '220px' },
    { key: 'status', label: 'Status', width: '110px' },
    { key: 'criado_em', label: 'Criado em', width: '160px', sortable: true },
  ]
}
