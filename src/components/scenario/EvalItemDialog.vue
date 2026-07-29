<template>
  <div class="eval-cd">

    <!-- 헤더 -->
    <div class="eval-cd__header">
      <span class="eval-cd__title">{{ item?.title ?? '-' }}</span>
      <button class="eval-cd__close" @click="emit('close')">
        <v-icon size="24">mdi-close</v-icon>
      </button>
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="eval-cd__loading">
      <v-progress-circular size="20" width="2" indeterminate color="#256EF4" />
    </div>

    <!-- 항목별 Body (동적 컴포넌트) -->
    <div v-else class="eval-cd__body">
      <component
        :is="bodyComponent"
        :plan-id="planId"
        :item-code="itemCode"
        :item="item"
        :saved-result="savedResult"
        @update:result="currentResult = $event"
      />
    </div>

    <!-- 푸터 -->
    <div class="eval-cd__footer">
      <div class="eval-cd__footer-left" />
      <div class="eval-cd__footer-right">
        <button class="btn btn--cancel" @click="emit('close')">취소</button>
        <button
          class="btn btn--confirm"
          :class="{ 'btn--confirm-active': currentResult != null }"
          :disabled="currentResult == null"
          @click="onConfirm"
        >확인</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useScenarioStore } from '@/stores/scenario'
import { fetchPlanEvaluationItems } from '@/api/planEvaluationApi'
import { getEvalBodyComponent } from './evalItemRegistry.js'

const props = defineProps({
  planId:   { type: String, required: true },
  itemCode: { type: String, default: null },
})
const emit = defineEmits(['close'])

const scenarioStore = useScenarioStore()

// ── 항목 메타 로딩 (헤더 title용) ─────────────────
const allItems = ref([])
const loading  = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    allItems.value = await fetchPlanEvaluationItems()
  } finally {
    loading.value = false
  }
})

const item = computed(() =>
  allItems.value.find(i => i.code === props.itemCode) ?? null
)

// ── Body 컴포넌트 선택 (registry 참조) ────────────
const bodyComponent = computed(() => getEvalBodyComponent(props.itemCode))

// ── 기존 저장 결과 (Body에 전달 → 복원용) ──────────
const savedResult = computed(() =>
  scenarioStore.plans[props.planId]?.evalResults?.[props.itemCode] ?? null
)

// ── Body가 emit한 결과 수신 ────────────────────────
const currentResult = ref(null)

// ── 확인: store 저장 후 닫기 ──────────────────────
function onConfirm() {
  if (!currentResult.value) return
  scenarioStore.setEvalResult(props.planId, props.itemCode, currentResult.value)
  emit('close')
}
</script>

<style lang="scss" scoped>
// ── Shell 구조 ──────────────────────────────────────
.eval-cd {
  width: 550px;
  max-height: calc(100vh - 32px);
  background: #fff;
  border-radius: 20px;
  box-shadow: 2px 0 24px 0 rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// ── 헤더 ───────────────────────────────────────────
.eval-cd__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 1px solid #eaeaea;
  height: 62px;
  flex-shrink: 0;
}

.eval-cd__title {
  flex: 1;
  font-size: 16px;
  font-weight: var(--fw-bold);
  color: #333;
  letter-spacing: -0.32px;
}

.eval-cd__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  cursor: pointer;
  color: #8f8f8f;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background var(--transition-fast);

  &:hover { background: #f3f3f3; }
}

// ── 로딩 ────────────────────────────────────────────
.eval-cd__loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

