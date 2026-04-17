<template>
  <transition name="overlay-slide">
    <div v-if="store.isOpen" class="result-overlay">

      <!-- 헤더 -->
      <div class="overlay-header">
        <div class="overlay-header__left">
          <span class="overlay-header__plan-badge">{{ store.tabId }}안</span>
          <span class="overlay-header__title">종합결과</span>
        </div>
        <button class="overlay-header__close" @click="store.close()">닫기</button>
      </div>

      <!-- 스크롤 바디 -->
      <div class="overlay-body" v-if="data">

        <!-- ① 녹색도시 개발계획 평가 결과 -->
        <section class="result-section" style="border: none; padding: 0">
          <div class="section-title-row">
            <span class="section-title">녹색도시 개발계획 평가 결과</span>
            <div class="grade-badge" @click="gradeOpen = !gradeOpen">
              <span>{{ data.result.gradeLabel }}</span>
              <v-icon size="14" :style="{ transform: gradeOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }">
                mdi-chevron-down
              </v-icon>
            </div>
          </div>

          <div class="metric-cards">
            <div class="metric-card metric-card--main">
              <div class="metric-card__header">
                <span class="metric-card__label">최종평점</span>
                <v-icon size="13" color="#8f8f8f">mdi-information-outline</v-icon>
              </div>
              <span class="metric-card__value metric-card__value--main">{{ data.result.finalScore }}</span>
            </div>
            <div class="metric-card">
              <span class="metric-card__label">탄소흡수</span>
              <span class="metric-card__value">{{ data.result.carbonAbsorptionScore }}</span>
            </div>
            <div class="metric-card">
              <span class="metric-card__label">탄소저감</span>
              <span class="metric-card__value">{{ data.result.carbonReductionScore }}</span>
            </div>
            <div class="metric-card">
              <span class="metric-card__label">정성평가</span>
              <span class="metric-card__value">{{ data.result.qualitativeScore }}</span>
            </div>
          </div>
        </section>

        <!-- ② 탄소배출량 대형 카드 -->
        <section class="emission-card">
          <span class="emission-card__label">탄소배출량</span>
          <span class="emission-card__value">
            {{ data.result.totalEmission.toLocaleString() }}
            <em>tCo2/년</em>
          </span>
        </section>

        <!-- ③ 탄소 배출 및 흡수량 예측 결과 -->
        <section class="result-section">
          <span class="section-title">탄소 배출 및 흡수량 예측 결과</span>

          <div class="usage-cards">
            <div v-for="item in data.result.byUsage" :key="item.label" class="usage-card">
              <span class="usage-card__label">{{ item.label }}</span>
              <span class="usage-card__value">{{ item.value.toLocaleString() }}</span>
              <span class="usage-card__unit">tCo2/년</span>
            </div>
          </div>

          <div class="chart-tabs">
            <button
              v-for="tab in chartTabs"
              :key="tab.id"
              class="chart-tabs__btn"
              :class="{ 'is-active': activeChartTab === tab.id }"
              @click="activeChartTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <div v-show="activeChartTab === 'total'" class="donut-wrap">
            <v-chart class="donut-chart" :option="donutOption" :autoresize="true" />
          </div>

          <div v-show="activeChartTab === 'electricity'" class="bar-wrap">
            <v-chart class="bar-chart" :option="electricityOption" :autoresize="true" />
          </div>

          <div v-show="activeChartTab === 'heat'" class="bar-wrap">
            <v-chart class="bar-chart bar-chart--heat" :option="heatOption" :autoresize="true" />
          </div>
        </section>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useCarbonResultStore } from '@/stores/carbonResultStore'

use([CanvasRenderer, PieChart, BarChart, TooltipComponent, LegendComponent, GridComponent])

const store = useCarbonResultStore()
const data  = computed(() => store.result)

const gradeOpen      = ref(false)
const activeChartTab = ref('total')

const chartTabs = [
  { id: 'total',       label: '종합' },
  { id: 'electricity', label: '전력 사용량' },
  { id: 'heat',        label: '열 사용량' },
]

const FONT = 'Pretendard, sans-serif'

const donutOption = computed(() => {
  if (!data.value) return {}
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {d}%', textStyle: { fontFamily: FONT, fontSize: 12 } },
    legend: {
      orient: 'vertical', right: 0, top: 'middle',
      itemWidth: 9, itemHeight: 9, itemGap: 10,
      formatter: (name) => {
        const found = data.value.result.breakdown.find(d => d.label === name)
        return `{name|${name}}  {pct|${found?.ratio ?? 0}%}`
      },
      textStyle: {
        fontFamily: FONT,
        rich: {
          name: { fontSize: 12, color: '#373737', width: 64 },
          pct:  { fontSize: 12, color: '#8f8f8f', fontWeight: 600 },
        },
      },
    },
    series: [{
      type: 'pie', radius: ['42%', '68%'], center: ['30%', '50%'],
      label: { show: true, position: 'center', formatter: '100%', fontSize: 15, fontWeight: 700, fontFamily: FONT, color: '#262626' },
      labelLine: { show: false }, emphasis: { scale: false },
      data: data.value.result.breakdown.map(d => ({ name: d.label, value: d.ratio, itemStyle: { color: d.color } })),
    }],
  }
})

