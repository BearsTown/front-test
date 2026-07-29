<template>
  <div class="step2-body">

    <!-- 개발계획 / 실시계획 selector -->
    <div class="plan-type-section">
      <button
        v-for="t in PLAN_TYPES"
        :key="t.value"
        class="plan-type-btn"
        :class="{ 'plan-type-btn--active': planType === t.value }"
        @click="selectPlanType(t.value)"
      >
        <span class="plan-type-btn__label">{{ t.label }}</span>
        <v-icon size="16" class="plan-type-btn__icon">mdi-chevron-down</v-icon>
      </button>
    </div>

    <!-- 섹션 제목 -->
    <div class="eval-section-header">② 녹색도시 개발계획 평가</div>

    <!-- 로딩 -->
    <div v-if="loading" class="eval-loading">
      <v-progress-circular size="20" width="2" indeterminate color="#256EF4" />
      <span>항목 불러오는 중...</span>
    </div>

    <!-- 평가항목 전체 리스트 (planType 필터 없음) -->
    <template v-else>
      <div
        v-for="section in allSections"
        :key="section.key"
        class="eval-group"
      >
        <p class="eval-group__title">{{ section.title }}</p>
        <div class="weight-grid">
          <button
            v-for="(item, idx) in section.items"
            :key="item.code"
            type="button"
            class="weight-card"
            :class="{
              'weight-card--full':     isFullWidth(section.items, idx),
              'weight-card--selected': isSelected(item.code),
              'weight-card--disabled': !item.사용여부,
            }"
            :disabled="!item.사용여부"
            @click="toggle(item)"
          >
            <div class="weight-card__left">
              <v-icon size="16" class="weight-card__icon">{{ item.icon }}</v-icon>
              <span class="weight-card__label">{{ item.title }}</span>
            </div>
            <span class="weight-card__value">{{ item.weight }}</span>
          </button>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useScenarioStore } from '@/stores/scenario'
import { fetchPlanEvaluationItems } from '@/api/planEvaluationApi'

const props = defineProps({
  planId: { type: String, required: true },
})

const scenarioStore = useScenarioStore()

// ── 계획 타입 selector ────────────────────────────────────────
const PLAN_TYPES = [
  { value: 'development',    label: '개발계획' },
  { value: 'implementation', label: '실시계획' },
]

const planType = computed(() => scenarioStore.plans[props.planId]?.planType ?? '')

function selectPlanType(value) {
  scenarioStore.setPlanType(props.planId, value)
}

// ── 섹션 메타 ─────────────────────────────────────────────────
const SECTION_META = [
  { key: 'carbon_absorption', title: '1) 탄소흡수 평가항목 및 가중치' },
  { key: 'carbon_reduction',  title: '2) 탄소저감 평가항목 및 가중치' },
  { key: 'qualitative',       title: '3) 정성평가 항목 및 가중치' },
]

// ── 항목 데이터 (API) ──────────────────────────────────────────
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

// ── 전체 섹션 (planType 필터 없이 category로만 그룹화) ─────────
const allSections = computed(() =>
  SECTION_META
    .map(sec => ({
      ...sec,
      items: allItems.value
        .filter(item => item.category === sec.key)
        .sort((a, b) =>
          a.type !== b.type
            ? (a.type === 'development' ? -1 : 1)
            : a.priority - b.priority
        ),
    }))
    .filter(sec => sec.items.length > 0)
)

// ── 토글 선택 ────────────────────────────────────────────────
const selectedCodes = computed(
  () => scenarioStore.plans[props.planId]?.selectedEvalItems ?? []
)

function isSelected(code) {
  return selectedCodes.value.includes(code)
}

function toggle(item) {
  if (!item.사용여부) return
  scenarioStore.toggleEvalItem(props.planId, item.code)
}

// ── 마지막 홀수 항목 → full-width ─────────────────────────────
function isFullWidth(items, idx) {
  return items.length % 2 === 1 && idx === items.length - 1
}
</script>

<style lang="scss" scoped>
.step2-body {
  display: flex;
  flex-direction: column;
}

// ── 개발계획/실시계획 selector ─────────────────────────────────
.plan-type-section {
  display: flex;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid #f1f1f1;
}

.plan-type-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #d5d5d5;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color var(--transition-fast), background var(--transition-fast);

  &:hover:not(&--active) {
    border-color: #b0b0b0;
    background: #fafafa;
  }

  &--active {
    border-color: #256EF4;
    background: #ecf2fe;

    .plan-type-btn__label { color: #256EF4; font-weight: var(--fw-semibold); }
    .plan-type-btn__icon  { color: #256EF4; }
  }

  &__label {
    font-size: 14px;
    font-weight: var(--fw-medium);
    color: #27364b;
    letter-spacing: -0.14px;
    white-space: nowrap;
  }

  &__icon { color: #8f8f8f; }
}

// ── 섹션 제목 ───────────────────────────────────────────────────
.eval-section-header {
  height: 42px;
  padding: 0 20px;
  background: #f7f7f7;
  border-bottom: 1px solid #f1f1f1;
  font-size: 16px;
  font-weight: var(--fw-bold);
  color: #262626;
  letter-spacing: -0.16px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

// ── 로딩 ────────────────────────────────────────────────────────
.eval-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
  font-size: 13px;
  color: #8f8f8f;
}

// ── 평가 그룹 ───────────────────────────────────────────────────
.eval-group {
  padding: 20px;
  border-bottom: 1px solid #f1f1f1;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__title {
    font-size: 14px;
    font-weight: var(--fw-medium);
    color: #8f8f8f;
    letter-spacing: -0.28px;
  }
}

// ── 가중치 그리드 ────────────────────────────────────────────────
.weight-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

// ── 가중치 카드 (버튼) ──────────────────────────────────────────
.weight-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(50% - 6px);
  min-height: 35px;
  padding: 8px 14px;
  background: #f7f7f7;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-sizing: border-box;
  cursor: pointer;
  text-align: left;
  transition: border-color var(--transition-fast), background var(--transition-fast);

  &:hover:not(&--selected) {
    border-color: #b0b0b0;
    background: #efefef;
  }

  &--full { width: 100%; }

  // 선택된 상태
  &--selected {
    border-color: #256EF4;
    background: #ecf2fe;

    .weight-card__icon  { color: #256EF4; }
    .weight-card__label { color: #256EF4; font-weight: var(--fw-semibold); }
    .weight-card__value { color: #256EF4; font-weight: var(--fw-semibold); }
  }

  // 사용불가 상태 (사용여부: false)
  &--disabled {
    //background: #f7f7f7;
    //border-color: #e5e5e5;
    cursor: not-allowed;
    //opacity: 0.45;

    &:hover { border-color: #e5e5e5; background: #f7f7f7; }

    //.weight-card__icon,
    //.weight-card__label,
    //.weight-card__value { color: #b0b0b0; }
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    flex: 1;
  }

  &__icon {
    color: #262626;
    flex-shrink: 0;
    transition: color var(--transition-fast);
  }

  &__label {
    font-size: 14px;
    font-weight: var(--fw-medium);
    color: #262626;
    letter-spacing: -0.28px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color var(--transition-fast);
  }

  &__value {
    font-size: 14px;
    font-weight: var(--fw-medium);
    color: #262626;
    letter-spacing: -0.28px;
    flex-shrink: 0;
    margin-left: 8px;
    transition: color var(--transition-fast);
  }
}
</style>
