<template>
  <DetailViewDialog
    :model-value="modelValue"
    :title="user?.nome ?? 'Usuario'"
    :deleting="deleting"
    :error-message="errorMessage"
    surface-class="user-detail-dialog-surface"
    @update:model-value="$emit('update:modelValue', $event)"
    @edit="$emit('edit')"
    @delete="$emit('delete')"
  >
    <DetailViewSection
      v-if="user"
      title="Dados do usuario"
      icon="user-line"
    >
      <DetailViewFieldsGrid :fields="userFields">
        <template #field-status>
          <DataTableStatusChip :active="user.is_active" />
        </template>
      </DetailViewFieldsGrid>
    </DetailViewSection>

    <DetailViewSection
      title="Acessos"
      icon="shield-user-line"
      :count="accessItems.length"
    >
      <p v-if="accessItems.length === 0" class="detail-view-empty text-body-small">
        Nenhum acesso cadastrado.
      </p>

      <ul v-else class="detail-view-list">
        <DetailViewListItem
          v-for="access in accessItems"
          :key="access.id"
          clickable
          :title="access.empresa"
          :subtitle="`Perfil: ${access.perfil}`"
          :active="access.ativo"
          @click="$emit('edit')"
        />
      </ul>
    </DetailViewSection>
  </DetailViewDialog>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import DetailViewDialog from '@/shared/components/detail-view-dialog/DetailViewDialog.vue'
  import DetailViewFieldsGrid from '@/shared/components/detail-view-dialog/DetailViewFieldsGrid.vue'
  import DetailViewListItem from '@/shared/components/detail-view-dialog/DetailViewListItem.vue'
  import DetailViewSection from '@/shared/components/detail-view-dialog/DetailViewSection.vue'
  import DataTableStatusChip from '@/features/datatable/components/DataTableStatusChip.vue'
  import type { ManageUsersListItem } from '@/features/manage-users/types/manage-users.types'

  const props = defineProps<{
    modelValue: boolean
    user: ManageUsersListItem | null
    deleting?: boolean
    errorMessage?: string
  }>()

  defineEmits<{
    'update:modelValue': [value: boolean]
    edit: []
    delete: []
  }>()

  const userFields = computed(() => {
    if (!props.user) return []

    return [
      { key: 'email', label: 'Email', value: props.user.email },
      { key: 'cpf', label: 'CPF', value: props.user.cpf },
      { key: 'status', label: 'Status', value: null },
    ]
  })

  const accessItems = computed(() => {
    if (!props.user?.acessos || props.user.acessos === '—') return []

    const details = props.user.acessos_detalhes ?? []

    return props.user.acessos.split('; ').map((entry, index) => {
      const [empresa = 'Empresa', perfil = 'Perfil'] = entry.split(' / ')

      return {
        id: `${index}-${empresa}`,
        empresa: empresa.trim(),
        perfil: perfil.trim(),
        ativo: details[index]?.ativo !== false,
      }
    })
  })
</script>

<style scoped lang="scss">
  @use '@/shared/styles/detail-view-dialog' as detail;

  .detail-view-list {
    @include detail.detail-view-list;
  }

  .detail-view-empty {
    @include detail.detail-view-empty;
  }
</style>

<style lang="scss">
  @use '@/shared/styles/detail-view-dialog' as detail;

  .user-detail-dialog-surface {
    @include detail.detail-view-dialog-surface-margin;
  }
</style>
