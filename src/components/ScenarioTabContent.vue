<template>
  <div class="scenario-tab-content">

    <!-- 프로그레스 인디케이터 -->
    <div class="tab-content__progress">
      <div
        v-for="group in stepGroups"
        :key="group.id"
        class="progress-col"
        :class="{ 'is-active': activeGroupId === group.id }"
        :style="{ flex: group.steps.length }"
      >
        <div class="progress-col__header">{{ group.label }}</div>
        <div class="progress-col__steps">
          <div
            v-for="step in group.steps"
            :key="step.globalId"
            class="step-item"
            :class="{
              'is-active': currentStep === step.globalId,
              'is-done':   currentStep > step.globalId,
            }"
          >
            <div class="step-item__circle">
              <v-icon v-if="currentStep > step.globalId" size="9" color="white">mdi-check</v-icon>
              <span v-else>{{ step.id }}</span>
            </div>
            <span class="step-item__label">{{ step.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 스텝별 컴포넌트 -->
    <div class="tab-content__body">
      <component :is="currentStepComponent" />
    </div>

    <!-- 하단 버튼 -->
    <div class="tab-content__footer">
      <button v-if="currentStep > 1" class="footer-btn footer-btn--prev" @click="handlePrev">이전</button>
      <button v-if="currentStep < maxStep" class="footer-btn footer-btn--next" @click="handleNext">다음</button>
      <button v-else class="footer-btn footer-btn--result" @click="handleOpenResult">
        <v-icon size="15" color="white" style="margin-right:4px">mdi-chart-box-outline</v-icon>
        결과보기
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, provide } from 'vue'
import Step1BasicInfo  from '@/components/steps/Step1BasicInfo.vue'
import Step2PlanInfo   from '@/components/steps/Step2PlanInfo.vue'
import Step3PlanDetail from '@/components/steps/Step3PlanDetail.vue'
import Step4CarbonCalc from '@/components/steps/Step4CarbonCalc.vue'
import { useCarbonResultStore } from '@/stores/carbonResultStore'
import { fetchCarbonCalcResult } from '@/api/carbonCalcApi'

const props = defineProps({
  tabId: { type: String, required: true }
})

provide('tabId', props.tabId)

const stepGroups = [
  {
    id: 'evaluation',
    label: '녹색도시 개발계획평가',
    steps: [
      { id: 1, globalId: 1, label: '기본정보입력' },
      { id: 2, globalId: 2, label: '개발계획평가입력' },
      { id: 3, globalId: 3, label: '계획평가세부조정' }
    ]
  },
  {
    id: 'carbon',
    label: '탄소 배출 흡수량 산정',
    steps: [
      { id: 1, globalId: 4, label: '탄소배출흡수량 산정' }
    ]
  }
]

const stepComponents = {
  1: Step1BasicInfo,
  2: Step2PlanInfo,
  3: Step3PlanDetail,
  4: Step4CarbonCalc
}

const currentStep = ref(1)

const activeGroupId = computed(() => {
  for (const group of stepGroups) {
    if (group.steps.some(s => s.globalId === currentStep.value)) return group.id
  }
  return stepGroups[0].id
})

const currentStepComponent = computed(() => stepComponents[currentStep.value])
const maxStep = 4

const handleNext = () => { if (currentStep.value < maxStep) currentStep.value++ }
const handlePrev = () => { if (currentStep.value > 1) currentStep.value-- }

const carbonResultStore = useCarbonResultStore()
async function handleOpenResult() {
  const data = await fetchCarbonCalcResult()
  carbonResultStore.open(data, props.tabId)
}
</script>

<style lang="scss" scoped>
.scenario-tab-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.tab-content__progress {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid $color-border;
  flex-shrink: 0;
}

.progress-col {
  display: flex;
  flex-direction: column;
  padding: 10px 12px 0;
  background: $color-neutral-05;
  border-right: 1px solid $color-border;
  transition: background 0.18s;

  &:last-child { border-right: none; }
  &.is-active  { background: $color-white; }

  &__header {
    font-size: 10px;
    font-weight: 600;
    color: $color-text-muted;
    letter-spacing: 0.01em;
    padding-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__steps {
    display: flex;
    align-items: flex-end;
    gap: 0;
  }
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: start;
  flex: 1;
  position: relative;
  padding-bottom: 8px;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    border-radius: 2px 2px 0 0;
    background: transparent;
    transition: background 0.18s;
  }

  &__circle {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: $color-neutral-10;
    color: $color-neutral-40;
    font-size: 9px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
    transition: background 0.18s, color 0.18s;
  }

  &__label {
    font-size: 9px;
    color: $color-text-muted;
    text-align: center;
    margin-top: 4px;
    word-break: keep-all;
    line-height: 1.3;
    transition: color 0.18s, font-weight 0.18s;
  }

  &.is-active {
    .step-item__circle { background: $color-primary; color: $color-white; }
    .step-item__label  { color: $color-primary; font-weight: 700; }
    &::after           { background: $color-primary; }
  }

  &.is-done {
    .step-item__circle { background: $color-neutral-30; color: $color-white; }
    .step-item__label  { color: $color-neutral-40; }
    &::after           { background: $color-neutral-30; }
  }
}

.tab-content__body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: $color-border-mid; border-radius: 2px; }
}

.tab-content__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 18px;
  border-top: 1px solid $color-border;
  background: $color-white;
  flex-shrink: 0;
}

.footer-btn {
  height: 34px;
  padding: 0 20px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  font-family: inherit;

  &--prev {
    background: $color-white;
    color: #5b5b5b;
    border: 1px solid #e7e7e7;
    min-width: 72px;
    &:hover { background: $color-neutral-05; border-color: $color-neutral-30; }
  }

  &--next {
    background: $color-primary;
    color: $color-white;
    border: 1px solid $color-primary;
    flex: 1;
    &:hover { background: $color-primary-dark; border-color: $color-primary-dark; }
  }

  &--result {
    display: flex;
    align-items: center;
    justify-content: center;
    background: $color-primary;
    color: $color-white;
    border: 1px solid $color-primary;
    flex: 1;
    font-weight: 700;
    &:hover { background: $color-primary-dark; border-color: $color-primary-dark; }
  }
}
</style>
