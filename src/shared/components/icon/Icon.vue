<template>
  <i
    :class="`ri-${name}`"
    :style="iconStyle"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = withDefaults(
    defineProps<{
      name: string
      size?: number | string
      color?: string
    }>(),
    {
      size: 20,
    },
  )

  const iconStyle = computed(() => ({
    fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
    color: props.color ?? 'inherit',
    lineHeight: '1',
  }))
</script>
