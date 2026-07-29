<template>
  <div class="result-panel">

    <!-- 헤더 -->
    <div class="rp-header">
      <div class="rp-header__left">
        <span class="rp-plan-badge">{{ planLabel }}</span>
        <span class="rp-title">종합결과</span>
      </div>
      <button class="rp-close-btn" @click="$emit('close')">닫기</button>
    </div>

    <!-- 본문 -->
    <div class="rp-body">

      <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
      <!-- Section 1: 녹색도시 개발계획 평가 결과              -->
      <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
      <div class="rp-section">

        <div class="rp-sec-header" @click="sec1Open = !sec1Open">
          <div class="rp-sec-header__left">
            <span class="rp-sec-title">녹색도시 개발계획 평가 결과</span>
            <span class="rp-grade-badge">{{ RESULT.grade }}등급</span>
          </div>
          <v-icon
            size="18"
            class="rp-chevron"
            :class="{ 'rp-chevron--closed': !sec1Open }"
          >mdi-chevron-up</v-icon>
        </div>

        <transition name="rp-expand">
          <div v-if="sec1Open" class="rp-sec-body">

            <!-- 4개 점수 카드 -->
            <div class="rp-scores">
              <div class="rp-score rp-score--primary">
                <span class="rp-score__label">최종평점</span>
                <span class="rp-score__val">{{ RESULT.finalScore }}</span>
              </div>
              <div class="rp-score">
                <span class="rp-score__label">탄소흡수</span>
                <span class="rp-score__val">{{ RESULT.carbonAbsorb }}</span>
              </div>
              <div class="rp-score">
                <span class="rp-score__label">탄소저감</span>
                <span class="rp-score__val">{{ RESULT.carbonReduce }}</span>
              </div>
              <div class="rp-score">
                <span class="rp-score__label">정성평가</span>
                <span class="rp-score__val">{{ RESULT.qualitative }}</span>
              </div>
            </div>

            <!-- 탄소배출량 카드 -->
            <div class="rp-emission">
              <span class="rp-emission__label">탄소배출량</span>
              <div class="rp-emission__right">
                <span class="rp-emission__value">{{ RESULT.totalEmission.toLocaleString() }}</span>
                <span class="rp-emission__unit">tCo2/년</span>
              </div>
            </div>

          </div>
        </transition>
      </div>

      <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
      <!-- Section 2: 탄소 배출 및 흡수량 예측 결과           -->
      <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
      <div class="rp-section rp-section--last">

        <div class="rp-sec-header rp-sec-header--plain">
          <span class="rp-sec-title">탄소 배출 및 흡수량 예측 결과</span>
        </div>

        <!-- 용도별 카드 3개 -->
        <div class="rp-cats">
          <div class="rp-cat">
            <span class="rp-cat__label">주거</span>
            <span class="rp-cat__value">{{ RESULT.residential.toLocaleString() }}</span>
            <span class="rp-cat__unit">tCo2/년</span>
          </div>
          <div class="rp-cat">
            <span class="rp-cat__label">상업</span>
            <span class="rp-cat__value">{{ RESULT.commercial.toLocaleString() }}</span>
            <span class="rp-cat__unit">tCo2/년</span>
          </div>
          <div class="rp-cat">
            <span class="rp-cat__label">기반시설</span>
            <span class="rp-cat__value">{{ RESULT.infrastructure.toLocaleString() }}</span>
            <span class="rp-cat__unit">tCo2/년</span>
          </div>
        </div>

        <!-- 탭 -->
        <div class="rp-tabs">
          <button
            v-for="tab in TABS"
            :key="tab.key"
            class="rp-tab"
            :class="{ 'rp-tab--active': activeTab === tab.key }"
            @click="activeTab = tab.key"
          >{{ tab.label }}</button>
        </div>

        <!-- 차트 영역 -->
        <div class="rp-chart-area">
          <VChart v-if="activeTab === 'total'" class="total-chart" :option="totalChartOption" autoresize />
          <div v-else class="rp-chart-placeholder">
            {{ activeTab === 'electricity' ? '전력 사용량' : '열 사용량' }} 세부 결과
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useScenarioStore } from '@/stores/scenario'

