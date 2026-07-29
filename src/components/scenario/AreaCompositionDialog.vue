<template>
  <PlanContentDialog title="면적 구성비" :show-manage="false" @close="$emit('close')">

    <div class="area-table-wrap">
      <div class="area-table">

        <!-- 헤더 행 -->
        <div class="area-table__head">
          <div class="ah ah--group">구분</div>
          <div class="ah ah--item">항목</div>
          <div class="ah ah--sub">세부항목</div>
          <div class="ah ah--leaf">세분류</div>
          <div class="ah ah--zone">용도지역</div>
          <div class="ah ah--num">용적률(%)</div>
          <div class="ah ah--num">면적(㎡)</div>
          <div class="ah ah--pct">구성비(%)</div>
          <div class="ah ah--num">연면적(㎡)</div>
          <div class="ah ah--pct ah--last">연면적<br>구성비(%)</div>
        </div>

        <!-- 로딩 -->
        <div v-if="zoneLoading" class="area-table__empty">
          <v-progress-circular size="16" width="2" indeterminate color="#256EF4" />
          <span>불러오는 중...</span>
        </div>

        <!-- 빈 상태 -->
        <div v-else-if="tableRows.length === 0" class="area-table__empty">
          토지이용계획 데이터가 없습니다.
        </div>

        <!-- 데이터 행 -->
        <template v-else>
          <div v-for="(row, i) in tableRows" :key="i" class="area-table__row">
            <div class="ac ac--group">
              <span class="group-badge" :class="`group-badge--${groupIndex(row.구분)}`">
                {{ row.구분 }}
              </span>
            </div>
            <div class="ac ac--item">{{ row.항목 }}</div>
            <div class="ac ac--sub">{{ row.세부항목 }}</div>
            <div class="ac ac--leaf">{{ row.세분류 }}</div>
            <div class="ac ac--zone">{{ zoneLabel(row.용도지역Key) }}</div>
            <div class="ac ac--num ac--right">{{ row.용적률.toLocaleString() }}</div>
            <div class="ac ac--num ac--right">{{ row.면적.toLocaleString() }}</div>
            <div class="ac ac--pct ac--right">{{ row.구성비 }}</div>
            <div class="ac ac--num ac--right">{{ row.연면적.toLocaleString() }}</div>
            <div class="ac ac--pct ac--right ac--last">{{ row.연면적구성비 }}</div>
          </div>

          <!-- 합계 행 -->
          <div class="area-table__row area-table__row--total">
            <div class="ac ac--total-label">합계</div>
            <div class="ac ac--num ac--right ac--accent">{{ totalSiteArea.toLocaleString() }}</div>
            <div class="ac ac--pct ac--right ac--accent">100.0</div>
            <div class="ac ac--num ac--right ac--accent">{{ totalFloorArea.toLocaleString() }}</div>
            <div class="ac ac--pct ac--right ac--accent ac--last">100.0</div>
          </div>
        </template>

      </div>
    </div>

  </PlanContentDialog>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useLandStore, LAND_GROUPS } from '@/stores/land'
import { useMapStore }               from '@/stores/map'
import { fetchZoneList }             from '@/api/landApi'
import PlanContentDialog             from './PlanContentDialog.vue'

const props = defineProps({
  planId: { type: String, required: true },
})
defineEmits(['close'])

const landStore = useLandStore()
const mapStore  = useMapStore()

// ── 용도지역 목록 ────────────────────────────────────────
const zoneOptions = ref([])
const zoneLoading = ref(false)

async function loadZoneList() {
  zoneLoading.value = true
  try {
    const { sido, sigungu } = mapStore.savedProject
    zoneOptions.value = await fetchZoneList(sido, sigungu)
  } finally {
    zoneLoading.value = false
  }
}

function zoneLabel(key) {
  if (!key) return '-'
  return zoneOptions.value.find(o => o.key === key)?.title ?? key
}

// ── 면적 집계 ────────────────────────────────────────────
const rows = computed(() => landStore.plans[props.planId]?.dataRows ?? [])

const totalSiteArea  = computed(() => rows.value.reduce((s, r) => s + (Number(r.면적)  || 0), 0))
const totalFloorArea = computed(() => rows.value.reduce((s, r) => s + (Number(r.연면적) || 0), 0))

