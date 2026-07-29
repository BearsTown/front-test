<template>
  <div class="carbon-step1">

    <!-- 섹션 타이틀 -->
    <div class="cs-header">탄소 배출 및 흡수량 산정</div>

    <!-- 면적 구성비 -->
    <div
      class="cs-section cs-section--card"
      :class="{ 'cs-section--active': isAreaActive }"
      @click="mapStore.openAreaDialog(props.planId)"
    >
      <div class="cs-section__head">
        <span class="cs-section__title">면적 구성비</span>
        <v-icon
          size="28"
          class="cs-chevron"
          :class="{ 'cs-chevron--open': openSections.area }"
          @click.stop="openSections.area = !openSections.area"
        >
          mdi-chevron-right
        </v-icon>
      </div>

      <div v-if="openSections.area" class="cs-cards" @click.stop>
        <!-- 총 부지면적 -->
        <div class="cs-card">
          <div class="cs-card__row">
            <span class="cs-card__label">총 부지면적</span>
            <div class="cs-card__val-wrap">
              <span class="cs-card__val">{{ totalSiteArea.toLocaleString() }}</span>
              <span class="cs-unit">㎡</span>
            </div>
          </div>
          <VChart class="area-chart" :option="siteAreaChartOption" autoresize />
        </div>

        <!-- 총 연면적 -->
        <div class="cs-card">
          <div class="cs-card__row">
            <span class="cs-card__label">총 연면적</span>
            <div class="cs-card__val-wrap">
              <span class="cs-card__val">{{ totalFloorArea.toLocaleString() }}</span>
              <span class="cs-unit">㎡</span>
            </div>
          </div>
          <VChart class="area-chart" :option="floorAreaChartOption" autoresize />
        </div>
      </div>
    </div>

    <!-- 전력 사용량 예측 -->
    <div
      class="cs-section cs-section--card"
      :class="{ 'cs-section--active': isElectricityActive }"
      @click="mapStore.openElectricityDialog(props.planId)"
    >
      <div class="cs-section__head">
        <span class="cs-section__title">전력 사용량 예측</span>
        <v-icon
          size="28"
          class="cs-chevron"
          :class="{ 'cs-chevron--open': openSections.electricity }"
          @click.stop="openSections.electricity = !openSections.electricity"
        >
          mdi-chevron-right
        </v-icon>
      </div>

      <div v-if="openSections.electricity" class="cs-chart-box" @click.stop>
        <VChart class="elec-chart" :option="electricityChartOption" autoresize />
      </div>
    </div>

    <!-- 열 사용량 예측 -->
    <div
      class="cs-section cs-section--card"
      :class="{ 'cs-section--active': isHeatActive }"
      @click="mapStore.openHeatDialog(props.planId)"
    >
      <div class="cs-section__head">
        <span class="cs-section__title">열 사용량 예측</span>
        <v-icon
          size="28"
          class="cs-chevron"
          :class="{ 'cs-chevron--open': openSections.heat }"
          @click.stop="openSections.heat = !openSections.heat"
        >
          mdi-chevron-right
        </v-icon>
      </div>

      <div v-if="openSections.heat" class="cs-chart-box" @click.stop>
        <VChart class="heat-chart" :option="heatChartOption" autoresize />
      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useLandStore }    from '@/stores/land'
import { useMapStore }     from '@/stores/map'
import { fetchCarbonData } from '@/api/evalCenterApi'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, LegendComponent])

const props = defineProps({
  planId: { type: String, required: true },
})

const landStore = useLandStore()
const mapStore  = useMapStore()

const openSections = reactive({ area: true, electricity: true, heat: true })

const isAreaActive        = computed(() => mapStore.planDialogs[props.planId]?.area        ?? false)
const isElectricityActive = computed(() => mapStore.planDialogs[props.planId]?.electricity ?? false)
const isHeatActive        = computed(() => mapStore.planDialogs[props.planId]?.heat        ?? false)

