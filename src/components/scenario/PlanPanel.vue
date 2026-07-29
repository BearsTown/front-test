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
      <PlanStep1
        v-if="activeStep === 1"
        :plan-id="planId"
        @file-upload-click="$emit('file-upload-click')"
      />

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
import { useMapStore }         from '@/stores/map'
import PlanStep1               from '@/components/scenario/PlanStep1.vue'
import PlanStep2               from '@/components/scenario/PlanStep2.vue'
import PlanStep3               from '@/components/scenario/PlanStep3.vue'
import CarbonStep1             from '@/components/scenario/CarbonStep1.vue'
import EvalSummaryDialog       from '@/components/scenario/EvalSummaryDialog.vue'

const props = defineProps({
  planId: { type: String, required: true },
})
defineEmits(['file-upload-click', 'next'])

const scenarioStore = useScenarioStore()
const mapStore = useMapStore()

// 이 PlanPanel이 담당하는 안(plan) 상태
const plan = computed(() => scenarioStore.plans[props.planId])

// 단계 (writable)
const activeStep = computed({
  get: () => plan.value.activeStep,
  set: (v) => scenarioStore.setActiveStep(props.planId, v),
})

const planSteps = [
  { num: 1, label: '기본정보입력' },
  { num: 2, label: '개발계획평가입력' },
  { num: 3, label: '계획평가세부조정' },
]

const isValid = computed(() => plan.value.form.title.trim().length > 0)

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

</style>
