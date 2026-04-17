<template>
  <span class="result-simple">{{ value }}</span>
</template>
<script setup>
defineProps({ value: { type: [Number, String], required: true } })
</script>
<style lang="scss" scoped>
.result-simple { font-size: $font-size-sm; font-weight: 600; color: $color-text-dark; }
</style>