// ── 면적 구성비 (land store) ──────────────────────────────────────────────
const rows = computed(() => landStore.plans[props.planId]?.dataRows ?? [])

const totalSiteArea  = computed(() => rows.value.reduce((s, r) => s + (Number(r.면적)   || 0), 0))
const totalFloorArea = computed(() => rows.value.reduce((s, r) => s + (Number(r.연면적) || 0), 0))

const AREA_GROUPS   = ['주거용지', '상업용지', '기타']
const AREA_COLORS   = { 주거용지: '#ffda7f', 상업용지: '#ffaeae', 기타: '#72aaff' }
const AREA_GROUP_LABEL = { 주거용지: '주거용지', 상업용지: '상업용지', 기타: '기타시설' }

function groupAreaRows(field) {
  const acc = { 주거용지: 0, 상업용지: 0, 기타: 0 }
  for (const r of rows.value) {
    const v = Number(r[field]) || 0
    if (r.구분 === '주거용지')  acc.주거용지 += v
    else if (r.구분 === '상업용지') acc.상업용지 += v
    else acc.기타 += v
  }
  return acc
}

const CHART_LEGEND_BOTTOM = {
  bottom: 0,
  left: 'center',
  itemWidth: 8,
  itemHeight: 8,
  textStyle: { fontSize: 11, color: '#888' },
}

function makeAreaBarOption(groupAcc, total) {
  const items = AREA_GROUPS
    .filter(g => groupAcc[g] > 0)
    .map(g => ({ name: AREA_GROUP_LABEL[g], value: groupAcc[g], color: AREA_COLORS[g] }))

  return {
    grid: { top: 6, bottom: 34, left: 0, right: 0 },
    xAxis: { type: 'value', show: false, max: total },
    yAxis: { type: 'category', show: false, data: [''] },
    tooltip: {
      trigger: 'item',
      formatter: (p) => {
        const pct = total > 0 ? ((p.value / total) * 100).toFixed(1) : 0
        return `${p.seriesName}: ${Number(p.value).toLocaleString()}㎡ (${pct}%)`
      },
    },
    legend: CHART_LEGEND_BOTTOM,
    series: items.map(item => ({
      type: 'bar',
      name: item.name,
      stack: 'total',
      barWidth: 20,
      data: [item.value],
      itemStyle: { color: item.color },
    })),
  }
}

const siteAreaChartOption  = computed(() => makeAreaBarOption(groupAreaRows('면적'),   totalSiteArea.value))
const floorAreaChartOption = computed(() => makeAreaBarOption(groupAreaRows('연면적'), totalFloorArea.value))

// ── 전력 사용량 예측 (세로 바) ───────────────────────────────────────────
const electricityItems = ref([])

const electricityChartOption = computed(() => {
  if (!electricityItems.value.length) return {}
  const labels = electricityItems.value.map(i => i.label)
  const values = electricityItems.value.map(i => i.value)
  return {
    grid: { top: 28, bottom: 28, left: 42, right: 10 },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: { fontSize: 11, color: '#5a5a5a' },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e0e0e0' } },
    },
    yAxis: {
      type: 'value',
      name: 'MWh/년',
      nameTextStyle: { fontSize: 10, color: '#888' },
      axisLabel: { fontSize: 10, color: '#888' },
      splitLine: { lineStyle: { color: '#e8e8e8' } },
    },
    tooltip: {
      trigger: 'item',
      formatter: (p) => `${p.name}: ${Number(p.value).toFixed(3)} MWh/년`,
    },
    series: [{
      type: 'bar',
      data: values,
      barWidth: 20,
      itemStyle: { color: '#71baa4', borderRadius: [2, 2, 0, 0] },
      label: {
        show: true,
        position: 'top',
        fontSize: 10,
        color: '#373737',
        formatter: (p) => Number(p.value).toFixed(3),
      },
    }],
  }
})

