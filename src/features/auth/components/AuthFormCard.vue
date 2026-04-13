<template>
  <section class="auth-page" :class="{ 'auth-page--overlay': withBackdropOverlay }">
    <div class="auth-backdrop" />

    <v-card class="auth-card" variant="flat">
      <header class="auth-header">
        <img src="@/assets/images/datafit-logo.webp" alt="DataFit" class="auth-logo">

        <div class="auth-heading-block">
          <h1 class="auth-title text-display-h3">{{ title }}</h1>
          <p v-if="description" class="auth-description text-body-base">{{ description }}</p>
        </div>
      </header>

      <slot />
    </v-card>
  </section>
</template>

<script lang="ts" setup>
  withDefaults(
    defineProps<{
      title: string
      description?: string
      withBackdropOverlay?: boolean
    }>(),
    {
      description: '',
      withBackdropOverlay: false,
    }
  )
</script>

<style scoped>
  .auth-page {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--df-space-lg);
    overflow: hidden;
  }

  .auth-backdrop {
    position: absolute;
    inset: 0;
    background-image: url('@/assets/images/login-background.webp');
    background-size: cover;
    background-position: center;
  }

  .auth-page--overlay .auth-backdrop::after {
    content: '';
    position: absolute;
    inset: 0;
  }

  .auth-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 500px;
    border-radius: var(--df-radius-lg);
    padding: var(--df-space-xl) 36px;
  }

  .auth-header {
    display: flex;
    flex-direction: column;
    gap: var(--df-space-md);
    margin-bottom: var(--df-space-lg);
  }

  .auth-logo {
    width: 96px;
    height: 20px;
    display: block;
  }

  .auth-heading-block {
    display: flex;
    flex-direction: column;
    gap: var(--df-space-sm);
  }

  .auth-title {
    margin: 0;
    color: var(--df-color-auth-title);
  }

  .auth-description {
    margin: 0;
    color: var(--df-color-auth-description);
  }

  @media (max-width: 959px) {
    .auth-page {
      align-items: flex-start;
      justify-content: flex-start;
      background: rgb(var(--v-theme-surface));
      padding: var(--df-space-xl) var(--df-space-lg);
    }

    .auth-backdrop {
      display: none;
    }

    .auth-card {
      max-width: none;
      border-radius: 0;
      box-shadow: none;
      padding: 0;
    }

    .auth-header {
      margin-bottom: var(--df-space-lg);
    }
  }
</style>
