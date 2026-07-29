<template>
  <div class="dr004-body">

    <!-- ① 체크박스 선택 섹션 -->
    <div class="eval-section">
      <div
        v-for="opt in OPTIONS"
        :key="opt.key"
        class="dr004-row"
        @click="onToggle(opt.key)"
      >
        <button
          class="dr004-cb"
          :class="{ 'dr004-cb--checked': selected.has(opt.key) }"
          @click.stop="onToggle(opt.key)"
        >
          <v-icon v-if="selected.has(opt.key)" size="10" color="#fff">mdi-check</v-icon>
        </button>
        <span class="dr004-label">{{ opt.label }}</span>
      </div>
    </div>

    <!-- 구분선 -->
    <div class="eval-divider" />

    <!-- ② 평가점수 섹션 -->
    <div class="eval-section">
      <div class="eval-section__head">
        <span class="eval-section__label">평가점수</span>
        <button
          class="btn-calc btn-calc--active"
          :disabled="calcLoading"
          @click="onCalc"
        >산정</button>
      </div>

      <table class="result-table">
        <colgroup>
          <col /><col class="col-score" />
        </colgroup>
        <thead>
          <tr class="result-table__head-row">
            <th class="result-table__th">반영항목 수</th>
            <th class="result-table__th">점수</th>
          </tr>
        </thead>
        <tbody>
          <tr class="result-table__body-row">
            <td class="result-table__td result-table__td--val">
              {{ calcCount != null ? calcCount + '가지' : '-' }}
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
import { ref, watch, onMounted } from 'vue'
import { fetchDR004Scores } from '@/api/evalCenterApi'

const props = defineProps({
  planId:      { type: String, required: true },
  itemCode:    { type: String, required: true },
  item:        { type: Object, default: null },
  savedResult: { type: Object, default: null },
})
const emit = defineEmits(['update:result'])

const OPTIONS = [
  { key: 'brt',            label: '간선급행버스(BRT) 시스템' },
  { key: 'rail_station',   label: '자동궤도차(AGT) 등 경전철, 전철 또는 국철의 역사' },
  { key: 'eco_charging',   label: '전기자동차 또는 바이오연료 충전소' },
  { key: 'bus_lane',       label: '버스전용차로' },
  { key: 'transit_center', label: '복합환승센터' },
]

const selected    = ref(new Set())
const calcLoading = ref(false)
const calcCount   = ref(null)
const calcScore   = ref(null)

function onToggle(key) {
  const next = new Set(selected.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  selected.value = next
}

// 체크박스 변경 시 산정 결과 초기화
watch(selected, () => {
  calcCount.value = null
  calcScore.value = null
  emit('update:result', null)
}, { deep: true })

async function onCalc() {
  if (calcLoading.value) return
  calcLoading.value = true
  try {
    const payload = {
      brt:            selected.value.has('brt'),
      rail_station:   selected.value.has('rail_station'),
      eco_charging:   selected.value.has('eco_charging'),
      bus_lane:       selected.value.has('bus_lane'),
      transit_center: selected.value.has('transit_center'),
    }
    const { count, score } = await fetchDR004Scores(props.planId, payload)
    calcCount.value = count
    calcScore.value = score
    emit('update:result', {
      list: [
        ...OPTIONS.map(opt => ({
          key:    opt.key,
          title:  opt.label,
          result: String(payload[opt.key]),
          unit:   '',
        })),
        { key: 'count', title: '반영항목 수', result: String(count), unit: '가지' },
      ],
      score,
    })
  } finally {
    calcLoading.value = false
  }
}

// savedResult 복원
onMounted(() => {
  if (!props.savedResult?.list) return
  const next = new Set()
  for (const opt of OPTIONS) {
    const entry = props.savedResult.list.find(i => i.key === opt.key)
    if (entry?.result === 'true') next.add(opt.key)
  }
  const countEntry = props.savedResult.list.find(i => i.key === 'count')
  selected.value  = next
  calcCount.value = countEntry ? Number(countEntry.result) : null
  if (props.savedResult.score != null) {
    calcScore.value = props.savedResult.score
    emit('update:result', props.savedResult)
  }
})
</script>

<style lang="scss" scoped>
.dr004-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

// ── 체크박스 행 ──────────────────────────────────────
.dr004-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  cursor: pointer;

  &:hover .dr004-cb:not(.dr004-cb--checked) {
    border-color: #888;
  }
}

.dr004-cb {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-white;
  border: 1px solid #bababa;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
  transition: background $transition-fast, border-color $transition-fast;

  &--checked {
    background: $color-primary;
    border-color: $color-primary;
  }
}

.dr004-label {
  font-size: 14px;
  font-weight: $font-weight-medium;
  color: #373737;
  letter-spacing: -0.28px;
  line-height: 18px;
  user-select: none;
}
</style>
