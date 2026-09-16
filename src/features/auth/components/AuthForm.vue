<template>
  <v-form class="auth-form" @submit.prevent="$emit('submit')">
    <slot />
  </v-form>
</template>

<script lang="ts" setup>
  defineEmits<{
    submit: []
  }>()
</script>

<style scoped>
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: var(--df-space-md);
  }
</style>
