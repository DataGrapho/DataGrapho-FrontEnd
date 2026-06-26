<template>
  <div class="admin-user-create-form">
    <Input
      id="admin-user-email"
      :model-value="modelValue.email"
      field-label="Email"
      placeholder="novo.usuario@empresa.com"
      type="email"
      :error="Boolean(errors.email)"
      :error-messages="errors.email"
      @update:model-value="updateField('email', $event)"
    />

    <Input
      id="admin-user-cpf"
      :model-value="modelValue.cpf"
      field-label="CPF"
      placeholder="000.000.000-00"
      inputmode="numeric"
      maxlength="14"
      :error="Boolean(errors.cpf)"
      :error-messages="errors.cpf"
      @update:model-value="updateCpf"
    />

    <Input
      id="admin-user-name"
      :model-value="modelValue.nome"
      field-label="Nome completo"
      placeholder="Nome do usuario"
      :error="Boolean(errors.nome)"
      :error-messages="errors.nome"
      @update:model-value="updateField('nome', $event)"
    />

    <Input
      id="admin-user-password"
      :model-value="modelValue.password"
      :field-label="isEditing ? 'Nova senha (opcional)' : 'Senha inicial'"
      type="password"
      placeholder="••••••••"
      :error="Boolean(errors.password)"
      :error-messages="errors.password"
      @update:model-value="updateField('password', $event)"
    />

    <FormSelect
      id="admin-user-role"
      :model-value="modelValue.roleType"
      field-label="Tipo de usuario"
      item-title="title"
      item-value="value"
      :items="roleOptions"
      placeholder="Selecione o tipo"
      :disabled="roleOptions.length <= 1"
      @update:model-value="updateField('roleType', $event)"
    />
  </div>
</template>

<script setup lang="ts">
  import Input from '@/shared/components/input/Input.vue'
  import FormSelect from '@/shared/components/form-select/FormSelect.vue'
  import { formatCpfInput } from '@/shared/utils/cpf'
  import type { ManageUsersRoleOption } from '@/features/manage-users/config/manage-users-role.config'
  import type { ManageUsersFieldErrorMap, ManageUsersFormDraft, ManageUsersRoleType } from '@/features/manage-users/types/manage-users.types'

  const props = defineProps<{
    modelValue: ManageUsersFormDraft
    errors: ManageUsersFieldErrorMap
    isEditing?: boolean
    roleOptions: ManageUsersRoleOption[]
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: ManageUsersFormDraft]
  }>()

  function updateCpf(value: string) {
    updateField('cpf', formatCpfInput(value))
  }

  function updateField(field: keyof ManageUsersFormDraft, value: string | boolean | ManageUsersRoleType) {
    emit('update:modelValue', {
      ...props.modelValue,
      [field]: value,
    })
  }
</script>

<style scoped>
  .admin-user-create-form {
    display: grid;
    gap: var(--df-space-sm);
    width: 100%;
  }
</style>
