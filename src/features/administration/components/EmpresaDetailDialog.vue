<template>
  <DetailViewDialog
    :model-value="modelValue"
    :title="empresa?.nome ?? 'Empresa'"
    :deleting="deleting"
    :error-message="errorMessage"
    surface-class="empresa-detail-dialog-surface"
    @update:model-value="$emit('update:modelValue', $event)"
    @edit="$emit('edit')"
    @delete="$emit('delete')"
  >
    <DetailViewSection
      v-if="empresa"
      title="Dados da empresa"
      icon="building-line"
    >
      <DetailViewFieldsGrid :fields="empresaFields">
        <template #field-status>
          <DataTableStatusChip :active="empresa.ativo" />
        </template>
      </DetailViewFieldsGrid>
    </DetailViewSection>

    <DetailViewSection
      title="Filiais"
      icon="building-line"
      :count="filiais.length"
    >
      <p v-if="filiais.length === 0" class="detail-view-empty text-body-small">
        Nenhuma filial cadastrada para esta empresa.
      </p>

      <ul v-else class="detail-view-list">
        <DetailViewListItem
          v-for="filial in filiais"
          :key="filial.id_filial"
          clickable
          :title="filial.nome"
          :subtitle="formatSetoresLabel(filial.id_filial)"
          :active="filial.ativo"
          @click="$emit('edit-filial', filial.id_filial)"
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
  import type {
    AdministrationEmpresa,
    AdministrationFilial,
    AdministrationSetor,
  } from '@/features/administration/types/administration.types'

  const props = defineProps<{
    modelValue: boolean
    empresa: AdministrationEmpresa | null
    filiais: AdministrationFilial[]
    setores: AdministrationSetor[]
    deleting?: boolean
    errorMessage?: string
  }>()

  defineEmits<{
    'update:modelValue': [value: boolean]
    edit: []
    delete: []
    'edit-filial': [idFilial: number]
  }>()

  const setoresByFilial = computed(() => {
    const map = new Map<number, AdministrationSetor[]>()

    for (const setor of props.setores) {
      const current = map.get(setor.filial) ?? []
      current.push(setor)
      map.set(setor.filial, current)
    }

    return map
  })

  const empresaFields = computed(() => {
    if (!props.empresa) return []

    return [
      { key: 'cnpj', label: 'CNPJ', value: props.empresa.cnpj },
      { key: 'endereco', label: 'Endereco', value: props.empresa.endereco },
      { key: 'status', label: 'Status', value: null },
    ]
  })

  function formatSetoresLabel(filialId: number) {
    const setores = setoresByFilial.value.get(filialId) ?? []
    if (setores.length === 0) return ''

    return `Setores: ${setores.map((setor) => setor.nome).join(', ')}`
  }
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

  .empresa-detail-dialog-surface {
    @include detail.detail-view-dialog-surface-margin;
  }
</style>
