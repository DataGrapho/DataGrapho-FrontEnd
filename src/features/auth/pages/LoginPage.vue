<template>
  <AuthFormCard title="Entrar no DataGrapho">
    <AuthForm @submit="onSubmit">
      <Input
        id="login-email"
        v-model="email"
        field-label="Email"
        placeholder="seuemail@exemplo.com"
        type="email"
        :error="Boolean(validationErrors.email)"
        :error-messages="validationErrors.email"
      />

      <Input
        id="login-password"
        v-model="password"
        field-label="Senha"
        placeholder="********"
        type="password"
        :error="Boolean(validationErrors.password)"
        :error-messages="validationErrors.password"
      />

      <InlineMessage
        v-if="errorMessage"
        :messages="errorMessage"
      />

      <Button class="text-body-base-bold" type="submit" size="lg" block :disabled="isSubmitting" :loading="isSubmitting">
        Entrar
      </Button>

      <Button class="forgot-button text-body-small" variant="text" color="on-surface" :to="{ name: 'forgot-password' }">
        Esqueceu a senha?
      </Button>
    </AuthForm>
  </AuthFormCard>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import InlineMessage from '@/shared/components/inline-message/InlineMessage.vue'
  import AuthForm from '@/features/auth/components/AuthForm.vue'
  import AuthFormCard from '@/features/auth/components/AuthFormCard.vue'
  import { registerAuthAuditEvent } from '@/features/auth/services/auth-audit.service'
  import { getLoginErrorMessage } from '@/features/auth/services/auth-feedback.service'
  import { setAuthenticatedSessionFromLogin } from '@/features/auth/services/auth-session.service'
  import { login } from '@/features/auth/services/auth.service'
  import Button from '@/shared/components/button/Button.vue'
  import Input from '@/shared/components/input/Input.vue'

  const router = useRouter()
  const route = useRoute()
  const email = ref('')
  const password = ref('')
  const errorMessage = ref('')
  const isSubmitting = ref(false)
  const validationErrors = ref<{ email: string, password: string }>({
    email: '',
    password: '',
  })
  function validateEmail(value: string) {
    return /\S+@\S+\.\S+/.test(value)
  }

  function validateForm() {
    validationErrors.value = {
      email: '',
      password: '',
    }

    if (!email.value.trim()) {
      validationErrors.value.email = 'Informe seu email para continuar.'
    } else if (!validateEmail(email.value.trim())) {
      validationErrors.value.email = 'Informe um email valido.'
    }

    if (!password.value) {
      validationErrors.value.password = 'Informe sua senha para continuar.'
    }

    return !validationErrors.value.email && !validationErrors.value.password
  }

  async function onSubmit() {
    if (isSubmitting.value) return

    errorMessage.value = ''
    if (!validateForm()) return

    isSubmitting.value = true

    try {
      const response = await login({
        email: email.value.trim(),
        password: password.value,
      })
      setAuthenticatedSessionFromLogin(response)
      const accountId = response.usuario?.id_usuario
      registerAuthAuditEvent(
        'login_sucesso',
        accountId
          ? { accountId: String(accountId), identifier: email.value.trim() }
          : { identifier: email.value.trim() },
      )

      const redirectTo = typeof route.query.redirect === 'string' ? route.query.redirect : null
      await router.push(redirectTo ?? { name: 'app-chat' })
    } catch (error) {
      registerAuthAuditEvent('login_falha', {
        identifier: email.value.trim(),
      })
      errorMessage.value = getLoginErrorMessage(error)
    } finally {
      isSubmitting.value = false
    }
  }
</script>

<style scoped>
  .forgot-button {
    min-height: auto;
    padding: 0;
    text-decoration: none;
  }
</style>
