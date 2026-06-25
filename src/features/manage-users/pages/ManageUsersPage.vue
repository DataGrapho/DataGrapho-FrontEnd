<template>
  <main class="manage-users-page">
    <InlineMessage
      v-if="!hasManagePermission"
      messages="Voce nao possui permissao para acessar este modulo."
      align="start"
    />

    <template v-else>
      <header class="manage-users-page__header">
        <div class="manage-users-page__title-block">
          <h1 class="manage-users-page__title text-display-h4">Gerenciar usuarios</h1>
          <p class="manage-users-page__subtitle text-body-small">
            Crie e edite contas da sua empresa.
          </p>
        </div>

        <div class="manage-users-page__header-actions">
          <v-text-field
            v-model="searchText"
            class="manage-users-page__search"
            clearable
            density="comfortable"
            hide-details
            placeholder="Buscar usuarios"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
          />

          <Button type="button" @click="openCreateDialog">
            <Icon name="add-line" />
            <span>Adicionar usuario</span>
          </Button>
        </div>
      </header>

      <div class="manage-users-page__table">
        <BaseDataTable
          :columns="columns"
          :rows="tableRows"
          row-key="id_usuario"
          :loading="loading"
          :error="errorMessage"
          empty-text="Nenhum usuario encontrado."
          :selectable="false"
          clickable-rows
          @row-click="openUserDetail"
          @edit-row="openEditDialog"
          @delete-rows="handleUserDeleteRows"
        >
          <template #cell-status="{ value }">
            <DataTableStatusChip :active="value === 'Ativo'" />
          </template>
        </BaseDataTable>
      </div>

      <UserDetailDialog
        v-model="userDetailOpen"
        :user="selectedUser"
        :deleting="deletingUser"
        :error-message="detailError"
        @edit="openUserEditFromDetail"
        @delete="deleteSelectedUser"
      />

      <ManageUserDialog
        v-model="showUserDialog"
        :user="selectedUser"
        @saved="handleUserSaved"
      />
    </template>
  </main>
</template>

<script setup lang="ts">
  import Button from '@/shared/components/button/Button.vue'
  import InlineMessage from '@/shared/components/inline-message/InlineMessage.vue'
  import ManageUserDialog from '@/features/manage-users/components/ManageUserDialog.vue'
  import UserDetailDialog from '@/features/manage-users/components/UserDetailDialog.vue'
  import { buildManageUsersColumns } from '@/features/manage-users/config/manage-users-table.config'
  import { useManageUsersList } from '@/features/manage-users/composables/useManageUsersList'
  import { hasUserManagementAccess } from '@/features/auth/services/user-permissions.service'
  import { getAuthenticatedSession } from '@/features/auth/services/auth-session.service'
  import BaseDataTable from '@/features/datatable/components/BaseDataTable.vue'
  import DataTableStatusChip from '@/features/datatable/components/DataTableStatusChip.vue'

  const hasManagePermission = hasUserManagementAccess(getAuthenticatedSession())
  const columns = buildManageUsersColumns()

  const {
    deletingUser,
    detailError,
    deleteSelectedUser,
    errorMessage,
    handleUserDeleteRows,
    handleUserSaved,
    loading,
    openCreateDialog,
    openEditDialog,
    openUserDetail,
    openUserEditFromDetail,
    searchText,
    selectedUser,
    showUserDialog,
    userDetailOpen,
    tableRows,
  } = useManageUsersList()
</script>

<style scoped lang="scss">
  @use '@/shared/styles/content-page' as content-page;
  @use '@/shared/styles/page-vuetify-fields' as page-fields;

  .manage-users-page {
    @include content-page.content-page-shell;
    overflow-y: auto;
    overflow-x: hidden;

    @media (max-width: 900px) {
      height: auto;
      min-height: 100%;
      overflow: visible;
    }
  }

  .manage-users-page__header {
    @include content-page.content-page-header;
    align-items: flex-start;
    gap: var(--df-space-md);
  }

  .manage-users-page__title-block {
    display: grid;
    gap: 4px;
  }

  .manage-users-page__title {
    @include content-page.content-page-title;
  }

  .manage-users-page__subtitle {
    @include page-fields.page-subtitle;
  }

  .manage-users-page__header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: auto;
    width: min(100%, 520px);
    @include page-fields.page-toolbar-button;
  }

  .manage-users-page__search {
    flex: 1;
    min-width: 0;
    @include page-fields.page-search-field;
  }

  .manage-users-page__table {
    min-width: 0;
    width: 100%;
  }

  @media (max-width: 900px) {
    .manage-users-page__header {
      flex-direction: column;
    }

    .manage-users-page__header-actions {
      margin-left: 0;
      width: 100%;
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
