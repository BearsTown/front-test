<template>
  <span class="result-select" :class="selected ? 'is-selected' : 'is-unselected'">
    {{ selected ? '선택' : '미선택' }}
  </span>
</template>
<script setup>
defineProps({ selected: { type: Boolean, required: true } })
</script>
<style lang="scss" scoped>
.result-select {
  font-size: $font-size-xs; font-weight: 600;
  &.is-selected   { color: $color-primary; }
  &.is-unselected { color: $color-text-disabled; }
}
</style>