use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent])

defineEmits(['close'])

const scenarioStore = useScenarioStore()
const planLabel = computed(() => `${scenarioStore.activePlan}안`)

const sec1Open = ref(true)
const activeTab = ref('total')

const TABS = [
  { key: 'total',       label: '종합' },
  { key: 'electricity', label: '전력 사용량' },
  { key: 'heat',        label: '열 사용량' },
]

const RESULT = {
  grade:          '3',
  finalScore:     71.02,
  carbonAbsorb:   33.3,
  carbonReduce:   37.7,
  qualitative:    0.02,
  totalEmission:  125502,
  residential:    40880,
  commercial:     58302,
  infrastructure: 26320,
}

const CHART_DATA = [
  { label: '단독주택', value: 10, color: '#ffda7f' },
  { label: '공동주택', value: 15, color: '#ffbd1a' },
  { label: '일반상업', value: 16, color: '#c7dd98' },
  { label: '근린상업', value: 18, color: '#acaaa0' },
  { label: '공공청사', value: 14, color: '#95def1' },
  { label: '의료시설', value: 12, color: '#ffd2ac' },
  { label: '기타시설', value: 15, color: '#e0e0e0' },
]

const totalChartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (p) => `${p.name}: ${p.value}%`,
  },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'middle',
    itemWidth: 10,
    itemHeight: 10,
    itemStyle: { borderRadius: 3, borderWidth: 0 },
    textStyle: { fontSize: 12, color: '#555' },
    formatter: (name) => {
      const item = CHART_DATA.find(d => d.label === name)
      return `{nm|${name}}{pct|${item?.value ?? 0}%}`
    },
    rich: {
      nm:  { fontSize: 12, color: '#555',   width: 68 },
      pct: { fontSize: 12, fontWeight: 'bold', color: '#1a1a1a', width: 36, align: 'right' },
    },
  },
  series: [{
    type: 'pie',
    radius: ['50%', '75%'],
    center: ['36%', '50%'],
    label: { show: false },
    emphasis: { label: { show: false } },
    data: CHART_DATA.map(d => ({
      name: d.label,
      value: d.value,
      itemStyle: { color: d.color, borderRadius: 3 },
    })),
  }],
}))
</script>

<style lang="scss" scoped>
// ── 패널 레이아웃 ─────────────────────────────────────
.result-panel {
  width: 532px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: $color-white;
  box-shadow: -4px 0 20px 0 rgba(0, 0, 0, 0.1);
}

// ── 헤더 ──────────────────────────────────────────────
.rp-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 67px;
  padding: 0 20px;
  border-bottom: 1px solid #e8e8e8;

  &__left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.rp-plan-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 26px;
  padding: 0 10px;
  background: #518bf6;
  color: $color-white;
  border-radius: 6px;
  font-size: 12px;
  font-weight: $font-weight-semibold;
  letter-spacing: -0.24px;
}

.rp-title {
  font-size: 16px;
  font-weight: $font-weight-bold;
  color: #1a1a1a;
  letter-spacing: -0.32px;
}

