<template>
  <div class="dialog-backdrop">
    <div class="dialog">

      <!-- 헤더 -->
      <div class="dialog-header">
        <h3 class="dialog-header__title">{{ dialogTitle }}</h3>
        <button class="close-btn" @click="$emit('close')">
          <v-icon size="20">mdi-close</v-icon>
        </button>
      </div>

      <!-- 콘텐츠 -->
      <div class="dialog-content">

        <!-- 로딩 -->
        <div v-if="loading" class="state-row">
          <v-progress-circular size="22" width="2" indeterminate color="#256EF4" />
        </div>

        <!-- 데이터 없음 -->
        <div v-else-if="displayRows.length === 0" class="state-row">
          토지이용계획 데이터가 없습니다.<br/>
          <small>Step 1에서 토지이용계획 데이터를 입력하세요.</small>
        </div>

        <!-- 테이블 -->
        <div v-else class="ls-table-wrap">
          <table class="ls-table">
            <thead>
              <tr class="ls-table__head-row">
                <th class="ls-th">구분</th>
                <th class="ls-th">항목</th>
                <th class="ls-th">세부항목</th>
                <th class="ls-th">세분류</th>
                <th class="ls-th">용도지역</th>
                <th class="ls-th ls-th--num">면적(㎡)</th>
                <th class="ls-th ls-th--num">연면적(㎡)</th>
                <th class="ls-th ls-th--chk">선택여부</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="{ row, idx } in displayRows"
                :key="idx"
                class="ls-table__row"
                :class="{ 'ls-table__row--selected': selectedSet.has(idx) }"
                @click="toggleRow(idx)"
              >
                <td class="ls-td">{{ row.구분 }}</td>
                <td class="ls-td">{{ row.항목 }}</td>
                <td class="ls-td">{{ row.세부항목 }}</td>
                <td class="ls-td">{{ row.세분류 }}</td>
                <td class="ls-td ls-td--zone">{{ zoneLabel(row.용도지역Key) }}</td>
                <td class="ls-td ls-td--num">{{ formatNum(row.면적) }}</td>
                <td class="ls-td ls-td--num">{{ formatNum(row.연면적) }}</td>
                <td class="ls-td ls-td--chk" @click.stop="toggleRow(idx)">
                  <span class="ls-checkbox" :class="{ 'ls-checkbox--checked': selectedSet.has(idx) }">
                    <v-icon v-if="selectedSet.has(idx)" size="11" color="#fff">mdi-check</v-icon>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 푸터 -->
      <div class="dialog-footer">
        <div class="dialog-footer__left" />
        <div class="dialog-footer__right">
          <button class="btn btn--cancel" @click="$emit('close')">취소</button>
          <button
            class="btn btn--save"
            :disabled="selectedSet.size === 0"
            @click="onSave"
          >저장</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useScenarioStore }  from '@/stores/scenario'
import { useLandStore }       from '@/stores/land'
import { useMapStore }        from '@/stores/map'
import { fetchZoneList }      from '@/api/landApi'
import { ROW_FILTERS }        from './evalLandFilters.js'

const props = defineProps({
  planId:   { type: String, required: true },
  itemCode: { type: String, default: null },
})
const emit = defineEmits(['close', 'saved'])

const scenarioStore = useScenarioStore()
const landStore     = useLandStore()
const mapStore      = useMapStore()

// ── 다이얼로그 제목 ───────────────────────────────────────
const TITLE_MAP = {
  DA001: '도시공원 및 녹지 면적',
  DA002: '자연지반 면적',
  DR001: '직주근접 현황',
  DR002: '대중교통 현황',
  DR003: '자전거 인프라',
  DR004: '녹색교통 인프라',
  DR005: '녹색건축물 현황',
  IA001: '생태면적 현황',
}
const dialogTitle = computed(() => TITLE_MAP[props.itemCode] ?? '토지이용 데이터 선택')

// ── 토지이용 행 데이터 (원본 인덱스 보존) ────────────────────
// evalItemLandRows 는 allRows 기준 인덱스로 저장되므로
// 필터 후에도 { row, idx } 쌍으로 원본 인덱스를 유지해야 한다
const allRows = computed(() => landStore.plans[props.planId]?.dataRows ?? [])

const displayRows = computed(() => {
  const filterFn = ROW_FILTERS[props.itemCode]
  return allRows.value
    .map((row, idx) => ({ row, idx }))
    .filter(({ row }) => !filterFn || filterFn(row))
})

// ── 용도지역 목록 ─────────────────────────────────────────
const zoneOptions = ref([])
const loading     = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const { sido, sigungu } = mapStore.savedProject
    zoneOptions.value = await fetchZoneList(sido, sigungu)
  } finally {
    loading.value = false
  }
})

