<template>
  <div class="step3-body">

    <!-- 섹션 헤더: 제목 + planType 태그 -->
    <div class="step3-header">
      <span class="step3-header__title">녹색도시 개발계획 평가</span>
      <span v-if="planTypeLabel" class="plan-type-tag">{{ planTypeLabel }}</span>
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="loading-row">
      <v-progress-circular size="20" width="2" indeterminate color="#256EF4" />
      <span>항목 불러오는 중...</span>
    </div>

    <!-- 카테고리별 평가항목 (전체 출력, 선택 여부로 활성/비활성 구분) -->
    <template v-else>
      <div
        v-for="section in allSections"
        :key="section.key"
        class="eval-group"
      >
        <p class="eval-group__title">{{ section.title }}</p>

        <div
          v-for="item in section.items"
          :key="item.code"
          class="eval-card"
          :class="{
            'eval-card--active':       isCardActive(item.code),
            'eval-card--disabled':     !isSelected(item.code),
            'eval-card--qualitative':  item.category === 'qualitative' && isSelected(item.code),
          }"
          @click="isSelected(item.code) && item.category !== 'qualitative' && onCardClick(item)"
        >
          <!-- 좌: 아이콘 + 이름 -->
          <div class="eval-card__left">
            <v-icon size="16" class="eval-card__icon">{{ item.icon }}</v-icon>
            <span class="eval-card__label">{{ item.title }}</span>
          </div>

          <!-- 우: 점수 표시 박스 -->
          <div class="score-box" :class="{ 'score-box--active': isCardActive(item.code) }">
            <input
              class="score-box__input"
              type="number"
              min="0"
              :value="getScore(item.code)"
              placeholder="-"
              :disabled="!isSelected(item.code)"
              readonly
              @click.stop
              @focus="$event.target.select()"
            />
            <span class="score-box__unit">점</span>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useScenarioStore } from '@/stores/scenario'
import { useMapStore } from '@/stores/map'
import { fetchPlanEvaluationItems } from '@/api/planEvaluationApi'

const props = defineProps({
  planId: { type: String, required: true },
})

const scenarioStore = useScenarioStore()
const mapStore = useMapStore()

// ── planType 라벨 ─────────────────────────────────────────
const PLAN_TYPE_LABELS = {
  development:    '개발계획',
  implementation: '실시계획',
}

const planTypeLabel = computed(() => {
  const type = scenarioStore.plans[props.planId]?.planType ?? ''
  return PLAN_TYPE_LABELS[type] ?? ''
})

// ── 섹션 메타 ─────────────────────────────────────────────
const SECTION_META = [
  { key: 'carbon_absorption', title: '1) 탄소흡수 평가항목' },
  { key: 'carbon_reduction',  title: '2) 탄소저감 평가항목' },
  { key: 'qualitative',       title: '3) 정성평가 항목' },
]

// ── API 데이터 ────────────────────────────────────────────
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

// ── Step2 선택 코드 목록 ─────────────────────────────────
const selectedCodes = computed(
  () => scenarioStore.plans[props.planId]?.selectedEvalItems ?? []
)

function isSelected(code) {
  return selectedCodes.value.includes(code)
}

// ── 전체 항목 → 카테고리별 그룹 (선택 여부 무관, 전체 표시) ──
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

// ── 카드 클릭 (선택된 항목만 dialog 활성화) ────────────────
function onCardClick(item) {
  mapStore.openEvalItemDialog(props.planId, item.code)
}

function isCardActive(code) {
  return mapStore.evalItemCode === code
}

// ── 점수 ─────────────────────────────────────────────────
// qualitative: 선택 시 가중치가 점수 / carbon: evalResults에서 산정된 score
function getScore(code) {
  const found = allItems.value.find(i => i.code === code)
  if (found?.category === 'qualitative' && isSelected(code)) {
    return found.weight
  }
  const result = scenarioStore.plans[props.planId]?.evalResults?.[code]
  return result?.score ?? ''
}
</script>

<style lang="scss" scoped>
.step3-body {
  display: flex;
  flex-direction: column;
}

// ── 섹션 헤더 ────────────────────────────────────────────
.step3-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid #f1f1f1;

  &__title {
    font-size: 16px;
    font-weight: var(--fw-bold);
    color: #333;
    letter-spacing: -0.32px;
  }
}

.plan-type-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  background: #bde9ff;
  border-radius: 6px;
  font-size: 10px;
  font-weight: var(--fw-medium);
  color: #256EF4;
  letter-spacing: -0.1px;
  white-space: nowrap;
  flex-shrink: 0;
}

// ── 로딩 / 빈 상태 ────────────────────────────────────────
.loading-row,
.empty-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
  font-size: 13px;
  color: #8f8f8f;
}

// ── 평가 그룹 ─────────────────────────────────────────────
.eval-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  border-bottom: 1px solid #f1f1f1;

  &__title {
    font-size: 14px;
    font-weight: var(--fw-medium);
    color: #8f8f8f;
    letter-spacing: -0.28px;
    margin-bottom: 4px;
  }
}

// ── 평가 카드 (항목 행) ──────────────────────────────────
.eval-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #f7f7f7;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color var(--transition-fast), background var(--transition-fast);

  &:hover:not(&--active) {
    border-color: #b0b0b0;
    background: #efefef;
  }

  &--active {
    background: #e9f1fe;
    border-color: #256EF4;

    .eval-card__icon  { color: #256EF4; }
    .eval-card__label { color: #256EF4; font-weight: var(--fw-semibold); }
  }

  // Step2에서 선택되지 않은 항목 — 비활성
  &--disabled {
    opacity: 0.38;
    cursor: not-allowed;
    pointer-events: none;
  }

  // qualitative 선택 항목 — 클릭 없음
  &--qualitative {
    cursor: default;
    &:hover { border-color: #e5e5e5; background: #f7f7f7; }
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 5px;
    flex: 1;
    min-width: 0;
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
}

// ── 점수 입력 박스 ──────────────────────────────────────
.score-box {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 55px;
  height: 22px;
  padding: 0 4px;
  background: #fff;
  border: 1px solid #cdd1d5;
  border-radius: 4px;
  flex-shrink: 0;
  gap: 2px;
  transition: background var(--transition-fast), border-color var(--transition-fast);

  // 활성(선택된) 카드의 점수 박스 → 파란 배경 + 흰 텍스트
  &--active {
    background: #5a93f7;
    border-color: #5a93f7;

    .score-box__input { color: #fff; &::placeholder { color: rgba(255,255,255,0.7); } }
    .score-box__unit  { color: #fff; }
  }

  &__input {
    flex: 1;
    min-width: 0;
    width: 100%;
    text-align: center;
    font-size: 14px;
    font-weight: var(--fw-bold);
    color: #656565;
    letter-spacing: -0.14px;
    background: none;
    border: none;
    outline: none;
    line-height: 22px;

    &::placeholder { color: #b0b0b0; }

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button { -webkit-appearance: none; }
    -moz-appearance: textfield;
  }

  &__unit {
    flex-shrink: 0;
    font-size: 14px;
    font-weight: var(--fw-bold);
    color: #656565;
    letter-spacing: -0.14px;
    line-height: 22px;
  }
}
</style>
