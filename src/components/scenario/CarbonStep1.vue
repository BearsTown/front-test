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

      <template v-if="openSections.area">
        <div class="cs-cards" @click.stop>
          <!-- 총 부지면적 -->
          <div class="cs-card">
            <div class="cs-card__row">
              <span class="cs-card__label">총 부지면적</span>
              <div class="cs-card__val-wrap">
                <span class="cs-card__val">{{ totalSiteArea.toLocaleString() }}</span>
                <span class="cs-unit">㎡</span>
              </div>
            </div>
            <div class="stacked-bar">
              <div class="stacked-bar__layer stacked-bar__layer--blue" />
              <div class="stacked-bar__layer stacked-bar__layer--pink" :style="{ width: siteMixedWidth }" />
              <div class="stacked-bar__layer stacked-bar__layer--yellow" :style="{ width: siteResidenceWidth }" />
            </div>
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
            <div class="stacked-bar">
              <div class="stacked-bar__layer stacked-bar__layer--blue" />
              <div class="stacked-bar__layer stacked-bar__layer--pink" :style="{ width: floorMixedWidth }" />
              <div class="stacked-bar__layer stacked-bar__layer--yellow" :style="{ width: floorResidenceWidth }" />
            </div>
          </div>
        </div>
      </template>
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

      <template v-if="openSections.electricity">
        <div class="cs-chart-box" @click.stop>
          <div class="cs-legend">
            <span class="cs-legend__dot cs-legend__dot--teal" />
            <span class="cs-legend__name">연간사용량(MWh/년)</span>
          </div>
          <div class="elec-chart">
            <div class="elec-chart__grid">
              <div v-for="n in 8" :key="n" class="elec-chart__grid-line" />
            </div>
            <div class="elec-chart__bars">
              <div v-for="item in electricityData" :key="item.label" class="elec-bar-group">
                <span class="elec-bar-group__val">{{ item.value }}</span>
                <div class="elec-bar-group__track">
                  <div class="elec-bar-group__bar" :style="{ height: item.pct + '%' }" />
                </div>
                <span class="elec-bar-group__label">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
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

      <template v-if="openSections.heat">
        <div class="cs-chart-box" @click.stop>
          <div class="cs-legend">
            <span class="cs-legend__dot cs-legend__dot--teal" />
            <span class="cs-legend__name">난방/급탕용</span>
            <span class="cs-legend__dot cs-legend__dot--gray" />
            <span class="cs-legend__name">냉방용</span>
            <span class="cs-legend__dot cs-legend__dot--indigo" />
            <span class="cs-legend__name">취사용</span>
          </div>
          <div class="heat-chart">
            <div v-for="item in heatData" :key="item.label" class="heat-row">
              <span class="heat-row__label">{{ item.label }}</span>
              <div class="heat-row__track">
                <div class="heat-row__seg heat-row__seg--teal"   :style="{ width: item.heatingPct + '%' }" />
                <div class="heat-row__seg heat-row__seg--gray"   :style="{ width: item.coolingPct + '%' }" />
                <div class="heat-row__seg heat-row__seg--indigo" :style="{ width: item.cookingPct + '%' }" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

  </div>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue'
import { useLandStore }   from '@/stores/land'
import { useMapStore }    from '@/stores/map'
import { fetchCarbonData } from '@/api/evalCenterApi'

const props = defineProps({
  planId: { type: String, required: true },
})

const landStore = useLandStore()
const mapStore  = useMapStore()

const openSections = reactive({ area: true, electricity: true, heat: true })

const isAreaActive        = computed(() => mapStore.planDialogs[props.planId]?.area        ?? false)
const isElectricityActive = computed(() => mapStore.planDialogs[props.planId]?.electricity ?? false)
const isHeatActive        = computed(() => mapStore.planDialogs[props.planId]?.heat        ?? false)

// ── 면적 구성비 ───────────────────────────────────────────────
const rows = computed(() => landStore.plans[props.planId]?.dataRows ?? [])

const totalSiteArea  = computed(() => rows.value.reduce((s, r) => s + (Number(r.면적)  || 0), 0))
const totalFloorArea = computed(() => rows.value.reduce((s, r) => s + (Number(r.연면적) || 0), 0))

