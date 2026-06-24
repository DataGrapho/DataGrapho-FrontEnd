<template>
  <v-dialog :model-value="modelValue" max-width="560" scrollable @update:model-value="emit('update:modelValue', $event)">
    <v-card class="depara-item-dialog">
      <v-card-title class="depara-item-dialog__title text-display-h6">
        {{ isEdit ? 'Editar item' : 'Novo item' }}
      </v-card-title>

      <v-card-text class="depara-item-dialog__content">
        <CatalogoTabelaField
          :catalogo-id="form.id_catalogo"
          :catalogo-tabela="form.catalogo_tabela"
          :catalogos="catalogos"
          :error="fieldErrors.catalogoTabela"
          :new-catalogo-tabela="form.newCatalogoTabela"
          select-id="depara-dialog-catalogo"
          variant="form"
          @change="handleCatalogChange"
        />

        <Input
          id="depara-dialog-origem"
          v-model="form.codigo_origem"
          field-label="Codigo origem"
          placeholder="Codigo de origem"
          :error="Boolean(fieldErrors.codigo_origem)"
          :error-messages="fieldErrors.codigo_origem"
        />

        <Input
          id="depara-dialog-destino"
          v-model="form.codigo_destino"
          field-label="Codigo destino"
          placeholder="Codigo de destino"
          :error="Boolean(fieldErrors.codigo_destino)"
          :error-messages="fieldErrors.codigo_destino"
        />

        <Input
          id="depara-dialog-desc-origem"
          v-model="form.descricao_origem"
          field-label="Descricao origem (opcional)"
          placeholder="Descricao de origem"
        />

        <Input
          id="depara-dialog-desc-destino"
          v-model="form.descricao_destino"
          field-label="Descricao destino (opcional)"
          placeholder="Descricao de destino"
        />

        <FormSelect
          id="depara-dialog-status"
          v-model="form.ativo"
          field-label="Status"
          item-title="title"
          item-value="value"
          :items="STATUS_OPTIONS"
          placeholder="Status"
        />

        <InlineMessage
          v-if="errorMessage"
          :messages="errorMessage"
          align="start"
        />
      </v-card-text>

      <v-card-actions class="depara-item-dialog__actions">
        <Button
          block
          size="md"
          variant="outlined"
          color="on-surface"
          @click="emit('update:modelValue', false)"
        >
          Cancelar
        </Button>
        <Button block size="md" :loading="saving" @click="handleSubmit">
          Salvar
        </Button>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import Button from '@/shared/components/button/Button.vue'
  import CatalogoTabelaField from '@/features/datatable/components/CatalogoTabelaField.vue'
  import FormSelect from '@/shared/components/form-select/FormSelect.vue'
  import InlineMessage from '@/shared/components/inline-message/InlineMessage.vue'
  import Input from '@/shared/components/input/Input.vue'
  import { createCatalogoDepara } from '@/features/datatable/services/catalogo-depara.service'
  import { createDepara, updateDepara } from '@/features/datatable/services/depara.service'
  import type { CatalogoDeparaListItem } from '@/features/datatable/types/depara.types'
  import type { DeparaDialogItem } from '@/features/datatable/types/depara-dialog.types'
  import { extractApiErrorMessage } from '@/features/datatable/utils/depara-api-errors'
  import { ApiError } from '@/shared/services/http'
  import { STATUS_OPTIONS } from '@/shared/constants/status-options'

  const props = defineProps<{
    modelValue: boolean
    catalogos: CatalogoDeparaListItem[]
    editItem?: DeparaDialogItem | null
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    saved: []
    'catalog-created': [catalogo: CatalogoDeparaListItem]
  }>()

  const form = reactive({
    id_depara: 0,
    id_catalogo: 0,
    catalogo_tabela: '',
    newCatalogoTabela: null as string | null,
    codigo_origem: '',
    codigo_destino: '',
    descricao_origem: '',
    descricao_destino: '',
    ativo: true,
  })

  const fieldErrors = reactive({
    catalogoTabela: '',
    codigo_origem: '',
    codigo_destino: '',
  })

  const errorMessage = ref('')
  const saving = ref(false)

  const isEdit = computed(() => Boolean(props.editItem?.id_depara && props.editItem.id_depara > 0))

  watch(
    () => [props.modelValue, props.editItem] as const,
    ([open, editItem]) => {
      if (!open) return

      fieldErrors.catalogoTabela = ''
      fieldErrors.codigo_origem = ''
      fieldErrors.codigo_destino = ''
      errorMessage.value = ''

      if (editItem) {
        form.id_depara = editItem.id_depara ?? 0
        form.id_catalogo = editItem.id_catalogo
        form.catalogo_tabela = editItem.catalogo_tabela
        form.newCatalogoTabela = editItem.newCatalogoTabela ?? null
        form.codigo_origem = editItem.codigo_origem
        form.codigo_destino = editItem.codigo_destino
        form.descricao_origem = editItem.descricao_origem ?? ''
        form.descricao_destino = editItem.descricao_destino ?? ''
        form.ativo = editItem.ativo
        return
      }

      form.id_depara = 0
      form.id_catalogo = 0
      form.catalogo_tabela = ''
      form.newCatalogoTabela = null
      form.codigo_origem = ''
      form.codigo_destino = ''
      form.descricao_origem = ''
      form.descricao_destino = ''
      form.ativo = true
    },
  )

  function handleCatalogChange (value: {
    id_catalogo: number | null
    catalogo_tabela: string
    newCatalogoTabela: string | null
  }) {
    form.id_catalogo = value.id_catalogo ?? 0
    form.catalogo_tabela = value.catalogo_tabela
    form.newCatalogoTabela = value.newCatalogoTabela
    fieldErrors.catalogoTabela = ''
  }

  function normalizeOptional (value: string) {
    const text = value.trim()
    return text ? text : null
  }

  function validateForm () {
    fieldErrors.catalogoTabela = ''
    fieldErrors.codigo_origem = ''
    fieldErrors.codigo_destino = ''

    const hasCatalog = (form.id_catalogo && form.id_catalogo > 0)
      || Boolean(form.newCatalogoTabela?.trim())
      || Boolean(form.catalogo_tabela.trim())

    if (!hasCatalog) {
      fieldErrors.catalogoTabela = 'Catalogo / tabela e obrigatorio.'
    }
    if (!form.codigo_origem.trim()) {
      fieldErrors.codigo_origem = 'Codigo origem e obrigatorio.'
    }
    if (!form.codigo_destino.trim()) {
      fieldErrors.codigo_destino = 'Codigo destino e obrigatorio.'
    }

    return !fieldErrors.catalogoTabela && !fieldErrors.codigo_origem && !fieldErrors.codigo_destino
  }

  async function resolveCatalogoId (): Promise<number> {
    if (form.id_catalogo && form.id_catalogo > 0 && !form.newCatalogoTabela) {
      return form.id_catalogo
    }

    const normalized = (form.newCatalogoTabela ?? form.catalogo_tabela).trim()
    if (!normalized) throw new Error('Catalogo / tabela e obrigatorio.')

    const existing = props.catalogos.find(catalogo =>
      catalogo.tabela_origem.toLocaleLowerCase('pt-BR') === normalized.toLocaleLowerCase('pt-BR'),
    )
    if (existing) return existing.id_catalogo

    const response = await createCatalogoDepara({ tabela_origem: normalized, ativo: true })
    if (!response.success || !response.data) {
      throw new Error(response.error ?? 'Nao foi possivel criar o catalogo.')
    }

    emit('catalog-created', response.data)
    return response.data.id_catalogo
  }

  async function handleSubmit () {
    errorMessage.value = ''
    if (!validateForm()) return

    saving.value = true

    try {
      const id_catalogo = await resolveCatalogoId()
      const payload = {
        id_catalogo,
        codigo_origem: form.codigo_origem.trim(),
        codigo_destino: form.codigo_destino.trim(),
        descricao_origem: normalizeOptional(form.descricao_origem),
        descricao_destino: normalizeOptional(form.descricao_destino),
        ativo: form.ativo,
      }

      const response = isEdit.value
        ? await updateDepara(form.id_depara, payload)
        : await createDepara(payload)

      if (!response.success) {
        errorMessage.value = response.error ?? 'Nao foi possivel salvar o item.'
        return
      }

      emit('saved')
      emit('update:modelValue', false)
    } catch (error) {
      if (error instanceof ApiError) {
        errorMessage.value = extractApiErrorMessage(error.details, error.message)
        return
      }
      if (error instanceof Error) {
        errorMessage.value = error.message
        return
      }
      errorMessage.value = 'Nao foi possivel salvar o item.'
    } finally {
      saving.value = false
    }
  }
</script>

<style scoped lang="scss">
  @use '@/features/datatable/styles/datatable-scroll' as scroll;
  @use '@/shared/styles/page-vuetify-fields' as page-fields;

  .depara-item-dialog {
    display: flex;
    max-height: calc(100dvh - 32px);
    flex-direction: column;
  }

  .depara-item-dialog__title {
    flex-shrink: 0;
    font-family: var(--df-font-display);
    letter-spacing: 0;
  }

  .depara-item-dialog__content {
    display: grid;
    min-height: 0;
    flex: 1 1 auto;
    gap: 12px;
    overflow-y: auto;
    @include scroll.datatable-custom-scrollbar;
    @include page-fields.page-form-field;
  }

  .depara-item-dialog__actions {
    display: grid;
    flex-shrink: 0;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 12px 16px 16px;
  }

  .depara-item-dialog__actions :deep(.button) {
    width: 100%;
    min-height: 40px;
    height: 40px;
    max-height: 40px;
    padding-inline: 12px;
  }
</style>
