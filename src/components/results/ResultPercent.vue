<template>
  <span class="result-percent">
    {{ value }}<span class="result-percent__unit">%</span>
  </span>
</template>
<script setup>
defineProps({ value: { type: Number, required: true } })
</script>
<style lang="scss" scoped>
.result-percent {
  font-size: $font-size-sm; font-weight: 600; color: $color-text-dark;
  &__unit { font-size: $font-size-xs; font-weight: 500; color: $color-text-muted; margin-left: 1px; }
}
</style>