const tableRows = computed(() => {
  const site  = totalSiteArea.value  || 1
  const floor = totalFloorArea.value || 1
  return rows.value.map(r => ({
    구분:         r.구분        ?? '',
    항목:         r.항목        ?? '',
    세부항목:     r.세부항목    ?? '',
    세분류:       r.세분류      ?? '',
    용도지역Key:  r.용도지역Key ?? '',
    용적률:       Number(r.용적률) || 0,
    면적:         Number(r.면적)   || 0,
    구성비:       ((Number(r.면적)  || 0) / site  * 100).toFixed(1),
    연면적:       Number(r.연면적) || 0,
    연면적구성비: ((Number(r.연면적) || 0) / floor * 100).toFixed(1),
  }))
})

const groupIndex = (group) => LAND_GROUPS.indexOf(group) % 4

onMounted(loadZoneList)
</script>

<style lang="scss" scoped>
// ── 테이블 래퍼 (가로 스크롤) ────────────────────────────
.area-table-wrap {
  overflow-x: auto;

  &::-webkit-scrollbar       { height: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #d5d5d5; border-radius: 100px; }
}

// ── 테이블 ───────────────────────────────────────────────
.area-table {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;
  min-width: 860px;

  &__head {
    display: flex;
    align-items: stretch;
    background: #f5f5f5;
    border-bottom: 1px solid #e8e8e8;
  }

  &__row {
    display: flex;
    align-items: stretch;
    border-top: 1px solid #e8e8e8;
    background: $color-white;
    min-height: 46px;

    &--total {
      background: #e9f1fe;
    }
  }

  &__empty {
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 12px;
    color: #6e6e6e;
    border-top: 1px solid #e8e8e8;
  }
}

// ── 헤더 셀 ──────────────────────────────────────────────
.ah {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  font-size: 11px;
  font-weight: $font-weight-medium;
  color: #6e6e6e;
  border-right: 1px solid #e8e8e8;
  text-align: center;
  flex-shrink: 0;
  line-height: 1.3;

  &--last { border-right: none; }

  &--group { width: 72px; }
  &--item  { flex: 1.2; min-width: 70px; }
  &--sub   { flex: 1.1; min-width: 60px; }
  &--leaf  { flex: 1.1; min-width: 60px; }
  &--zone  { flex: 1.4; min-width: 90px; }
  &--num   { flex: 1;   min-width: 60px; }
  &--pct   { flex: 0.8; min-width: 52px; }
}

// ── 데이터 셀 ────────────────────────────────────────────
.ac {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  font-size: 12px;
  font-weight: $font-weight-medium;
  color: #373737;
  border-right: 1px solid #e8e8e8;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: keep-all;

  &--last { border-right: none; }

  &--group { width: 72px; justify-content: center; }
  &--item  { flex: 1.2; min-width: 70px; }
  &--sub   { flex: 1.1; min-width: 60px; }
  &--leaf  { flex: 1.1; min-width: 60px; }
  &--zone  { flex: 1.4; min-width: 90px; font-size: 11px; }
  &--num   { flex: 1;   min-width: 60px; }
  &--pct   { flex: 0.8; min-width: 52px; }
  &--right { justify-content: flex-end; }
  &--accent { color: #256ef4; font-weight: $font-weight-bold; }

  &--total-label {
    flex: 1;
    justify-content: center;
    font-weight: $font-weight-semibold;
    color: #262626;
    // 구분+항목+세부항목+세분류+용도지역+용적률 자리 차지
    min-width: calc(72px + (1.2 + 1.1 + 1.1 + 1.4 + 1) * 1px);
    flex: 5.8;
  }
}

// ── 그룹 배지 ─────────────────────────────────────────────
.group-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 5px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: $font-weight-semibold;
  letter-spacing: -0.2px;
  white-space: nowrap;
  text-align: center;
  line-height: 1.3;

  &--0 { background: #e8f0ff; color: #256ef4; }
  &--1 { background: #fef3e2; color: #c97b00; }
  &--2 { background: #e6f9f0; color: #1a8c5a; }
  &--3 { background: #f3eaff; color: #7c3aed; }
}
</style>
