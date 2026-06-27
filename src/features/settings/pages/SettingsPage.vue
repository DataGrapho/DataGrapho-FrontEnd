<template>
  <main class="settings-page">
    <header class="settings-page__header">
      <div>
        <h1 class="settings-page__title text-display-h4">Configuração</h1>
        <p class="settings-page__subtitle text-body-small">
          Visualize seus dados, preferências e segurança da conta.
        </p>
      </div>
    </header>

    <InlineMessage
      v-if="loadError"
      :messages="loadError"
      align="start"
    />

    <div class="settings-page__sections">
      <DetailViewSection
        title="Meus dados"
        icon="user-line"
      >
        <v-skeleton-loader
          v-if="loading"
          type="text@3"
        />
        <DetailViewFieldsGrid
          v-else
          :fields="userFields"
        />
      </DetailViewSection>

      <DetailViewSection
        title="Meus acessos"
        icon="shield-user-line"
        :count="acessos.length"
      >
        <v-skeleton-loader
          v-if="loading"
          type="list-item@2"
        />

        <p
          v-else-if="acessos.length === 0"
          class="settings-page__empty text-body-small"
        >
          Nenhum acesso cadastrado.
        </p>

        <ul
          v-else
          class="settings-page__access-list"
        >
          <DetailViewListItem
            v-for="access in acessos"
            :key="access.id"
            icon="building-line"
            :title="access.empresa?.nome ?? 'Empresa nao informada'"
            :subtitle="formatAccessSubtitle(access)"
            :active="access.ativo"
            :show-chevron="false"
          />
        </ul>
      </DetailViewSection>

      <DetailViewSection
        title="Preferências"
        icon="palette-line"
      >
        <div class="settings-page__preference-row">
          <p class="settings-page__preference-label text-label-base">
            Tema da interface
          </p>

          <Button
            class="settings-page__theme-button"
            variant="outlined"
            color="on-surface"
            block
            type="button"
            @click="toggleTheme"
          >
            <Icon :name="isDarkTheme ? 'sun-line' : 'moon-line'" />
            <span>{{ isDarkTheme ? 'Usar modo claro' : 'Usar modo escuro' }}</span>
          </Button>
        </div>
      </DetailViewSection>

      <DetailViewSection
        title="Trocar de senha"
        icon="lock-password-line"
      >
        <form
          class="settings-page__password-form"
          @submit.prevent="submitPasswordChange"
        >
          <Input
            id="settings-current-password"
            v-model="currentPassword"
            field-label="Senha atual"
            placeholder="********"
            type="password"
            :error="Boolean(currentPasswordError)"
            :error-messages="currentPasswordError"
          />

          <Input
            id="settings-new-password"
            v-model="newPassword"
            field-label="Nova senha"
            placeholder="********"
            type="password"
            :error="Boolean(newPasswordError)"
            :error-messages="newPasswordError"
          />

          <Input
            id="settings-confirm-password"
            v-model="confirmPassword"
            field-label="Confirmar nova senha"
            placeholder="********"
            type="password"
            :error="Boolean(confirmPasswordError)"
            :error-messages="confirmPasswordError"
          />

          <p
            v-if="passwordFeedback"
            class="settings-page__feedback text-body-small"
            role="status"
          >
            {{ passwordFeedback }}
          </p>

          <Button
            type="submit"
            block
            :disabled="isChangingPassword"
            :loading="isChangingPassword"
          >
            Alterar senha
          </Button>
        </form>
      </DetailViewSection>

      <section class="settings-page__logout">
        <Button
          variant="outlined"
          color="on-surface"
          block
          @click="handleLogout"
        >
          <Icon name="logout-box-r-line" />
          <span>Sair da conta</span>
        </Button>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import Button from '@/shared/components/button/Button.vue'
  import DetailViewFieldsGrid from '@/shared/components/detail-view-dialog/DetailViewFieldsGrid.vue'
  import DetailViewListItem from '@/shared/components/detail-view-dialog/DetailViewListItem.vue'
  import DetailViewSection from '@/shared/components/detail-view-dialog/DetailViewSection.vue'
  import InlineMessage from '@/shared/components/inline-message/InlineMessage.vue'
  import Input from '@/shared/components/input/Input.vue'
  import { useAppTheme } from '@/shared/composables/useAppTheme'
  import { clearAuthenticatedSession } from '@/features/auth/services/auth-session.service'
  import { formatAccessSubtitle, useSettings } from '@/features/settings/composables/useSettings'

  const router = useRouter()
  const { isDarkTheme, toggleTheme } = useAppTheme()
  const {
    acessos,
    confirmPassword,
    confirmPasswordError,
    currentPassword,
    currentPasswordError,
    isChangingPassword,
    loadError,
    loading,
    newPassword,
    newPasswordError,
    passwordFeedback,
    submitPasswordChange,
    userFields,
  } = useSettings()

  function handleLogout() {
    clearAuthenticatedSession()
    void router.push({ name: 'login' })
  }
</script>

<style scoped lang="scss">
  @use '@/shared/styles/content-page' as content-page;
  @use '@/shared/styles/detail-view-dialog' as detail;
  @use '@/shared/styles/page-vuetify-fields' as page-fields;

  .settings-page {
    @include content-page.content-page-shell;
    overflow-y: auto;
    overflow-x: hidden;

    @media (max-width: 900px) {
      padding-bottom: calc(12px + 60px + env(safe-area-inset-bottom, 0px));
    }
  }

  .settings-page__header {
    @include content-page.content-page-header;
    margin-bottom: var(--df-space-sm);
  }

  .settings-page__title {
    @include content-page.content-page-title;
  }

  .settings-page__subtitle {
    @include page-fields.page-subtitle;
  }

  .settings-page__sections {
    display: grid;
    gap: 16px;
    min-width: 0;
  }

  .settings-page__access-list {
    @include detail.detail-view-list;
  }

  .settings-page__empty {
    @include detail.detail-view-empty;
  }

  .settings-page__preference-row {
    display: grid;
    gap: 12px;
    min-width: 0;
  }

  .settings-page__preference-label {
    margin: 0;
    color: rgb(var(--v-theme-on-surface));
  }

  .settings-page__theme-button {
    width: 100%;
  }

  .settings-page__password-form {
    display: grid;
    gap: 12px;
    width: 100%;
    min-width: 0;

    :deep(.input-wrapper) {
      width: 100%;
    }
  }

  .settings-page__feedback {
    margin: 0;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  .settings-page__logout {
    padding-top: 4px;
  }
</style>
