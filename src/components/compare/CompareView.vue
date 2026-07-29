<template>
  <div class="compare-view">

    <!-- 상단 헤더 -->
    <div class="cv-header">
      <h1 class="cv-header__title">녹색도시 개발계획 평가 시뮬레이션</h1>
      <button class="cv-print-btn">
        <v-icon size="13">mdi-printer-outline</v-icon>
        출력하기
      </button>
    </div>

    <!-- 카드 영역 (스크롤) -->
    <div class="cv-body">
      <div class="cv-cards">
        <PlanCompareCard
          v-for="planId in ['1', '2', '3']"
          :key="planId"
          :plan-id="planId"
        />
      </div>
    </div>

  </div>
</template>

<script setup>
import PlanCompareCard from './PlanCompareCard.vue'
</script>

<style lang="scss" scoped>
.compare-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: $color-white;
}

// ── 헤더 ──────────────────────────────────────────────
.cv-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-h);
  padding: 0 20px;
  background: $color-white;
  border-bottom: 1px solid #eaeaea;

  &__title {
    font-size: var(--fs-2xl);
    font-weight: var(--fw-bold);
    color: var(--color-text-title);
    letter-spacing: var(--ls-tight);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 8px;
  }
}

.cv-print-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  background: #256ef4;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: $font-weight-medium;
  color: $color-white;
  letter-spacing: -0.26px;
  cursor: pointer;
  transition: background $transition-fast;

  &:hover { background: #1a5fd8; }
}

// ── 카드 영역 ─────────────────────────────────────────
.cv-body {
  flex: 1;
  overflow: auto;
  background: #f5f5f5;

  &::-webkit-scrollbar       { width: 5px; height: 5px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: #c8c8c8;
    border-radius: 100px;
    &:hover { background: #a0a0a0; }
  }
}

.cv-cards {
  display: flex;
  gap: 20px;
  padding: 10px;
  align-items: flex-start;
  min-height: 100%;
}
</style>
