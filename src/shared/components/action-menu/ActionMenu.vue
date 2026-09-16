<template>
  <v-menu location="bottom end">
    <template #activator="{ props: menuProps }">
      <slot name="activator" :props="menuProps">
        <v-btn
          density="compact"
          icon="mdi-dots-horizontal"
          :title="title"
          variant="text"
          v-bind="menuProps"
        />
      </slot>
    </template>

    <v-list class="action-menu" density="compact" min-width="160" slim>
      <v-list-item
        v-for="item in items"
        :key="item.value"
        :title="item.label"
        @click="emit('select', item.value)"
      >
        <template v-if="item.icon" #prepend>
          <v-icon :icon="item.icon" size="16" />
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
  export type ActionMenuItem = {
    label: string
    value: string
    icon?: string
  }

  withDefaults(defineProps<{
    items: ActionMenuItem[]
    title?: string
  }>(), {
    title: 'Ações',
  })

  const emit = defineEmits<{
    select: [value: string]
  }>()
</script>

<style>
  .action-menu .v-list-item-title {
    font-family: var(--df-font-body);
    font-size: 0.875rem;
    line-height: 1.25rem;
    letter-spacing: 0;
  }

  .action-menu .v-list-item__prepend {
    width: auto;
    min-width: 0;
    margin-inline-end: 6px;
  }

  .action-menu .v-list-item__prepend > .v-icon {
    margin-inline-end: 0;
    opacity: 0.9;
  }
</style>
