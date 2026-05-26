<template>
  <div class="chat-loading-dots">
    <span class="chat-loading-dots__dot"></span>
    <span class="chat-loading-dots__dot"></span>
    <span class="chat-loading-dots__dot"></span>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
  .chat-loading-dots {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 12px 16px;
    max-width: 100%;
    overflow: hidden;
  }

  .chat-loading-dots__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgb(var(--v-theme-primary));
    animation: chat-loading-bounce 1.4s infinite ease-in-out both;
  }

  .chat-loading-dots__dot:nth-child(1) {
    animation-delay: -0.32s;
  }

  .chat-loading-dots__dot:nth-child(2) {
    animation-delay: -0.16s;
  }

  @keyframes chat-loading-bounce {
    0%, 80%, 100% {
      transform: scale(0.6);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
</style>
