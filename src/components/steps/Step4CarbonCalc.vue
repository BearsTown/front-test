<template>
  <div class="step-content">

    <h2 class="page-title">탄소 배출 및 흡수량 산정</h2>

    <div v-if="isLoading" class="loading-area">
      <v-progress-circular indeterminate color="primary" size="28" width="2" />
    </div>

    <template v-else-if="data">

      <div class="accordion" :class="{ 'is-open': open[0] }">
        <button class="accordion__header" @click="toggle(0)">
          <span class="accordion__title">건축계획</span>
          <v-icon class="accordion__arrow" size="20">mdi-chevron-right</v-icon>
        </button>
        <div v-show="open[0]" class="accordion__body">
          <div class="info-card">
            <div class="info-card__row">
              <span class="info-card__label">총 연면적</span>
              <span class="info-card__value">{{ data.totalFloorArea.toLocaleString() }}<em>m²</em></span>
            </div>
            <div class="stack-bar">
              <div v-for="item in data.floorAreaBreakdown" :key="item.label" class="stack-bar__seg" :style="{ flex: item.value, background: item.color }" />
            </div>
            <div class="stack-legend">
              <span v-for="item in data.floorAreaBreakdown" :key="item.label" class="stack-legend__item">
                <i :style="{ background: item.color }" />
                {{ item.label }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="accordion" :class="{ 'is-open': open[1] }">
        <button class="accordion__header" @click="toggle(1)">
          <span class="accordion__title">전력 사용량 예측</span>
          <v-icon class="accordion__arrow" size="20">mdi-chevron-right</v-icon>
        </button>
        <div v-show="open[1]" class="accordion__body">
          <div class="chart-card">
            <div class="chart-card__legend">
              <span class="chart-card__legend-dot" style="background:#059176" />
              <span class="chart-card__legend-text">연간사용량(MWh/년)</span>
            </div>
            <v-chart class="chart-card__canvas" :option="electricityChartOption" :autoresize="true" />
          </div>
        </div>
      </div>

      <div class="accordion" :class="{ 'is-open': open[2] }">
        <button class="accordion__header" @click="toggle(2)">
          <span class="accordion__title">열 사용량 예측</span>
          <v-icon class="accordion__arrow" size="20">mdi-chevron-right</v-icon>
        </button>
        <div v-show="open[2]" class="accordion__body">
          <div class="chart-card">
            <div class="chart-card__legend">
              <span v-for="leg in heatLegend" :key="leg.label" class="chart-card__legend-item">
                <span class="chart-card__legend-dot" :style="{ background: leg.color }" />
                <span class="chart-card__legend-text">{{ leg.label }}</span>
              </span>
            </div>
            <v-chart class="chart-card__canvas chart-card__canvas--heat" :option="heatChartOption" :autoresize="true" />
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { fetchCarbonCalcResult } from '@/api/carbonCalcApi'
import { useCarbonResultStore } from '@/stores/carbonResultStore'

use([CanvasRenderer, BarChart, TooltipComponent, GridComponent, LegendComponent])

const tabId       = inject('tabId')
const resultStore = useCarbonResultStore()
const isLoading   = ref(false)
const data        = ref(null)

const open = ref([true, true, true])
function toggle(idx) { open.value[idx] = !open.value[idx] }

const electricityChartOption = computed(() => {
  if (!data.value) return {}
  const FONT = 'Pretendard, sans-serif'
  return {
    tooltip: { trigger: 'axis', formatter: (p) => `${p[0].name}: <b>${p[0].value.toLocaleString()}</b> MWh/년`, textStyle: { fontFamily: FONT, fontSize: 12 } },
    grid: { top: 28, bottom: 20, left: 8, right: 8, containLabel: true },
    xAxis: { type: 'category', data: data.value.electricityUsage.map(d => d.label), axisLabel: { fontFamily: FONT, fontSize: 12, color: '#565656' }, axisTick: { show: false }, axisLine: { lineStyle: { color: '#e5e5e5' } } },
    yAxis: { type: 'value', axisLabel: { show: false }, splitLine: { lineStyle: { color: '#e5e5e5', type: 'dashed' } } },
    series: [{ type: 'bar', barMaxWidth: 36, borderRadius: [4, 4, 0, 0], itemStyle: { color: '#059176' }, label: { show: true, position: 'top', formatter: (p) => p.value.toLocaleString(), fontSize: 12, fontWeight: 700, fontFamily: FONT, color: '#262626' }, data: data.value.electricityUsage.map(d => d.value) }],
  }
})

const HEAT_COLORS = { heating: '#059176', cooling: '#D1D5DB', cooking: '#93C5FD' }
const heatLegend  = [
  { label: '난방/급탕용', color: HEAT_COLORS.heating },
  { label: '냉방용',     color: HEAT_COLORS.cooling },
  { label: '취사용',     color: HEAT_COLORS.cooking },
]

const heatChartOption = computed(() => {
  if (!data.value) return {}
  const FONT = 'Pretendard, sans-serif'
  const rows = data.value.heatUsage
  const mkSeries = (key, color, name) => ({ name, type: 'bar', stack: 'heat', barMaxWidth: 24, itemStyle: { color }, data: rows.map(r => r[key]) })
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, textStyle: { fontFamily: FONT, fontSize: 12 } },
    grid: { top: 8, bottom: 8, left: 8, right: 16, containLabel: true },
    xAxis: { type: 'value', axisLabel: { show: false }, splitLine: { lineStyle: { color: '#e5e5e5', type: 'dashed' } } },
    yAxis: { type: 'category', data: rows.map(r => r.label), axisLabel: { fontFamily: FONT, fontSize: 12, color: '#565656' }, axisTick: { show: false }, axisLine: { show: false } },
    series: [ mkSeries('heating', HEAT_COLORS.heating, '난방/급탕용'), mkSeries('cooling', HEAT_COLORS.cooling, '냉방용'), mkSeries('cooking', HEAT_COLORS.cooking, '취사용') ],
  }
})

