import { AuthRequestError } from '@/features/auth/services/auth.service'

const GENERIC_AUTH_ERROR_MESSAGE = 'Nao foi possivel concluir a operacao. Tente novamente em instantes.'
const NEUTRAL_RECOVERY_MESSAGE = 'Se o email informado for valido, voce recebera instrucoes de recuperacao em instantes.'

export function getLoginErrorMessage(error: unknown) {
  if (error instanceof AuthRequestError && error.status === 401) {
    return 'Credenciais invalidas. Verifique o email e a senha informados.'
  }

  return GENERIC_AUTH_ERROR_MESSAGE
}

export function getPasswordResetRequestMessage(error: unknown) {
  if (error instanceof AuthRequestError && error.status >= 500) {
    return 'Nao foi possivel processar sua solicitacao agora. Tente novamente em instantes.'
  }

  return NEUTRAL_RECOVERY_MESSAGE
}

export function getPasswordResetErrorMessage(error: unknown) {
  if (error instanceof AuthRequestError && (error.status === 400 || error.status === 401 || error.status === 410)) {
    return 'O link de recuperacao e invalido ou expirou. Solicite um novo link para continuar.'
  }

  return GENERIC_AUTH_ERROR_MESSAGE
}

export function getChangePasswordErrorMessage(error: unknown) {
  if (error instanceof AuthRequestError && error.status === 400) {
    const details = error.details as Record<string, string[] | string> | undefined
    const currentPasswordError = details?.current_password
    if (Array.isArray(currentPasswordError) && currentPasswordError[0]) {
      return currentPasswordError[0]
    }
    if (typeof currentPasswordError === 'string') {
      return currentPasswordError
    }
    const confirmPasswordError = details?.confirmPassword
    if (Array.isArray(confirmPasswordError) && confirmPasswordError[0]) {
      return confirmPasswordError[0]
    }
  }

  return GENERIC_AUTH_ERROR_MESSAGE
}

export function getPasswordPolicyMessage(password: string) {
  if (password.length < 8) {
    return 'A senha precisa ter pelo menos 8 caracteres.'
  }

  if (!/[a-z]/.test(password)) {
    return 'A senha precisa incluir pelo menos uma letra minuscula.'
  }

  if (!/\d/.test(password)) {
    return 'A senha precisa incluir pelo menos um numero.'
  }

  return ''
}

export function getNeutralRecoveryMessage() {
  return NEUTRAL_RECOVERY_MESSAGE
}
