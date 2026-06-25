<template>
  <v-dialog
    :model-value="modelValue"
    max-width="900"
    scrollable
    content-class="admin-user-dialog-surface"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="admin-user-dialog">
      <header class="admin-user-dialog__head">
        <v-card-title class="admin-user-dialog__title text-display-h6">
          {{ isEditing ? 'Editar usuario' : 'Adicionar usuario' }}
        </v-card-title>
        <button
          type="button"
          class="admin-user-dialog__close"
          aria-label="Fechar"
          :disabled="isSubmitting"
          @click="$emit('update:modelValue', false)"
        >
          <Icon name="close-line" :size="20" />
        </button>
      </header>

      <v-card-text class="admin-user-dialog__body">
        <InlineMessage
          v-if="submitError"
          :messages="submitError"
          align="start"
        />

        <form class="admin-user-dialog__form" @submit.prevent="handleSubmit">
          <ManageUserCreateForm
            :model-value="form"
            :errors="fieldErrors"
            :is-editing="isEditing"
            :role-options="roleOptions"
            @update:model-value="form = $event"
          />

          <FormSelect
            v-model="form.is_active"
            field-label="Status"
            item-title="title"
            item-value="value"
            :items="STATUS_OPTIONS"
            placeholder="Status"
          />

          <ManageUserAccessForm
            :model-value="form"
            :schema="schema"
            :errors="fieldErrors"
            @update:model-value="form = $event"
            @add-access="addAccess"
            @remove-access="removeAccess"
          />
        </form>
      </v-card-text>

      <v-card-actions class="admin-user-dialog__actions">
        <Button
          block
          size="md"
          variant="outlined"
          color="on-surface"
          type="button"
          :disabled="isSubmitting"
          @click="$emit('update:modelValue', false)"
        >
          Cancelar
        </Button>
        <Button
          block
          size="md"
          type="button"
          :loading="isSubmitting"
          :disabled="isSubmitting || isLoadingSchema"
          @click="handleSubmit"
        >
          {{ isEditing ? 'Salvar alteracoes' : 'Criar usuario' }}
        </Button>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { onMounted, watch } from 'vue'
  import Button from '@/shared/components/button/Button.vue'
  import InlineMessage from '@/shared/components/inline-message/InlineMessage.vue'
  import { STATUS_OPTIONS } from '@/shared/constants/status-options'
  import ManageUserAccessForm from '@/features/manage-users/components/ManageUserAccessForm.vue'
  import ManageUserCreateForm from '@/features/manage-users/components/ManageUserCreateForm.vue'
  import FormSelect from '@/shared/components/form-select/FormSelect.vue'
  import { useManageUserForm } from '@/features/manage-users/composables/useManageUserForm'
  import type { ManageUsersListItem } from '@/features/manage-users/types/manage-users.types'

  const props = defineProps<{
    modelValue: boolean
    user?: ManageUsersListItem | null
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    saved: []
  }>()

  const {
    addAccess,
    fieldErrors,
    form,
    isEditing,
    isLoadingSchema,
    isSubmitting,
    loadFormFromUser,
    loadSchema,
    removeAccess,
    resetForm,
    roleOptions,
    schema,
    submit,
    submitError,
  } = useManageUserForm()

  async function handleSubmit() {
    const saved = await submit()
    if (saved) {
      emit('saved')
    }
  }

  watch(
    () => [props.modelValue, props.user] as const,
    ([open, user]) => {
      if (!open) {
        resetForm()
        return
      }

      if (user) {
        loadFormFromUser(user)
      } else {
        resetForm()
      }
    },
    { immediate: true },
  )

  onMounted(() => {
    void loadSchema()
  })
</script>

<style scoped lang="scss">
  @use '@/features/datatable/styles/datatable-scroll' as scroll;
  @use '@/shared/styles/page-vuetify-fields' as page-fields;

  .admin-user-dialog {
    display: flex;
    max-height: calc(100dvh - 48px);
    flex-direction: column;
  }

  .admin-user-dialog__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    padding: 16px 16px 0;
    flex-shrink: 0;
  }

  .admin-user-dialog__title {
    flex: 1;
    min-width: 0;
    padding: 0;
    @include page-fields.page-dialog-title;
  }

  .admin-user-dialog__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 0;
    border-radius: var(--df-radius-base);
    background: transparent;
    color: rgb(var(--v-theme-on-surface-variant));
    cursor: pointer;
  }

  .admin-user-dialog__close:hover {
    background: rgb(var(--v-theme-surface-variant));
  }

  .admin-user-dialog__body {
    display: grid;
    min-height: 0;
    flex: 1 1 auto;
    gap: var(--df-space-md);
    padding: 12px 16px 16px;
    overflow-y: auto;
    @include scroll.datatable-custom-scrollbar;
  }

  .admin-user-dialog__form {
    display: grid;
    gap: var(--df-space-md);
    @include page-fields.page-form-field;
  }

  .admin-user-dialog__actions {
    display: grid;
    flex-shrink: 0;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 12px 16px 16px;
  }

  .admin-user-dialog__actions :deep(.button) {
    width: 100%;
    min-height: 40px;
    height: 40px;
    max-height: 40px;
    padding-inline: 12px;
  }
</style>

<style lang="scss">
  .admin-user-dialog-surface {
    margin-top: 24px;
    margin-bottom: 24px;
  }
</style>