.rp-close-btn {
  height: 32px;
  padding: 0 16px;
  background: $color-white;
  border: 1px solid #e0e0e0;
  border-radius: 100px;
  font-size: 12px;
  font-weight: $font-weight-medium;
  color: #555;
  cursor: pointer;
  letter-spacing: -0.24px;
  transition: background $transition-fast;

  &:hover { background: #f5f5f5; }
}

// ── 본문 스크롤 ───────────────────────────────────────
.rp-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;

  &::-webkit-scrollbar       { width: 5px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: #c8c8c8;
    border-radius: 100px;
    &:hover { background: #a0a0a0; }
  }
}

// ── 섹션 ──────────────────────────────────────────────
.rp-section {
  border-bottom: 8px solid #f2f2f2;

  &--last { border-bottom: none; }
}

.rp-sec-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  user-select: none;
  transition: background $transition-fast;

  &:hover { background: #fafafa; }

  &--plain {
    cursor: default;
    &:hover { background: none; }
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.rp-sec-title {
  font-size: 14px;
  font-weight: $font-weight-bold;
  color: #1a1a1a;
  letter-spacing: -0.28px;
}

.rp-grade-badge {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  background: #ffde81;
  border-radius: 100px;
  font-size: 11px;
  font-weight: $font-weight-semibold;
  color: #7a5800;
  letter-spacing: -0.22px;
}

.rp-chevron {
  color: #888;
  transition: transform $transition-base;

  &--closed { transform: rotate(180deg); }
}

.rp-sec-body {
  padding: 0 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// ── 점수 카드 4개 ──────────────────────────────────────
.rp-scores {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.rp-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 80px;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 12px 6px;

  &--primary { background: #ecf2fe; }

  &__label {
    font-size: 11px;
    font-weight: $font-weight-medium;
    color: #6e6e6e;
    letter-spacing: -0.22px;
    text-align: center;
    white-space: nowrap;
  }

  &__val {
    font-size: 18px;
    font-weight: $font-weight-bold;
    color: #1a1a1a;
    letter-spacing: -0.36px;
  }
}

// ── 탄소배출량 카드 ───────────────────────────────────
.rp-emission {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: #ecf2fe;
  border-radius: 10px;

  &__label {
    font-size: 13px;
    font-weight: $font-weight-semibold;
    color: #256ef4;
    letter-spacing: -0.26px;
  }

  &__right {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  &__value {
    font-size: 26px;
    font-weight: $font-weight-bold;
    color: #256ef4;
    letter-spacing: -0.52px;
  }

  &__unit {
    font-size: 12px;
    font-weight: $font-weight-medium;
    color: #256ef4;
    letter-spacing: -0.24px;
  }
}

// ── 용도별 카드 3개 ───────────────────────────────────
.rp-cats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 0 20px 16px;
}

.rp-cat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 8px;
  background: #f5f5f5;
  border-radius: 10px;
  gap: 4px;

  &__label {
    font-size: 12px;
    font-weight: $font-weight-medium;
    color: #6e6e6e;
    letter-spacing: -0.24px;
  }

  &__value {
    font-size: 18px;
    font-weight: $font-weight-bold;
    color: #1a1a1a;
    letter-spacing: -0.36px;
  }

  &__unit {
    font-size: 11px;
    font-weight: $font-weight-medium;
    color: #a0a0a0;
    letter-spacing: -0.22px;
  }
}

// ── 탭 ───────────────────────────────────────────────
.rp-tabs {
  display: flex;
  border-bottom: 1px solid #e8e8e8;
  margin: 0 20px;
}

.rp-tab {
  flex: 1;
  height: 40px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 13px;
  font-weight: $font-weight-medium;
  color: #888;
  cursor: pointer;
  letter-spacing: -0.26px;
  margin-bottom: -1px;
  transition: all $transition-fast;

  &--active {
    border-bottom-color: #256ef4;
    color: #256ef4;
    font-weight: $font-weight-semibold;
  }

  &:hover:not(.rp-tab--active) { color: #444; }
}

// ── 차트 영역 ─────────────────────────────────────────
.rp-chart-area {
  padding: 20px;
}

.total-chart {
  height: 220px;
}

// ── 플레이스홀더 ──────────────────────────────────────
.rp-chart-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 10px;
  font-size: 13px;
  color: #888;
  letter-spacing: -0.26px;
}

// ── 섹션 열림/닫힘 트랜지션 ──────────────────────────
.rp-expand-enter-active,
.rp-expand-leave-active {
  transition: opacity $transition-base, max-height $transition-base;
  overflow: hidden;
  max-height: 600px;
}
.rp-expand-enter-from,
.rp-expand-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
