import { computed, onMounted, ref } from 'vue'
import type { AuthUserAccess } from '@/features/auth/types/auth.types'
import {
  getChangePasswordErrorMessage,
  getPasswordPolicyMessage,
} from '@/features/auth/services/auth-feedback.service'
import { changePassword, fetchCurrentUser } from '@/features/auth/services/auth.service'
import { getAuthenticatedSession } from '@/features/auth/services/auth-session.service'

export function formatAccessSubtitle(access: AuthUserAccess) {
  const parts = [
    access.filial?.nome ? `Filial: ${access.filial.nome}` : null,
    access.setor?.nome ? `Setor: ${access.setor.nome}` : null,
    access.perfil?.nome ? `Perfil: ${access.perfil.nome}` : null,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(' · ') : 'Sem detalhes de acesso'
}

export function useSettings() {
  const session = getAuthenticatedSession()
  const loading = ref(false)
  const loadError = ref('')
  const nome = ref(session?.usuario?.nome ?? '')
  const email = ref(session?.usuario?.email ?? '')
  const cpf = ref('')
  const acessos = ref<AuthUserAccess[]>(session?.acessos ?? [])

  const currentPassword = ref('')
  const newPassword = ref('')
  const confirmPassword = ref('')
  const currentPasswordError = ref('')
  const newPasswordError = ref('')
  const confirmPasswordError = ref('')
  const passwordFeedback = ref('')
  const isChangingPassword = ref(false)

  const userFields = computed(() => [
    { key: 'nome', label: 'Nome', value: nome.value },
    { key: 'email', label: 'Email', value: email.value },
    { key: 'cpf', label: 'CPF', value: cpf.value },
  ])

  async function loadProfile() {
    loading.value = true
    loadError.value = ''

    try {
      const profile = await fetchCurrentUser()
      nome.value = profile.nome ?? ''
      email.value = profile.email
      cpf.value = profile.cpf ?? ''
      acessos.value = profile.acessos ?? []
    } catch {
      loadError.value = 'Nao foi possivel carregar seus dados. Tente novamente em instantes.'
    } finally {
      loading.value = false
    }
  }

  function validatePasswordForm() {
    currentPasswordError.value = ''
    newPasswordError.value = ''
    confirmPasswordError.value = ''

    if (!currentPassword.value) {
      currentPasswordError.value = 'Informe sua senha atual.'
    }

    const passwordPolicyMessage = getPasswordPolicyMessage(newPassword.value)
    if (passwordPolicyMessage) {
      newPasswordError.value = passwordPolicyMessage
    }

    if (!confirmPassword.value) {
      confirmPasswordError.value = 'Confirme sua nova senha.'
    } else if (confirmPassword.value !== newPassword.value) {
      confirmPasswordError.value = 'A confirmacao precisa ser igual a senha informada.'
    }

    return !currentPasswordError.value && !newPasswordError.value && !confirmPasswordError.value
  }

  async function submitPasswordChange() {
    if (isChangingPassword.value) return

    passwordFeedback.value = ''
    if (!validatePasswordForm()) return

    isChangingPassword.value = true

    try {
      await changePassword({
        currentPassword: currentPassword.value,
        password: newPassword.value,
        confirmPassword: confirmPassword.value,
      })

      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
      passwordFeedback.value = 'Senha alterada com sucesso.'
    } catch (error) {
      passwordFeedback.value = getChangePasswordErrorMessage(error)
    } finally {
      isChangingPassword.value = false
    }
  }

  onMounted(() => {
    void loadProfile()
  })

  return {
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
  }
}