// ── 열 사용량 예측 (가로 바) ──────────────────────────────────────────────
const heatItems  = ref([])
const heatMaxVal = ref(1)

const heatChartOption = computed(() => {
  if (!heatItems.value.length) return {}
  const labels  = heatItems.value.map(i => i.label)
  const heating = heatItems.value.map(i => i.heating)
  const cooling = heatItems.value.map(i => i.cooling)
  const cooking = heatItems.value.map(i => i.cooking)
  return {
    legend: {
      top: 0,
      left: 'center',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { fontSize: 11, color: '#888' },
    },
    grid: { top: 30, bottom: 8, left: 50, right: 10 },
    xAxis: { type: 'value', show: false, max: heatMaxVal.value },
    yAxis: {
      type: 'category',
      data: labels,
      axisLabel: { fontSize: 11, color: '#5a5a5a' },
      axisTick: { show: false },
      axisLine: { show: false },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const name = params[0]?.axisValue ?? ''
        const lines = params
          .filter(p => p.value > 0)
          .map(p => `${p.marker}${p.seriesName}: ${p.value}`)
        return [name, ...lines].join('<br/>')
      },
    },
    series: [
      { type: 'bar', name: '난방/급탕용', stack: 'total', barWidth: 14, data: heating, itemStyle: { color: '#71baa4' } },
      { type: 'bar', name: '냉방용',      stack: 'total', barWidth: 14, data: cooling, itemStyle: { color: '#d5d5d5' } },
      { type: 'bar', name: '취사용',      stack: 'total', barWidth: 14, data: cooking, itemStyle: { color: '#8fa6ff' } },
    ],
  }
})

onMounted(async () => {
  const data = await fetchCarbonData(props.planId)
  electricityItems.value = data.electricity
  heatItems.value        = data.heat.items
  heatMaxVal.value       = data.heat.maxVal || 1
})
</script>

<style lang="scss" scoped>
.carbon-step1 {
  display: flex;
  flex-direction: column;
}

// ── 섹션 타이틀 ──────────────────────────────────────────────
.cs-header {
  height: 52px;
  padding: 10px 20px;
  background: var(--color-surface-section);
  border-bottom: 1px solid var(--color-border-subtle);
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  color: var(--color-text-section);
  display: flex;
  align-items: center;
}

// ── 접이식 섹션 ───────────────────────────────────────────────
.cs-section {
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;

  &--card {
    cursor: pointer;
    transition: background var(--transition-fast);

    &:hover:not(.cs-section--active) {
      background: var(--color-surface-section);
    }
  }

  &--active { background: var(--color-primary-light); }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    font-size: var(--fs-xl);
    font-weight: var(--fw-bold);
    color: var(--color-text-body);
    letter-spacing: var(--ls-tight);
  }
}

.cs-chevron {
  color: var(--color-text-hint);
  transition: transform var(--transition-fast);
  transform: rotate(0deg);

  &--open { transform: rotate(90deg); }
}

// ── 면적 카드 ─────────────────────────────────────────────────
.cs-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cs-card {
  background: #fafafa;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 16px 18px;
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
    color: #333;
    letter-spacing: var(--ls-tight);
  }

  &__val-wrap {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: var(--fs-base);
    letter-spacing: var(--ls-tight);
    white-space: nowrap;
  }

  &__val {
    font-weight: var(--fw-semibold);
    color: #262626;
  }
}

.cs-unit {
  font-size: var(--fs-base);
  font-weight: $font-weight-regular;
  color: var(--color-text-unit);
  font-style: normal;
}

// ── 차트 공통 박스 ────────────────────────────────────────────
.cs-chart-box {
  background: #f8f8f8;
  border-radius: 20px;
  padding: 20px 17px;
  display: flex;
  flex-direction: column;
}

// ── ECharts 차트 크기 ─────────────────────────────────────────
.area-chart { height: 70px; }
.elec-chart { height: 180px; }
.heat-chart { height: 130px; }
</style>