const residenceArea  = computed(() => rows.value.filter(r => r.구분 === '주거용지').reduce((s, r) => s + (Number(r.면적) || 0), 0))
const commerceArea   = computed(() => rows.value.filter(r => r.구분 === '상업용지').reduce((s, r) => s + (Number(r.면적) || 0), 0))
const residenceFloor = computed(() => rows.value.filter(r => r.구분 === '주거용지').reduce((s, r) => s + (Number(r.연면적) || 0), 0))
const commerceFloor  = computed(() => rows.value.filter(r => r.구분 === '상업용지').reduce((s, r) => s + (Number(r.연면적) || 0), 0))

function pct(num, total) {
  if (!total) return '0%'
  return `${Math.min((num / total) * 100, 100).toFixed(1)}%`
}

const siteResidenceWidth = computed(() => pct(residenceArea.value, totalSiteArea.value))
const siteMixedWidth     = computed(() => pct(residenceArea.value + commerceArea.value, totalSiteArea.value))
const floorResidenceWidth = computed(() => pct(residenceFloor.value, totalFloorArea.value))
const floorMixedWidth    = computed(() => pct(residenceFloor.value + commerceFloor.value, totalFloorArea.value))

// ── 전력 사용량 예측 ──────────────────────────────────────────
const electricityData = reactive([])

// ── 열 사용량 예측 ────────────────────────────────────────────
const heatData = reactive([])

onMounted(async () => {
  const data = await fetchCarbonData(props.planId)

  const maxElec = Math.max(...data.electricity.map(i => i.value))
  data.electricity.forEach(item => {
    electricityData.push({ ...item, pct: maxElec > 0 ? (item.value / maxElec) * 100 : 0 })
  })

  data.heat.items.forEach(item => {
    const max = data.heat.maxVal || 1
    heatData.push({
      label:      item.label,
      heatingPct: (item.heating / max) * 100,
      coolingPct: (item.cooling / max) * 100,
      cookingPct: (item.cooking / max) * 100,
    })
  })
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

  &--active {
    background: var(--color-primary-light);
  }

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
  gap: 17px;

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

// ── 스택 바 ───────────────────────────────────────────────────
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

// ── 범례 ─────────────────────────────────────────────────────
.cs-legend {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.cs-legend__dot {
  width: 11px;
  height: 11px;
  border-radius: 6px;
  flex-shrink: 0;

  &--teal  { background: #71baa4; }
  &--gray  { background: #d5d5d5; }
  &--indigo { background: #8fa6ff; }
}

.cs-legend__name {
  font-size: var(--fs-xs);
  color: var(--color-text-body);
  white-space: nowrap;
  margin-right: 10px;
}

// ── 차트 공통 박스 ────────────────────────────────────────────
.cs-chart-box {
  background: #f8f8f8;
  border-radius: 20px;
  padding: 24px 17px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// ── 전력 사용량 세로 막대 차트 ───────────────────────────────
.elec-chart {
  position: relative;
}

.elec-chart__grid {
  position: absolute;
  inset: 0 0 22px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;

  &-line {
    width: 100%;
    height: 1px;
    background: #e8e8e8;
  }
}

.elec-chart__bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 20px;
  height: 160px;
  padding-top: 10px;
  padding-bottom: 22px;
  border-bottom: 1px solid #e0e0e0;
}

.elec-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;

  &__val {
    font-size: var(--fs-base);
    font-weight: var(--fw-semibold);
    color: #373737;
    letter-spacing: var(--ls-tight);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__track {
    flex: 1;
    width: 13px;
    display: flex;
    align-items: flex-end;
  }

  &__bar {
    width: 100%;
    background: #71baa4;
    border-radius: 2px;
    min-height: 2px;
  }

  &__label {
    font-size: var(--fs-xs);
    color: #5a5a5a;
    letter-spacing: var(--ls-tight);
    text-align: center;
    white-space: nowrap;
  }
}

// ── 열 사용량 수평 스택 바 ────────────────────────────────────
.heat-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.heat-row {
  display: flex;
  align-items: center;
  gap: 8px;

  &__label {
    width: 48px;
    flex-shrink: 0;
    font-size: var(--fs-xs);
    color: #5a5a5a;
    letter-spacing: var(--ls-tight);
  }

  &__track {
    flex: 1;
    height: 13px;
    display: flex;
    gap: 0;
  }

  &__seg {
    height: 100%;
    border-radius: 2px;

    &--teal  { background: #71baa4; }
    &--gray  { background: #d5d5d5; }
    &--indigo { background: #8fa6ff; }
  }
}
</style>
