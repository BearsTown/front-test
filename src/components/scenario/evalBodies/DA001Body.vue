<template>
  <div class="da001-body">

    <!-- ① 데이터 입력 섹션 -->
    <div class="eval-section">
      <div class="eval-section__head">
        <span class="eval-section__label">도시공원 및 녹지 면적</span>
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
              도시공원 및 녹지 면적
              <v-icon size="13" color="#6e6e6e">mdi-help-circle-outline</v-icon>
            </th>
            <th class="result-table__th">
              확보기준
              <v-icon size="13" color="#6e6e6e">mdi-help-circle-outline</v-icon>
            </th>
            <th class="result-table__th">공원녹지 확보비</th>
            <th class="result-table__th">점수</th>
          </tr>
        </thead>
        <tbody>
          <tr class="result-table__body-row">
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
            <td class="result-table__td">
              <div class="eval-field" :class="{ 'eval-field--loading': defaultsLoading }">
                <input
                  v-model="col2Input"
                  class="eval-field__input"
                  type="number"
                  :placeholder="defaultsLoading ? '조회 중...' : ''"
                  :disabled="defaultsLoading"
                  @focus="$event.target.select()"
                />
                <span class="eval-field__unit">㎡</span>
              </div>
            </td>
            <td class="result-table__td result-table__td--val">
              {{ calcRatio ?? '-' }}
            </td>
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
import { useLandStore } from '@/stores/land'
import { useMapStore } from '@/stores/map'
import { fetchZoneList } from '@/api/landApi'
import { useEvalDefault } from '@/composables/useEvalDefault'

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

const { loadDefaults, applyIfEmpty, defaultsLoading } = useEvalDefault(props.itemCode)

// ── 용도지역 (zone label 표시용) ────────────────────
const zoneOptions = ref([])

onMounted(async () => {
  const { sido, sigungu } = mapStore.savedProject
  zoneOptions.value = await fetchZoneList(sido, sigungu)

  // 기존 저장 결과 복원
  if (props.savedResult) {
    const findEntry = (key) => props.savedResult.list?.find(i => i.key === key) ?? null

    const col2Entry = findEntry('col2')
    if (col2Entry) col2Input.value = col2Entry.result

    // totalArea가 수동 입력이었으면 복원
    const totalAreaEntry = findEntry('totalArea')
    if (totalAreaEntry?.manual) manualTotalArea.value = Number(totalAreaEntry.result)

    if (props.savedResult.score != null) {
      calcScore.value = String(props.savedResult.score)
      emit('update:result', props.savedResult)
    }
  }

  // col2(확보기준)가 비어있거나 0이면 API 기본값 자동 적용
  await loadDefaults(props.planId)
  applyIfEmpty(col2Input, 'col2')
})

// ── 선택된 토지이용 행 ─────────────────────────────
const allLandRows = computed(() => landStore.plans[props.planId]?.dataRows ?? [])

const selectedIndices = computed(() =>
  scenarioStore.plans[props.planId]?.evalItemLandRows?.[props.itemCode] ?? []
)

const selectedLandRows = computed(() =>
  selectedIndices.value.map(idx => allLandRows.value[idx]).filter(Boolean)
)

// 선택 행 합산 (자동)
const computedTotalArea = computed(() => {
  if (!selectedLandRows.value.length) return null
  return selectedLandRows.value.reduce((sum, r) => sum + (Number(r.면적) || 0), 0)
})

// 수동 입력 override (null이면 자동값 사용)
const manualTotalArea = ref(null)

// 실제 사용값: 수동 입력 우선
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
const col2Input = ref('')
const calcScore = ref(null)

const canCalc = computed(() =>
  effectiveTotalArea.value != null && col2Input.value !== '' && Number(col2Input.value) > 0
)

const calcRatio = computed(() => {
  if (!canCalc.value) return null
  return (effectiveTotalArea.value / Number(col2Input.value)).toFixed(2)
})

function onCalc() {
  if (!canCalc.value) return
  calcScore.value = (Number(calcRatio.value) * 1.8).toFixed(2)
}

// ── Shell에 결과 전달 ──────────────────────────────
// 토지이용 행 재선택 시 산정 초기화 (수동 여부 무관)
watch(computedTotalArea, () => { calcScore.value = null })

// calcScore 변경 시 전체 값을 key 기반으로 emit
watch(calcScore, (score) => {
  if (score == null) { emit('update:result', null); return }
  emit('update:result', {
    list: [
      {
        key:    'totalArea',
        title:  '도시공원 및 녹지 면적',
        result: String(effectiveTotalArea.value ?? 0),
        unit:   '㎡',
        manual: manualTotalArea.value !== null,
      },
      {
        key:    'col2',
        title:  '확보기준',
        result: col2Input.value,
        unit:   '㎡',
      },
      {
        key:    'ratio',
        title:  '공원녹지 확보비',
        result: calcRatio.value ?? '-',
        unit:   '',
      },
    ],
    score: Number(score),
  })
})
</script>

<style lang="scss" scoped>
// Shell의 eval-cd__body 안에서 flex 컨테이너를 채움
.da001-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
// 나머지 스타일(.eval-section, .data-table, .result-table 등)은
// Shell(EvalItemDialog.vue)의 :deep() 룰에서 일괄 정의
</style>
