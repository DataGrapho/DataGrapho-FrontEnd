<template>
  <li
    class="detail-view-list-item"
    :class="{ 'detail-view-list-item--clickable': clickable }"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    @click="handleClick"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <span
      v-if="icon"
      class="detail-view-list-item__icon"
      aria-hidden="true"
    >
      <Icon :name="icon" :size="18" />
    </span>

    <div class="detail-view-list-item__content">
      <p class="detail-view-list-item__title text-body-small">
        {{ title }}
      </p>
      <p
        v-if="subtitle"
        class="detail-view-list-item__subtitle text-body-caption"
      >
        {{ subtitle }}
      </p>
    </div>

    <div class="detail-view-list-item__meta">
      <DataTableStatusChip
        v-if="showStatus"
        :active="active"
      />
      <Icon
        v-if="showChevron"
        name="arrow-right-s-line"
        :size="18"
      />
    </div>
  </li>
</template>

<script setup lang="ts">
  import DataTableStatusChip from '@/features/datatable/components/DataTableStatusChip.vue'

  const props = withDefaults(defineProps<{
    title: string
    subtitle?: string
    icon?: string
    active?: boolean
    showStatus?: boolean
    showChevron?: boolean
    clickable?: boolean
  }>(), {
    subtitle: '',
    icon: '',
    active: true,
    showStatus: true,
    showChevron: true,
    clickable: false,
  })

  const emit = defineEmits<{
    click: []
  }>()

  function handleClick() {
    if (!props.clickable) return
    emit('click')
  }
</script>

<style scoped lang="scss">
  @use '@/shared/styles/detail-view-dialog' as detail;

  .detail-view-list-item {
    @include detail.detail-view-list-item;
  }

  .detail-view-list-item__icon {
    @include detail.detail-view-list-item-icon;
  }

  .detail-view-list-item__content {
    @include detail.detail-view-list-item-content;
  }

  .detail-view-list-item__title {
    @include detail.detail-view-list-item-title;
  }

  .detail-view-list-item__subtitle {
    @include detail.detail-view-list-item-subtitle;
  }

  .detail-view-list-item__meta {
    @include detail.detail-view-list-item-meta;
  }

  .detail-view-list-item--clickable {
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;

    &:hover,
    &:focus-visible {
      border-color: rgba(var(--v-theme-primary), 0.35);
      background: rgba(var(--v-theme-primary), 0.04);
      outline: none;
    }
  }
</style>
