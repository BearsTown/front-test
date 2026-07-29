<template>
  <div class="step1-body">

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

    <!-- 섹션 카드 목록 -->
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
        <div v-if="sections[sec.key]" class="chart-card" @click.stop>

          <!-- 인구 및 수용 계획 -->
          <template v-if="sec.key === 'population'">
            <div class="chart-card__summary">
              <span class="chart-card__label">총 인구</span>
              <span class="chart-card__value" :class="{ 'chart-card__value--empty': !hasPopulationData }">
                {{ (popPlan?.totalPopulation || 0).toLocaleString() }}<em class="chart-card__unit">인</em>
              </span>
            </div>
            <VChart
              v-if="hasPopulationData"
              class="chart"
              :option="populationChartOption"
              autoresize
            />
            <div v-else class="chart-empty">데이터를 입력해 주세요</div>
          </template>

          <!-- 인구 및 주택건설 계획 -->
          <template v-else-if="sec.key === 'housing'">
            <div class="chart-card__summary">
              <span class="chart-card__label">총 면적</span>
              <span class="chart-card__value" :class="{ 'chart-card__value--empty': !hasHousingData }">
                {{ housingAreaTotal.toLocaleString() }}<em class="chart-card__unit">m²</em>
              </span>
            </div>
            <VChart
              v-if="hasHousingData"
              class="chart"
              :option="housingChartOption"
              autoresize
            />
            <div v-else class="chart-empty">데이터를 입력해 주세요</div>
          </template>

          <!-- 토지이용계획 -->
          <template v-else-if="sec.key === 'land'">
            <div class="chart-card__summary">
              <span class="chart-card__label">총 면적</span>
              <span class="chart-card__value" :class="{ 'chart-card__value--empty': !hasLandData }">
                {{ landAreaTotal.toLocaleString() }}<em class="chart-card__unit">m²</em>
              </span>
            </div>
            <VChart
              v-if="hasLandData"
              class="chart"
              :option="landChartOption"
              autoresize
            />
            <div v-else class="chart-empty">데이터를 입력해 주세요</div>
          </template>

        </div>
      </transition>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useScenarioStore }       from '@/stores/scenario'
import { usePopulationStore }     from '@/stores/population'
import { useHousingStore }        from '@/stores/housing'
import { useLandStore, LAND_GROUPS } from '@/stores/land'
import { useMapStore }            from '@/stores/map'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, LegendComponent])

const props = defineProps({
  planId: { type: String, required: true },
})
defineEmits(['file-upload-click'])

const scenarioStore   = useScenarioStore()
const populationStore = usePopulationStore()
const housingStore    = useHousingStore()
const landStore       = useLandStore()
const mapStore        = useMapStore()

const plan     = computed(() => scenarioStore.plans[props.planId])
const form     = computed(() => plan.value.form)
const sections = computed(() => plan.value.sections)

const uploadedGrade = computed({
  get: () => plan.value.uploadedGrade,
  set: (v) => scenarioStore.setUploadedGrade(props.planId, v),
})

const gradeOptions = [
  { value: 1, title: '1급지' },
  { value: 2, title: '2급지' },
]

const sectionConfigs = [
  { key: 'population', title: '인구 및 수용 계획' },
  { key: 'housing',    title: '인구 및 주택건설 계획' },
  { key: 'land',       title: '토지이용계획' },
]

const toggle = (key) => scenarioStore.toggleSection(props.planId, key)

const dialogOpeners = {
  population: () => mapStore.openPopulationDialog(props.planId),
  housing:    () => mapStore.openHousingDialog(props.planId),
  land:       () => mapStore.openLandDialog(props.planId),
}

function openSectionDialog(key) {
  dialogOpeners[key]?.()
}

function isDialogActive(key) {
  return mapStore.planDialogs[props.planId]?.[key] ?? false
}

// ── 공통 차트 헬퍼 ───────────────────────────────────────────────────────
const CHART_LEGEND = {
  bottom: 0,
  left: 'center',
  itemWidth: 8,
  itemHeight: 8,
  textStyle: { fontSize: 11, color: '#888' },
}

