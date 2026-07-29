<template>
  <PlanContentDialog
    title="인구 및 수용 계획"
    @close="$emit('close')"
    @manage="onManageData"
  >
    <div class="pop-table">

      <!-- 헤더 행 -->
      <div class="pop-table__head">
        <div class="pop-table__cell pop-table__cell--label">구분</div>
        <div class="pop-table__cell">면적(㎡)</div>
        <div class="pop-table__cell">세대수(호)</div>
        <div class="pop-table__cell">인구(인)</div>
        <div class="pop-table__cell">순밀도(인/ha)</div>
      </div>

      <template v-if="populationRows.length > 0">
        <!-- 합계 행 (파란 배경 #e9f1fe) -->
        <div class="pop-table__row pop-table__row--total">
          <div class="pop-table__cell pop-table__cell--label">합계</div>
          <div class="pop-table__cell pop-table__cell--num">{{ formatNum(totalRow.면적) }}</div>
          <div class="pop-table__cell pop-table__cell--num">{{ formatNum(totalRow.세대수) }}</div>
          <div class="pop-table__cell pop-table__cell--num">{{ formatNum(totalRow.인구) }}</div>
          <div class="pop-table__cell pop-table__cell--num">{{ formatDensity(totalRow.순밀도) }}</div>
        </div>

        <!-- 구분별 행 -->
        <div v-for="(row, i) in populationRows" :key="i" class="pop-table__row">
          <div class="pop-table__cell pop-table__cell--label">{{ row.구분 }}</div>
          <div class="pop-table__cell pop-table__cell--num">{{ formatNum(row.면적) }}</div>
          <div class="pop-table__cell pop-table__cell--num">{{ formatNum(row.세대수) }}</div>
          <div class="pop-table__cell pop-table__cell--num">{{ formatNum(row.인구) }}</div>
          <div class="pop-table__cell pop-table__cell--num">{{ formatDensity(row.순밀도) }}</div>
        </div>
      </template>

      <!-- 빈 상태 -->
      <div v-else class="pop-table__empty">데이터가 없습니다.</div>

    </div>
  </PlanContentDialog>
</template>

<script setup>
import { computed } from 'vue'
import { usePopulationStore } from '@/stores/population'
import { useMapStore } from '@/stores/map'
import PlanContentDialog from './PlanContentDialog.vue'

const props = defineProps({
  planId: { type: String, required: true },
})
defineEmits(['close'])

const populationStore = usePopulationStore()
const mapStore = useMapStore()

const populationRows = computed(() => populationStore.plans[props.planId]?.populationRows ?? [])

const totalRow = computed(() => {
  const totalArea = populationRows.value.reduce((s, r) => s + (Number(r.면적)  || 0), 0)
  const totalHH   = populationRows.value.reduce((s, r) => s + (Number(r.세대수) || 0), 0)
  const totalPop  = populationRows.value.reduce((s, r) => s + (Number(r.인구)  || 0), 0)
  const density   = totalArea > 0 ? Math.round((totalPop / (totalArea / 10000)) * 10) / 10 : 0
  return { 면적: totalArea, 세대수: totalHH, 인구: totalPop, 순밀도: density }
})

const formatNum     = (v) => (Number(v) || 0).toLocaleString()
const formatDensity = (v) => v ? Number(v).toFixed(1) : '-'

function onManageData() {
  mapStore.openPopulationDataDialog()
}
</script>

<style lang="scss" scoped>
.pop-table {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;

  &__head {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    height: 34px;
    padding: 0 14px;
    gap: 10px;

    .pop-table__cell {
      font-weight: $font-weight-medium;
      color: #6e6e6e;
      font-size: 12px;
    }

    .pop-table__cell--label { border-right: none; }
  }

  &__row {
    display: flex;
    align-items: center;
    border-top: 1px solid #e8e8e8;
    height: 50px;
    padding: 0 12px;
    gap: 12px;
    background: $color-white;

    &--total {
      background: #e9f1fe;

      .pop-table__cell { font-weight: $font-weight-semibold; color: #333; }
    }
  }

  &__cell {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: $font-weight-medium;
    color: #6e6e6e;
    min-width: 0;

    &--label {
      height: 100%;
      justify-content: center;
      border-right: 1px solid #e8e8e8;
      padding: 0 7px;
      color: #373737;
    }

    &--num {
      justify-content: flex-end;
      padding-right: 4px;
      color: #373737;
    }
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
</style>
