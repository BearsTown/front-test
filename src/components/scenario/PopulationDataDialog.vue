<template>
  <div class="dialog-backdrop">
    <div class="dialog">

      <!-- 헤더 -->
      <div class="dialog-header">
        <h3 class="dialog-header__title">인구 및 수용 계획</h3>
        <div class="dialog-header__actions">
          <button class="file-btn" @click="triggerFileInput">
            파일 업로드
            <v-icon size="12">mdi-upload</v-icon>
          </button>
          <input ref="fileInputRef" type="file" accept=".xlsx,.xls,.csv" hidden @change="onFileChange" />
        </div>
        <button class="close-btn" @click="$emit('close')">
          <v-icon size="20">mdi-close</v-icon>
        </button>
      </div>

      <!-- 콘텐츠 -->
      <div class="dialog-content">
        <div class="data-table">

          <!-- 헤더 행 -->
          <div class="data-table__head">
            <div class="cell cell--label-head">구분</div>
            <div class="cell cell--flex">주택규모</div>
            <div class="cell cell--flex">면적</div>
            <div class="cell cell--flex">인구수</div>
            <div class="cell cell--flex">세대수</div>
            <div class="cell cell--flex">용적률</div>
          </div>

          <!-- 데이터 행 -->
          <template v-if="localRows.length > 0">
            <div v-for="(row, i) in localRows" :key="i" class="data-table__row">
              <!-- 구분 (고정, 우측 구분선) -->
              <div class="cell cell--label">{{ row.구분 }}</div>

              <!-- 주택규모 (읽기전용, 중앙정렬) -->
              <div class="cell cell--size">{{ row.주택규모 }}</div>

              <!-- 면적 (수정 가능) -->
              <div class="cell cell--flex">
                <div class="edit-box">
                  <input
                    v-model.number="row.면적"
                    type="number"
                    class="edit-box__input"
                    @focus="$event.target.select()"
                  />
                  <span class="edit-box__unit">㎡</span>
                </div>
              </div>

              <!-- 인구수 (수정 가능) -->
              <div class="cell cell--flex">
                <div class="edit-box">
                  <input
                    v-model.number="row.인구수"
                    type="number"
                    class="edit-box__input"
                    @focus="$event.target.select()"
                  />
                  <span class="edit-box__unit">인</span>
                </div>
              </div>

              <!-- 세대수 (수정 가능) -->
              <div class="cell cell--flex">
                <div class="edit-box">
                  <input
                    v-model.number="row.세대수"
                    type="number"
                    class="edit-box__input"
                    @focus="$event.target.select()"
                  />
                  <span class="edit-box__unit">세대</span>
                </div>
              </div>

              <!-- 용적률 (읽기전용, 우측정렬) -->
              <div class="cell cell--rate">{{ row.용적률 }}</div>
            </div>
          </template>

          <!-- 빈 상태 -->
          <div v-else class="data-table__empty">데이터가 없습니다.</div>

        </div>
      </div>

      <!-- 푸터 -->
      <div class="dialog-footer">
        <div class="dialog-footer__right">
          <button class="action-btn action-btn--cancel" @click="$emit('close')">취소</button>
          <button
            class="action-btn action-btn--save"
            :class="{ 'action-btn--active': localRows.length > 0 }"
            :disabled="localRows.length === 0"
            @click="onSave"
          >저장</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useScenarioStore } from '@/stores/scenario'
import { usePopulationStore } from '@/stores/population'

// DataDialog 패턴: planId prop 없이 activePlan을 직접 구독한다.
// 탭 전환 시 자동으로 해당 안의 데이터로 전환됨.
// 향후 추가되는 DataDialog도 동일 패턴을 따른다.

const emit = defineEmits(['close', 'save'])

const scenarioStore = useScenarioStore()
const populationStore = usePopulationStore()
const fileInputRef = ref(null)

const activePlanId = computed(() => scenarioStore.activePlan)

const localRows = ref([])

watch(
  () => populationStore.plans[activePlanId.value]?.dataRows,
  (rows) => { localRows.value = rows ? [...rows.map(r => ({ ...r }))] : [] },
  { immediate: true },
)

function triggerFileInput() {
  fileInputRef.value?.click()
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  // TODO: 실제 xlsx/csv 파싱으로 교체
  localRows.value = [
    { 구분: '단독주택', 주택규모: '60㎡ 이하',  면적: 42446,  인구수: 405,  세대수: 78,   용적률: 200  },
    { 구분: '단독주택', 주택규모: '60㎡ 이하',  면적: 56809,  인구수: 382,  세대수: 272,  용적률: 200  },
    { 구분: '공동주택', 주택규모: '60㎡ 이하',  면적: 30910,  인구수: 1383, 세대수: 1369, 용적률: 200  },
    { 구분: '주상복합', 주택규모: '60 ~ 85㎡',  면적: 18407,  인구수: 130,  세대수: 390,  용적률: 1100 },
    { 구분: '주상복합', 주택규모: '60 ~ 85㎡',  면적: 4026,   인구수: 973,  세대수: 100,  용적률: 1100 },
    { 구분: '아파트',   주택규모: '85㎡ 초과',  면적: 30482,  인구수: 1820, 세대수: 771,  용적률: 250  },
    { 구분: '아파트',   주택규모: '85㎡ 초과',  면적: 53012,  인구수: 3066, 세대수: 865,  용적률: 250  },
    { 구분: '아파트',   주택규모: '85㎡ 초과',  면적: 36294,  인구수: 1874, 세대수: 1242, 용적률: 250  },
    { 구분: '아파트',   주택규모: '85㎡ 초과',  면적: 108140, 인구수: 932,  세대수: 1457, 용적률: 250  },
    { 구분: '아파트',   주택규모: '85㎡ 초과',  면적: 61460,  인구수: 5742, 세대수: 1222, 용적률: 250  },
    { 구분: '아파트',   주택규모: '85㎡ 초과',  면적: 82478,  인구수: 1820, 세대수: 515,  용적률: 250  },
    { 구분: '아파트',   주택규모: '85㎡ 초과',  면적: 108201, 인구수: 1768, 세대수: 739,  용적률: 250  },
  ]
  e.target.value = ''
}

