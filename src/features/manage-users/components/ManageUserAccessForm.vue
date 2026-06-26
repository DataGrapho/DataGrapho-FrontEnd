<template>
  <section class="access-form">
    <header class="access-form__header">
      <div class="access-form__title-row">
        <h2 class="access-form__title text-label-large">Acessos</h2>
        <v-tooltip
          text="Opcional. Empresa e perfil sao obrigatorios por linha. Filial e setor sao opcionais."
          location="top"
          content-class="access-form__tooltip"
        >
          <template #activator="{ props: tooltipProps }">
            <button
              type="button"
              class="access-form__info"
              aria-label="Informacoes sobre acessos"
              v-bind="tooltipProps"
            >
              <Icon name="information-line" :size="16" />
            </button>
          </template>
        </v-tooltip>
      </div>

      <Button
        size="sm"
        variant="outlined"
        color="on-surface"
        type="button"
        @click="$emit('add-access')"
      >
        <Icon name="add-line" />
        <span>Adicionar acesso</span>
      </Button>
    </header>

    <p
      v-if="modelValue.acessos.length === 0"
      class="access-form__empty text-body-small"
    >
      Nenhum acesso adicionado.
    </p>

    <div v-for="(access, index) in modelValue.acessos" :key="access.id" class="access-form__row">
      <div class="access-form__inputs">
        <FormSelect
          :id="`access-empresa-${access.id}`"
          :model-value="access.id_empresa"
          field-label="Empresa"
          :items="schema?.empresas_atribuiveis ?? []"
          item-title="nome"
          item-value="id_empresa"
          placeholder="Selecione a empresa"
          @update:model-value="updateAccess(index, 'id_empresa', $event)"
        />

        <FormSelect
          :id="`access-filial-${access.id}`"
          :model-value="access.id_filial"
          field-label="Filial"
          :items="branchOptions(access.id_empresa)"
          item-title="nome"
          item-value="id_filial"
          placeholder="Opcional"
          :disabled="access.id_empresa === null"
          @update:model-value="updateAccess(index, 'id_filial', $event)"
        />

        <FormSelect
          :id="`access-setor-${access.id}`"
          :model-value="access.id_setor"
          field-label="Setor"
          :items="departmentOptions(access.id_filial)"
          item-title="nome"
          item-value="id_setor"
          placeholder="Opcional"
          :disabled="access.id_filial === null"
          @update:model-value="updateAccess(index, 'id_setor', $event)"
        />

        <FormSelect
          :id="`access-perfil-${access.id}`"
          :model-value="access.id_perfil"
          field-label="Perfil"
          :items="profileOptions"
          item-title="nome"
          item-value="id_perfil"
          placeholder="Selecione o perfil"
          @update:model-value="updateAccess(index, 'id_perfil', $event)"
        />

        <FormSelect
          :id="`access-status-${access.id}`"
          :model-value="access.ativo"
          field-label="Status"
          item-title="title"
          item-value="value"
          :items="STATUS_OPTIONS"
          placeholder="Status"
          @update:model-value="updateAccess(index, 'ativo', $event)"
        />
      </div>

      <div class="access-form__row-actions">
        <button
          type="button"
          class="access-form__remove"
          :aria-label="`Remover acesso ${index + 1}`"
          @click="$emit('remove-access', index)"
        >
          <Icon name="delete-bin-line" :size="18" />
        </button>
      </div>
    </div>

    <InlineMessage
      v-if="errors.acessos"
      :messages="errors.acessos"
      align="start"
    />
  </section>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import Button from '@/shared/components/button/Button.vue'
  import InlineMessage from '@/shared/components/inline-message/InlineMessage.vue'
  import { STATUS_OPTIONS } from '@/shared/constants/status-options'
  import FormSelect from '@/shared/components/form-select/FormSelect.vue'
  import type {
    ManageUsersFieldErrorMap,
    ManageUsersFormDraft,
    ManageUsersRegisterSchema,
  } from '@/features/manage-users/types/manage-users.types'

  type AccessField = 'id_empresa' | 'id_filial' | 'id_setor' | 'id_perfil' | 'ativo'

  const props = defineProps<{
    modelValue: ManageUsersFormDraft
    schema: ManageUsersRegisterSchema | null
    errors: ManageUsersFieldErrorMap
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: ManageUsersFormDraft]
    'add-access': []
    'remove-access': [index: number]
  }>()

  const profileOptions = computed(() => (
    props.schema?.perfis_atribuiveis.filter((profile) => profile.ativo !== false) ?? []
  ))

  function branchOptions(idEmpresa: number | null) {
    if (idEmpresa === null) return []
    return (props.schema?.filiais_atribuiveis ?? []).filter((branch) => branch.id_empresa === idEmpresa)
  }

  function departmentOptions(idFilial: number | null) {
    if (idFilial === null) return []
    return (props.schema?.setores_atribuiveis ?? []).filter((department) => department.id_filial === idFilial)
  }

  function toNullableNumber(value: unknown) {
    return value === null || value === undefined || value === '' ? null : Number(value)
  }

  function updateAccess(index: number, field: AccessField, value: unknown) {
    const nextAccesses = props.modelValue.acessos.map((entry, entryIndex) => {
      if (entryIndex !== index) return entry

      if (field === 'ativo') {
        return {
          ...entry,
          ativo: Boolean(value),
        }
      }

      const nextValue = toNullableNumber(value)
      const nextEntry = {
        ...entry,
        [field]: nextValue,
      }

      if (field === 'id_empresa') {
        nextEntry.id_filial = null
        nextEntry.id_setor = null
      }

      if (field === 'id_filial') {
        nextEntry.id_setor = null
      }

      return nextEntry
    })

    emit('update:modelValue', {
      ...props.modelValue,
      acessos: nextAccesses,
    })
  }