onMounted(async () => {
  isLoading.value = true
  try { data.value = await fetchCarbonCalcResult() }
  finally { isLoading.value = false }
})

function openResult() { resultStore.open(data.value, tabId) }
defineExpose({ openResult })
</script>

<style lang="scss" scoped>
.step-content { display: flex; flex-direction: column; gap: 0; }

.page-title { font-size: 18px; font-weight: 700; color: $color-text-dark; padding: 4px 0 16px; border-bottom: 1px solid $color-border; margin-bottom: 4px; }
.loading-area { display: flex; justify-content: center; padding: 48px 0; }

.accordion {
  border-bottom: 1px solid $color-border;

  &__header { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 16px 0; background: none; border: none; cursor: pointer; font-family: inherit; }
  &__title  { font-size: 16px; font-weight: 700; color: $color-text-dark; }
  &__arrow  { color: $color-text-muted; transition: transform 0.2s; }
  &.is-open &__arrow { transform: rotate(90deg); }
  &__body   { padding-bottom: 16px; }
}

.info-card {
  background: $color-white; border: 1px solid $color-border; border-radius: 10px; padding: 14px 16px;
  display: flex; flex-direction: column; gap: 10px;

  &__row   { display: flex; align-items: baseline; justify-content: space-between; }
  &__label { font-size: $font-size-sm; font-weight: 500; color: $color-text-body; }
  &__value {
    font-size: 18px; font-weight: 700; color: $color-text-dark;
    em { font-style: normal; font-size: $font-size-xs; font-weight: 500; color: $color-text-muted; margin-left: 2px; }
  }
}

.stack-bar {
  display: flex; height: 12px; border-radius: 6px; overflow: hidden; gap: 2px;
  &__seg { border-radius: 3px; transition: flex 0.4s; }
}

.stack-legend {
  display: flex; gap: 12px;
  &__item { display: flex; align-items: center; gap: 4px; font-size: $font-size-xxs; color: $color-text-muted; i { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; } }
}

.chart-card {
  background: $color-white; border: 1px solid $color-border; border-radius: 10px; padding: 14px 16px;
  display: flex; flex-direction: column; gap: 10px;

  &__legend      { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  &__legend-item { display: flex; align-items: center; gap: 4px; }
  &__legend-dot  { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  &__legend-text { font-size: $font-size-xs; color: $color-text-body; font-weight: 500; }
  &__canvas      { width: 100%; height: 200px; &--heat { height: 150px; } }
}
</style>
