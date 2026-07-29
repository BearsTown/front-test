<template>
  <div class="plan-panel">

    <!-- ③ 단계 표시기 -->
    <div class="step-progress">
      <div class="step-group">
        <div class="step-group__label step-group__label--active">녹색도시 개발계획평가</div>
        <div class="step-group__items">
          <div
            v-for="step in planSteps"
            :key="step.num"
            class="step-item"
            :class="{
              'step-item--active': activeStep === step.num,
              'step-item--done':   activeStep > step.num,
            }"
            @click="activeStep = step.num"
          >
            <!-- 완료된 단계: 체크 아이콘 / 현재 단계: 번호 원형 / 미래 단계: 번호 원형(비활성) -->
            <div class="step-item__badge">
              <v-icon v-if="activeStep > step.num" size="10">mdi-check</v-icon>
              <template v-else>{{ step.num }}</template>
            </div>
            <span class="step-item__label">{{ step.label }}</span>
            <div class="step-item__bar" />
          </div>
        </div>
      </div>

      <div class="step-group step-group--carbon">
        <div class="step-group__label" :class="{ 'step-group__label--active': activeStep === 4 }">탄소 배출 흡수량 산정</div>
        <div class="step-group__items">
          <div
            class="step-item"
            :class="{ 'step-item--active': activeStep === 4 }"
            @click="activeStep = 4"
          >
            <div class="step-item__badge">1</div>
            <span class="step-item__label">탄소배출흡수량 산정</span>
            <div class="step-item__bar" />
          </div>
        </div>
      </div>
    </div>

    <!-- ④ 본문 (스크롤) — step 별 분기 -->
    <div class="panel-body">

      <!-- Step 1: 기본정보입력 -->
      <template v-if="activeStep === 1">

        <!-- 시나리오 제목 -->
        <div class="section-header">시나리오 제목</div>
        <div class="section-title-wrap">
          <input v-model="form.title" type="text" class="field-input" placeholder="" />
        </div>

        <!-- 개발사업구역 정보 입력 -->
        <div class="section-header">개발사업구역 정보 입력</div>

        <!-- 기본 개요 -->
        <div class="subsection">
          <div class="subsection__head">
            <span class="subsection__title">기본 개요</span>
            <button class="btn-upload" @click="$emit('file-upload-click')">
              파일 업로드
              <v-icon size="12">mdi-upload</v-icon>
            </button>
          </div>
          <div class="field-cols-3">
            <input
              type="text"
              class="field-input field-input--disabled"
              :value="mapStore.savedProject.sido"
              disabled
              placeholder="시도"
            />
            <input
              type="text"
              class="field-input field-input--disabled"
              :value="mapStore.savedProject.sigungu"
              disabled
              placeholder="시군구"
            />
            <div class="field-select-wrap">
              <select v-model="uploadedGrade" class="field-input">
                <option :value="null" disabled>급지</option>
                <option v-for="g in gradeOptions" :key="g.value" :value="g.value">{{ g.title }}</option>
              </select>
              <v-icon size="14" class="field-select-icon">mdi-chevron-down</v-icon>
            </div>
          </div>
        </div>

        <div
          v-for="sec in sectionConfigs"
          :key="sec.key"
          class="subsection subsection--card"
          :class="{ 'subsection--active': isDialogActive(sec.key) }"
          @click="openSectionDialog(sec.key)"
        >
          <div class="subsection__head">
            <span class="subsection__title">{{ sec.title }}</span>
            <button class="icon-btn" @click.stop="toggle(sec.key)">
              <v-icon size="28" class="expand-icon" :class="{ 'expand-icon--open': sections[sec.key] }">
                mdi-chevron-right
              </v-icon>
            </button>
          </div>

          <transition name="expand">
            <div v-if="sections[sec.key]" class="value-card">
              <template v-if="sec.key === 'population'">
                <div class="value-card__row">
                  <span class="value-card__label">인구</span>
                  <span class="value-card__value" :class="{ 'value-card__value--empty': !hasPopulationData }">
                    {{ (popPlan.totalPopulation || 0).toLocaleString() }}<em class="value-card__unit">인</em>
                  </span>
                </div>
                <template v-if="hasPopulationData">
                  <div class="stacked-bar">
                    <div class="stacked-bar__layer stacked-bar__layer--blue" />
                    <div class="stacked-bar__layer stacked-bar__layer--pink" :style="{ width: stackedPinkWidth }" />
                    <div class="stacked-bar__layer stacked-bar__layer--yellow" :style="{ width: stackedYellowWidth }" />
                  </div>
                  <div class="bar-legend">
                    <div class="bar-legend__item">
                      <span class="bar-legend__dot bar-legend__dot--yellow" />
                      <span class="bar-legend__name">단독주택</span>
                      <span class="bar-legend__pct">{{ popPlan.populationDistrib.단독 }}%</span>
                    </div>
                    <div class="bar-legend__item">
                      <span class="bar-legend__dot bar-legend__dot--pink" />
                      <span class="bar-legend__name">공동주택</span>
                      <span class="bar-legend__pct">{{ popPlan.populationDistrib.공동 }}%</span>
                    </div>
                    <div class="bar-legend__item">
                      <span class="bar-legend__dot bar-legend__dot--blue" />
                      <span class="bar-legend__name">주상복합</span>
                      <span class="bar-legend__pct">{{ popPlan.populationDistrib.주상 }}%</span>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="value-card__bar value-card__bar--empty" />
                </template>
              </template>

              <template v-else-if="sec.key === 'housing'">
                <div class="value-card__row">
                  <span class="value-card__label">면적</span>
                  <span class="value-card__value" :class="{ 'value-card__value--empty': !form.housingArea }">
                    {{ (form.housingArea || 0).toLocaleString() }}<em class="value-card__unit">m²</em>
                  </span>
                </div>
                <div class="value-card__bar" :class="form.housingArea ? '' : 'value-card__bar--empty'">
                  <div v-if="form.housingArea" class="value-card__fill" :style="{ width: barPct(form.housingArea, 1000000) }" />
                </div>
              </template>

              <template v-else-if="sec.key === 'land'">
                <div class="value-card__row">
                  <span class="value-card__label">면적</span>
                  <span class="value-card__value" :class="{ 'value-card__value--empty': !form.landArea }">
                    {{ (form.landArea || 0).toLocaleString() }}<em class="value-card__unit">m²</em>
                  </span>
                </div>
                <div class="value-card__bar" :class="form.landArea ? '' : 'value-card__bar--empty'">
                  <div v-if="form.landArea" class="value-card__fill" :style="{ width: barPct(form.landArea, 1000000) }" />
                </div>
              </template>
            </div>
          </transition>
        </div>

      </template>

      <!-- Step 2: 개발계획평가입력 -->
      <PlanStep2 v-else-if="activeStep === 2" :plan-id="planId" />

      <!-- Step 3: 계획평가세부조정 -->
      <PlanStep3 v-else-if="activeStep === 3" :plan-id="planId" />

      <!-- Step 4: 탄소배출흡수량 산정 -->
      <CarbonStep1 v-else-if="activeStep === 4" :plan-id="planId" />

    </div>

    <!-- 평가총괄표 다이얼로그 -->
    <EvalSummaryDialog
      v-if="showSummaryDialog"
      :plan-id="planId"
      @close="showSummaryDialog = false"
    />

    <!-- ⑤ 푸터 -->
    <div class="panel-footer">
      <div class="panel-footer__left">
        <button
          v-if="activeStep === 3"
          class="btn btn--grade"
          :class="{ 'btn--grade-active': isStep3Complete }"
          :disabled="!isStep3Complete"
          style="width: auto"
          @click="showSummaryDialog = true"
        >
          평가총괄표 등급 분석
        </button>
        <button
          v-if="activeStep === 4"
          class="btn btn--result"
          @click="mapStore.openResultPanel()"
        >
          결과보기
        </button>
      </div>
      <div class="panel-footer__right">
        <button v-if="activeStep > 1" class="btn btn--prev" @click="activeStep--">이전</button>
        <button
          v-if="activeStep < 4"
          class="btn btn--next"
          :class="{ 'btn--next-active': isNextEnabled }"
          :disabled="!isNextEnabled"
          @click="onNextClick"
        >다음</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useScenarioStore }    from '@/stores/scenario'