const makeStackedBarOption = (items, total, unit) => ({
  grid: { top: 6, bottom: 34, left: 0, right: 0 },
  xAxis: { type: 'value', show: false, max: total },
  yAxis: { type: 'category', show: false, data: [''] },
  tooltip: {
    trigger: 'item',
    formatter: (p) => {
      const pct = total > 0 ? ((p.value / total) * 100).toFixed(1) : 0
      return `${p.seriesName}: ${Number(p.value).toLocaleString()}${unit} (${pct}%)`
    },
  },
  legend: CHART_LEGEND,
  series: items.map(item => ({
    type: 'bar',
    name: item.name,
    stack: 'total',
    barWidth: 20,
    data: [item.value],
    itemStyle: { color: item.color },
    emphasis: { focus: 'series' },
  })),
})

// ── 인구 ─────────────────────────────────────────────────────────────────
const POP_COLORS = { 단독주택: '#ffda7f', 공동주택: '#ffaeae', 주상복합: '#72aaff' }

const popPlan           = computed(() => populationStore.plans[props.planId])
const hasPopulationData = computed(() => (popPlan.value?.totalPopulation ?? 0) > 0)

const populationChartOption = computed(() => {
  const rows = popPlan.value?.populationRows ?? []
  if (!rows.length) return {}
  const total = popPlan.value.totalPopulation
  return makeStackedBarOption(
    rows.map(r => ({ name: r.구분, value: r.인구, color: POP_COLORS[r.구분] ?? '#ccc' })),
    total,
    '인',
  )
})

// ── 주택건설 ─────────────────────────────────────────────────────────────
const HOUSING_COLORS = { 단독주택: '#ffda7f', 공동주택: '#ffaeae', 주상복합: '#72aaff' }
const HOUSING_TYPES  = ['단독주택', '공동주택', '주상복합']

const housingPlan      = computed(() => housingStore.plans[props.planId])
const housingAreaRow   = computed(() => housingPlan.value?.housingTypeRows?.[0])
const housingAreaTotal = computed(() => housingAreaRow.value?.합계 ?? 0)
const hasHousingData   = computed(() => housingAreaTotal.value > 0)

const housingChartOption = computed(() => {
  const row = housingAreaRow.value
  if (!row || !hasHousingData.value) return {}
  return makeStackedBarOption(
    HOUSING_TYPES
      .filter(t => (row[t] ?? 0) > 0)
      .map(t => ({ name: t, value: row[t], color: HOUSING_COLORS[t] })),
    housingAreaTotal.value,
    '㎡',
  )
})

// ── 토지이용 ─────────────────────────────────────────────────────────────
const LAND_COLORS = {
  '주거용지':         '#5470c6',
  '상업용지':         '#91cc75',
  '도시기반시설용지': '#fac858',
  '기타시설용지':     '#ee6666',
}

const landPlan        = computed(() => landStore.plans[props.planId])
const landGroupTotals = computed(() => {
  const acc = {}
  for (const r of landPlan.value?.dataRows ?? []) {
    acc[r.구분] = (acc[r.구분] || 0) + (Number(r.면적) || 0)
  }
  return acc
})
const landAreaTotal = computed(() =>
  Object.values(landGroupTotals.value).reduce((s, v) => s + v, 0)
)
const hasLandData = computed(() => landAreaTotal.value > 0)

const landChartOption = computed(() => {
  if (!hasLandData.value) return {}
  return makeStackedBarOption(
    LAND_GROUPS
      .filter(g => (landGroupTotals.value[g] || 0) > 0)
      .map(g => ({ name: g, value: landGroupTotals.value[g], color: LAND_COLORS[g] })),
    landAreaTotal.value,
    '㎡',
  )
})
</script>

<style lang="scss" scoped>
.step1-body {
  display: flex;
  flex-direction: column;
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

.subsection {
  border-bottom: 1px solid var(--color-border-subtle);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  &--active { background: var(--color-primary-light); }

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

.expand-icon {
  color: var(--color-text-hint);
  transition: transform var(--transition-fast);

  &--open { transform: rotate(90deg); }
}

// ── 차트 카드 ────────────────────────────────────────────────────────────
.chart-card {
  background: var(--color-surface-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__summary {
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
    font-weight: 400;
    color: var(--color-text-unit);
    font-style: normal;
  }
}

.chart {
  height: 70px;
}

.chart-empty {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-sm);
  color: var(--color-text-hint);
  letter-spacing: var(--ls-tight);
}

// ── Expand Transition ────────────────────────────────────────────────────
.expand-enter-active,
.expand-leave-active {
  transition: opacity var(--transition-base), max-height var(--transition-base);
  overflow: hidden;
  max-height: 200px;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
