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
      />

      <Input
        id="confirm-password"
        v-model="confirmPassword"
        field-label="Confirmar senha"
        placeholder="********"
        type="password"
      />

      <Button class="text-body-base-bold" type="submit" size="lg" block>
        Trocar senha
      </Button>
    </AuthForm>
  </AuthFormCard>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import AuthForm from '@/features/auth/components/AuthForm.vue'
  import AuthFormCard from '@/features/auth/components/AuthFormCard.vue'
  import { resetPassword } from '@/features/auth/services/auth.service'
  import Button from '@/shared/components/button/Button.vue'
  import Input from '@/shared/components/input/Input.vue'

  const route = useRoute()
  const password = ref('')
  const confirmPassword = ref('')

  const displayName = computed(() => {
    const queryName = route.query.name

    if (typeof queryName === 'string' && queryName.trim().length > 0) {
      return queryName
    }

    return 'Israel'
  })

  async function onSubmit() {
    const queryToken = route.query.token
    const token = typeof queryToken === 'string' ? queryToken : undefined

    await resetPassword({
      password: password.value,
      confirmPassword: confirmPassword.value,
      token,
    })
  }
</script>
