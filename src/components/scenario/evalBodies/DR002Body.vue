<template>
  <div class="dr002-body">

    <!-- ① 데이터 입력 섹션 -->
    <div class="eval-section">
      <div class="eval-section__head">
        <span class="eval-section__label">주거용지 면적</span>
        <button class="btn-data-select" @click="openLandSelect">
          데이터선택
          <v-icon size="12">mdi-harddisk</v-icon>
        </button>
      </div>

      <div class="data-table">
        <div class="data-table__head">
          <div class="data-table__hcell">토지이용</div>
          <div class="data-table__hcell">면적(㎡)</div>
          <div class="data-table__hcell">용적률(%)</div>
          <div class="data-table__hcell">연면적(㎡)</div>
        </div>
        <template v-if="selectedLandRows.length > 0">
          <div v-for="(row, i) in selectedLandRows" :key="i" class="data-table__row">
            <div class="data-table__cell data-table__cell--land">{{ shortLandLabel(row) }}</div>
            <div class="data-table__cell data-table__cell--num">{{ formatNum(row.면적) }}</div>
            <div class="data-table__cell data-table__cell--num">{{ formatNum(row.용적률) }}</div>
            <div class="data-table__cell data-table__cell--num">{{ formatNum(row.연면적) }}</div>
          </div>
          <div class="data-table__row data-table__row--total">
            <div class="data-table__cell data-table__cell--total-label">합계</div>
            <div class="data-table__cell data-table__cell--num data-table__cell--total-num">
              {{ formatNum(computedTotalArea) }}
            </div>
            <div class="data-table__cell data-table__cell--num" />
            <div class="data-table__cell data-table__cell--num data-table__cell--total-num">
              {{ formatNum(computedTotalFloorArea) }}
            </div>
          </div>
        </template>
        <div v-else class="data-table__empty">데이터가 없습니다.</div>
      </div>
    </div>

    <!-- 구분선 -->
    <div class="eval-divider" />

    <!-- ② 평가점수 섹션 -->
    <div class="eval-section">
      <div class="eval-section__head">
        <span class="eval-section__label">평가점수</span>
        <button
          class="btn-calc"
          :class="{ 'btn-calc--active': canCalc }"
          :disabled="!canCalc || calcLoading"
          @click="onCalc"
        >산정</button>
      </div>

      <!-- 집중도 -->
      <div class="dr002-sub">
        <div class="dr002-sub__title">집중도</div>
        <table class="result-table">
          <colgroup>
            <col /><col /><col class="col-score" />
          </colgroup>
          <thead>
            <tr class="result-table__head-row">
              <th class="result-table__th">대중교통영향권 내 개발밀도</th>
              <th class="result-table__th">개발구역 전체 개발밀도</th>
              <th class="result-table__th">점수</th>
            </tr>
          </thead>
          <tbody>
            <tr class="result-table__body-row">
              <td class="result-table__td result-table__td--val">
                {{ concentrationData ? concentrationData.transitDensity : '-' }}
              </td>
              <td class="result-table__td result-table__td--val">
                {{ concentrationData ? concentrationData.totalDensity : '-' }}
              </td>
              <td class="result-table__td result-table__td--val">
                {{ concentrationData ? concentrationData.score : '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 복합도 -->
      <div class="dr002-sub">
        <div class="dr002-sub__head">
          <span class="dr002-sub__title">복합도</span>
          <span class="dr002-sub__note">복합도는 대중교통영향권 내에서만 산정함</span>
        </div>
        <table class="result-table">
          <colgroup>
            <col /><col /><col class="col-score" />
          </colgroup>
          <thead>
            <tr class="result-table__head-row">
              <th class="result-table__th">주거외 용도 개발밀도</th>
              <th class="result-table__th">개발밀도</th>
              <th class="result-table__th">점수</th>
            </tr>
          </thead>
          <tbody>
            <tr class="result-table__body-row">
              <td class="result-table__td result-table__td--val">
                {{ complexityData ? complexityData.nonResidentialDensity : '-' }}
              </td>
              <td class="result-table__td result-table__td--val">
                {{ complexityData ? complexityData.density : '-' }}
              </td>
              <td class="result-table__td result-table__td--val">
                {{ complexityData ? complexityData.score : '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useScenarioStore } from '@/stores/scenario'
import { useLandStore }     from '@/stores/land'
import { useMapStore }      from '@/stores/map'
import { fetchDR002Scores } from '@/api/evalCenterApi'

const props = defineProps({
  planId:      { type: String, required: true },
  itemCode:    { type: String, required: true },
  item:        { type: Object, default: null },
  savedResult: { type: Object, default: null },
})
const emit = defineEmits(['update:result'])

const scenarioStore = useScenarioStore()
const landStore     = useLandStore()
const mapStore      = useMapStore()

// ── 선택된 토지이용 행 ─────────────────────────────
const allLandRows = computed(() => landStore.plans[props.planId]?.dataRows ?? [])

const selectedIndices = computed(() =>
  scenarioStore.plans[props.planId]?.evalItemLandRows?.[props.itemCode] ?? []
)

const selectedLandRows = computed(() =>
  selectedIndices.value.map(idx => allLandRows.value[idx]).filter(Boolean)
)

const computedTotalArea = computed(() => {
  if (!selectedLandRows.value.length) return null
  return selectedLandRows.value.reduce((sum, r) => sum + (Number(r.면적) || 0), 0)
})

const computedTotalFloorArea = computed(() => {
  if (!selectedLandRows.value.length) return null
  return selectedLandRows.value.reduce((sum, r) => sum + (Number(r.연면적) || 0), 0)
})

function shortLandLabel(row) {
  return row.세부항목 || row.항목 || row.구분 || '-'
}

function formatNum(val) {
  const n = Number(val)
  return isNaN(n) ? '-' : n.toLocaleString()
}

function openLandSelect() {
  mapStore.openLandSelectDialog(props.planId, props.itemCode)
}

// ── 산정 결과 ─────────────────────────────────────
const calcLoading       = ref(false)
const concentrationData = ref(null)   // { transitDensity, totalDensity, score }
const complexityData    = ref(null)   // { nonResidentialDensity, density, score }
const calcTotalScore    = ref(null)

const canCalc = computed(() => selectedLandRows.value.length > 0)

async function onCalc() {
  if (!canCalc.value || calcLoading.value) return
  calcLoading.value = true
  try {
    const data = await fetchDR002Scores(props.planId)
    concentrationData.value = data.concentration
    complexityData.value    = data.complexity
    calcTotalScore.value    = data.totalScore
  } finally {
    calcLoading.value = false
  }
}

// ── 산정값 변경 → Shell에 결과 전달 ───────────────
watch(calcTotalScore, score => {
  if (score == null) { emit('update:result', null); return }
  const c = concentrationData.value
  const x = complexityData.value
  emit('update:result', {
    list: [
      { key: 'transitDensity',        title: '대중교통영향권 내 개발밀도', result: String(c.transitDensity),        unit: '' },
      { key: 'totalDensity',          title: '개발구역 전체 개발밀도',     result: String(c.totalDensity),          unit: '' },
      { key: 'concentrationScore',    title: '집중도 점수',                result: String(c.score),                 unit: '' },
      { key: 'nonResidentialDensity', title: '주거외 용도 개발밀도',       result: String(x.nonResidentialDensity), unit: '' },
      { key: 'complexityDensity',     title: '개발밀도',                   result: String(x.density),               unit: '' },
      { key: 'complexityScore',       title: '복합도 점수',                result: String(x.score),                 unit: '' },
    ],
    score,
  })
})

// 토지이용 행 재선택 시 산정 초기화
watch(computedTotalArea, () => {
  concentrationData.value = null
  complexityData.value    = null
  calcTotalScore.value    = null
})

// ── savedResult 복원 ───────────────────────────────
onMounted(() => {
  if (!props.savedResult) return
  const findEntry = key => props.savedResult.list?.find(i => i.key === key) ?? null

  const transit  = findEntry('transitDensity')
  const total    = findEntry('totalDensity')
  const conScore = findEntry('concentrationScore')
  const nonRes   = findEntry('nonResidentialDensity')
  const density  = findEntry('complexityDensity')
  const cplScore = findEntry('complexityScore')

  if (transit && total && conScore) {
    concentrationData.value = {
      transitDensity: Number(transit.result),
      totalDensity:   Number(total.result),
      score:          Number(conScore.result),
    }
  }
  if (nonRes && density && cplScore) {
    complexityData.value = {
      nonResidentialDensity: Number(nonRes.result),
      density:               Number(density.result),
      score:                 Number(cplScore.result),
    }
  }
  if (props.savedResult.score != null) {
    calcTotalScore.value = props.savedResult.score
    emit('update:result', props.savedResult)
  }
})
</script>

<style lang="scss" scoped>
.dr002-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.dr002-sub {
  margin-top: 12px;

  &__head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  &__title {
    font-size: 13px;
    font-weight: var(--fw-medium);
    color: #333;
    margin-bottom: 6px;
  }

  &__head &__title {
    margin-bottom: 0;
  }

  &__note {
    font-size: 11px;
    color: #929292;
    letter-spacing: -0.22px;
  }
}
</style>