const electricityOption = computed(() => {
  if (!data.value) return {}
  return {
    tooltip: { trigger: 'axis', formatter: (p) => `${p[0].name}: <b>${p[0].value.toLocaleString()}</b> MWh/년`, textStyle: { fontFamily: FONT, fontSize: 12 } },
    grid: { top: 28, bottom: 20, left: 8, right: 8, containLabel: true },
    xAxis: { type: 'category', data: data.value.electricityUsage.map(d => d.label), axisLabel: { fontFamily: FONT, fontSize: 12, color: '#565656' }, axisTick: { show: false }, axisLine: { lineStyle: { color: '#e5e5e5' } } },
    yAxis: { type: 'value', axisLabel: { show: false }, splitLine: { lineStyle: { color: '#e5e5e5', type: 'dashed' } } },
    series: [{
      type: 'bar', barMaxWidth: 36, borderRadius: [4, 4, 0, 0], itemStyle: { color: '#059176' },
      label: { show: true, position: 'top', formatter: (p) => p.value.toLocaleString(), fontSize: 12, fontWeight: 700, fontFamily: FONT, color: '#262626' },
      data: data.value.electricityUsage.map(d => d.value),
    }],
  }
})

const HEAT_COLORS = { heating: '#059176', cooling: '#D1D5DB', cooking: '#93C5FD' }
const heatOption = computed(() => {
  if (!data.value) return {}
  const rows = data.value.heatUsage
  const mkSeries = (key, color, name) => ({ name, type: 'bar', stack: 'heat', barMaxWidth: 24, itemStyle: { color }, data: rows.map(r => r[key]) })
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, textStyle: { fontFamily: FONT, fontSize: 12 } },
    legend: { top: 0, itemWidth: 9, itemHeight: 9, textStyle: { fontFamily: FONT, fontSize: 11, color: '#565656' } },
    grid: { top: 32, bottom: 8, left: 8, right: 16, containLabel: true },
    xAxis: { type: 'value', axisLabel: { show: false }, splitLine: { lineStyle: { color: '#e5e5e5', type: 'dashed' } } },
    yAxis: { type: 'category', data: rows.map(r => r.label), axisLabel: { fontFamily: FONT, fontSize: 12, color: '#565656' }, axisTick: { show: false }, axisLine: { show: false } },
    series: [
      mkSeries('heating', HEAT_COLORS.heating, '난방/급탕용'),
      mkSeries('cooling',  HEAT_COLORS.cooling,  '냉방용'),
      mkSeries('cooking',  HEAT_COLORS.cooking,  '취사용'),
    ],
  }
})
</script>

<style lang="scss" scoped>
.result-overlay {
  position: absolute;
  top: 0; right: 0; bottom: 0;
  width: 500px;
  z-index: 100;
  background: $color-white;
  border-left: 1px solid $color-border;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.overlay-slide-enter-active,
.overlay-slide-leave-active { transition: transform 0.3s ease, opacity 0.3s ease; }
.overlay-slide-enter-from,
.overlay-slide-leave-to     { transform: translateX(100%); opacity: 0; }

.overlay-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: $color-white;
  border-bottom: 1px solid $color-border;
  flex-shrink: 0;

  &__left  { display: flex; align-items: center; gap: 8px; }

  &__plan-badge {
    background: $color-primary;
    color: $color-white;
    font-size: 12px;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 5px;
  }

  &__title { font-size: 16px; font-weight: 700; color: $color-text-dark; }

  &__close {
    height: 32px;
    padding: 0 14px;
    font-size: 13px;
    font-weight: 500;
    color: $color-text-body;
    background: $color-white;
    border: 1px solid $color-border;
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s;
    &:hover { background: $color-bg-card; }
  }
}

.overlay-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: $color-border-mid; border-radius: 2px; }
}

.result-section {
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title-row { display: flex; align-items: center; justify-content: space-between; }
.section-title { font-size: $font-size-sm; font-weight: 700; color: $color-text-dark; }

.grade-badge {
  display: flex;
  align-items: center;
  gap: 3px;
  background: #FEF3C7;
  border: 1px solid #FCD34D;
  color: #92400E;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
}

.metric-cards { display: grid; grid-template-columns: 1.3fr 1fr 1fr 1fr; gap: 8px; }

.metric-card {
  background: $color-bg-card;
  border: 1px solid $color-border;
  border-radius: 8px;
  padding: 10px 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &--main { background: $color-white; border-color: $color-border; }
  &__header { display: flex; align-items: center; gap: 3px; }
  &__label  { font-size: 10px; font-weight: 500; color: $color-text-muted; white-space: nowrap; }
  &__value  { font-size: 16px; font-weight: 700; color: $color-text-dark; &--main { font-size: 22px; } }
}

.emission-card {
  background: $color-primary-bg;
  border: 1px solid rgba($color-primary, 0.2);
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__label { font-size: $font-size-xs; font-weight: 600; color: $color-text-muted; }
  &__value {
    font-size: 32px; font-weight: 800; color: $color-text-dark; line-height: 1;
    em { font-style: normal; font-size: $font-size-sm; font-weight: 500; color: $color-text-muted; margin-left: 4px; }
  }
}

.usage-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }

.usage-card {
  background: $color-bg-card;
  border: 1px solid $color-border;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__label { font-size: 10px; font-weight: 500; color: $color-text-muted; }
  &__value { font-size: 16px; font-weight: 700; color: $color-text-dark; line-height: 1; }
  &__unit  { font-size: 9px; font-weight: 500; color: $color-text-muted; }
}

.chart-tabs {
  display: flex;
  border-bottom: 1px solid $color-border;

  &__btn {
    flex: 1;
    padding: 8px 4px;
    font-size: 12px;
    font-weight: 500;
    color: $color-text-muted;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;

    &.is-active { color: $color-primary; border-bottom-color: $color-primary; font-weight: 600; }
    &:hover:not(.is-active) { color: $color-text-body; }
  }
}

.donut-wrap, .bar-wrap { padding-top: 8px; }
.donut-chart { width: 100%; height: 240px; }
.bar-chart   { width: 100%; height: 200px; &--heat { height: 160px; } }
</style>