import { usePopulationStore }  from '@/stores/population'
import { useMapStore }         from '@/stores/map'
import PlanStep2               from '@/components/scenario/PlanStep2.vue'
import PlanStep3               from '@/components/scenario/PlanStep3.vue'
import CarbonStep1             from '@/components/scenario/CarbonStep1.vue'
import EvalSummaryDialog       from '@/components/scenario/EvalSummaryDialog.vue'

const props = defineProps({
  planId: { type: String, required: true },
})
defineEmits(['file-upload-click', 'next'])

const scenarioStore = useScenarioStore()
const populationStore = usePopulationStore()
const mapStore = useMapStore()

// 이 PlanPanel이 담당하는 안(plan) 상태
const plan = computed(() => scenarioStore.plans[props.planId])

// 단계 (writable)
const activeStep = computed({
  get: () => plan.value.activeStep,
  set: (v) => scenarioStore.setActiveStep(props.planId, v),
})

// 폼 · 섹션
const form = computed(() => plan.value.form)
const sections = computed(() => plan.value.sections)

// 급지 (writable) — 파일 업로드 분석 결과 or 사용자 선택
const uploadedGrade = computed({
  get: () => plan.value.uploadedGrade,
  set: (v) => scenarioStore.setUploadedGrade(props.planId, v),
})

