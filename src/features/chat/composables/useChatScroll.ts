import { computed, nextTick, ref, type Ref } from 'vue'
import type { ChatScrollDirection } from '@/features/chat/types/chat.types'

const BOTTOM_THRESHOLD = 48

export function useChatScroll (scrollElement: Ref<HTMLElement | null>) {
  const isAtBottom = ref(true)
  const isExploring = ref(false)
  const distanceFromTop = ref(0)
  const distanceFromBottom = ref(0)
  const scrollDirection = ref<ChatScrollDirection>('idle')
  const scrollVelocity = ref(0)

  let previousTop = 0
  let previousTime = performance.now()

  const compactness = computed(() => {
    const distance = Math.min(distanceFromTop.value, 180)
    return Number((distance / 180).toFixed(2))
  })

  const shouldAutoScroll = computed(() => isAtBottom.value && !isExploring.value)

  function updateMetrics () {
    const element = scrollElement.value

    if (!element) return

    const now = performance.now()
    const nextTop = element.scrollTop
    const delta = nextTop - previousTop
    const elapsed = Math.max(now - previousTime, 1)

    distanceFromTop.value = nextTop
    distanceFromBottom.value = Math.max(element.scrollHeight - element.clientHeight - nextTop, 0)
    isAtBottom.value = distanceFromBottom.value <= BOTTOM_THRESHOLD
    scrollDirection.value = delta > 1 ? 'down' : delta < -1 ? 'up' : 'idle'
    scrollVelocity.value = Math.abs(delta / elapsed)

    if (scrollDirection.value === 'up' && distanceFromTop.value > 24 && !isAtBottom.value) {
      isExploring.value = true
    }

    if (isAtBottom.value) {
      isExploring.value = false
    }

    previousTop = nextTop
    previousTime = now
  }

  async function scrollToBottom (options: ScrollToOptions = {}, force = false) {
    const element = scrollElement.value

    if (!element || (!force && !shouldAutoScroll.value)) return

    await nextTick()
    const targetTop = Math.max(element.scrollHeight - element.clientHeight, 0)

    element.scrollTo({
      top: targetTop,
      behavior: options.behavior ?? 'smooth',
    })
  }

  async function scrollToTop (options: ScrollToOptions = {}) {
    const element = scrollElement.value

    if (!element) return

    await nextTick()

    element.scrollTo({
      top: 0,
      behavior: options.behavior ?? 'smooth',
    })
  }

  async function scrollMessageToTop (messageId: string, options: ScrollToOptions = {}) {
    const element = scrollElement.value

    if (!element) return

    await nextTick()

    const messageElement = element.querySelector<HTMLElement>(`[data-message-id="${messageId}"]`)

    if (!messageElement) return

    element.scrollTo({
      top: Math.max(messageElement.offsetTop, 0),
      behavior: options.behavior ?? 'smooth',
    })
  }

  function resetScrollIntent () {
    isExploring.value = false
    isAtBottom.value = true
  }

  return {
    compactness,
    distanceFromBottom,
    distanceFromTop,
    isAtBottom,
    isExploring,
    resetScrollIntent,
    scrollDirection,
    scrollToBottom,
    scrollMessageToTop,
    scrollToTop,
    scrollVelocity,
    shouldAutoScroll,
    updateMetrics,
  }
}
