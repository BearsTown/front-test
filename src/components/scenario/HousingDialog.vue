<template>
  <PlanContentDialog
    title="인구 및 주택건설 계획"
    @close="$emit('close')"
    @manage="onManageData"
  >

    <!-- ① 주택유형별 공급계획 (크로스 테이블) -->
    <div class="section">
      <h4 class="section__title">주택유형별 공급계획</h4>
      <div class="cross-tbl">

        <!-- 헤더 -->
        <div class="cross-tbl__head">
          <div class="ch">구분</div>
          <div class="ch">합계</div>
          <div class="ch">단독주택</div>
          <div class="ch">공동주택</div>
          <div class="ch ch--last">주상복합</div>
        </div>

        <!-- 데이터 행 -->
        <template v-if="housingTypeRows.length > 0">
          <div v-for="(row, i) in housingTypeRows" :key="i" class="cross-tbl__row">
            <div class="cd cd--center">{{ row.구분 }}</div>
            <div class="cd cd--right">{{ formatNum(row.합계) }}</div>
            <div class="cd cd--right">{{ formatNum(row.단독주택) }}</div>
            <div class="cd cd--right">{{ formatNum(row.공동주택) }}</div>
            <div class="cd cd--right cd--last">{{ formatNum(row.주상복합) }}</div>
          </div>
        </template>
        <div v-else class="cross-tbl__empty">데이터가 없습니다.</div>

      </div>
    </div>

    <!-- ② 인구 및 주택건설계획 (수직 테이블) -->
    <div class="section">
      <h4 class="section__title">인구 및 주택건설계획</h4>
      <div class="plan-tbl">

        <!-- 헤더 -->
        <div class="plan-tbl__head">
          <div class="ph ph--label">구분</div>
          <div class="ph">면적</div>
          <div class="ph">세대수</div>
          <div class="ph">인구</div>
          <div class="ph">구성비</div>
        </div>

        <!-- 데이터 행 -->
        <template v-if="housingPlanRows.length > 0">
          <template v-for="(row, i) in housingPlanRows" :key="i">

            <!-- 합계 (파란 배경, 굵은 글씨) -->
            <div v-if="row.rowKind === 'total'" class="plan-tbl__row plan-tbl__row--total">
              <div class="pd pd--label">{{ row.구분 }}</div>
              <div class="pd pd--num">{{ formatNum(row.면적) }}</div>
              <div class="pd pd--num">{{ formatNum(row.세대수) }}</div>
              <div class="pd pd--num">{{ formatNum(row.인구수) }}</div>
              <div class="pd pd--num">{{ row.구성비 }}</div>
            </div>

            <!-- 일반 그룹 행 (단독주택, 주상복합) -->
            <div v-else-if="row.rowKind === 'group'" class="plan-tbl__row">
              <div class="pd pd--label">{{ row.구분 }}</div>
              <div class="pd pd--num">{{ formatNum(row.면적) }}</div>
              <div class="pd pd--num">{{ formatNum(row.세대수) }}</div>
              <div class="pd pd--num">{{ formatNum(row.인구수) }}</div>
              <div class="pd pd--num">{{ row.구성비 }}</div>
            </div>

            <!-- 소계 행 (회색 배경) -->
            <div v-else-if="row.rowKind === 'subtotal'" class="plan-tbl__row plan-tbl__row--subtotal">
              <div class="pd pd--label">{{ row.구분 }}</div>
              <div class="pd pd--num">{{ formatNum(row.면적) }}</div>
              <div class="pd pd--num">{{ formatNum(row.세대수) }}</div>
              <div class="pd pd--num">{{ formatNum(row.인구수) }}</div>
              <div class="pd pd--num">{{ row.구성비 }}</div>
            </div>

            <!-- 공동주택 중첩 그룹 (주택규모 세부 행) -->
            <div v-else-if="row.rowKind === 'nested_group'" class="plan-tbl__row plan-tbl__row--nested">
              <!-- 공동주택 라벨 — 세부 행 전체 높이를 span -->
              <div class="plan-tbl__group-label">{{ row.구분 }}</div>
              <!-- 주택규모별 세부 행 -->
              <div class="plan-tbl__sub-rows">
                <div
                  v-for="(sub, j) in row.subRows"
                  :key="j"
                  class="plan-tbl__sub-row"
                  :class="{ 'plan-tbl__sub-row--first': j === 0 }"
                >
                  <div class="plan-tbl__sub-label">{{ sub.주택규모 }}</div>
                  <div class="pd pd--num">{{ formatNum(sub.면적) }}</div>
                  <div class="pd pd--num">{{ formatNum(sub.세대수) }}</div>
                  <div class="pd pd--num">{{ formatNum(sub.인구수) }}</div>
                  <div class="pd pd--num">{{ sub.구성비 }}</div>
                </div>
              </div>
            </div>

          </template>
        </template>
        <div v-else class="plan-tbl__empty">데이터가 없습니다.</div>

      </div>
    </div>

  </PlanContentDialog>
