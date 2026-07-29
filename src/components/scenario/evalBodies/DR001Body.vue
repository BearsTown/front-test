<template>
  <div class="dr001-body">

    <!-- ① 중심지 선택 섹션 -->
    <div class="eval-section">
      <div class="dr001-select-row">

        <!-- 개발구역 중심지 -->
        <div class="dr001-field">
          <span class="dr001-field__label">개발구역 중심지</span>
          <div class="dr001-select-wrap">
            <select
              class="dr001-select"
              :class="{ 'dr001-select--loading': loading }"
              :disabled="loading"
              v-model="selectedDevId"
            >
              <option value="">선택하세요</option>
              <option v-for="c in devCenters" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
            <v-icon size="11" class="dr001-chevron">mdi-chevron-down</v-icon>
          </div>
        </div>

        <!-- 중핵도시 중심지 -->
        <div class="dr001-field">
          <span class="dr001-field__label">중핵도시 중심지</span>
          <div class="dr001-select-wrap">
            <select
              class="dr001-select"
              :class="{ 'dr001-select--loading': loading }"
              :disabled="loading"
              v-model="selectedCityId"
            >
              <option value="">선택하세요</option>
              <option v-for="c in coreCities" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
            <v-icon size="11" class="dr001-chevron">mdi-chevron-down</v-icon>
          </div>
        </div>

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
          <col /><col />
          <col class="col-score" />
        </colgroup>
        <thead>
          <tr class="result-table__head-row">
            <th class="result-table__th">통근시간(분)</th>
            <th class="result-table__th">통근거리(km)</th>
            <th class="result-table__th">점수</th>
          </tr>
        </thead>
        <tbody>
          <tr class="result-table__body-row">
            <td class="result-table__td">
              <div class="eval-field">
                <input
                  class="eval-field__input"
                  type="text"
                  :value="calcTime ?? ''"
                  readonly
                  placeholder="-"
                />
                <span class="eval-field__unit">분</span>
              </div>
            </td>
            <td class="result-table__td">
              <div class="eval-field">
                <input
                  class="eval-field__input"
                  type="text"
                  :value="calcDistance != null ? calcDistance.toFixed(2) : ''"
                  readonly
                  placeholder="-"
                />
                <span class="eval-field__unit">km</span>
              </div>
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
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useScenarioStore } from '@/stores/scenario'
import { useMapStore }      from '@/stores/map'
import { fetchDevCenters, fetchCoreCities } from '@/api/evalCenterApi'

const props = defineProps({
  planId:      { type: String, required: true },
  itemCode:    { type: String, required: true },
  item:        { type: Object, default: null },
  savedResult: { type: Object, default: null },
})
const emit = defineEmits(['update:result'])

const scenarioStore = useScenarioStore()
const mapStore      = useMapStore()

// ── 목록 로딩 ──────────────────────────────────────
const loading    = ref(false)
const devCenters = ref([])
const coreCities = ref([])

// ── 선택 상태 ──────────────────────────────────────
const selectedDevId  = ref('')
const selectedCityId = ref('')

const selectedDev  = computed(() => devCenters.value.find(c => c.id === selectedDevId.value)  ?? null)
const selectedCity = computed(() => coreCities.value.find(c => c.id === selectedCityId.value) ?? null)

// ── 산정 결과 (표시용) ─────────────────────────────
const calcScore    = ref(null)
const calcDistance = ref(null)
const calcTime     = ref(null)

// savedResult 복원 중 watch가 산정값을 초기화하지 않도록 방어
const isRestoring = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    ;[devCenters.value, coreCities.value] = await Promise.all([
      fetchDevCenters(props.planId),
      fetchCoreCities(props.planId),
    ])
  } finally {
    loading.value = false
  }

  if (props.savedResult) {
    const findEntry = key => props.savedResult.list?.find(i => i.key === key) ?? null
    const devEntry  = findEntry('devCenter')
    const cityEntry = findEntry('coreCity')
    const distEntry = findEntry('distance')
    const timeEntry = findEntry('time')

    isRestoring.value = true
    if (devEntry?._id)  selectedDevId.value  = devEntry._id
    if (cityEntry?._id) selectedCityId.value = cityEntry._id
    if (distEntry) calcDistance.value = parseFloat(distEntry.result)
    if (timeEntry) calcTime.value     = parseInt(timeEntry.result, 10)
    if (props.savedResult.score != null) {
      calcScore.value = props.savedResult.score
      emit('update:result', props.savedResult)
    }
    await nextTick()   // watch 정산 후 플래그 해제
    isRestoring.value = false
  }
})

