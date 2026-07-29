<template>
  <PlanContentDialog title="전력 사용량 예측" :show-manage="false" @close="$emit('close')">

    <!-- 테이블 -->
    <div class="ed-wrap">
      <div v-if="loading" class="ed-empty">
        <v-progress-circular size="16" width="2" indeterminate color="#256EF4" />
        <span>불러오는 중...</span>
      </div>

      <table v-else class="ed-table">
        <colgroup>
          <col class="col-구분">
          <col class="col-규모">
          <col class="col-unit">
          <col class="col-annual">
        </colgroup>
        <thead>
          <tr>
            <th>구분</th>
            <th>규모</th>
            <th>단위사용량</th>
            <th>연간사용량</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(group, gi) in tableGroups" :key="gi">

            <!-- 단일 행 -->
            <tr v-if="group.type === 'single'" class="ed-row">
              <td class="td-name">{{ group.구분 }}</td>
              <td class="td-규모">
                <span class="규모-box">
                  <span class="규모-val">{{ group.규모값.toLocaleString() }}</span>
                  <span class="규모-unit">{{ group.규모단위 }}</span>
                </span>
              </td>
              <td class="td-unit" :class="{ 'td-note': isNote(group.단위사용량) }">{{ group.단위사용량 }}</td>
              <td class="td-annual">{{ group.연간사용량.toLocaleString() }}</td>
            </tr>

            <!-- 그룹 행 (공동주택, 주상복합 등) -->
            <template v-else>
              <tr
                v-for="(item, ri) in group.items"
                :key="ri"
                class="ed-row"
              >
                <!-- 구분 셀은 첫 번째 행만 렌더링, rowspan 처리 -->
                <td
                  v-if="ri === 0"
                  :rowspan="group.items.length"
                  class="td-name td-name--group"
                >{{ group.구분 }}</td>
                <td class="td-규모 td-규모--sub">
                  <span class="sub-label">{{ item.sub }}</span>
                  <span class="규모-box">
                    <span class="규모-val">{{ item.규모값.toLocaleString() }}</span>
                    <span class="규모-unit">{{ item.규모단위 }}</span>
                  </span>
                </td>
                <td class="td-unit">{{ item.단위사용량 }}</td>
                <td class="td-annual">{{ item.연간사용량.toLocaleString() }}</td>
              </tr>
            </template>

          </template>

          <!-- 합계 행 -->
          <tr class="ed-row ed-row--total">
            <td class="td-name td-name--total">합계</td>
            <td class="td-규모">-</td>
            <td class="td-unit">-</td>
            <td class="td-annual td-annual--accent">{{ total.toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 푸터 버튼 -->
    <template #footer>
      <div class="ed-footer">
        <button class="ed-btn ed-btn--cancel" @click="$emit('close')">취소</button>
        <button class="ed-btn ed-btn--confirm" @click="$emit('close')">확인</button>
      </div>
    </template>

  </PlanContentDialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchCarbonData }    from '@/api/evalCenterApi'
import PlanContentDialog      from './PlanContentDialog.vue'

const props = defineProps({
  planId: { type: String, required: true },
})
defineEmits(['close'])

const loading  = ref(false)
const rawRows  = ref([])
const total    = ref(0)

async function load() {
  loading.value = true
  try {
    const data = await fetchCarbonData(props.planId)
    rawRows.value = data.electricityTable.rows
    total.value   = data.electricityTable.total
  } finally {
    loading.value = false
  }
}

// ── 그룹 집계 ─────────────────────────────────────────
// 연속된 같은 구분 + sub !== null 을 그룹으로 묶음
const tableGroups = computed(() => {
  const result = []
  const rows   = rawRows.value
  let i = 0
  while (i < rows.length) {
    const row = rows[i]
    if (row.sub !== null) {
      const items = [row]
      let j = i + 1
      while (j < rows.length && rows[j].구분 === row.구분 && rows[j].sub !== null) {
        items.push(rows[j])
        j++
      }
      result.push({ type: 'group', 구분: row.구분, items })
      i = j
    } else {
      result.push({ type: 'single', ...row })
      i++
    }
  }
  return result
})

const isNote = (val) => val && val.includes('\n')

onMounted(load)
</script>

<style lang="scss" scoped>
// ── 래퍼 ─────────────────────────────────────────────
.ed-wrap {
  overflow-x: auto;

  &::-webkit-scrollbar       { height: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #d5d5d5; border-radius: 100px; }
}

.ed-empty {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: #6e6e6e;
}

// ── 테이블 ───────────────────────────────────────────
.ed-table {
  width: 100%;
  min-width: 480px;
  border-collapse: collapse;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;

  // col 너비
  .col-구분   { width: 150px; }
  .col-규모   { width: 195px; }
  .col-unit   { width: auto; min-width: 80px; }
  .col-annual { width: auto; min-width: 80px; }

  thead tr {
    background: #f5f5f5;
    border-bottom: 1px solid #e8e8e8;
  }

  th {
    padding: 8px 10px;
    font-size: 12px;
    font-weight: $font-weight-medium;
    color: #6e6e6e;
    text-align: left;
    border-right: 1px solid #e8e8e8;
    white-space: nowrap;

    &:last-child { border-right: none; }
  }
}

// ── 데이터 행 ────────────────────────────────────────
.ed-row {
  border-top: 1px solid #e8e8e8;
  background: $color-white;

  &--total {
    background: #e9f1fe;
  }
}

// ── 셀 공통 ──────────────────────────────────────────
td {
  padding: 10px 10px;
  font-size: 13px;
  font-weight: $font-weight-medium;
  color: #373737;
  vertical-align: middle;
  border-right: 1px solid #e8e8e8;

  &:last-child { border-right: none; }
}

// ── 구분 셀 ──────────────────────────────────────────
.td-name {
  font-size: 13px;
  letter-spacing: -0.26px;

  &--group {
    border-right: 1px solid #e8e8e8;
    vertical-align: middle;
  }

  &--total {
    font-weight: $font-weight-semibold;
  }
}

// ── 규모 셀 ──────────────────────────────────────────
.td-규모 {
  display: table-cell;
  vertical-align: middle;

  &--sub {
    display: table-cell;
    padding: 0;

    .sub-label {
      display: inline-block;
      padding: 10px 8px;
      font-size: 12px;
      font-weight: $font-weight-medium;
      color: #373737;
      border-right: 1px solid #e8e8e8;
      min-width: 72px;
      vertical-align: middle;
      letter-spacing: -0.24px;
    }

    .규모-box {
      margin-left: 8px;
    }
  }
}

.규모-box {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  padding: 0 12px;
  background: $color-white;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  min-width: 100px;
  gap: 6px;
}

.규모-val {
  font-size: 13px;
  font-weight: $font-weight-medium;
  color: #373737;
  letter-spacing: -0.26px;
}

.규모-unit {
  font-size: 13px;
  font-weight: $font-weight-regular;
  color: #929292;
  flex-shrink: 0;
}

// ── 단위사용량 셀 ─────────────────────────────────────
.td-unit {
  white-space: pre-line;
  font-size: 13px;

  &.td-note {
    font-size: 11px;
    color: #6e6e6e;
    line-height: 1.4;
  }
}

// ── 연간사용량 셀 ─────────────────────────────────────
.td-annual {
  text-align: right;
  letter-spacing: -0.26px;

  &--accent {
    color: #373737;
    font-weight: $font-weight-semibold;
  }
}

// ── 푸터 ─────────────────────────────────────────────
.ed-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #e5e5e5;
}

.ed-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: $font-weight-semibold;
  letter-spacing: -0.24px;
  cursor: pointer;
  border: 1px solid #e7e7e7;
  transition: background $transition-fast;

  &--cancel {
    background: $color-white;
    color: #656565;
    &:hover { background: #f5f5f5; }
  }

  &--confirm {
    background: #256EF4;
    color: $color-white;
    border-color: #256EF4;
    &:hover { background: #1a5fd8; }
  }
}
</style>