</script>

<style scoped lang="scss">
  .access-form {
    display: grid;
    gap: 12px;
    width: 100%;
  }

  .access-form__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .access-form__title-row {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .access-form__title {
    margin: 0;
    color: rgb(var(--v-theme-on-surface));
  }

  .access-form__info {
    display: inline-flex;
    width: 20px;
    height: 20px;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: rgb(var(--v-theme-on-surface-variant));
    cursor: help;
  }

  .access-form__info:hover,
  .access-form__info:focus-visible {
    color: rgb(var(--v-theme-on-surface));
    outline: none;
  }

  .access-form__header :deep(.button) {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    border-color: rgba(var(--v-theme-on-surface), 0.16);
  }

  .access-form__empty {
    margin: 0;
    color: rgb(var(--v-theme-on-surface-variant));
    font-family: var(--df-font-body);
    letter-spacing: 0;
  }

  .access-form__row {
    display: grid;
    gap: 8px;
    align-items: start;
  }

  .access-form__inputs {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    min-width: 0;
  }

  .access-form__row-actions {
    display: flex;
    justify-content: flex-end;
  }

  .access-form__remove {
    display: inline-flex;
    width: 40px;
    height: 40px;
    min-height: 40px;
    box-sizing: border-box;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.16);
    border-radius: var(--df-radius-base);
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-error));
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }

  .access-form__remove:hover,
  .access-form__remove:focus-visible {
    border-color: rgb(var(--v-theme-error));
    background: rgba(var(--v-theme-error), 0.06);
    outline: none;
  }

  @media (max-width: 900px) {
    .access-form__header {
      flex-direction: column;
      align-items: stretch;
    }

    .access-form__row {
      grid-template-columns: 1fr;
    }

    .access-form__row-actions {
      justify-content: stretch;
    }

    .access-form__remove {
      width: 100%;
    }
  }
</style>

<style>
  .access-form__tooltip {
    font-family: var(--df-font-body) !important;
    font-size: 0.875rem !important;
    line-height: 1.25rem !important;
    letter-spacing: 0 !important;
    color: rgb(var(--v-theme-on-surface)) !important;
    background: rgb(var(--v-theme-surface)) !important;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.16) !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14) !important;
    opacity: 1 !important;
    padding: 8px 12px !important;
    max-width: 280px;
  }
</style>
