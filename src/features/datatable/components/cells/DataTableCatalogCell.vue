<template>
  <v-tooltip
    :disabled="!errorMessage"
    location="top"
    :text="errorMessage"
    content-class="datatable-cell-error-tooltip"
  >
    <template #activator="{ props: tooltipProps }">
      <div v-bind="tooltipProps">
        <CatalogoTabelaField
          compact
          :catalogo-id="catalogoId"
          :catalogo-tabela="catalogoTabela"
          :catalogos="catalogos"
          :error="errorMessage"
          :invalid="invalid"
          :new-catalogo-tabela="newCatalogoTabela"
          @change="emit('change', $event)"
        />
      </div>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import CatalogoTabelaField from '@/features/datatable/components/CatalogoTabelaField.vue'
  import type { CatalogoDeparaListItem } from '@/features/datatable/types/depara.types'

  const props = defineProps<{
    catalogoId: number | null
    catalogoTabela: string
    catalogos: CatalogoDeparaListItem[]
    errorMessage?: string
    invalid?: boolean
    newCatalogoTabela?: string | null
  }>()

  const emit = defineEmits<{
    change: [value: {
      id_catalogo: number | null
      catalogo_tabela: string
      newCatalogoTabela: string | null
    }]
  }>()

  const invalid = computed(() => props.invalid || Boolean(props.errorMessage))
</script>
