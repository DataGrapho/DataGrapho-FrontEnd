<template>
  <main class="admin-users-page">
    <InlineMessage
      v-if="!hasAdminPermission"
      messages="Voce nao possui permissao para acessar este modulo."
      align="start"
    />

    <template v-else>
      <header class="admin-users-page__header">
        <div>
          <h1 class="admin-users-page__title text-display-h4">Administração</h1>
        </div>
      </header>

      <InlineMessage
        v-if="successMessage"
        :messages="successMessage"
        variant="success"
        align="start"
      />

      <InlineMessage
        v-if="isLoadingSchema"
        messages="Carregando regras de cadastro..."
        variant="info"
        align="start"
      />

      <InlineMessage
        v-if="submitError"
        :messages="submitError"
        align="start"
      />

      <form class="admin-users-page__form" @submit.prevent="submit">
        <AdminUserCreateForm
          :model-value="form"
          :errors="fieldErrors"
          @update:model-value="form = $event"
        />

        <AdminUserAccessForm
          :model-value="form"
          :schema="schema"
          :errors="fieldErrors"
          @update:model-value="form = $event"
          @add-access="addAccess"
          @remove-access="removeAccess"
        />

        <div class="admin-users-page__footer">
          <Button
            class="admin-users-page__reset"
            variant="outlined"
            color="on-surface"
            type="button"
            :disabled="isSubmitting"
            @click="resetForm"
          >
            Limpar
          </Button>
          <Button
            class="admin-users-page__submit"
            type="submit"
            :loading="isSubmitting"
            :disabled="isSubmitting || isLoadingSchema"
          >
            Criar usuario
          </Button>
        </div>
      </form>
    </template>
  </main>
</template>

<script setup lang="ts">
  import { onMounted, watch } from 'vue'
  import Button from '@/shared/components/button/Button.vue'
  import InlineMessage from '@/shared/components/inline-message/InlineMessage.vue'
  import AdminUserAccessForm from '@/features/admin-users/components/AdminUserAccessForm.vue'
  import AdminUserCreateForm from '@/features/admin-users/components/AdminUserCreateForm.vue'
  import { useAdminUserForm } from '@/features/admin-users/composables/useAdminUserForm'

  const {
    addAccess,
    fieldErrors,
    form,
    hasAdminPermission,
    isLoadingSchema,
    isSubmitting,
    loadSchema,
    removeAccess,
    resetForm,
    schema,
    submit,
    submitError,
    successMessage,
  } = useAdminUserForm()

  let successTimer: ReturnType<typeof setTimeout> | null = null

  watch(successMessage, (val) => {
    if (successTimer) {
      clearTimeout(successTimer)
      successTimer = null
    }

    if (val) {
      successTimer = setTimeout(() => {
        successMessage.value = ''
        successTimer = null
      }, 5000)
    }
  })

  onMounted(() => {
    void loadSchema()
  })
</script>

<style scoped lang="scss">
  @use '@/shared/styles/content-page' as content-page;

  .admin-users-page {
    @include content-page.content-page-shell;
    overflow-y: auto;
    overflow-x: hidden;

    @media (max-width: 900px) {
      height: auto;
      min-height: 100%;
      overflow: visible;
    }
  }

  .admin-users-page__header {
    @include content-page.content-page-header;
  }

  .admin-users-page__title {
    @include content-page.content-page-title;
  }

  .admin-users-page__form {
    display: grid;
    gap: var(--df-space-md);
    min-width: 0;
    width: 100%;
  }

  .admin-users-page__footer {
    display: flex;
    align-items: stretch;
    gap: 8px;
    padding-top: 4px;
  }

  .admin-users-page__reset,
  .admin-users-page__submit {
    flex: 1;
    min-width: 0;
  }

  .admin-users-page__reset {
    background: rgb(var(--v-theme-surface-variant));
  }

  @media (max-width: 900px) {
    .admin-users-page__footer {
      flex-direction: column;
    }
  }
</style>
