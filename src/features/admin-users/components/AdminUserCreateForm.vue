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
      field-label="Senha inicial"
      type="password"
      placeholder="••••••••"
      :error="Boolean(errors.password)"
      :error-messages="errors.password"
      @update:model-value="updateField('password', $event)"
    />

    <v-checkbox
      :model-value="modelValue.is_staff"
      color="primary"
      label="É administrador?"
      hide-details
      density="comfortable"
      @update:model-value="updateField('is_staff', Boolean($event))"
    />
  </div>
</template>

<script setup lang="ts">
  import Input from '@/shared/components/input/Input.vue'
  import { formatCpfInput } from '@/shared/utils/cpf'
  import type { AdminUsersFieldErrorMap, AdminUsersFormDraft } from '@/features/admin-users/types/admin-users.types'

  const props = defineProps<{
    modelValue: AdminUsersFormDraft
    errors: AdminUsersFieldErrorMap
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: AdminUsersFormDraft]
  }>()

  function updateCpf(value: string) {
    updateField('cpf', formatCpfInput(value))
  }

  function updateField(field: keyof AdminUsersFormDraft, value: string | boolean) {
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

  .admin-user-create-form :deep(.v-label) {
    font-family: var(--df-font-body);
    font-size: 0.875rem;
    line-height: 1.25rem;
    letter-spacing: 0;
  }

  .admin-user-create-form :deep(.v-selection-control__label) {
    font-family: var(--df-font-body);
    font-size: 0.875rem;
    line-height: 1.25rem;
    letter-spacing: 0;
    color: rgb(var(--v-theme-on-surface));
    opacity: 1;
  }
</style>
