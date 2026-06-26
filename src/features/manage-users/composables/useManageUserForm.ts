import { computed, ref } from 'vue'
import { getAuthenticatedSession } from '@/features/auth/services/auth-session.service'
import {
  hasSuperuserAccess,
  hasUserManagementAccess,
} from '@/features/auth/services/user-permissions.service'
import {
  ManageUsersRequestError,
  createManageUser,
  getManageUsersRegisterSchema,
  updateManageUser,
} from '@/features/manage-users/services/manage-users.service'
import type {
  ManageUsersAccessCreatePayload,
  ManageUsersAccessDraft,
  ManageUsersCreatePayload,
  ManageUsersFieldErrorMap,
  ManageUsersFormDraft,
  ManageUsersListItem,
  ManageUsersRegisterSchema,
  ManageUsersUpdatePayload,
} from '@/features/manage-users/types/manage-users.types'
import {
  isCompleteCpfFormatted,
  isValidCpfFormatted,
} from '@/shared/utils/cpf'
import {
  getManageUsersRoleOptions,
  resolveRoleType,
  roleToFlags,
} from '@/features/manage-users/config/manage-users-role.config'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_MIN_LENGTH = 6

function buildDefaultAccessDraft(overrides: Partial<ManageUsersAccessDraft> = {}): ManageUsersAccessDraft {
  return {
    id: crypto.randomUUID(),
    id_empresa: null,
    id_filial: null,
    id_setor: null,
    id_perfil: null,
    ativo: true,
    ...overrides,
  }
}

function buildDefaultFormDraft(): ManageUsersFormDraft {
  return {
    id_usuario: null,
    email: '',
    cpf: '',
    nome: '',
    password: '',
    roleType: 'comum',
    is_active: true,
    acessos: [],
  }
}

function isAccessDraftComplete(access: ManageUsersAccessDraft) {
  return access.id_empresa !== null && access.id_perfil !== null
}