// ── Body 컨테이너 ────────────────────────────────────
// Body 컴포넌트들이 공통으로 사용하는 구조 클래스는 :deep()으로 일괄 정의
.eval-cd__body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;

  &::-webkit-scrollbar       { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #d5d5d5; border-radius: 100px; }

  // ── Body 공통 레이아웃 클래스 ──────────────────
  :deep(.eval-section) {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 16px 20px;
  }

  :deep(.eval-section__head) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 3px;
  }

  :deep(.eval-section__label) {
    font-size: 14px;
    font-weight: var(--fw-medium);
    color: #333;
    letter-spacing: -0.28px;
    line-height: 18px;
  }

  :deep(.eval-divider) {
    height: 0;
    border-top: 1px dashed #d5d5d5;
    flex-shrink: 0;
    margin: 0 20px;
  }

  // ── :deep() 안에서는 BEM &--suffix 사용 불가 → 선택자 명시 작성 ──

  // 데이터선택 버튼
  :deep(.btn-data-select) {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 30px;
    padding: 0 12px;
    background: #fff;
    border: 1px solid #e7e7e7;
    border-radius: 16px;
    font-size: 12px;
    font-weight: var(--fw-semibold);
    color: #256EF4;
    letter-spacing: -0.24px;
    cursor: pointer;
    white-space: nowrap;
    transition: background var(--transition-fast);
  }
  :deep(.btn-data-select:hover) { background: #ecf2fe; }

  // 산정 버튼
  :deep(.btn-calc) {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    padding: 0 12px;
    background: #d5d5d5;
    border: 1px solid #e7e7e7;
    border-radius: 8px;
    font-size: 12px;
    font-weight: var(--fw-semibold);
    color: #fff;
    letter-spacing: -0.24px;
    cursor: not-allowed;
    white-space: nowrap;
    transition: background var(--transition-fast);
  }
  :deep(.btn-calc--active) {
    background: #256EF4;
    border-color: #256EF4;
    cursor: pointer;
  }
  :deep(.btn-calc--active:hover) { background: #1a5bd4; }

  // 섹션1 데이터 테이블
  :deep(.data-table)         { border-radius: 6px; overflow: hidden; }
  :deep(.data-table__head)   { display: flex; background: #f5f5f5; border: 1px solid #e8e8e8; height: 34px; }
  :deep(.data-table__hcell)  {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 7px;
    font-size: 12px;
    font-weight: var(--fw-medium);
    color: #6e6e6e;
  }
  :deep(.data-table__empty) {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    font-size: 13px;
    color: #999;
    border: 1px solid #e8e8e8;
    border-top: none;
    border-radius: 0 0 6px 6px;
  }
  :deep(.data-table__row) {
    display: flex;
    border-bottom: 1px solid #e8e8e8;
    border-left: 1px solid #e8e8e8;
    border-right: 1px solid #e8e8e8;
  }
  :deep(.data-table__row--total) {
    background: #e9f1fe;
    border-top: 1px solid #e8e8e8;
    border-bottom: none;
  }
  :deep(.data-table__cell) {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 10px 12px;
    font-size: 12px;
    font-weight: var(--fw-medium);
    color: #373737;
    letter-spacing: -0.24px;
    border-right: 1px solid #e8e8e8;
  }
  :deep(.data-table__cell:last-child)    { border-right: none; }
  :deep(.data-table__cell--land)         { justify-content: center; }
  :deep(.data-table__cell--num)          { justify-content: flex-end; }
  :deep(.data-table__cell--total-label)  { justify-content: center; font-weight: var(--fw-semibold); }
  :deep(.data-table__cell--total-num)    { justify-content: flex-end; font-weight: var(--fw-semibold); }

  // 섹션2 결과 테이블
  :deep(.result-table)           { width: 100%; border-collapse: collapse; table-layout: fixed; }
  :deep(.col-score)              { width: 55px; }
  :deep(.result-table__head-row) { background: #f5f5f5; border: 1px solid #e8e8e8; height: 34px; }
  :deep(.result-table__th) {
    padding: 0 5px;
    font-size: 12px;
    font-weight: var(--fw-medium);
    color: #6e6e6e;
    text-align: center;
    vertical-align: middle;
    border-right: 1px solid #e8e8e8;
  }
  :deep(.result-table__th:last-child) { border-right: none; }
  :deep(.result-table__body-row)      { background: #fff; border: 1px solid #e8e8e8; height: 57px; }
  :deep(.result-table__td)            { padding: 0 5px; vertical-align: middle; border-right: 1px solid #e8e8e8; }
  :deep(.result-table__td:last-child) { border-right: none; }
  :deep(.result-table__td--val) {
    text-align: center;
    font-size: 14px;
    font-weight: var(--fw-bold);
    color: #256EF4;
    letter-spacing: -0.28px;
  }

  // 입력 필드 — 수동 입력 상태 강조
  :deep(.eval-field--manual) {
    border-color: #256EF4;
    background: #f0f6ff;
  }

  // 입력 필드 — API 기본값 로딩 중
  :deep(.eval-field--loading) {
    background: #f7f7f7;
    border-color: #e0e0e0;
    opacity: 0.7;
  }

  :deep(.eval-field) {
    display: flex;
    align-items: center;
    width: 100%;
    height: 32px;
    padding: 0 12px;
    background: #fff;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    gap: 5px;
  }
  :deep(.eval-field__input) {
    flex: 1;
    min-width: 0;
    background: none;
    border: none;
    outline: none;
    font-size: 12px;
    font-weight: var(--fw-semibold);
    color: #373737;
    text-align: right;
    letter-spacing: -0.24px;
    -moz-appearance: textfield;
  }
  :deep(.eval-field__input::-webkit-outer-spin-button),
  :deep(.eval-field__input::-webkit-inner-spin-button) { -webkit-appearance: none; }
  :deep(.eval-field__unit) {
    flex-shrink: 0;
    font-size: 14px;
    color: #929292;
    letter-spacing: -0.28px;
  }
}

// ── 푸터 ────────────────────────────────────────────
.eval-cd__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 66px;
  padding: 0 20px;
  border-top: 1px solid #e5e5e5;
  flex-shrink: 0;

  &-left  { flex: 1; }
  &-right { display: flex; align-items: center; gap: 10px; }
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 34px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: var(--fw-semibold);
  letter-spacing: -0.24px;
  cursor: pointer;
  transition: all var(--transition-fast);

  &--cancel {
    background: #fff;
    border: 1px solid #e7e7e7;
    color: #656565;
    &:hover { background: #f7f7f7; }
  }

  &--confirm {
    background: #d5d5d5;
    border: 1px solid #e7e7e7;
    color: #fff;
    cursor: not-allowed;

    &-active {
      background: #256EF4;
      border-color: #256EF4;
      cursor: pointer;
      &:hover { background: #1a5bd4; }
    }
  }
}
</style>
