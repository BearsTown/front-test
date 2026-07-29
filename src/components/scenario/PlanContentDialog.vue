<template>
  <div class="plan-cd">

    <!-- 헤더 -->
    <div class="plan-cd__header">
      <h3 class="plan-cd__title">{{ title }}</h3>
      <button class="plan-cd__close" @click="$emit('close')">
        <v-icon size="24">mdi-close</v-icon>
      </button>
    </div>

    <!-- 콘텐츠 -->
    <div class="plan-cd__content">
      <!-- 데이터관리 버튼 (우상단 고정, showManage=false이면 숨김) -->
      <div v-if="showManage" class="plan-cd__toolbar">
        <button class="plan-cd__manage" @click="$emit('manage')">
          <span>데이터관리</span>
          <v-icon size="12">mdi-harddisk</v-icon>
        </button>
      </div>
      <!-- 각 다이얼로그 콘텐츠 슬롯 -->
      <slot />
    </div>

    <!-- 푸터: 슬롯 제공 시 커스텀 버튼 영역, 미제공 시 20px 여백 -->
    <div class="plan-cd__footer" :class="{ 'plan-cd__footer--empty': !$slots.footer }">
      <slot name="footer" />
    </div>

  </div>
</template>

<script setup>
defineProps({
  title:       { type: String,  required: true },
  showManage:  { type: Boolean, default: true },
})
defineEmits(['close', 'manage'])
</script>

<style lang="scss" scoped>
// ── 다이얼로그 쉘 ──────────────────────────────────────
.plan-cd {
  //width: 550px;
  width: auto;
  min-width: 550px;
  max-height: calc(100vh - 32px);
  background: $color-white;
  border-radius: 20px;
  box-shadow: 2px 0 24px 0 rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// ── 헤더 ─────────────────────────────────────────────
.plan-cd__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 1px solid #eaeaea;
  height: 66px;
  flex-shrink: 0;
}

.plan-cd__title {
  flex: 1;
  font-size: 16px;
  font-weight: $font-weight-bold;
  color: #333;
  letter-spacing: -0.32px;
}

.plan-cd__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  cursor: pointer;
  color: $color-gray-500;
  border-radius: $radius-full;
  flex-shrink: 0;
  transition: background $transition-fast;

  &:hover { background: $color-gray-100; }
}

// ── 콘텐츠 영역 ──────────────────────────────────────
.plan-cd__content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px;
  min-height: 0;

  &::-webkit-scrollbar       { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: #d5d5d5;
    border-radius: 100px;
  }
}

// ── 데이터관리 툴바 ───────────────────────────────────
.plan-cd__toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.plan-cd__manage {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 0 12px;
  background: $color-white;
  border: 1px solid #e7e7e7;
  border-radius: $radius-full;
  font-size: 12px;
  font-weight: $font-weight-semibold;
  color: #256EF4;
  letter-spacing: -0.24px;
  cursor: pointer;
  white-space: nowrap;
  transition: background $transition-fast;

  &:hover { background: #ECF2FE; }
}

// ── 푸터 ──────────────────────────────────────────────
.plan-cd__footer {
  flex-shrink: 0;

  &--empty {
    height: 20px;
  }
}
</style>
