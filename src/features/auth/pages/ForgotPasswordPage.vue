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
      />

      <Button class="text-body-base-bold" type="submit" size="lg" block>
        Enviar link de redefinição
      </Button>
    </AuthForm>
  </AuthFormCard>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import AuthForm from '@/features/auth/components/AuthForm.vue'
  import AuthFormCard from '@/features/auth/components/AuthFormCard.vue'
  import { requestPasswordReset } from '@/features/auth/services/auth.service'
  import Button from '@/shared/components/button/Button.vue'
  import Input from '@/shared/components/input/Input.vue'

  const email = ref('')

  async function onSubmit() {
    await requestPasswordReset({
      email: email.value,
    })
  }
</script>
