<template>
  <v-chip
    :color="active ? 'success' : 'grey'"
    class="datatable-status"
    density="comfortable"
    size="small"
    variant="tonal"
  >
    {{ active ? 'Ativo' : 'Inativo' }}
  </v-chip>
</template>

<script setup lang="ts">
  defineProps<{
    active: boolean
  }>()
</script>

<style scoped>
  .datatable-status {
    min-width: 68px;
    justify-content: center;
    font-family: var(--df-font-body);
    font-weight: 700;
  }
</style>
