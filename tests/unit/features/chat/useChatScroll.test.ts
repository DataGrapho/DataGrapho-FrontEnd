import { describe, expect, it } from 'vitest'
import { useChatScroll } from '@/features/chat/composables/useChatScroll'
import { ref } from 'vue'

describe('comportamento de rolagem do chat', () => {
  it('mantem estado inicial estavel', () => {
    const el = ref<HTMLElement | null>(null)
    const state = useChatScroll(el)
    expect(state.isAtBottom.value).toBe(true)
  })
})
