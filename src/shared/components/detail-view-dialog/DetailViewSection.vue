<template>
  <section class="detail-view-section">
    <header class="detail-view-section__head">
      <div class="detail-view-section__title-row">
        <span class="detail-view-section__icon" aria-hidden="true">
          <Icon :name="icon" :size="16" />
        </span>
        <h3 class="detail-view-section__title text-label-large">
          {{ title }}
        </h3>
      </div>
      <span
        v-if="count !== undefined"
        class="detail-view-section__count text-body-caption"
      >
        {{ countLabel }}
      </span>
    </header>

    <div class="detail-view-section__body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps<{
    title: string
    icon: string
    count?: number
  }>()

  const countLabel = computed(() => {
    if (props.count === undefined) return ''
    return props.count === 1 ? '1 item' : `${props.count} itens`
  })
</script>

<style scoped lang="scss">
  @use '@/shared/styles/detail-view-dialog' as detail;

  .detail-view-section {
    @include detail.detail-view-section-card;
  }

  .detail-view-section__head {
    @include detail.detail-view-section-head;
  }

  .detail-view-section__title-row {
    @include detail.detail-view-section-title-row;
  }

  .detail-view-section__icon {
    @include detail.detail-view-section-icon;
  }

  .detail-view-section__title {
    @include detail.detail-view-section-title;
  }

  .detail-view-section__count {
    @include detail.detail-view-section-count;
  }

  .detail-view-section__body {
    display: grid;
    gap: 8px;
    min-width: 0;
  }
</style>
