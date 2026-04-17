<template>
  <div class="step-content">

    <div class="plan-radio-group">
      <label
        v-for="opt in planTypeOptions"
        :key="opt.value"
        class="plan-radio"
        :class="{ 'is-active': store.selectedPlanType === opt.value }"
      >
        <span class="plan-radio__label">{{ opt.label }}</span>
        <span class="plan-radio__check">
          <v-icon v-if="store.selectedPlanType === opt.value" size="11" color="white">mdi-check</v-icon>
        </span>
        <input type="radio" :value="opt.value" :checked="store.selectedPlanType === opt.value" class="plan-radio__input" @change="store.selectPlanType(opt.value)" />
      </label>
    </div>

    <div class="eval-header">
      <span class="eval-header__badge">②</span>
      <span class="eval-header__title">녹색도시 개발계획 평가</span>
    </div>

    <div v-if="isLoading" class="loading-area">
      <v-progress-circular indeterminate color="primary" size="26" width="2" />
    </div>

    <template v-else>
      <p v-if="!store.selectedPlanType" class="guide-text">개발계획 또는 실시계획을 선택하세요.</p>

      <template v-else>
        <div class="eval-section">
          <p class="eval-section__label">1) 탄소흡수 평가항목 및 가중치</p>
          <div class="eval-section__grid">
            <div v-for="item in store.carbonAbsorptionItems" :key="item.code" class="eval-item" :class="{ 'is-selected': item.selected, 'is-disabled': item.type !== store.selectedPlanType, 'is-full': item.title.length > 12 }" @click="store.toggleItem(item.code)">
              <v-icon class="eval-item__icon" size="14">{{ item.icon }}</v-icon>
              <span class="eval-item__title">{{ item.title }}</span>
              <span class="eval-item__weight">{{ item.weight }}</span>
            </div>
          </div>
        </div>

        <div class="eval-section">
          <p class="eval-section__label">2) 탄소저감 평가항목 및 가중치</p>
          <div class="eval-section__grid">
            <div v-for="item in store.carbonReductionItems" :key="item.code" class="eval-item" :class="{ 'is-selected': item.selected, 'is-disabled': item.type !== store.selectedPlanType, 'is-full': item.title.length > 12 }" @click="store.toggleItem(item.code)">
              <v-icon class="eval-item__icon" size="14">{{ item.icon }}</v-icon>
              <span class="eval-item__title">{{ item.title }}</span>
              <span class="eval-item__weight">{{ item.weight }}</span>
            </div>
          </div>
        </div>

        <div class="eval-section">
          <p class="eval-section__label">3) 정성평가 항목 및 가중치</p>
          <div class="eval-section__grid">
            <div v-for="item in store.qualitativeItems" :key="item.code" class="eval-item" :class="{ 'is-selected': item.selected, 'is-disabled': item.type !== store.selectedPlanType, 'is-full': item.title.length > 12 }" @click="store.toggleItem(item.code)">
              <v-icon class="eval-item__icon" size="14">{{ item.icon }}</v-icon>
              <span class="eval-item__title">{{ item.title }}</span>
              <span class="eval-item__weight">{{ item.weight }}</span>
            </div>
          </div>
        </div>
      </template>
    </template>

  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { usePlanEvaluationStore } from '@/stores/planEvaluationStore'
import { fetchPlanEvaluationItems } from '@/api/planEvaluationApi'

const tabId = inject('tabId')
const store = usePlanEvaluationStore(tabId)
const isLoading = ref(false)

const planTypeOptions = [
  { value: 'development',    label: '개발계획' },
  { value: 'implementation', label: '실시계획' },
]

onMounted(async () => {
  if (store.items.length > 0) return
  isLoading.value = true
  try {
    const data = await fetchPlanEvaluationItems()
    store.setItems(data)
  } finally {
    isLoading.value = false
  }
})
</script>

<style lang="scss" scoped>
.step-content { display: flex; flex-direction: column; gap: 14px; }

.plan-radio-group { display: flex; gap: 8px; }

.plan-radio {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  height: 35px;
  padding: 0 14px;
  background: $color-bg-card;
  border: 1px solid $color-border;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  user-select: none;

  &:hover { border-color: $color-primary-light; background: rgba($color-primary, 0.04); }

  &.is-active {
    border-color: $color-primary;
    background: $color-primary-bg;
    .plan-radio__label { color: $color-primary; font-weight: 600; }
    .plan-radio__check { background: $color-primary; border-color: $color-primary; }
  }

  &__input { display: none; }
  &__label { font-size: $font-size-sm; font-weight: 500; color: $color-text-body; transition: color 0.15s; }
  &__check {
    width: 15px; height: 15px;
    border: 1.5px solid $color-border-mid;
    border-radius: 3px;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s, border-color 0.15s;
  }
}

.eval-header {
  display: flex; align-items: center; gap: 6px;
  padding-bottom: 6px; border-bottom: 2px solid $color-primary;

  &__badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 20px; height: 20px;
    border-radius: 50%; border: 1.5px solid $color-text-dark;
    font-size: 11px; font-weight: 700; color: $color-text-dark; flex-shrink: 0;
  }
  &__title { font-size: $font-size-sm; font-weight: 700; color: $color-text-dark; }
}

.loading-area { display: flex; justify-content: center; padding: 32px 0; }
.guide-text   { font-size: $font-size-xs; color: $color-text-disabled; text-align: center; padding: 24px 0; margin: 0; }

.eval-section {
  display: flex; flex-direction: column; gap: 6px;
  &__label { font-size: $font-size-xxs; font-weight: 600; color: $color-text-muted; margin: 0; }
  &__grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
}

.eval-item {
  display: flex; align-items: center; gap: 6px;
  height: 35px; padding: 0 14px;
  background: $color-bg-card; border: 1px solid $color-border; border-radius: 6px;
  cursor: pointer; user-select: none;
  transition: border-color 0.15s, background 0.15s, opacity 0.15s;

  &.is-full    { grid-column: 1 / -1; }
  &:hover:not(.is-disabled) { border-color: $color-primary-light; background: rgba($color-primary, 0.04); }
  &.is-selected {
    border-color: $color-primary; background: $color-primary-bg;
    .eval-item__icon  { color: $color-primary; }
    .eval-item__title { color: $color-primary; font-weight: 600; }
    .eval-item__weight{ color: $color-primary; }
  }
  &.is-disabled { opacity: 0.45; cursor: not-allowed; }

  &__icon   { color: $color-text-muted; flex-shrink: 0; }
  &__title  { flex: 1; font-size: $font-size-sm; font-weight: 500; color: $color-text-body; line-height: 1.3; word-break: keep-all; }
  &__weight { font-size: $font-size-xs; font-weight: 700; color: $color-text-muted; flex-shrink: 0; min-width: 20px; text-align: right; }
}
</style>