function onSave() {
  populationStore.setDataRows(activePlanId.value, localRows.value)
  emit('save', localRows.value)
  emit('close')
}
</script>

<style lang="scss" scoped>
.dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-modal;
}

.dialog {
  width: 900px;
  max-height: calc(100vh - 80px);
  background: $color-white;
  border-radius: 20px;
  box-shadow: 2px 0px 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// ── 헤더 ─────────────────────────────────────────────
.dialog-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 1px solid #eaeaea;
  height: 66px;
  flex-shrink: 0;

  &__title {
    flex: 1;
    font-size: 16px;
    font-weight: $font-weight-bold;
    color: #333;
    letter-spacing: -0.32px;
  }

  &__actions {
    display: flex;
    align-items: center;
  }
}

.file-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 8px 12px;
  background: $color-white;
  border: 1px solid #e7e7e7;
  border-radius: 16px;
  font-size: 12px;
  font-weight: $font-weight-semibold;
  color: #256EF4;
  letter-spacing: -0.24px;
  cursor: pointer;
  white-space: nowrap;
  transition: background $transition-fast;

  &:hover { background: #ECF2FE; }
}

.close-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: $color-gray-500;
  border-radius: $radius-full;
  transition: background $transition-fast;
  flex-shrink: 0;

  &:hover { background: $color-gray-100; }
}

// ── 콘텐츠 ───────────────────────────────────────────
.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f1f1;
  min-height: 0;

  &::-webkit-scrollbar       { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: #d5d5d5;
    border-radius: 100px;
  }
}

// ── 테이블 ───────────────────────────────────────────
.data-table {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;

  &__head {
    display: flex;
    align-items: center;
    padding: 0 14px;
    background: #f5f5f5;
    height: 34px;
    gap: 10px;
  }

  &__row {
    display: flex;
    align-items: center;
    padding: 0 12px;
    height: 50px;
    gap: 12px;
    border-top: 1px solid #e8e8e8;
    background: $color-white;
  }

  &__empty {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: #333;
  }
}

// ── 셀 공통 ──────────────────────────────────────────
.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: $font-weight-medium;
  color: #6e6e6e;
  text-align: center;

  // 헤더·데이터 공용
  &--flex { flex: 1; min-width: 0; }

  // 구분 헤더 셀 (고정 너비)
  &--label-head {
    width: 162px;
    flex-shrink: 0;
    padding: 0 7px;
  }

  // 구분 데이터 셀 (우측 구분선)
  &--label {
    width: 162px;
    flex-shrink: 0;
    height: 100%;
    justify-content: flex-start;
    padding: 10px 12px;
    border-right: 1px solid #e8e8e8;
    font-size: 14px;
    font-weight: $font-weight-medium;
    color: #373737;
  }

  // 주택규모 (읽기전용)
  &--size {
    flex: 1;
    font-size: 14px;
    font-weight: $font-weight-medium;
    color: #373737;
  }

  // 용적률 (읽기전용, 우측정렬)
  &--rate {
    flex: 1;
    justify-content: flex-end;
    padding: 10px 12px;
    font-size: 14px;
    font-weight: $font-weight-medium;
    color: #373737;
  }
}

// ── 수정 가능 셀 박스 ─────────────────────────────────
.edit-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  width: 100%;
  height: 32px;
  padding: 0 12px;
  background: $color-white;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  transition: border-color $transition-fast;

  &:focus-within {
    border-color: #256EF4;
  }

  &__input {
    flex: 1;
    min-width: 0;
    text-align: right;
    font-size: 14px;
    font-weight: $font-weight-medium;
    color: #373737;
    letter-spacing: -0.28px;
    background: none;
    border: none;
    outline: none;

    // 숫자 스피너 제거
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button { -webkit-appearance: none; }
    -moz-appearance: textfield;
  }

  &__unit {
    flex-shrink: 0;
    font-size: 14px;
    color: #929292;
    letter-spacing: -0.28px;
  }
}

// ── 푸터 ─────────────────────────────────────────────
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 66px;
  padding: 16px 20px;
  flex-shrink: 0;

  &__right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.action-btn {
  width: 70px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  font-size: 12px;
  font-weight: $font-weight-semibold;
  letter-spacing: -0.24px;
  cursor: pointer;
  transition: all $transition-fast;

  &--cancel {
    background: $color-white;
    border: 1px solid #e7e7e7;
    color: #656565;
    &:hover { background: $color-gray-50; }
  }

  &--save {
    background: #d5d5d5;
    border: 1px solid #e7e7e7;
    color: $color-white;
    cursor: not-allowed;
  }

  &--active {
    background: #256EF4;
    border-color: #256EF4;
    cursor: pointer;
    &:hover { background: #1452C4; }
  }
}
</style>
