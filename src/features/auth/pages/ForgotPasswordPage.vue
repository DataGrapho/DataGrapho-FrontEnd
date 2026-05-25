<template>
  <AuthFormCard
    title="Resetar sua senha"
    description="Digite o endereço de e-mail verificado da sua conta de usuário e enviaremos um link para redefinir sua senha."
  >
    <AuthForm @submit="onSubmit">
      <Input
        id="forgot-email"
        v-model="email"
        field-label="Email"
        placeholder="Adicione seu endereço de e-mail"
        type="email"
        :error="Boolean(emailError)"
        :error-messages="emailError"
      />

      <p v-if="feedbackMessage" class="feedback text-body-small" role="status">
        {{ feedbackMessage }}
      </p>

      <Button class="text-body-base-bold" type="submit" size="lg" block :disabled="isButtonDisabled" :loading="isSubmitting">
        {{ submitButtonLabel }}
      </Button>

      <p v-if="cooldownRemainingSeconds > 0" class="cooldown text-body-small" role="status">
        Voce podera reenviar em {{ cooldownRemainingSeconds }}s.
      </p>
    </AuthForm>
  </AuthFormCard>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, ref } from 'vue'
  import AuthForm from '@/features/auth/components/AuthForm.vue'
  import AuthFormCard from '@/features/auth/components/AuthFormCard.vue'
  import { registerAuthAuditEvent } from '@/features/auth/services/auth-audit.service'
  import { getNeutralRecoveryMessage, getPasswordResetRequestMessage } from '@/features/auth/services/auth-feedback.service'
  import { requestPasswordReset } from '@/features/auth/services/auth.service'
  import Button from '@/shared/components/button/Button.vue'
  import Input from '@/shared/components/input/Input.vue'

  const email = ref('')
  const emailError = ref('')
  const feedbackMessage = ref('')
  const isSubmitting = ref(false)
  const hasRequestedReset = ref(false)
  const cooldownRemainingSeconds = ref(0)
  let cooldownTimer: number | null = null
  const COOLDOWN_SECONDS = 30

  const isButtonDisabled = computed(() => isSubmitting.value || cooldownRemainingSeconds.value > 0)
  const submitButtonLabel = computed(() =>
    hasRequestedReset.value ? 'Reenviar link de redefinicao' : 'Enviar link de redefinicao'
  )

  function validateEmail(value: string) {
    return /\S+@\S+\.\S+/.test(value)
  }

  function stopCooldownTimer() {
    if (cooldownTimer === null) return
    window.clearInterval(cooldownTimer)
    cooldownTimer = null
  }

  function startCooldown() {
    stopCooldownTimer()
    cooldownRemainingSeconds.value = COOLDOWN_SECONDS
    cooldownTimer = window.setInterval(() => {
      if (cooldownRemainingSeconds.value <= 1) {
        cooldownRemainingSeconds.value = 0
        stopCooldownTimer()
        return
      }

      cooldownRemainingSeconds.value -= 1
    }, 1000)
  }

  async function onSubmit() {
    if (isSubmitting.value) return

    feedbackMessage.value = ''
    emailError.value = ''

    if (!email.value.trim()) {
      emailError.value = 'Informe seu email para continuar.'
      return
    }

    if (!validateEmail(email.value.trim())) {
      emailError.value = 'Informe um email valido.'
      return
    }

    isSubmitting.value = true

    try {
      await requestPasswordReset({
        email: email.value.trim(),
      })
      feedbackMessage.value = getNeutralRecoveryMessage()
      hasRequestedReset.value = true
      startCooldown()
      registerAuthAuditEvent('recuperacao_solicitada', {
        identifier: email.value.trim(),
      })
    } catch (error) {
      feedbackMessage.value = getPasswordResetRequestMessage(error)
      hasRequestedReset.value = true
      startCooldown()
      registerAuthAuditEvent('recuperacao_solicitada', {
        identifier: email.value.trim(),
        reason: 'request_failed',
      })
    } finally {
      isSubmitting.value = false
    }
  }

  onBeforeUnmount(() => {
    stopCooldownTimer()
  })
</script>

<style scoped>
  .feedback {
    margin: calc(var(--df-space-xs) * -1) 0 0;
    text-align: center;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  .cooldown {
    margin: calc(var(--df-space-xs) * -1) 0 0;
    text-align: center;
    color: rgb(var(--v-theme-on-surface-variant));
  }
</style>
