<template>
  <span class="result-multi">
    <span v-for="pair in pairs" :key="pair.label" class="result-multi__pair">
      <span class="result-multi__label">{{ pair.label }}</span>
      <span class="result-multi__value">{{ pair.value }}</span>
    </span>
  </span>
</template>
<script setup>
defineProps({ pairs: { type: Array, required: true } })
</script>
<style lang="scss" scoped>
.result-multi {
  display: flex; align-items: center; gap: 10px;
  &__pair  { display: flex; align-items: baseline; gap: 3px; }
  &__label { font-size: $font-size-xxs; font-weight: 500; color: $color-text-muted; white-space: nowrap; }
  &__value { font-size: $font-size-sm;  font-weight: 600; color: $color-text-dark;  white-space: nowrap; }
}
</style>
