<template>
  <TransitionGroup
    v-if="messages.length > 0"
    class="chat-page__messages"
    name="chat-message"
    tag="div"
  >
    <article
      v-for="message in messages"
      :key="message.id"
      :data-message-id="message.id"
      class="chat-message"
      :class="`chat-message--${message.role}`"
    >
      <div class="chat-message__bubble text-body-small">
        <ChatLoadingDots v-if="message.state === 'processing' && !message.content" />
        <p v-else>{{ message.content }}</p>
      </div>

      <p
        v-if="message.state === 'failed'"
        class="chat-message__error text-caption"
      >
        Falha ao processar resposta.
      </p>

      <div
        v-if="message.role === 'assistant' && message.state === 'completed'"
        class="chat-message__actions"
        aria-label="Acoes da resposta"
      >
        <ChatActionIconButton label="Copiar resposta" icon="file-copy-line" />
        <ChatActionIconButton label="Marcar como util" icon="thumb-up-line" />
        <ChatActionIconButton label="Marcar como nao util" icon="thumb-down-line" />
        <ChatActionIconButton label="Gerar novamente" icon="refresh-line" />
      </div>
    </article>
  </TransitionGroup>
</template>

<script setup lang="ts">
  import ChatActionIconButton from '@/features/chat/components/conversation/ChatActionIconButton.vue'
  import ChatLoadingDots from '@/features/chat/components/conversation/ChatLoadingDots.vue'
  import type { ChatMessage } from '@/features/chat/types/chat.types'

  defineProps<{
    messages: ChatMessage[]
  }>()

</script>

<style scoped>
  .chat-page__messages {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: var(--df-space-lg);
  }

  .chat-message {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: var(--df-space-sm);
  }

  .chat-message--user {
    align-items: flex-end;
  }

  .chat-message--assistant {
    align-items: flex-start;
  }

  .chat-message__bubble {
    max-width: 686px;
    color: rgb(var(--v-theme-on-surface));
  }

  .chat-message__bubble p {
    margin: 0;
    white-space: pre-wrap;
  }

  .chat-message--user .chat-message__bubble {
    max-width: 70%;
    padding: var(--df-space-sm);
    border-radius: var(--df-radius-md);
    background: rgb(var(--v-theme-grey-lighten-3));
  }

  .chat-message__actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .chat-message__error {
    margin: 0;
    color: rgb(var(--v-theme-error));
  }

  .chat-message-enter-active,
  .chat-message-leave-active {
    transition:
      opacity 520ms ease,
      transform 620ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .chat-message-enter-from,
  .chat-message-leave-to {
    opacity: 0;
    transform: translateY(22px);
  }

  @media (max-width: 900px) {
    .chat-message--user .chat-message__bubble,
    .chat-message__bubble {
      max-width: 100%;
    }
  }
</style>
