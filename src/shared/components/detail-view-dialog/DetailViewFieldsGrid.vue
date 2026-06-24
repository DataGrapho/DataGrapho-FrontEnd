<template>
  <dl class="detail-view-fields">
    <div
      v-for="field in fields"
      :key="field.key"
      class="detail-view-fields__cell"
    >
      <dt class="text-label-base">{{ field.label }}</dt>
      <dd class="text-body-small">
        <slot :name="`field-${field.key}`" :value="field.value">
          {{ formatValue(field.value) }}
        </slot>
      </dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
  export type DetailViewField = {
    key: string
    label: string
    value?: string | number | boolean | null
  }

  defineProps<{
    fields: DetailViewField[]
  }>()

  function formatValue(value: string | number | boolean | null | undefined) {
    if (value === null || value === undefined || value === '') return 'Nao informado'
    return String(value)
  }
</script>

<style scoped lang="scss">
  @use '@/shared/styles/detail-view-dialog' as detail;

  .detail-view-fields {
    @include detail.detail-view-fields-grid;
    margin: 0;
  }

  .detail-view-fields__cell {
    @include detail.detail-view-field-cell;
  }
</style>
