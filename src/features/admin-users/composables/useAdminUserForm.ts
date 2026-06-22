import { computed, ref } from 'vue'
import { getAuthenticatedSession } from '@/features/auth/services/auth-session.service'
import { hasAdministrativeAccess } from '@/features/admin-users/services/admin-user-permissions.service'
import {
  AdminUsersRequestError,
  createAdminUser,
  getAdminUsersRegisterSchema,
} from '@/features/admin-users/services/admin-users.service'
import type {
  AdminUsersAccessCreatePayload,
  AdminUsersAccessDraft,
  AdminUsersCreatePayload,
  AdminUsersFieldErrorMap,
  AdminUsersFormDraft,
  AdminUsersRegisterSchema,
} from '@/features/admin-users/types/admin-users.types'
import {
  isCompleteCpfFormatted,
  isValidCpfFormatted,
} from '@/shared/utils/cpf'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_MIN_LENGTH = 6

function buildDefaultAccessDraft(): AdminUsersAccessDraft {
  return {
    id: crypto.randomUUID(),
    id_empresa: null,
    id_filial: null,
    id_setor: null,
    id_perfil: null,
    ativo: true,
  }
}

function buildDefaultFormDraft(): AdminUsersFormDraft {
  return {
    email: '',
    cpf: '',
    nome: '',
    password: '',
    is_staff: false,
    acessos: [],
  }
}

function isAccessDraftComplete(access: AdminUsersAccessDraft) {
  return access.id_empresa !== null && access.id_perfil !== null
}

function isAccessDraftIncomplete(access: AdminUsersAccessDraft) {
  const hasEmpresa = access.id_empresa !== null
  const hasPerfil = access.id_perfil !== null
  const hasFilial = access.id_filial !== null
  const hasSetor = access.id_setor !== null
  const hasAnyValue = hasEmpresa || hasPerfil || hasFilial || hasSetor

  if (!hasAnyValue) return true
  if (hasEmpresa !== hasPerfil) return true
  if (hasSetor && !hasFilial) return true
  return false
}

function getAccessValidationMessage(access: AdminUsersAccessDraft) {
  if (access.id_setor !== null && access.id_filial === null) {
    return 'Se informar setor, selecione tambem a filial.'
  }

  const hasEmpresa = access.id_empresa !== null
  const hasPerfil = access.id_perfil !== null
  if (hasEmpresa !== hasPerfil) {
    return 'Preencha empresa e perfil em todas as linhas ou remova a linha incompleta.'
  }

  return 'Preencha empresa e perfil em todas as linhas ou remova a linha incompleta.'
}

export function useAdminUserForm() {
  const session = getAuthenticatedSession()
  const schema = ref<AdminUsersRegisterSchema | null>(null)
  const form = ref<AdminUsersFormDraft>(buildDefaultFormDraft())

  const isLoadingSchema = ref(false)
  const isSubmitting = ref(false)

  const successMessage = ref('')
  const submitError = ref('')
  const fieldErrors = ref<AdminUsersFieldErrorMap>({})

  const hasAdminPermission = computed(() => hasAdministrativeAccess(session))

  function resetFeedback() {
    successMessage.value = ''
    submitError.value = ''
    fieldErrors.value = {}
  }

  function resetForm() {
    form.value = buildDefaultFormDraft()
  }

  function addAccess() {
    form.value.acessos.push(buildDefaultAccessDraft())
  }

  function removeAccess(index: number) {
    form.value.acessos.splice(index, 1)
  }

  function sanitizePayload() {
    const accessPayload = form.value.acessos
      .filter(isAccessDraftComplete)
      .map<AdminUsersAccessCreatePayload>((entry) => ({
        id_empresa: Number(entry.id_empresa),
        id_filial: entry.id_filial,
        id_setor: entry.id_setor,
        id_perfil: Number(entry.id_perfil),
        ativo: entry.ativo,
      }))

    const payload: AdminUsersCreatePayload = {
      email: form.value.email.trim(),
      cpf: form.value.cpf.trim(),
      nome: form.value.nome.trim(),
      password: form.value.password,
      is_active: true,
      is_staff: form.value.is_staff,
    }

    if (accessPayload.length > 0) {
      payload.acessos = accessPayload
    }

    return payload
  }

  function validateLocal() {
    const nextFieldErrors: AdminUsersFieldErrorMap = {}
    const payload = sanitizePayload()

    if (!payload.email) nextFieldErrors.email = 'Informe o email.'
    else if (!EMAIL_PATTERN.test(payload.email)) nextFieldErrors.email = 'Informe um email valido.'

    if (!payload.cpf) nextFieldErrors.cpf = 'Informe o CPF.'
    else if (!isCompleteCpfFormatted(payload.cpf)) {
      nextFieldErrors.cpf = 'Informe um CPF no formato 000.000.000-00.'
    } else if (!isValidCpfFormatted(payload.cpf)) {
      nextFieldErrors.cpf = 'Informe um CPF valido.'
    }
    if (!payload.nome) nextFieldErrors.nome = 'Informe o nome completo.'

    if (!payload.password) nextFieldErrors.password = 'Informe a senha.'
    else if (payload.password.length < PASSWORD_MIN_LENGTH) {
      nextFieldErrors.password = `A senha inicial deve ter ao menos ${PASSWORD_MIN_LENGTH} caracteres.`
    }

    const incompleteAccess = form.value.acessos.find(isAccessDraftIncomplete)
    if (incompleteAccess) {
      nextFieldErrors.acessos = getAccessValidationMessage(incompleteAccess)
    }

    fieldErrors.value = nextFieldErrors
    return Object.keys(nextFieldErrors).length === 0
  }

  async function loadSchema() {
    if (!hasAdminPermission.value) return
    isLoadingSchema.value = true
    resetFeedback()

    try {
      schema.value = await getAdminUsersRegisterSchema()
    } catch (error) {
      submitError.value = error instanceof Error
        ? error.message
        : 'Nao foi possivel carregar o schema de cadastro.'
    } finally {
      isLoadingSchema.value = false
    }
  }

  async function submit() {
    if (isSubmitting.value || !hasAdminPermission.value) return
    resetFeedback()
    if (!validateLocal()) return

    const payload = sanitizePayload()

    isSubmitting.value = true
    try {
      await createAdminUser(payload)
      successMessage.value = 'Usuario criado com sucesso.'
      resetForm()
    } catch (error) {
      if (error instanceof AdminUsersRequestError) {
        if (error.status === 401) return

        fieldErrors.value = { ...fieldErrors.value, ...error.fieldErrors }
        submitError.value = error.message
        return
      }

      submitError.value = error instanceof Error
        ? error.message
        : 'Falha inesperada ao salvar usuario.'
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    addAccess,
    fieldErrors,
    form,
    hasAdminPermission,
    isLoadingSchema,
    isSubmitting,
    loadSchema,
    removeAccess,
    resetForm,
    schema,
    submit,
    submitError,
    successMessage,
  }
}
