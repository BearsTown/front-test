<template>
  <div class="dashboard">
    <h1 class="page-title">대시보드</h1>
    <p class="page-desc">피그마 디자인을 확인 후 구성됩니다.</p>
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.dashboard {
  .page-title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $color-text-primary;
    margin-bottom: $spacing-2;
  }

  .page-desc {
    color: $color-text-secondary;
    font-size: $font-size-base;
  }
}
</style>
