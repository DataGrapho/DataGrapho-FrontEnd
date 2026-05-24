<template>
  <AuthFormCard title="Entrar no DataGrapho">
    <AuthForm @submit="onSubmit">
      <Input
        id="login-email"
        v-model="email"
        field-label="Email"
        placeholder="seuemail@exemplo.com"
        type="email"
      />

      <Input
        id="login-password"
        v-model="password"
        field-label="Senha"
        placeholder="********"
        type="password"
      />

      <Button class="text-body-base-bold" type="submit" size="lg" block>
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
  import { useRouter } from 'vue-router'
  import AuthForm from '@/features/auth/components/AuthForm.vue'
  import AuthFormCard from '@/features/auth/components/AuthFormCard.vue'
  import { login } from '@/features/auth/services/auth.service'
  import Button from '@/shared/components/button/Button.vue'
  import Input from '@/shared/components/input/Input.vue'

  const router = useRouter()
  const email = ref('')
  const password = ref('')
  const isLoading = ref(false)
  const error = ref('')

  async function onSubmit() {
    if (isLoading.value) return
    
    isLoading.value = true
    error.value = ''
    
    try {
      await login({
        email: email.value,
        password: password.value,
      })
      
      router.push({ name: 'app-chat' })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao fazer login'
      console.error('Login error:', err)
    } finally {
      isLoading.value = false
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