const toggle = (key) => scenarioStore.toggleSection(props.planId, key)

const sectionConfigs = [
  { key: 'population', title: '인구 및 수용 계획' },
  { key: 'housing',    title: '인구 및 주택건설 계획' },
  { key: 'land',       title: '토지이용계획' },
]

const dialogOpeners = {
  population: () => mapStore.openPopulationDialog(props.planId),
  housing:    () => mapStore.openHousingDialog(props.planId),
  land:       () => mapStore.openLandDialog(props.planId),
}

function openSectionDialog(key) {
  dialogOpeners[key]?.()
}

// planDialogs[planId][key] 직접 참조 → 탭 전환 시 자동 반응
function isDialogActive(key) {
  return mapStore.planDialogs[props.planId]?.[key] ?? false
}

const planSteps = [
  { num: 1, label: '기본정보입력' },
  { num: 2, label: '개발계획평가입력' },
  { num: 3, label: '계획평가세부조정' },
]

// 급지 옵션 (1안·2안·3안 공통)
const gradeOptions = [
  { value: 1, title: '1급지' },
  { value: 2, title: '2급지' },
]

const isValid = computed(() => form.value.title.trim().length > 0)

// 평가총괄표 다이얼로그 표시 여부
const showSummaryDialog = ref(false)

// Step 3: 선택된 모든 정량 평가항목이 점수 산정 완료인지 확인
// Q로 시작하는 항목(정성평가)은 선택 시 자동 완료로 간주
const isStep3Complete = computed(() => {
  const selectedItems = plan.value?.selectedEvalItems ?? []
  if (selectedItems.length === 0) return false
  return selectedItems.every(code => {
    if (code.startsWith('Q')) return true
    return plan.value?.evalResults?.[code]?.score != null
  })
})

// step별 "다음" 활성화 조건
const isNextEnabled = computed(() => {
  if (activeStep.value === 1) return isValid.value
  if (activeStep.value === 2) return (plan.value.selectedEvalItems?.length ?? 0) >= 1
  if (activeStep.value === 3) return isStep3Complete.value
  return false
})

function onNextClick() {
  if (!isNextEnabled.value) return
  activeStep.value = activeStep.value + 1
}

const barPct = (val, max) => `${Math.min((val / max) * 100, 100)}%`

// 인구 수용 계획 - 스택 바 (population store)
const popPlan = computed(() => populationStore.plans[props.planId])
const hasPopulationData = computed(() => (popPlan.value?.totalPopulation ?? 0) > 0)
const stackedYellowWidth = computed(() => `${popPlan.value?.populationDistrib.단독 ?? 0}%`)
const stackedPinkWidth = computed(() => {
  const d = popPlan.value?.populationDistrib ?? { 단독: 0, 공동: 0 }
  return `${d.단독 + d.공동}%`
})
</script>

<style lang="scss" scoped>
// ─── Layout ──────────────────────────────────────────────────────────
.plan-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--color-white);
}

// ─── ③ Step Progress ─────────────────────────────────────────────────
.step-progress {
  display: flex;
  align-items: stretch;
  gap: 4px;
  padding: 10px;
  border-bottom: 1px solid var(--color-border-subtle);
  flex-shrink: 0;
}

