<template>
  <div class="step-content">

    <div class="detail-header">
      <span class="detail-header__title">녹색도시 개발계획 평가</span>
      <span v-if="store.selectedPlanType" class="detail-header__badge">{{ planTypeLabel }}</span>
    </div>

    <p v-if="!store.selectedPlanType" class="guide-text">이전 단계에서 개발계획 또는 실시계획을 선택하세요.</p>

    <template v-else>

      <div v-if="store.selectedCarbonAbsorptionItems.length" class="eval-section">
        <p class="eval-section__label">1) 탄소흡수 평가항목</p>
        <div class="eval-section__list">
          <div v-for="item in store.selectedCarbonAbsorptionItems" :key="item.code" class="eval-row">
            <div class="eval-row__left">
              <v-icon class="eval-row__icon" size="15">{{ item.icon }}</v-icon>
              <span class="eval-row__title">{{ item.title }}</span>
            </div>
            <div class="eval-row__right">
              <component v-if="item.result" :is="RESULT_COMPONENTS[item.resultType]" v-bind="item.result" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="store.selectedCarbonReductionItems.length" class="eval-section">
        <p class="eval-section__label">2) 탄소저감 평가항목</p>
        <div class="eval-section__list">
          <div v-for="item in store.selectedCarbonReductionItems" :key="item.code" class="eval-row">
            <div class="eval-row__left">
              <v-icon class="eval-row__icon" size="15">{{ item.icon }}</v-icon>
              <span class="eval-row__title">{{ item.title }}</span>
            </div>
            <div class="eval-row__right">
              <component v-if="item.result" :is="RESULT_COMPONENTS[item.resultType]" v-bind="item.result" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="store.selectedQualitativeItems.length" class="eval-section">
        <p class="eval-section__label">3) 정성평가 항목</p>
        <div class="eval-section__list">
          <div v-for="item in store.selectedQualitativeItems" :key="item.code" class="eval-row">
            <div class="eval-row__left">
              <v-icon class="eval-row__icon" size="15">{{ item.icon }}</v-icon>
              <span class="eval-row__title">{{ item.title }}</span>
            </div>
            <div class="eval-row__right">
              <component v-if="item.result" :is="RESULT_COMPONENTS[item.resultType]" v-bind="item.result" />
            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import { usePlanEvaluationStore } from '@/stores/planEvaluationStore'
import ResultSimple     from '@/components/results/ResultSimple.vue'
import ResultPercent    from '@/components/results/ResultPercent.vue'
import ResultMultiLabel from '@/components/results/ResultMultiLabel.vue'
import ResultCount      from '@/components/results/ResultCount.vue'
import ResultSelect     from '@/components/results/ResultSelect.vue'

const RESULT_COMPONENTS = {
  simple:     ResultSimple,
  percent:    ResultPercent,
  multiLabel: ResultMultiLabel,
  count:      ResultCount,
  select:     ResultSelect,
}

const tabId = inject('tabId')
const store = usePlanEvaluationStore(tabId)

const planTypeLabel = computed(() =>
  store.selectedPlanType === 'development' ? '개발계획' : '실시계획'
)
</script>

<style lang="scss" scoped>
.step-content { display: flex; flex-direction: column; gap: 16px; }

.detail-header {
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: 8px; border-bottom: 2px solid $color-primary;
  &__title { font-size: $font-size-sm; font-weight: 700; color: $color-text-dark; }
  &__badge { font-size: $font-size-xxs; font-weight: 600; color: $color-primary; background: $color-primary-bg; border: 1px solid rgba($color-primary, 0.3); border-radius: 4px; padding: 2px 8px; }
}

.guide-text { font-size: $font-size-xs; color: $color-text-disabled; text-align: center; padding: 24px 0; margin: 0; }

.eval-section {
  display: flex; flex-direction: column; gap: 6px;
  &__label { font-size: $font-size-xxs; font-weight: 600; color: $color-text-muted; margin: 0; }
  &__list  { display: flex; flex-direction: column; gap: 5px; }
}

.eval-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; padding: 10px 16px;
  background: $color-bg-card; border: 1px solid $color-border; border-radius: 6px; min-height: 40px;

  &__left  { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
  &__icon  { color: $color-text-muted; flex-shrink: 0; }
  &__title { font-size: $font-size-sm; font-weight: 500; color: $color-text-body; line-height: 1.3; word-break: keep-all; }
  &__right { display: flex; align-items: center; flex-shrink: 0; }
}
</style>
