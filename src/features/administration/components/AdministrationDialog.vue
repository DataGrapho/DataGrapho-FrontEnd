<template>
  <v-dialog
    :model-value="modelValue"
    max-width="560"
    scrollable
    content-class="administration-dialog-surface"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="administration-dialog">
      <header class="administration-dialog__head">
        <v-card-title class="administration-dialog__title text-display-h6">
          {{ title }}
        </v-card-title>
        <button
          type="button"
          class="administration-dialog__close"
          aria-label="Fechar"
          :disabled="saving"
          @click="$emit('update:modelValue', false)"
        >
          <Icon name="close-line" :size="20" />
        </button>
      </header>

      <v-card-text class="administration-dialog__body">
        <InlineMessage
          v-if="errorMessage"
          :messages="errorMessage"
          align="start"
        />

        <slot />
      </v-card-text>

      <v-card-actions class="administration-dialog__actions">
        <Button
          block
          size="md"
          variant="outlined"
          color="on-surface"
          type="button"
          :disabled="saving"
          @click="$emit('update:modelValue', false)"
        >
          Cancelar
        </Button>
        <Button
          block
          size="md"
          type="button"
          :loading="saving"
          :disabled="saving"
          @click="$emit('save')"
        >
          Salvar
        </Button>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import Button from '@/shared/components/button/Button.vue'
  import InlineMessage from '@/shared/components/inline-message/InlineMessage.vue'

  defineProps<{
    modelValue: boolean
    title: string
    saving?: boolean
    errorMessage?: string
  }>()

  defineEmits<{
    'update:modelValue': [value: boolean]
    save: []
  }>()
</script>

<style scoped lang="scss">
  @use '@/features/datatable/styles/datatable-scroll' as scroll;
  @use '@/shared/styles/page-vuetify-fields' as page-fields;

  .administration-dialog {
    display: flex;
    max-height: calc(100dvh - 48px);
    flex-direction: column;
  }

  .administration-dialog__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    padding: 16px 16px 0;
    flex-shrink: 0;
  }

  .administration-dialog__title {
    flex: 1;
    min-width: 0;
    padding: 0;
    @include page-fields.page-dialog-title;
  }

  .administration-dialog__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 0;
    border-radius: var(--df-radius-base);
    background: transparent;
    color: rgb(var(--v-theme-on-surface-variant));
    cursor: pointer;
  }

  .administration-dialog__close:hover {
    background: rgb(var(--v-theme-surface-variant));
  }

  .administration-dialog__body {
    display: grid;
    min-height: 0;
    flex: 1 1 auto;
    gap: var(--df-space-sm);
    padding: 12px 16px 16px;
    overflow-y: auto;
    @include scroll.datatable-custom-scrollbar;
    @include page-fields.page-form-field;
  }

  .administration-dialog__actions {
    display: grid;
    flex-shrink: 0;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 12px 16px 16px;
  }

  .administration-dialog__actions :deep(.button) {
    width: 100%;
    min-height: 40px;
    height: 40px;
    max-height: 40px;
    padding-inline: 12px;
  }
</style>

<style lang="scss">
  .administration-dialog-surface {
    margin-top: 24px;
    margin-bottom: 24px;
  }
</style>
