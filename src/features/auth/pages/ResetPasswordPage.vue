<template>
  <AuthFormCard
    :title="`Troca de senha para ${displayName}`"
    description="Certifique-se que a senha tenha pelo menos 8 caracteres, incluindo um número e uma letra minúscula."
  >
    <AuthForm @submit="onSubmit">
      <Input
        id="new-password"
        v-model="password"
        field-label="Senha"
        placeholder="********"
        type="password"
        :error="Boolean(passwordError)"
        :error-messages="passwordError"
      />

      <Input
        id="confirm-password"
        v-model="confirmPassword"
        field-label="Confirmar senha"
        placeholder="********"
        type="password"
        :error="Boolean(confirmPasswordError)"
        :error-messages="confirmPasswordError"
      />

      <p v-if="feedbackMessage" class="feedback text-body-small" role="status">
        {{ feedbackMessage }}
      </p>

      <Button class="text-body-base-bold" type="submit" size="lg" block :disabled="isSubmitting" :loading="isSubmitting">
        Trocar senha
      </Button>
    </AuthForm>
  </AuthFormCard>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import AuthForm from '@/features/auth/components/AuthForm.vue'
  import AuthFormCard from '@/features/auth/components/AuthFormCard.vue'
  import { registerAuthAuditEvent } from '@/features/auth/services/auth-audit.service'
  import { getPasswordPolicyMessage, getPasswordResetErrorMessage } from '@/features/auth/services/auth-feedback.service'
  import { clearAuthenticatedSession } from '@/features/auth/services/auth-session.service'
  import { resetPassword } from '@/features/auth/services/auth.service'
  import Button from '@/shared/components/button/Button.vue'
  import Input from '@/shared/components/input/Input.vue'

  const route = useRoute()
  const router = useRouter()
  const password = ref('')
  const confirmPassword = ref('')
  const passwordError = ref('')
  const confirmPasswordError = ref('')
  const feedbackMessage = ref('')
  const isSubmitting = ref(false)

  const displayName = computed(() => {
    const queryName = route.query.name

    if (typeof queryName === 'string' && queryName.trim().length > 0) {
      return queryName
    }

    return 'Israel'
  })

  const resetToken = computed(() => {
    const queryToken = route.query.token
    return typeof queryToken === 'string' ? queryToken : ''
  })

  function validateForm() {
    passwordError.value = ''
    confirmPasswordError.value = ''

    const passwordPolicyMessage = getPasswordPolicyMessage(password.value)
    if (passwordPolicyMessage) {
      passwordError.value = passwordPolicyMessage
    }

    if (!confirmPassword.value) {
      confirmPasswordError.value = 'Confirme sua nova senha.'
    } else if (confirmPassword.value !== password.value) {
      confirmPasswordError.value = 'A confirmacao precisa ser igual a senha informada.'
    }

    return !passwordError.value && !confirmPasswordError.value
  }

  async function onSubmit() {
    if (isSubmitting.value) return

    feedbackMessage.value = ''

    if (!resetToken.value) {
      feedbackMessage.value = 'O link de recuperacao e invalido ou expirou. Solicite um novo link.'
      return
    }

    if (!validateForm()) return

    isSubmitting.value = true

    try {
      await resetPassword({
        password: password.value,
        confirmPassword: confirmPassword.value,
        token: resetToken.value,
      })

      clearAuthenticatedSession()
      registerAuthAuditEvent('senha_redefinida')
      feedbackMessage.value = 'Senha redefinida com sucesso. Faça login novamente.'
      await router.push({ name: 'login' })
    } catch (error) {
      feedbackMessage.value = getPasswordResetErrorMessage(error)
    } finally {
      isSubmitting.value = false
    }
  }
</script>

<style scoped>
  .feedback {
    margin: calc(var(--df-space-xs) * -1) 0 0;
    text-align: center;
    color: rgb(var(--v-theme-on-surface-variant));
  }
</style>