function zoneLabel(key) {
  return zoneOptions.value.find(o => o.key === key)?.title ?? key ?? '-'
}

// ── 체크박스 선택 상태 ────────────────────────────────────
const savedIndices = scenarioStore.plans[props.planId]?.evalItemLandRows?.[props.itemCode] ?? []
const selectedSet  = reactive(new Set(savedIndices))

function toggleRow(idx) {
  if (selectedSet.has(idx)) selectedSet.delete(idx)
  else selectedSet.add(idx)
}

// ── 저장 ─────────────────────────────────────────────────
function onSave() {
  scenarioStore.setEvalItemLandRows(props.planId, props.itemCode, [...selectedSet])
  emit('saved')
  emit('close')
}

// ── 포맷 ─────────────────────────────────────────────────
function formatNum(val) {
  const n = Number(val)
  return isNaN(n) ? '-' : n.toLocaleString()
}
</script>

<style lang="scss" scoped>
// ── 백드롭 ──────────────────────────────────────────────
.dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-modal;
}

// ── 다이얼로그 ──────────────────────────────────────────
.dialog {
  width: 1060px;
  max-height: calc(100vh - 80px);
  background: $color-white;
  border-radius: 20px;
  box-shadow: 2px 0 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// ── 헤더 ────────────────────────────────────────────────
.dialog-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 1px solid #eaeaea;
  height: 62px;
  flex-shrink: 0;

  &__title {
    flex: 1;
    font-size: 16px;
    font-weight: var(--fw-bold);
    color: #333;
    letter-spacing: -0.32px;
  }
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  cursor: pointer;
  color: #8f8f8f;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background var(--transition-fast);

  &:hover { background: #f3f3f3; }
}

// ── 콘텐츠 ──────────────────────────────────────────────
.dialog-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 16px 20px;
}

.state-row {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: #8f8f8f;
  text-align: center;
  line-height: 1.6;
}

// ── 테이블 래퍼 ─────────────────────────────────────────
.ls-table-wrap {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #e8e8e8;
  border-radius: 6px;

  &::-webkit-scrollbar       { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #d5d5d5; border-radius: 100px; }
}

// ── 테이블 ──────────────────────────────────────────────
.ls-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.ls-table__head-row {
  background: #f5f5f5;
  position: sticky;
  top: 0;
  z-index: 1;
}

.ls-th {
  height: 36px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: var(--fw-medium);
  color: #6e6e6e;
  text-align: center;
  border-right: 1px solid #e8e8e8;
  white-space: nowrap;

  &:last-child { border-right: none; }
  &--num { width: 110px; }
  &--chk { width: 80px; }
}

.ls-table__row {
  border-bottom: 1px solid #e8e8e8;
  cursor: pointer;
  transition: background var(--transition-fast);

  &:hover:not(&--selected) { background: #f9f9f9; }
  &--selected { background: #ecf2fe; }
  &:last-child { border-bottom: none; }
}

.ls-td {
  height: 50px;
  padding: 0 12px;
  font-size: 14px;
  font-weight: var(--fw-medium);
  color: #373737;
  text-align: left;
  border-right: 1px solid #e8e8e8;
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:last-child { border-right: none; }
  &--zone { font-size: 12px; }
  &--num  { text-align: right; }
  &--chk  { text-align: center; padding: 0; }
}

// ── 체크박스 ────────────────────────────────────────────
.ls-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 1.5px solid #b0b0b0;
  border-radius: 3px;
  background: #fff;
  cursor: pointer;
  transition: all var(--transition-fast);

  &--checked {
    background: #256EF4;
    border-color: #256EF4;
  }
}

// ── 푸터 ────────────────────────────────────────────────
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 66px;
  padding: 0 20px;
  border-top: 1px solid #e5e5e5;
  flex-shrink: 0;

  &__left  { flex: 1; }
  &__right { display: flex; align-items: center; gap: 10px; }
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 34px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: var(--fw-semibold);
  letter-spacing: -0.24px;
  cursor: pointer;
  transition: all var(--transition-fast);

  &--cancel {
    background: #fff;
    border: 1px solid #e7e7e7;
    color: #656565;
    &:hover { background: #f7f7f7; }
  }

  &--save {
    background: #256EF4;
    border: 1px solid #256EF4;
    color: #fff;
    &:hover { background: #1a5bd4; }

    &:disabled {
      background: #d5d5d5;
      border-color: #e7e7e7;
      cursor: not-allowed;
    }
  }
}
</style>