.step-group {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &--carbon { flex-shrink: 0; }

  &__label {
    height: 25px;
    padding: 4px 8px;
    border-radius: var(--radius-sm);
    font-size: var(--fs-xs);
    font-weight: var(--fw-semibold);
    color: var(--color-text-hint);
    background: var(--color-surface-section);
    display: flex;
    align-items: center;

    &--active {
      background: var(--color-primary-light);
      color: var(--color-text-section);
    }
  }

  &__items {
    display: flex;
    gap: 5px;
    height: 60px;
    align-items: center;
    padding: 5px;
    overflow: hidden;
  }
}

.step-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-start;
  width: 95px;
  cursor: pointer;
  flex-shrink: 0;

  &__badge {
    width: 16px;
    height: 16px;
    border-radius: var(--radius-full);
    background: var(--color-progress-step);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: var(--fw-medium);
    color: var(--color-text-hint);
    transition: all var(--transition-fast);
  }

  &__label {
    font-size: var(--fs-sm);
    font-weight: var(--fw-medium);
    color: var(--color-text-hint);
    white-space: nowrap;
    transition: color var(--transition-fast);
  }

  &__bar {
    height: 3px;
    width: 100%;
    background: var(--color-progress-step);
    border-radius: 50px;
    transition: background var(--transition-fast);
  }

  &--active {
    .step-item__badge {
      background: var(--color-primary);
      color: var(--color-text-white);
      font-weight: var(--fw-bold);
    }
    .step-item__label {
      color: var(--color-primary);
      font-weight: var(--fw-semibold);
    }
    .step-item__bar { background: var(--color-primary); }
  }

  &--done {
    .step-item__badge {
      background: var(--color-text-hint);
      color: var(--color-text-white);
      font-weight: var(--fw-bold);
    }
    .step-item__label { color: var(--color-text-hint); }
    .step-item__bar   { background: var(--color-text-hint); }
  }
}

// ─── ④ Body ──────────────────────────────────────────────────────────
.panel-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;

  &::-webkit-scrollbar       { width: 5px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: var(--color-text-value);
    border-radius: 100px;
    &:hover { background: var(--color-text-hint); }
  }
}

.section-header {
  height: 40px;
  padding: 0 20px;
  background: var(--color-surface-section);
  border-bottom: 1px solid var(--color-border-subtle);
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  color: var(--color-text-section);
  letter-spacing: var(--ls-tight);
  display: flex;
  align-items: center;
}

.section-title-wrap {
  padding: 20px;
  border-bottom: 1px solid var(--color-border-subtle);
}

// 서브섹션
.subsection {
  border-bottom: 1px solid var(--color-border-subtle);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  // 섹션 선택 시 배경 강조
  &--active {
    background: var(--color-primary-light);
  }

  // 클릭 가능한 섹션 카드
  &--card {
    cursor: pointer;
    transition: background var(--transition-fast);

    &:hover:not(.subsection--active) {
      background: var(--color-surface-section);
    }
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  &__title {
    font-size: var(--fs-xl);
    font-weight: var(--fw-bold);
    color: var(--color-text-body);
    letter-spacing: var(--ls-tight);
    transition: color var(--transition-fast);
  }
}

// 아이콘 전용 버튼 (chevron-right 등)
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--color-text-hint);
  transition: color var(--transition-fast);

  &:hover { color: var(--color-primary); }
}

// 파일 업로드 버튼
.btn-upload {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 0 12px;
  background: var(--color-white);
  border: 1px solid var(--color-border-button);
  border-radius: var(--radius-full);
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--color-primary);
  letter-spacing: var(--ls-tight);
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--transition-fast);

  &:hover { background: var(--color-primary-light); }
}

// 인풋 공통
.field-input {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  background: var(--color-surface-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--fs-md);
  font-weight: var(--fw-medium);
  color: var(--color-text-input);
  letter-spacing: var(--ls-tight);
  outline: none;
  appearance: none;
  transition: border-color var(--transition-fast), background var(--transition-fast);

  &:focus {
    border-color: var(--color-primary);
    background: var(--color-white);
  }

  &::placeholder { color: var(--color-text-placeholder); }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }

  &--disabled {
    background: var(--color-surface-readonly);
    color: var(--color-text-secondary);
  }
}

// 3열 셀렉트 그리드
.field-cols-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

.field-select-wrap {
  position: relative;

  select.field-input {
    padding-right: 26px;
    cursor: pointer;
  }

  .field-select-icon {
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-hint);
    pointer-events: none;
  }
}

