<template>
  <v-dialog
    :model-value="modelValue"
    :max-width="maxWidth"
    scrollable
    :content-class="surfaceClass"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="detail-view-dialog">
      <header class="detail-view-dialog__head">
        <div class="detail-view-dialog__title-block">
          <h2 class="detail-view-dialog__title text-display-h6">
            {{ title }}
          </h2>
          <p v-if="subtitle" class="detail-view-dialog__subtitle text-body-small">
            {{ subtitle }}
          </p>
        </div>
        <button
          type="button"
          class="detail-view-dialog__close"
          aria-label="Fechar"
          :disabled="deleting"
          @click="$emit('update:modelValue', false)"
        >
          <Icon name="close-line" :size="20" />
        </button>
      </header>

      <v-card-text class="detail-view-dialog__content">
        <InlineMessage
          v-if="errorMessage"
          :messages="errorMessage"
          align="start"
        />
        <slot />
      </v-card-text>

      <footer class="detail-view-dialog__actions">
        <Button
          block
          size="md"
          :disabled="deleting"
          @click="$emit('edit')"
        >
          <Icon name="edit-box-line" :size="18" />
          <span>Editar</span>
        </Button>
        <button
          type="button"
          class="detail-view-dialog__delete"
          :disabled="deleting"
          @click="$emit('delete')"
        >
          <span
            v-if="deleting"
            class="detail-view-dialog__delete-spinner"
            aria-hidden="true"
          />
          <Icon v-else name="delete-bin-line" :size="18" />
          <span>Excluir</span>
        </button>
      </footer>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import Button from '@/shared/components/button/Button.vue'
  import InlineMessage from '@/shared/components/inline-message/InlineMessage.vue'

  withDefaults(defineProps<{
    modelValue: boolean
    title: string
    subtitle?: string
    errorMessage?: string
    deleting?: boolean
    maxWidth?: number | string
    surfaceClass?: string
  }>(), {
    subtitle: '',
    errorMessage: '',
    deleting: false,
    maxWidth: 640,
    surfaceClass: 'detail-view-dialog-surface',
  })

  defineEmits<{
    'update:modelValue': [value: boolean]
    edit: []
    delete: []
  }>()
</script>

<style scoped lang="scss">
  @use '@/features/datatable/styles/datatable-scroll' as scroll;
  @use '@/shared/styles/detail-view-dialog' as detail;

  .detail-view-dialog {
    @include detail.detail-view-dialog-shell;
  }

  .detail-view-dialog__head {
    @include detail.detail-view-dialog-head;
  }

  .detail-view-dialog__title-block {
    @include detail.detail-view-dialog-title-block;
  }

  .detail-view-dialog__title {
    @include detail.detail-view-dialog-title;
  }

  .detail-view-dialog__subtitle {
    @include detail.detail-view-dialog-subtitle;
  }

  .detail-view-dialog__close {
    @include detail.detail-view-dialog-close;
  }

  .detail-view-dialog__content {
    @include detail.detail-view-dialog-content;
    @include scroll.datatable-custom-scrollbar;
  }

  .detail-view-dialog__actions {
    @include detail.detail-view-dialog-actions;
  }

  .detail-view-dialog__actions :deep(.button) {
    @include detail.detail-view-dialog-action-button;
  }

  .detail-view-dialog__delete {
    @include detail.detail-view-delete-button;
  }

  .detail-view-dialog__delete-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.35);
    border-top-color: currentColor;
    border-radius: 50%;
    animation: detail-view-dialog-spin 0.8s linear infinite;
  }

  @keyframes detail-view-dialog-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>

<style lang="scss">
  @use '@/shared/styles/detail-view-dialog' as detail;

  .detail-view-dialog-surface {
    @include detail.detail-view-dialog-surface-margin;
  }
</style>
