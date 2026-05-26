<template>
  <div class="chat-page__composer-wrap">
    <form
      class="chat-composer"
      @submit.prevent="emit('submit')"
    >
      <i class="ri-chat-3-line chat-composer__icon chat-composer__leading" />

      <input
        :value="modelValue"
        :disabled="disabled"
        class="chat-composer__input text-body-small"
        placeholder="Me pergunte qualquer coisa..."
        type="text"
        @focus="emit('focus')"
        @keydown.enter.prevent="emit('submit')"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >

      <button
        class="chat-composer__submit"
        :disabled="submitDisabled"
        type="submit"
        aria-label="Enviar mensagem"
      >
        <i class="ri-send-plane-2-line chat-composer__icon" />
      </button>
    </form>

    <p class="chat-page__disclaimer text-body-caption">
      Datagrapho usa IA. Portanto, cheque as respostas.
    </p>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    disabled: boolean
    modelValue: string
    submitDisabled: boolean
  }>()

  const emit = defineEmits<{
    (e: 'focus'): void
    (e: 'submit'): void
    (e: 'update:modelValue', value: string): void
  }>()
</script>

<style scoped>
  .chat-page__composer-wrap {
    position: absolute;
    bottom: var(--df-space-sm);
    left: 50%;
    display: flex;
    width: min(calc(100% - 32px), var(--chat-content-width, 760px));
    transform: translateX(-50%);
    flex-direction: column;
    gap: var(--df-space-sm);
    z-index: 4;
    transition:
      bottom 620ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 620ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .chat-page__composer-wrap::before {
    content: '';
    position: absolute;
    z-index: -1;
    top: -84px;
    right: -16px;
    bottom: -12px;
    left: -16px;
    background: linear-gradient(
      180deg,
      rgba(var(--v-theme-surface-variant), 0) 0%,
      rgba(var(--v-theme-surface-variant), 0.82) 40%,
      rgb(var(--v-theme-surface-variant)) 70%
    );
    pointer-events: none;
  }

  .chat-composer {
    display: flex;
    width: 100%;
    min-height: 62px;
    align-items: center;
    gap: var(--df-space-sm);
    padding: 13px 17px;
    border: 1px solid rgb(var(--v-theme-grey-lighten-3));
    border-radius: var(--df-radius-base);
    background: rgb(var(--v-theme-surface));
    box-shadow: var(--df-shadow-chat-composer);
    transition:
      border-color 280ms ease,
      box-shadow 280ms ease,
      transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .chat-composer__leading {
    color: rgb(var(--v-theme-on-surface));
    opacity: 0.72;
  }

  .chat-composer__icon {
    font-size: 20px;
    line-height: 1;
  }

  .chat-composer__input {
    min-width: 0;
    flex: 1 1 auto;
    border: 0;
    outline: 0;
    color: rgb(var(--v-theme-on-surface));
    background: transparent;
    line-height: 20px;
  }

  .chat-composer__input::placeholder {
    color: rgba(var(--v-theme-on-surface), 0.65);
  }

  .chat-composer__submit {
    display: inline-flex;
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border: 0;
    border-radius: var(--df-radius-base);
    color: rgb(var(--v-theme-on-primary));
    background: var(--df-gradient-brand-primary-secondary);
    cursor: pointer;
    transition:
      opacity 260ms ease,
      transform 260ms ease;
  }

  .chat-composer__submit .chat-composer__icon {
    font-size: 18px;
  }

  .chat-composer__submit:disabled {
    cursor: default;
    opacity: 0.42;
  }

  .chat-composer__submit:not(:disabled):hover {
    transform: translateY(-1px);
  }

  .chat-page__disclaimer {
    margin: 0;
    color: rgba(var(--v-theme-on-surface-variant), 0.9);
    text-align: center;
  }
</style>
