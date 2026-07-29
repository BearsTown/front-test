<template>
  <div class="da002-body">

    <!-- ① 데이터 입력 섹션 -->
    <div class="eval-section">
      <div class="eval-section__head">
        <span class="eval-section__label">자연지반 면적</span>
        <button class="btn-data-select" @click="openLandSelect">
          데이터선택
          <v-icon size="12">mdi-harddisk</v-icon>
        </button>
      </div>

      <div class="data-table">
        <div class="data-table__head">
          <div class="data-table__hcell">토지이용</div>
          <div class="data-table__hcell">면적(㎡)</div>
        </div>
        <template v-if="selectedLandRows.length > 0">
          <div v-for="(row, i) in selectedLandRows" :key="i" class="data-table__row">
            <div class="data-table__cell data-table__cell--land">{{ shortLandLabel(row) }}</div>
            <div class="data-table__cell data-table__cell--num">{{ formatNum(row.면적) }}</div>
          </div>
          <div class="data-table__row data-table__row--total">
            <div class="data-table__cell data-table__cell--total-label">합계</div>
            <div class="data-table__cell data-table__cell--num data-table__cell--total-num">
              {{ formatNum(computedTotalArea) }}
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
          :disabled="!canCalc"
          @click="onCalc"
        >산정</button>
      </div>

      <table class="result-table">
        <colgroup>
          <col /><col /><col />
          <col class="col-score" />
        </colgroup>
        <thead>
          <tr class="result-table__head-row">
            <th class="result-table__th">
              자연지반 면적
              <v-icon size="13" color="#6e6e6e">mdi-help-circle-outline</v-icon>
            </th>
            <th class="result-table__th">
              전체 개발구역 면적
              <v-icon size="13" color="#6e6e6e">mdi-help-circle-outline</v-icon>
            </th>
            <th class="result-table__th">자연지반 면적률</th>
            <th class="result-table__th">점수</th>
          </tr>
        </thead>
        <tbody>
          <tr class="result-table__body-row">
            <!-- 자연지반 면적: 수동 override 가능 -->
            <td class="result-table__td">
              <div class="eval-field" :class="{ 'eval-field--manual': manualTotalArea !== null }">
                <input
                  class="eval-field__input"
                  type="number"
                  :value="effectiveTotalArea ?? ''"
                  placeholder=""
                  @input="onTotalAreaInput($event.target.value)"
                  @focus="$event.target.select()"
                />
                <span class="eval-field__unit">㎡</span>
              </div>
            </td>
            <!-- 전체 개발구역 면적: Step1 토지이용계획 면적 합계 (자동, 읽기 전용) -->
            <td class="result-table__td">
              <div class="eval-field">
                <input
                  class="eval-field__input"
                  type="text"
                  :value="totalLandArea != null ? formatNum(totalLandArea) : ''"
                  placeholder="Step1 데이터 필요"
                  readonly
                />
                <span class="eval-field__unit">㎡</span>
              </div>
            </td>
            <!-- 자연지반 면적률 (%) -->
            <td class="result-table__td result-table__td--val">
              {{ calcRatio != null ? calcRatio + ' %' : '-' }}
            </td>
            <!-- 점수 -->
            <td class="result-table__td result-table__td--val">
              {{ calcScore ?? '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useScenarioStore } from '@/stores/scenario'
import { useLandStore }     from '@/stores/land'
import { useMapStore }      from '@/stores/map'

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

onMounted(() => {
  // savedResult 복원 (key 기반)
  // col2는 landStore에서 자동 참조하므로 복원 불필요
  if (props.savedResult) {
    const findEntry = key => props.savedResult.list?.find(i => i.key === key) ?? null

    const totalAreaEntry = findEntry('totalArea')
    if (totalAreaEntry?.manual) manualTotalArea.value = Number(totalAreaEntry.result)

    if (props.savedResult.score != null) {
      calcScore.value = String(props.savedResult.score)
      emit('update:result', props.savedResult)
    }
  }
})

// ── 전체 개발구역 면적: Step1 토지이용계획 전체 행 면적 합계 ───
const allLandRows = computed(() => landStore.plans[props.planId]?.dataRows ?? [])

const totalLandArea = computed(() => {
  if (!allLandRows.value.length) return null
  return allLandRows.value.reduce((sum, r) => sum + (Number(r.면적) || 0), 0)
})

// ── 선택된 토지이용 행 (자연지반 면적) ────────────────────────
const selectedIndices = computed(() =>
  scenarioStore.plans[props.planId]?.evalItemLandRows?.[props.itemCode] ?? []
)

const selectedLandRows = computed(() =>
  selectedIndices.value.map(idx => allLandRows.value[idx]).filter(Boolean)
)

// 자동 합산
const computedTotalArea = computed(() => {
  if (!selectedLandRows.value.length) return null
  return selectedLandRows.value.reduce((sum, r) => sum + (Number(r.면적) || 0), 0)
})

// 수동 override (null → 자동값 사용)
const manualTotalArea = ref(null)

const effectiveTotalArea = computed(() =>
  manualTotalArea.value !== null ? manualTotalArea.value : computedTotalArea.value
)

function onTotalAreaInput(val) {
  const n = parseFloat(val)
  manualTotalArea.value = val === '' || isNaN(n) ? null : n
  calcScore.value = null
}

function shortLandLabel(row) {
  return row.세부항목 || row.항목 || row.구분 || '-'
}

function formatNum(val) {
  const n = Number(val)
  return isNaN(n) ? '-' : n.toLocaleString()
}

// ── 데이터선택 버튼 ────────────────────────────────
function openLandSelect() {
  mapStore.openLandSelectDialog(props.planId, props.itemCode)
}

// ── 산정 로직 ──────────────────────────────────────
const calcScore = ref(null)

const canCalc = computed(() =>
  effectiveTotalArea.value != null &&
  totalLandArea.value != null &&
  totalLandArea.value > 0
)

// 자연지반 면적률 = (자연지반 면적 / 전체 개발구역 면적) × 100 (%)
const calcRatio = computed(() => {
  if (!canCalc.value) return null
  return ((effectiveTotalArea.value / totalLandArea.value) * 100).toFixed(2)
})

function onCalc() {
  if (!canCalc.value) return
  const ratio  = Number(calcRatio.value)        // %
  const weight = props.item?.weight ?? 2        // 항목 배점
  calcScore.value = (ratio / 100 * weight).toFixed(2)
}

// ── Shell에 결과 전달 ──────────────────────────────
// 토지이용 행 변경 또는 전체 면적 변경 시 산정 초기화
watch(computedTotalArea, () => { calcScore.value = null })
watch(totalLandArea,     () => { calcScore.value = null })

watch(calcScore, score => {
  if (score == null) { emit('update:result', null); return }
  emit('update:result', {
    list: [
      {
        key:    'totalArea',
        title:  '자연지반 면적',
        result: String(effectiveTotalArea.value ?? 0),
        unit:   '㎡',
        manual: manualTotalArea.value !== null,
      },
      {
        key:    'col2',
        title:  '전체 개발구역 면적',
        result: String(totalLandArea.value ?? 0),
        unit:   '㎡',
      },
      {
        key:    'ratio',
        title:  '자연지반 면적률',
        result: calcRatio.value ?? '-',
        unit:   '%',
      },
    ],
    score: Number(score),
  })
})
</script>

<style lang="scss" scoped>
.da002-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
// 나머지 스타일(.eval-section, .data-table, .result-table 등)은
// Shell(EvalItemDialog.vue)의 :deep() 룰에서 일괄 정의
</style>
