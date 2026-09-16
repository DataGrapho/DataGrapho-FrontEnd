import { computed, onMounted, ref, watch } from 'vue'
import { deleteManageUser, listManageUsers } from '@/features/manage-users/services/manage-users.service'
import type { ManageUsersListItem } from '@/features/manage-users/types/manage-users.types'
import type { DataTableRow } from '@/features/datatable/types/shared-table.types'

export function useManageUsersList() {
  const users = ref<ManageUsersListItem[]>([])
  const searchText = ref('')
  const loading = ref(false)
  const errorMessage = ref('')
  const selectedUserId = ref<number | null>(null)
  const userDetailOpen = ref(false)
  const showUserDialog = ref(false)
  const deletingUser = ref(false)
  const detailError = ref('')

  const selectedUser = computed(() =>
    users.value.find((item) => item.id_usuario === selectedUserId.value) ?? null,
  )

  const filteredUsers = computed(() => {
    const query = searchText.value.trim().toLowerCase()
    if (!query) return users.value

    return users.value.filter((user) => {
      const haystack = [
        user.nome,
        user.email,
        user.cpf,
        user.acessos,
        user.status,
      ].join(' ').toLowerCase()

      return haystack.includes(query)
    })
  })

  const tableRows = computed<DataTableRow[]>(() =>
    filteredUsers.value.map((user) => ({
      id_usuario: user.id_usuario,
      nome: user.nome,
      email: user.email,
      cpf: user.cpf,
      status: user.status === 'ativo' ? 'Ativo' : 'Inativo',
      acessos: user.acessos,
      criado_em: user.criado_em,
    })),
  )

  async function loadUsers() {
    loading.value = true
    errorMessage.value = ''

    try {
      users.value = await listManageUsers()
    } catch (error) {
      errorMessage.value = error instanceof Error
        ? error.message
        : 'Nao foi possivel carregar os usuarios.'
    } finally {
      loading.value = false
    }
  }

  function openUserDetail(row: DataTableRow) {
    if (!row.id_usuario) return

    detailError.value = ''
    selectedUserId.value = Number(row.id_usuario)
    userDetailOpen.value = true
  }

  function openCreateDialog() {
    selectedUserId.value = null
    showUserDialog.value = true
  }

  function openEditDialog(row?: DataTableRow) {
    const id = row?.id_usuario ?? selectedUserId.value
    if (!id) return

    selectedUserId.value = Number(id)
    showUserDialog.value = true
  }

  function openUserEditFromDetail() {
    if (!selectedUserId.value) return

    showUserDialog.value = true
    userDetailOpen.value = false
  }

  async function deleteSelectedUser() {
    if (!selectedUserId.value) return

    deletingUser.value = true
    detailError.value = ''

    try {
      await deleteManageUser(selectedUserId.value)
      userDetailOpen.value = false
      selectedUserId.value = null
      await loadUsers()
    } catch (error) {
      detailError.value = error instanceof Error
        ? error.message
        : 'Nao foi possivel excluir o usuario.'
    } finally {
      deletingUser.value = false
    }
  }

  async function handleUserDeleteRows(rows: DataTableRow[]) {
    const row = rows[0]
    if (!row?.id_usuario) return

    selectedUserId.value = Number(row.id_usuario)
    await deleteSelectedUser()
  }

  async function handleUserSaved() {
    showUserDialog.value = false
    selectedUserId.value = null
    await loadUsers()
  }

  watch(userDetailOpen, (open) => {
    if (!open) {
      detailError.value = ''
      if (!showUserDialog.value) {
        selectedUserId.value = null
      }
    }
  })

  watch(showUserDialog, (open) => {
    if (!open && !userDetailOpen.value) {
      selectedUserId.value = null
    }
  })

  onMounted(() => {
    void loadUsers()
  })

  return {
    deletingUser,
    detailError,
    errorMessage,
    handleUserDeleteRows,
    handleUserSaved,
    loading,
    openCreateDialog,
    openEditDialog,
    openUserDetail,
    openUserEditFromDetail,
    deleteSelectedUser,
    searchText,
    selectedUser,
    showUserDialog,
    userDetailOpen,
    tableRows,
  }
}