// 다이얼로그 닫힐 때 포인트 마커 제거
onUnmounted(() => mapStore.clearEvalPoints())

// 선택 변경 → 지도 마커 갱신 + 산정 초기화
watch(selectedDev, center => {
  mapStore.setEvalPoint('dr001-dev', center ?? null)
  if (isRestoring.value) return
  calcScore.value = calcDistance.value = calcTime.value = null
  emit('update:result', null)
})

watch(selectedCity, center => {
  mapStore.setEvalPoint('dr001-city', center ?? null)
  if (isRestoring.value) return
  calcScore.value = calcDistance.value = calcTime.value = null
  emit('update:result', null)
})

// ── 산정 ──────────────────────────────────────────
const canCalc = computed(() => selectedDev.value != null && selectedCity.value != null)

function haversineKm(lat1, lng1, lat2, lng2) {
  const R     = 6371
  const toRad = d => d * Math.PI / 180
  const dLat  = toRad(lat2 - lat1)
  const dLng  = toRad(lng2 - lng1)
  const a     = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function buildResult(dist, time, score) {
  return {
    list: [
      { key: 'devCenter', title: '개발구역 중심지', result: selectedDev.value?.name  ?? '', unit: '', _id: selectedDev.value?.id },
      { key: 'coreCity',  title: '중핵도시 중심지', result: selectedCity.value?.name ?? '', unit: '', _id: selectedCity.value?.id },
      { key: 'distance',  title: '통근거리',        result: dist.toFixed(2),               unit: 'km' },
      { key: 'time',      title: '통근시간',         result: String(time),                  unit: '분' },
    ],
    score,
  }
}

function onCalc() {
  if (!canCalc.value) return
  const { lat: lat1, lng: lng1 } = selectedDev.value
  const { lat: lat2, lng: lng2 } = selectedCity.value

  const dist = haversineKm(lat1, lng1, lat2, lng2)
  const time = Math.round(dist / 40 * 60)   // 평균속도 40km/h 기준

  // TODO: 실제 평가기준에 맞는 점수 산정 로직으로 교체
  const weight = props.item?.weight ?? 2
  let score
  if (time <= 30)      score = weight
  else if (time <= 60) score = weight * (60 - time) / 30
  else                 score = 0
  const scoreVal = Number(score.toFixed(2))

  const result = buildResult(dist, time, scoreVal)

  // store에 즉시 저장 — 기존 평가항목(setEvalResult)과 동일한 구조
  scenarioStore.setEvalResult(props.planId, props.itemCode, result)

  // Shell에 전달 (확인 버튼 활성화)
  emit('update:result', result)

  // 표시용 reactive 값 업데이트
  calcDistance.value = dist
  calcTime.value     = time
  calcScore.value    = scoreVal
}
</script>

<style lang="scss" scoped>
.dr001-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

// ── 선택 행 (두 콤보박스 나란히) ─────────────────────
.dr001-select-row {
  display: flex;
  gap: 12px;
}

.dr001-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;

  &__label {
    font-size: 14px;
    font-weight: var(--fw-medium);
    color: #333;
    letter-spacing: -0.28px;
    white-space: nowrap;
  }
}

.dr001-select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.dr001-select {
  width: 100%;
  height: 36px;
  padding: 0 32px 0 12px;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  font-size: 13px;
  font-weight: var(--fw-regular);
  color: #373737;
  appearance: none;
  cursor: pointer;
  transition: border-color var(--transition-fast);

  &:focus { outline: none; border-color: #256EF4; }

  &--loading { opacity: 0.6; cursor: not-allowed; }

  // 선택 전 placeholder 색
  &:invalid,
  option[value=""] { color: #929292; }
}

.dr001-chevron {
  position: absolute;
  right: 10px;
  color: #929292;
  pointer-events: none;
  flex-shrink: 0;
}

// 공통 스타일(.eval-section 등)은 Shell :deep() 에서 정의
</style>