// expand 아이콘
.expand-icon {
  color: var(--color-text-hint);
  transition: transform var(--transition-fast);

  &--open { transform: rotate(90deg); }
}

// Value Card
.value-card {
  background: var(--color-surface-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__label {
    font-size: var(--fs-base);
    font-weight: var(--fw-semibold);
    color: var(--color-text-body);
    letter-spacing: var(--ls-tight);
  }

  &__value {
    font-size: var(--fs-base);
    font-weight: var(--fw-medium);
    color: var(--color-text-value);
    letter-spacing: var(--ls-tight);
    display: flex;
    align-items: center;
    gap: 2px;

    &--empty { color: var(--color-text-hint); }
  }

  &__unit {
    font-size: var(--fs-base);
    font-weight: $font-weight-regular;
    color: var(--color-text-unit);
    font-style: normal;
  }

  &__bar {
    height: 11px;
    background: var(--color-progress-track);
    border-radius: var(--radius-sm);
    overflow: hidden;

    &--empty { background: #d6d6d6; }
  }

  &__fill {
    height: 100%;
    background: var(--color-primary);
    border-radius: var(--radius-sm);
    transition: width 0.3s ease;
  }
}

// 주택유형별 스택 바
.stacked-bar {
  position: relative;
  width: 100%;
  height: 11px;

  &__layer {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    border-radius: 2px;

    &--blue   { width: 100%; background: #72aaff; z-index: 1; }
    &--pink   { background: #ffaeae; z-index: 2; }
    &--yellow { background: #ffda7f; z-index: 3; }
  }
}

// 스택 바 범례
.bar-legend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  &__item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: var(--radius-full);
    flex-shrink: 0;

    &--yellow { background: #ffda7f; }
    &--pink   { background: #ffaeae; }
    &--blue   { background: #72aaff; }
  }

  &__name {
    font-size: var(--fs-xs);
    color: var(--color-text-hint);
    letter-spacing: var(--ls-tight);
  }

  &__pct {
    font-size: var(--fs-xs);
    font-weight: var(--fw-semibold);
    color: var(--color-text-body);
    letter-spacing: var(--ls-tight);
  }
}

// ─── ⑤ Footer ────────────────────────────────────────────────────────
.panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--footer-h);
  padding: 0 20px;
  background: var(--color-white);
  border-top: 1px solid var(--color-border-divider);
  flex-shrink: 0;

  &__left { flex: 1; }

  &__right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.btn {
  width: 70px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-tight);
  cursor: pointer;
  transition: all var(--transition-fast);

  &--prev {
    background: var(--color-white);
    border: 1px solid var(--color-border-button);
    color: var(--color-text-cancel);
    &:hover { background: var(--color-surface-section); }
  }

  &--grade {
    height: 34px;
    padding: 0 14px;
    background: var(--color-surface-section);
    border: 1px solid var(--color-border-button);
    border-radius: var(--radius-md);
    font-size: var(--fs-sm);
    font-weight: var(--fw-semibold);
    color: var(--color-text-hint);
    letter-spacing: var(--ls-tight);
    cursor: not-allowed;
    white-space: nowrap;
    opacity: 0.6;

    &-active {
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: var(--color-text-white);
      cursor: pointer;
      opacity: 1;
      &:hover { background: var(--color-primary-hover); }
    }
  }

  &--next {
    background: var(--color-disabled-bg);
    border: 1px solid var(--color-disabled-bg);
    color: var(--color-text-white);
    cursor: not-allowed;

    &-active {
      background: var(--color-primary);
      border-color: var(--color-primary);
      cursor: pointer;
      &:hover { background: var(--color-primary-hover); }
    }
  }

  &--result {
    height: 34px;
    padding: 0 14px;
    background: var(--color-primary);
    border: 1px solid var(--color-primary);
    border-radius: var(--radius-md);
    font-size: var(--fs-sm);
    font-weight: var(--fw-semibold);
    color: var(--color-text-white);
    letter-spacing: var(--ls-tight);
    cursor: pointer;
    white-space: nowrap;
    &:hover { background: var(--color-primary-hover); }
  }
}

// ─── Expand Transition ────────────────────────────────────────────────
.expand-enter-active,
.expand-leave-active {
  transition: opacity var(--transition-base), max-height var(--transition-base);
  overflow: hidden;
  max-height: 300px;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
