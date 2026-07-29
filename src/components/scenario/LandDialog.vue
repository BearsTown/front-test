<template>
  <PlanContentDialog
    title="토지이용계획"
    @close="$emit('close')"
    @manage="onManageData"
  >

    <!-- 그룹 토글 (1개만 활성화) -->
    <div class="group-tabs">
      <button
        v-for="g in LAND_GROUPS"
        :key="g"
        class="group-tab"
        :class="{ 'group-tab--active': activeGroup === g }"
        @click="selectGroup(g)"
      >{{ g }}</button>
    </div>

    <!-- 3단계 계층 테이블 (CSS Grid rowspan 방식) -->
    <div class="land-grid-wrap">
      <div class="land-grid">

        <!-- 헤더 (row 1) -->
        <div class="lg-h">항목</div>
        <div class="lg-h">세부항목</div>
        <div class="lg-h">세분류</div>
        <div class="lg-h">면적(㎡)</div>
        <div class="lg-h lg-h--last">연면적(㎡)</div>

        <!-- 데이터 (항목 → 세부항목 → 세분류 계층) -->
        <template v-if="gridItems.length > 0">
          <template v-for="(item, i) in gridItems" :key="`item-${i}`">

            <!-- 항목 셀 (rowSpan으로 세부항목 행 전체 span) -->
            <div
              class="lg-c lg-c--item"
              :style="{ gridRow: `${item.gridRow} / span ${item.rowSpan}`, gridColumn: 1 }"
            >{{ item.항목 }}</div>

            <template v-for="(sub, j) in item.subs" :key="`sub-${i}-${j}`">

              <!-- 세부항목 셀 (rowSpan으로 세분류 행 전체 span) -->
              <div
                class="lg-c lg-c--sub"
                :style="{ gridRow: `${sub.gridRow} / span ${sub.rowSpan}`, gridColumn: 2 }"
              >{{ sub.세부항목 }}</div>

              <!-- 세분류 / 면적 / 연면적 (리프 행) -->
              <template v-for="(leaf, k) in sub.leafRows" :key="`leaf-${i}-${j}-${k}`">
                <div
                  class="lg-c lg-c--leaf"
                  :style="{ gridRow: leaf.gridRow, gridColumn: 3 }"
                >{{ leaf.세분류 }}</div>
                <div
                  class="lg-c lg-c--num"
                  :style="{ gridRow: leaf.gridRow, gridColumn: 4 }"
                >{{ formatNum(leaf.면적) }}</div>
                <div
                  class="lg-c lg-c--num lg-c--last"
                  :style="{ gridRow: leaf.gridRow, gridColumn: 5 }"
                >{{ formatNum(leaf.연면적) }}</div>
              </template>

            </template>
          </template>
        </template>

        <!-- 빈 상태 -->
        <div v-else class="lg-empty">데이터가 없습니다.</div>

      </div>
    </div>

  </PlanContentDialog>
</template>

<script setup>
import { computed } from 'vue'
import { useLandStore, LAND_GROUPS } from '@/stores/land'
import { useMapStore } from '@/stores/map'
import PlanContentDialog from './PlanContentDialog.vue'

const props = defineProps({
  planId: { type: String, required: true },
})
defineEmits(['close'])

const landStore = useLandStore()
const mapStore  = useMapStore()

const activeGroup = computed(() => landStore.plans[props.planId]?.activeGroup ?? '주거용지')
const gridItems   = computed(() => landStore.getGridItems(props.planId, activeGroup.value))

function selectGroup(group) {
  landStore.setActiveGroup(props.planId, group)
}

const formatNum = (v) => (Number(v) || 0).toLocaleString()

function onManageData() {
  mapStore.openLandDataDialog()
}
</script>

<style lang="scss" scoped>
// ── 그룹 토글 탭 ──────────────────────────────────────
.group-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.group-tab {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 999px;
  border: none;
  background: #f4f4f4;
  color: #494949;
  font-size: 14px;
  font-weight: $font-weight-medium;
  letter-spacing: -0.28px;
  cursor: pointer;
  white-space: nowrap;
  transition: background $transition-fast, color $transition-fast;

  &:hover:not(.group-tab--active) { background: #e4e4e4; }

  // 활성: Figma의 rgba(0,0,0,0.2) 오버레이 on #256EF4
  &--active {
    background-image:
      linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
      linear-gradient(#256EF4, #256EF4);
    color: $color-white;
  }
}

// ── CSS Grid 테이블 래퍼 ──────────────────────────────
.land-grid-wrap {
  overflow-x: auto;

  &::-webkit-scrollbar       { height: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #d5d5d5; border-radius: 100px; }
}

// ── CSS Grid 테이블 ──────────────────────────────────
// 5열 균등 (항목|세부항목|세분류|면적|연면적)
// 데이터 셀은 grid-row/grid-column 인라인 스타일로 명시적 배치 (rowspan 효과)
.land-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;
  width: 100%;
  min-width: 420px;
}

// 헤더 셀
.lg-h {
  background: #f5f5f5;
  min-height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: $font-weight-medium;
  color: #6e6e6e;
  padding: 0 8px;
  border-right: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
  text-align: center;

  &--last { border-right: none; }
}

// 데이터 셀 공통
.lg-c {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: $font-weight-medium;
  color: #373737;
  padding: 10px 8px;
  border-top: 1px solid #e8e8e8;
  border-right: 1px solid #e8e8e8;
  min-height: 50px;
  text-align: center;
  word-break: keep-all;
  letter-spacing: -0.26px;
  background: $color-white;

  // 마지막 열 (연면적): border-right 없음
  &--last { border-right: none; }

  // 숫자 셀 (면적, 연면적): 우측 정렬
  &--num {
    justify-content: flex-end;
    padding: 0 12px;
    font-size: 14px;
    letter-spacing: -0.28px;
  }
}

// 빈 상태 (grid-column 전체 span)
.lg-empty {
  grid-column: 1 / -1;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #6e6e6e;
  border-top: 1px solid #e8e8e8;
}
</style>