</template>

<script setup>
import { computed } from 'vue'
import { useHousingStore } from '@/stores/housing'
import { useMapStore } from '@/stores/map'
import PlanContentDialog from './PlanContentDialog.vue'

const props = defineProps({
  planId: { type: String, required: true },
})
defineEmits(['close'])

const housingStore = useHousingStore()
const mapStore     = useMapStore()

const housingTypeRows = computed(() => housingStore.plans[props.planId]?.housingTypeRows ?? [])
const housingPlanRows = computed(() => housingStore.plans[props.planId]?.housingPlanRows ?? [])

const formatNum = (v) => (Number(v) || 0).toLocaleString()

function onManageData() {
  mapStore.openHousingDataDialog()
}
</script>

<style lang="scss" scoped>
// ── 섹션 그룹 ─────────────────────────────────────────
.section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 0;
  margin-bottom: 20px;

  &:last-child { margin-bottom: 0; }

  &__title {
    font-size: 14px;
    font-weight: $font-weight-bold;
    color: #3e3e3e;
    letter-spacing: -0.28px;
  }
}

// ── 크로스 테이블 (주택유형별 공급계획) ──────────────────
// 5열 균등 배분, 구분 셀 center, 값 셀 right-aligned
.cross-tbl {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;
  width: 100%;

  &__head {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    height: 34px;
    border-bottom: 1px solid #e8e8e8;
  }

  &__row {
    display: flex;
    align-items: center;
    border-top: 1px solid #e8e8e8;
    min-height: 50px;
    background: $color-white;
  }

  &__empty {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: #6e6e6e;
  }
}

// 크로스 테이블 헤더 셀
.ch {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: $font-weight-medium;
  color: #6e6e6e;
  padding: 0 16px;
  border-right: 1px solid #e8e8e8;

  &--last { border-right: none; }
}

// 크로스 테이블 데이터 셀
.cd {
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: $font-weight-medium;
  color: #333;
  padding: 12px 16px;
  border-right: 1px solid #e8e8e8;

  &--center { justify-content: center; }
  &--right  { justify-content: flex-end; }
  &--last   { border-right: none; }
}

// ── 수직 테이블 (인구 및 주택건설계획) ──────────────────
// 구분 열: 150px 고정, 나머지 4열: flex-1 균등
.plan-tbl {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;
  width: 100%;

  &__head {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    height: 34px;
    border-bottom: 1px solid #e8e8e8;
  }

  &__row {
    display: flex;
    align-items: stretch;
    border-top: 1px solid #e8e8e8;
    min-height: 50px;
    background: $color-white;

    // 합계: 파란 배경 + 굵은 글씨
    &--total {
      background: #e9f1fe;
      .pd { font-weight: $font-weight-semibold; color: #1a3a6b; }
    }

    // 소계: 연회색 배경
    &--subtotal { background: #f7f7f7; }

    // 중첩 그룹: 배경은 하위 행이 처리
    &--nested { /* no extra bg */ }
  }

  &__empty {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: #6e6e6e;
  }

  // 공동주택 라벨 셀 (75px, 세부 행 높이 전체를 span)
  &__group-label {
    width: 75px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: $font-weight-medium;
    color: #373737;
    letter-spacing: -0.28px;
    border-right: 1px solid #e8e8e8;
    background: $color-white;
    padding: 10px 6px;
  }

  // 세부 행 컨테이너 (flex-1, 세로로 쌓임)
  &__sub-rows {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  // 개별 세부 행
  &__sub-row {
    display: flex;
    align-items: center;
    height: 50px;
    background: $color-white;
    border-top: 1px solid #e8e8e8;

    &--first { border-top: none; }
  }

  // 주택규모 라벨 셀 (75px, 세부 행 내)
  &__sub-label {
    width: 75px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: $font-weight-medium;
    color: #373737;
    letter-spacing: -0.28px;
    border-right: 1px solid #e8e8e8;
    padding: 0 6px;
    height: 100%;
    text-align: center;
    word-break: keep-all;
  }
}

// 수직 테이블 헤더 셀
.ph {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: $font-weight-medium;
  color: #6e6e6e;
  padding: 0 8px;

  &--label {
    width: 150px;
    flex: none;
    border-right: 1px solid #e8e8e8;
  }
}

// 수직 테이블 데이터 셀
.pd {
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: $font-weight-medium;
  color: #373737;
  letter-spacing: -0.28px;
  padding: 10px 12px;
  min-width: 0;

  &--label {
    width: 150px;
    flex: none;
    height: 100%;
    justify-content: flex-start;
    border-right: 1px solid #e8e8e8;
    padding: 10px 14px;
  }

  &--num { justify-content: flex-end; }
}
</style>
