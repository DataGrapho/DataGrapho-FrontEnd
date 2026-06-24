<template>
  <div
    class="catalogo-tabela-field"
    :class="{
      'catalogo-tabela-field--compact': compact,
      'catalogo-tabela-field--form': variant === 'form',
    }"
  >
    <FormSelect
      v-if="!creatingNew && variant === 'form'"
      :id="selectId"
      :error="fieldInvalid"
      :error-messages="error"
      field-label="Catalogo / Tabela"
      item-title="title"
      item-value="value"
      :items="selectItems"
      :model-value="selectedCatalogoValue"
      placeholder="Catalogo / Tabela"
      @update:model-value="handleSelect"
    />

    <v-select
      v-else-if="!creatingNew"
      :id="selectId"
      :error="fieldInvalid"
      :error-messages="error"
      class="catalogo-tabela-field__select"
      density="compact"
      hide-details
      item-title="title"
      item-value="value"
      :items="selectItems"
      :model-value="selectedCatalogoValue"
      placeholder="Selecione"
      variant="outlined"
      :menu-props="{ contentClass: 'catalogo-tabela-field__menu' }"
      @update:model-value="handleSelect"
    />

    <div v-else-if="variant === 'form'" class="catalogo-tabela-field__labeled">
      <label class="catalogo-tabela-field__label text-label-base" :for="selectId">
        Catalogo / Tabela
      </label>
      <v-text-field
        :id="selectId"
        :error="Boolean(error)"
        :error-messages="error"
        autofocus
        class="catalogo-tabela-field__input"
        density="compact"
        hide-details
        :model-value="newTabelaName"
        placeholder="Nova tabela"
        variant="outlined"
        @update:model-value="handleNewName"
      >
        <template #append-inner>
          <button
            class="catalogo-tabela-field__back"
            title="Voltar"
            type="button"
            @click="exitCreateMode"
          >
            <Icon name="arrow-left-s-line" :size="14" />
          </button>
        </template>
      </v-text-field>
    </div>

    <v-text-field
      v-else
      :id="selectId"
      :error="fieldInvalid"
      :error-messages="error"
      autofocus
      class="catalogo-tabela-field__input"
      density="compact"
      hide-details
      :model-value="newTabelaName"
      placeholder="Nova tabela"
      variant="outlined"
      @update:model-value="handleNewName"
    >
      <template #append-inner>
        <button
          class="catalogo-tabela-field__back"
          title="Voltar"
          type="button"
          @click="exitCreateMode"
        >
          <Icon name="arrow-left-s-line" :size="14" />
        </button>
      </template>
    </v-text-field>

    <button
      v-if="showCreateLink"
      class="catalogo-tabela-field__create-link text-body-caption"
      type="button"
      @click="enterCreateMode"
    >
      + Criar nova tabela
    </button>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import FormSelect from '@/shared/components/form-select/FormSelect.vue'
  import type { CatalogoDeparaListItem } from '@/features/datatable/types/depara.types'

  const CREATE_VALUE = '__create__'

  const props = withDefaults(defineProps<{
    catalogoId?: number | null
    catalogoTabela?: string
    newCatalogoTabela?: string | null
    catalogos: CatalogoDeparaListItem[]
    error?: string
    invalid?: boolean
    selectId?: string
    compact?: boolean
    variant?: 'inline' | 'form'
  }>(), {
    catalogoId: null,
    catalogoTabela: '',
    newCatalogoTabela: null,
    error: '',
    invalid: false,
    selectId: undefined,
    compact: false,
    variant: 'inline',
  })

  const emit = defineEmits<{
    change: [value: {
      id_catalogo: number | null
      catalogo_tabela: string
      newCatalogoTabela: string | null
    }]
  }>()

  const creatingNew = ref(false)
  const newTabelaName = ref('')

  const showCreateLink = computed(() =>
    props.variant === 'form' && !creatingNew.value,
  )

  const fieldInvalid = computed(() => Boolean(props.error) || props.invalid)

  const selectItems = computed(() => {
    const items = props.catalogos.map(catalogo => ({
      title: catalogo.tabela_origem,
      value: catalogo.id_catalogo,
    }))

    if (props.compact) {
      items.push({ title: 'Criar nova tabela...', value: CREATE_VALUE as unknown as number })
    }

    return items
  })

  const selectedCatalogoValue = computed(() => {
    if (props.newCatalogoTabela) return null
    if (props.catalogoId && props.catalogoId > 0) return props.catalogoId
    return null
  })

  watch(
    () => [props.newCatalogoTabela, props.catalogoTabela, props.catalogoId],
    () => {
      if (props.newCatalogoTabela) {
        creatingNew.value = true
        newTabelaName.value = props.newCatalogoTabela
        return
      }
      if (!props.catalogoId && props.catalogoTabela && !selectItems.value.some(item => item.title === props.catalogoTabela)) {
        creatingNew.value = true
        newTabelaName.value = props.catalogoTabela
      }
    },
    { immediate: true },
  )

  function enterCreateMode () {
    creatingNew.value = true
    newTabelaName.value = ''
    emit('change', { id_catalogo: null, catalogo_tabela: '', newCatalogoTabela: '' })
  }

  function exitCreateMode () {
    creatingNew.value = false
    newTabelaName.value = ''
    emit('change', { id_catalogo: null, catalogo_tabela: '', newCatalogoTabela: null })
  }

  function handleSelect (value: unknown) {
    if (value === CREATE_VALUE) {
      enterCreateMode()
      return
    }

    const id = Number(value)
    const catalogo = props.catalogos.find(item => item.id_catalogo === id)
    if (!catalogo) return

    creatingNew.value = false
    newTabelaName.value = ''
    emit('change', {
      id_catalogo: catalogo.id_catalogo,
      catalogo_tabela: catalogo.tabela_origem,
      newCatalogoTabela: null,
    })
  }

  function handleNewName (value: string) {
    newTabelaName.value = value
    const text = value.trim()
    emit('change', {
      id_catalogo: null,
      catalogo_tabela: text,
      newCatalogoTabela: text || '',
    })
  }
</script>

<style scoped lang="scss">
  @use '@/features/datatable/styles/datatable-field' as field;

  .catalogo-tabela-field {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  .catalogo-tabela-field--compact {
    gap: 0;
  }

  .catalogo-tabela-field--form {
    gap: 0;
  }

  .catalogo-tabela-field__select,
  .catalogo-tabela-field__input {
    @include field.datatable-inline-field;
  }

  .catalogo-tabela-field--form .catalogo-tabela-field__input {
    @include field.datatable-form-field;
  }

  .catalogo-tabela-field__labeled {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .catalogo-tabela-field__label {
    color: rgb(var(--v-theme-on-surface-variant));
    font-family: var(--df-font-body);
  }

  .catalogo-tabela-field__create-link {
    justify-self: start;
    margin-top: 4px;
    padding: 0;
    border: 0;
    background: transparent;
    color: rgb(var(--v-theme-primary));
    font-family: var(--df-font-body);
    cursor: pointer;
    letter-spacing: 0;
  }

  .catalogo-tabela-field__back {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: rgb(var(--v-theme-on-surface-variant));
    cursor: pointer;
  }
</style>

<style>
  .catalogo-tabela-field__menu .v-list-item-title {
    font-family: var(--df-font-body);
    font-size: 0.8125rem;
    line-height: 1.125rem;
    letter-spacing: 0;
  }
</style>
