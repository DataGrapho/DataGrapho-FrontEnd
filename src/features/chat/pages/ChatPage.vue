<template>
  <section
    class="chat-page"
    :class="[`chat-page--${interfaceState}`]"
  >
    <div
      ref="scrollContainer"
      class="chat-page__scroll"
      @scroll="updateScrollMetrics"
    >
      <Transition name="chat-welcome">
        <div
          v-if="isInitial"
          class="chat-page__welcome"
        >
          <h1 class="chat-page__title text-display-h2">
            O que podemos analisar hoje?
          </h1>
        </div>
      </Transition>

      <ChatMessageList :messages="messages" />
    </div>

    <ChatComposer
      v-model="draft"
      :disabled="isResponding"
      :submit-disabled="!canSend"
      @focus="handleComposerFocus"
      @submit="sendMessage"
    />
  </section>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
  import ChatComposer from '@/features/chat/components/conversation/ChatComposer.vue'
  import ChatMessageList from '@/features/chat/components/conversation/ChatMessageList.vue'
  import { useChatMessages } from '@/features/chat/composables/useChatMessages'
  import { useChatScroll } from '@/features/chat/composables/useChatScroll'
  import type { ChatInterfaceState } from '@/features/chat/types/chat.types'

  const draft = ref('')
  const inputFocused = ref(false)
  const scrollContainer = ref<HTMLElement | null>(null)
  const { activeChatId, messages, isResponding, refreshChats, sendUserMessage, setActiveChat, setViewport, syncSessionState } = useChatMessages()

  const { isExploring, resetScrollIntent, scrollMessageToTop, updateMetrics: updateScrollMetrics } = useChatScroll(scrollContainer)

  const isInitial = computed(() => messages.value.length === 0)
  const canSend = computed(() => draft.value.trim().length > 0 && !isResponding.value)
  const interfaceState = computed<ChatInterfaceState>(() => {
    if (isInitial.value) return 'initial'
    if (isExploring.value) return 'exploring'
    if (isResponding.value || inputFocused.value) return 'interacting'
    return 'expanded'
  })

  function handleComposerFocus () {
    inputFocused.value = true
  }

  function syncViewportFromWindow () {
    const width = window.innerWidth
    if (width < 640) setViewport('mobile')
    else if (width < 1024) setViewport('tablet')
    else setViewport('desktop')
    syncSessionState()
  }

  async function sendMessage () {
    const content = draft.value.trim()

    if (!content || isResponding.value) return

    resetScrollIntent()
    draft.value = ''
    const userMessageId = await sendUserMessage(content)
    await nextTick()
    await scrollMessageToTop(userMessageId, { behavior: 'auto' })
    window.requestAnimationFrame(() => {
      void scrollMessageToTop(userMessageId, { behavior: 'auto' })
    })
    syncSessionState()
  }

  onMounted(() => {
    syncViewportFromWindow()
    window.addEventListener('resize', syncViewportFromWindow)
    void refreshChats()
    if (!activeChatId.value) {
      setActiveChat(null)
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', syncViewportFromWindow)
  })
</script>

<style scoped>
  .chat-page {
    --chat-top-padding: 40px;
    --chat-bottom-padding: 196px;
    --chat-content-width: 760px;

    position: relative;
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    height: 100%;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
    border-radius: var(--df-radius-md);
    background: rgb(var(--v-theme-surface-variant));
  }

  .chat-page__scroll {
    display: flex;
    width: min(100%, var(--chat-content-width));
    min-height: 0;
    flex: 1 1 auto;
    flex-direction: column;
    overflow-y: auto;
    padding: var(--chat-top-padding) 0 var(--chat-bottom-padding);
    scrollbar-width: none;
  }

  .chat-page__scroll::-webkit-scrollbar {
    display: none;
  }

  .chat-page--initial .chat-page__scroll {
    justify-content: center;
    padding: 0 0 96px;
    overflow: hidden;
  }

  .chat-page__welcome {
    display: flex;
    width: 100%;
    justify-content: center;
    padding-bottom: var(--df-space-sm);
  }

  .chat-page__title {
    margin: 0;
    color: rgb(var(--v-theme-on-surface));
    font-size: 2rem;
    font-weight: 400;
    line-height: 2.5rem;
    text-align: center;
  }

  .chat-page :deep(.chat-page__messages) {
    gap: var(--df-space-lg);
  }

  .chat-page--initial :deep(.chat-page__composer-wrap) {
    bottom: calc(50% - 80px);
  }

  .chat-welcome-enter-active {
    transition:
      opacity 520ms ease,
      transform 620ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .chat-welcome-enter-from {
    opacity: 0;
    transform: translateY(-28px);
  }

  .chat-welcome-leave-active {
    transition: none;
  }

  .chat-welcome-leave-to {
    opacity: 0;
    transform: none;
  }

  @media (max-width: 900px) {
    .chat-page {
      --chat-content-width: 100%;
      min-height: calc(100dvh - 132px);
    }

    .chat-page__scroll {
      min-height: calc(100dvh - 132px);
      padding-right: var(--df-space-md);
      padding-left: var(--df-space-md);
    }

    .chat-page__title {
      font-size: 1.5rem;
      line-height: 2rem;
    }

    .chat-page {
      --chat-bottom-padding: 220px;
    }

    .chat-page--initial :deep(.chat-page__composer-wrap) {
      top: 56%;
      bottom: auto;
      transform: translate(-50%, -50%);
    }
  }
</style>