function isAccessDraftIncomplete(access: ManageUsersAccessDraft) {
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

function getAccessValidationMessage(access: ManageUsersAccessDraft) {
  if (access.id_setor !== null && access.id_filial === null) {
    return 'Se informar setor, selecione tambem a filial.'
  }

  return 'Preencha empresa e perfil em todas as linhas ou remova a linha incompleta.'
}

function mapListItemToForm(item: ManageUsersListItem): ManageUsersFormDraft {
  return {
    id_usuario: item.id_usuario,
    email: item.email,
    cpf: item.cpf,
    nome: item.nome,
    password: '',
    roleType: resolveRoleType({
      is_staff: item.is_staff,
      is_superuser: item.is_superuser,
    }),
    is_active: item.is_active,
    acessos: (item.acessos_detalhes ?? []).map((access) => buildDefaultAccessDraft({
      id_empresa: access.id_empresa,
      id_filial: access.id_filial ?? null,
      id_setor: access.id_setor ?? null,
      id_perfil: access.id_perfil,
      ativo: access.ativo,
    })),
  }
}

export function useManageUserForm() {
  const session = getAuthenticatedSession()
  const schema = ref<ManageUsersRegisterSchema | null>(null)
  const form = ref<ManageUsersFormDraft>(buildDefaultFormDraft())
  const isEditing = computed(() => form.value.id_usuario != null)

  const isLoadingSchema = ref(false)
  const isSubmitting = ref(false)

  const submitError = ref('')
  const fieldErrors = ref<ManageUsersFieldErrorMap>({})

  const isSuperuser = computed(() => hasSuperuserAccess(session))
  const roleOptions = computed(() => getManageUsersRoleOptions(isSuperuser.value, isEditing.value))

  function applyRoleFlags(payload: ManageUsersCreatePayload | ManageUsersUpdatePayload) {
    const allowedValues = new Set(roleOptions.value.map((option) => option.value))
    const roleType = allowedValues.has(form.value.roleType) ? form.value.roleType : 'comum'
    const flags = roleToFlags(roleType)

    payload.is_staff = flags.is_staff
    payload.is_superuser = flags.is_superuser
  }

  function resetFeedback() {
    submitError.value = ''
    fieldErrors.value = {}
  }

  function resetForm() {
    form.value = buildDefaultFormDraft()
  }

  function loadFormFromUser(item: ManageUsersListItem) {
    form.value = mapListItemToForm(item)
    resetFeedback()
  }

  function addAccess() {
    form.value.acessos.push(buildDefaultAccessDraft())
  }

  function removeAccess(index: number) {
    form.value.acessos.splice(index, 1)
  }

  function buildAccessPayload() {
    return form.value.acessos
      .filter(isAccessDraftComplete)
      .map<ManageUsersAccessCreatePayload>((entry) => ({
        id_empresa: Number(entry.id_empresa),
        id_filial: entry.id_filial,
        id_setor: entry.id_setor,
        id_perfil: Number(entry.id_perfil),
        ativo: entry.ativo,
      }))
  }

  function sanitizeCreatePayload(): ManageUsersCreatePayload {
    const payload: ManageUsersCreatePayload = {
      email: form.value.email.trim(),
      cpf: form.value.cpf.trim(),
      nome: form.value.nome.trim(),
      password: form.value.password,
      is_active: form.value.is_active,
    }

    applyRoleFlags(payload)

    const accessPayload = buildAccessPayload()
    if (accessPayload.length > 0) {
      payload.acessos = accessPayload
    }

    return payload
  }

  function sanitizeUpdatePayload(): ManageUsersUpdatePayload {
    const payload: ManageUsersUpdatePayload = {
      email: form.value.email.trim(),
      cpf: form.value.cpf.trim(),
      nome: form.value.nome.trim(),
      is_active: form.value.is_active,
      acessos: buildAccessPayload(),
    }

    if (form.value.password.trim()) {
      payload.password = form.value.password
    }

    applyRoleFlags(payload)

    return payload
  }

  function validateLocal() {
    const nextFieldErrors: ManageUsersFieldErrorMap = {}

    if (!form.value.email.trim()) nextFieldErrors.email = 'Informe o email.'
    else if (!EMAIL_PATTERN.test(form.value.email.trim())) nextFieldErrors.email = 'Informe um email valido.'

    if (!form.value.cpf.trim()) nextFieldErrors.cpf = 'Informe o CPF.'
    else if (!isCompleteCpfFormatted(form.value.cpf)) {
      nextFieldErrors.cpf = 'Informe um CPF no formato 000.000.000-00.'
    } else if (!isValidCpfFormatted(form.value.cpf)) {
      nextFieldErrors.cpf = 'Informe um CPF valido.'
    }

    if (!form.value.nome.trim()) nextFieldErrors.nome = 'Informe o nome completo.'

    if (!isEditing.value) {
      if (!form.value.password) nextFieldErrors.password = 'Informe a senha.'
      else if (form.value.password.length < PASSWORD_MIN_LENGTH) {
        nextFieldErrors.password = `A senha inicial deve ter ao menos ${PASSWORD_MIN_LENGTH} caracteres.`
      }
    } else if (form.value.password && form.value.password.length < PASSWORD_MIN_LENGTH) {
      nextFieldErrors.password = `A senha deve ter ao menos ${PASSWORD_MIN_LENGTH} caracteres.`
    }

    const incompleteAccess = form.value.acessos.find(isAccessDraftIncomplete)
    if (incompleteAccess) {
      nextFieldErrors.acessos = getAccessValidationMessage(incompleteAccess)
    }

    fieldErrors.value = nextFieldErrors
    return Object.keys(nextFieldErrors).length === 0
  }

  async function loadSchema() {
    if (!hasUserManagementAccess(session)) return
    isLoadingSchema.value = true
    resetFeedback()

    try {
      schema.value = await getManageUsersRegisterSchema()
    } catch (error) {
      submitError.value = error instanceof Error
        ? error.message
        : 'Nao foi possivel carregar o schema de cadastro.'
    } finally {
      isLoadingSchema.value = false
    }
  }

  async function submit() {
    if (isSubmitting.value || !hasUserManagementAccess(session)) return
    resetFeedback()
    if (!validateLocal()) return false

    isSubmitting.value = true
    try {
      if (isEditing.value && form.value.id_usuario != null) {
        await updateManageUser(form.value.id_usuario, sanitizeUpdatePayload())
      } else {
        await createManageUser(sanitizeCreatePayload())
        resetForm()
      }
      return true
    } catch (error) {
      if (error instanceof ManageUsersRequestError) {
        if (error.status === 401) return false

        fieldErrors.value = { ...fieldErrors.value, ...error.fieldErrors }
        submitError.value = error.message
        return false
      }

      submitError.value = error instanceof Error
        ? error.message
        : 'Falha inesperada ao salvar usuario.'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    addAccess,
    fieldErrors,
    form,
    isEditing,
    isLoadingSchema,
    isSubmitting,
    loadFormFromUser,
    loadSchema,
    removeAccess,
    resetForm,
    roleOptions,
    schema,
    submit,
    submitError,
  }
}
