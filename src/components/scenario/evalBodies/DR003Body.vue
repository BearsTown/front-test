<template>
  <div class="dr003-body">

    <!-- 평가점수 섹션 -->
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
            <th class="result-table__th">자전거도로 길이</th>
            <th class="result-table__th">집산도로 기능 이상 도로 길이</th>
            <th class="result-table__th">자전거도로연장비</th>
            <th class="result-table__th">점수</th>
          </tr>
        </thead>
        <tbody>
          <tr class="result-table__body-row">
            <!-- 입력1: 자전거도로 길이 -->
            <td class="result-table__td">
              <div class="eval-field">
                <input
                  v-model="bikeRoadLength"
                  class="eval-field__input"
                  type="number"
                  min="0"
                  placeholder=""
                  @focus="$event.target.select()"
                  @input="onInputChange"
                />
                <span class="eval-field__unit">km</span>
              </div>
            </td>
            <!-- 입력2: 집산도로 기능 이상 도로 길이 -->
            <td class="result-table__td">
              <div class="eval-field">
                <input
                  v-model="collectorRoadLength"
                  class="eval-field__input"
                  type="number"
                  min="0"
                  placeholder=""
                  @focus="$event.target.select()"
                  @input="onInputChange"
                />
                <span class="eval-field__unit">km</span>
              </div>
            </td>
            <!-- 결과1: 자전거도로연장비 -->
            <td class="result-table__td result-table__td--val">
              {{ calcRatio != null ? calcRatio + '%' : '-' }}
            </td>
            <!-- 결과2: 점수 -->
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
import { ref, computed, watch } from 'vue'

const props = defineProps({
  planId:      { type: String, required: true },
  itemCode:    { type: String, required: true },
  item:        { type: Object, default: null },
  savedResult: { type: Object, default: null },
})
const emit = defineEmits(['update:result'])

// ── 입력값 ────────────────────────────────────────
const bikeRoadLength      = ref('')   // 자전거도로 길이 (km)
const collectorRoadLength = ref('')   // 집산도로 기능 이상 도로 길이 (km)

// ── 산정 결과 ─────────────────────────────────────
const calcRatio = ref(null)   // 자전거도로연장비 (%)
const calcScore = ref(null)

const canCalc = computed(() => {
  const bike = Number(bikeRoadLength.value)
  const col  = Number(collectorRoadLength.value)
  return bikeRoadLength.value !== '' && collectorRoadLength.value !== ''
    && !isNaN(bike) && !isNaN(col) && col > 0
})

// 입력값 변경 시 산정 결과 초기화
function onInputChange() {
  calcRatio.value = null
  calcScore.value = null
}

function onCalc() {
  if (!canCalc.value) return
  const bike   = Number(bikeRoadLength.value)
  const col    = Number(collectorRoadLength.value)
  const ratio  = Number((bike / col * 100).toFixed(2))
  const weight = props.item?.weight ?? 2
  // 자전거도로연장비 기준 점수 산정 (기준값 도달 시 만점)
  const score  = Number(Math.min(ratio / 100 * weight, weight).toFixed(2))

  calcRatio.value = ratio
  calcScore.value = score
}

// ── Shell에 결과 전달 ──────────────────────────────
watch(calcScore, score => {
  if (score == null) { emit('update:result', null); return }
  emit('update:result', {
    list: [
      { key: 'bikeRoadLength',      title: '자전거도로 길이',             result: String(bikeRoadLength.value),      unit: 'km' },
      { key: 'collectorRoadLength', title: '집산도로 기능 이상 도로 길이', result: String(collectorRoadLength.value), unit: 'km' },
      { key: 'ratio',               title: '자전거도로연장비',              result: String(calcRatio.value),           unit: '%'  },
    ],
    score,
  })
})

// ── savedResult 복원 ───────────────────────────────
if (props.savedResult) {
  const findEntry = key => props.savedResult.list?.find(i => i.key === key) ?? null
  const bikeEntry = findEntry('bikeRoadLength')
  const colEntry  = findEntry('collectorRoadLength')
  const ratioEntry = findEntry('ratio')

  if (bikeEntry)  bikeRoadLength.value      = bikeEntry.result
  if (colEntry)   collectorRoadLength.value = colEntry.result
  if (ratioEntry) calcRatio.value           = Number(ratioEntry.result)
  if (props.savedResult.score != null) {
    calcScore.value = props.savedResult.score
    emit('update:result', props.savedResult)
  }
}
</script>

<style lang="scss" scoped>
.dr003-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
