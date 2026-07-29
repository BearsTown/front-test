<template>
  <PlanContentDialog title="열 사용량 예측" :show-manage="false" @close="$emit('close')">

    <div class="hd-wrap">
      <div v-if="loading" class="hd-empty">
        <v-progress-circular size="16" width="2" indeterminate color="#256EF4" />
        <span>불러오는 중...</span>
      </div>

      <template v-else>
        <table class="hd-table">
          <colgroup>
            <col class="col-구분">
            <col class="col-value">
            <col class="col-value">
            <col class="col-value">
            <col class="col-total">
          </colgroup>
          <thead>
            <tr>
              <th>구분</th>
              <th>난방/급탕용</th>
              <th>냉방용</th>
              <th>취사용</th>
              <th class="th-total">계</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in rows" :key="i" class="hd-row">
              <td class="td-name">{{ row.구분 }}</td>
              <td class="td-val">
                <span class="val-box">{{ fmt(row.난방) }}</span>
              </td>
              <td class="td-val">
                <span class="val-box">{{ fmt(row.냉방) }}</span>
              </td>
              <td class="td-val">
                <span class="val-box">{{ fmt(row.취사) }}</span>
              </td>
              <td class="td-total">{{ fmt(row.계) }}</td>
            </tr>

            <!-- 합계 행 -->
            <tr class="hd-row hd-row--total">
              <td class="td-name td-name--bold">합계</td>
              <td class="td-val td-val--plain td-val--bold">{{ total.난방.toLocaleString() }}</td>
              <td class="td-val td-val--plain">{{ total.냉방.toLocaleString() }}</td>
              <td class="td-val td-val--plain td-val--bold">{{ total.취사.toLocaleString() }}</td>
              <td class="td-total td-total--bold">{{ total.계.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 주석 -->
        <div class="hd-note">* 열수요(Gcal/년)</div>
      </template>
    </div>

    <!-- 푸터 버튼 -->
    <template #footer>
      <div class="hd-footer">
        <button class="hd-btn hd-btn--cancel" @click="$emit('close')">취소</button>
        <button class="hd-btn hd-btn--confirm" @click="$emit('close')">확인</button>
      </div>
    </template>

  </PlanContentDialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchCarbonData } from '@/api/evalCenterApi'
import PlanContentDialog   from './PlanContentDialog.vue'

const props = defineProps({
  planId: { type: String, required: true },
})
defineEmits(['close'])

const loading = ref(false)
const rows    = ref([])
const total   = ref({ 난방: 0, 냉방: 0, 취사: 0, 계: 0 })

const fmt = (v) => (v == null ? '-' : v.toLocaleString())

async function load() {
  loading.value = true
  try {
    const data = await fetchCarbonData(props.planId)
    rows.value  = data.heatTable.rows
    total.value = data.heatTable.total
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style lang="scss" scoped>
// ── 래퍼 ─────────────────────────────────────────────
.hd-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hd-empty {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: #6e6e6e;
}

// ── 테이블 ───────────────────────────────────────────
.hd-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;

  .col-구분  { width: 120px; }
  .col-value { }
  .col-total { }

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

  .th-total {
    text-align: left;
  }
}

// ── 데이터 행 ────────────────────────────────────────
.hd-row {
  border-top: 1px solid #e8e8e8;
  background: $color-white;

  &--total {
    background: #e9f1fe;
  }
}

// ── 셀 공통 ──────────────────────────────────────────
td {
  padding: 9px 10px;
  font-size: 13px;
  font-weight: $font-weight-medium;
  color: #373737;
  vertical-align: middle;
  border-right: 1px solid #e8e8e8;

  &:last-child { border-right: none; }
}

// ── 구분 셀 ──────────────────────────────────────────
.td-name {
  letter-spacing: -0.26px;
  font-size: 13px;

  &--bold { font-weight: $font-weight-semibold; }
}

// ── 수치 셀 (border-box 스타일) ───────────────────────
.td-val {
  padding: 9px 6px;

  &--plain {
    // 합계 행: border-box 없이 plain 텍스트
    padding: 9px 10px;
    letter-spacing: -0.26px;
  }

  &--bold { font-weight: $font-weight-semibold; }
}

.val-box {
  display: inline-flex;
  align-items: center;
  width: 100%;
  height: 32px;
  padding: 0 12px;
  background: $color-white;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  font-size: 13px;
  font-weight: $font-weight-medium;
  color: #373737;
  letter-spacing: -0.26px;
  box-sizing: border-box;
}

// ── 계 셀 (plain) ─────────────────────────────────────
.td-total {
  text-align: left;
  letter-spacing: -0.26px;

  &--bold { font-weight: $font-weight-semibold; }
}

// ── 주석 ─────────────────────────────────────────────
.hd-note {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 8px 12px;
  background: #f7f7f7;
  border-radius: 6px;
  font-size: 12px;
  font-weight: $font-weight-medium;
  color: #333;
  letter-spacing: -0.24px;
}

// ── 푸터 ─────────────────────────────────────────────
.hd-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #e5e5e5;
}

.hd-btn {
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
