<template>
  <div class="dialog-backdrop">
    <div class="dialog">

      <!-- 헤더 -->
      <div class="dialog-header">
        <h3 class="dialog-header__title">토지이용계획</h3>
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
            <div class="hcell hcell--group">구분</div>
            <div class="hcell hcell--item">항목</div>
            <div class="hcell hcell--sub">세부항목</div>
            <div class="hcell hcell--leaf">세분류</div>
            <div class="hcell hcell--zone">용도지역</div>
            <div class="hcell hcell--far">
              용적률(%)
              <v-icon size="14" class="sort-icon">mdi-information</v-icon>
            </div>
            <div class="hcell hcell--num">면적(㎡)</div>
            <div class="hcell hcell--num">연면적(㎡)</div>
          </div>

          <!-- 로딩 상태 -->
          <div v-if="zoneLoading" class="data-table__empty">
            <v-progress-circular size="18" width="2" indeterminate color="#256EF4" />
            <span>용도지역 목록 불러오는 중...</span>
          </div>

          <!-- 데이터 행 -->
          <template v-else-if="localRows.length > 0">
            <div v-for="(row, i) in localRows" :key="i" class="data-table__row">

              <!-- 구분 (그룹, read-only 배지) -->
              <div class="dcell dcell--group">
                <span class="group-badge" :class="`group-badge--${groupIndex(row.구분)}`">
                  {{ row.구분 }}
                </span>
              </div>

              <!-- 항목 -->
              <div class="dcell dcell--item">
                {{ row.항목 }}
              </div>

              <!-- 세부항목 -->
              <div class="dcell dcell--sub">
                {{ row.세부항목 }}
              </div>

              <!-- 세분류 -->
              <div class="dcell dcell--leaf">
                {{ row.세분류 }}
              </div>

              <!-- 용도지역 selectbox -->
              <div class="dcell dcell--zone">
                <div class="select-box" :class="{ 'select-box--open': openIndex === i }" @click.stop="toggleSelect(i)">
                  <span class="select-box__label">
                    {{ zoneLabel(row.용도지역Key) || '선택' }}
                  </span>
                  <v-icon size="16" class="select-box__arrow">mdi-chevron-down</v-icon>

                  <!-- 드롭다운 -->
                  <div v-if="openIndex === i" class="select-dropdown" @click.stop>
                    <div
                      v-for="opt in zoneOptions"
                      :key="opt.key"
                      class="select-dropdown__item"
                      :class="{ 'select-dropdown__item--active': row.용도지역Key === opt.key }"
                      @click="selectZone(row, opt)"
                    >
                      {{ opt.title }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 용적률(%) — 용도지역 선택 시 자동 설정, 수동 변경 시 연면적 재산출 -->
              <div class="dcell dcell--far">
                <div class="edit-box">
                  <input
                    v-model.number="row.용적률"
                    type="number"
                    class="edit-box__input"
                    placeholder="0"
                    @focus="$event.target.select()"
                    @input="recalcGFA(row)"
                  />
                  <span class="edit-box__unit">%</span>
                </div>
              </div>

              <!-- 면적 — 변경 시 연면적 재산출 -->
              <div class="dcell dcell--num">
                <div class="edit-box">
                  <input
                    v-model.number="row.면적"
                    type="number"
                    class="edit-box__input"
                    @focus="$event.target.select()"
                    @input="recalcGFA(row)"
                  />
                  <span class="edit-box__unit">㎡</span>
                </div>
              </div>

              <!-- 연면적 -->
              <div class="dcell dcell--num">
                <div class="edit-box">
                  <input
                    v-model.number="row.연면적"
                    type="number"
                    class="edit-box__input"
                    readonly
                    @focus="$event.target.select()"
                  />
                  <span class="edit-box__unit">㎡</span>
                </div>
              </div>

            </div>
          </template>

          <div v-else class="data-table__empty">
            <span>데이터가 없습니다.</span>
          </div>

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
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {useScenarioStore} from '@/stores/scenario'
import {LAND_GROUPS, useLandStore} from '@/stores/land'
import {useMapStore} from '@/stores/map'
import {fetchZoneList} from '@/api/landApi'

const emit = defineEmits(['close', 'save'])

const scenarioStore = useScenarioStore()
const landStore     = useLandStore()
const mapStore      = useMapStore()
const fileInputRef  = ref(null)

const activePlanId = computed(() => scenarioStore.activePlan)
const localRows    = ref([])

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
  return zoneOptions.value.find(o => o.key === key)?.title ?? ''
}

// ── selectbox 열림 상태 ──────────────────────────────────
const openIndex = ref(-1)

function toggleSelect(i) {
  openIndex.value = openIndex.value === i ? -1 : i
}

function selectZone(row, opt) {
  row.용도지역Key = opt.key
  row.용적률     = opt.value
  recalcGFA(row)
  openIndex.value = -1
}

function recalcGFA(row) {
  const area = Number(row.면적)  || 0
  const far  = Number(row.용적률) || 0
  row.연면적 = Math.round(area * far / 100)
}

function closeAllDropdowns() {
  openIndex.value = -1
}

// ── store 데이터 동기화 ───────────────────────────────────
watch(
  () => landStore.plans[activePlanId.value]?.dataRows,
  (rows) => {
    localRows.value = rows
      ? rows.map(r => ({
          구분:      r.구분  ?? r.그룹 ?? '',
          항목:      r.항목  ?? '',
          세부항목:  r.세부항목 ?? '',
          세분류:    r.세분류 ?? '',
          용도지역Key: r.용도지역Key ?? '',
          용적률:    r.용적률 ?? 0,
          면적:      Number(r.면적)  ?? 0,
          연면적:    Number(r.연면적) ?? 0,
        }))
      : []
  },
  { immediate: true },
)

// ── 그룹 배지 인덱스 ─────────────────────────────────────
const groupIndex = (group) => LAND_GROUPS.indexOf(group) % 4

// ── 파일 업로드 ──────────────────────────────────────────
function triggerFileInput() {
  fileInputRef.value?.click()
}

function onFileChange(e) {
  // TODO: 실제 xlsx/csv 파싱으로 교체
  // 엑셀의 용도지역Key 컬럼값으로 selectbox 초기값 설정
  localRows.value = [
    { 구분: '주거용지', 항목: '단독주택용지', 세부항목: '단독주택',   세분류: '단독주택',   용도지역Key: 'LU0203', 용적률: 300,  면적: 15000,  연면적: 45000 },
    { 구분: '주거용지', 항목: '단독주택용지', 세부항목: '다가구주택', 세분류: '다가구주택', 용도지역Key: 'LU0202', 용적률: 150,  면적: 12000,  연면적: 18000 },
    { 구분: '주거용지', 항목: '공동주택용지', 세부항목: '아파트',     세분류: '아파트',     용도지역Key: 'LU0203', 용적률: 300,  면적: 80000,  연면적: 240000 },
    { 구분: '주거용지', 항목: '공동주택용지', 세부항목: '연립주택',   세분류: '연립주택',   용도지역Key: 'LU0202', 용적률: 150,  면적: 25000,  연면적: 37500 },
    { 구분: '상업용지', 항목: '근린상업용지', 세부항목: '근린상업',   세분류: '근린상업',   용도지역Key: 'LU0403', 용적률: 900,  면적: 15000,  연면적: 135000 },
    { 구분: '상업용지', 항목: '일반상업용지', 세부항목: '일반상업',   세분류: '일반상업',   용도지역Key: 'LU0402', 용적률: 1300, 면적: 25000,  연면적: 325000 },
    { 구분: '도시기반시설용지', 항목: '교통시설', 세부항목: '도로', 세분류: '간선도로', 용도지역Key: '', 용적률: 0, 면적: 45000, 연면적: 0 },
    { 구분: '도시기반시설용지', 항목: '공원녹지', 세부항목: '공원', 세분류: '근린공원', 용도지역Key: '', 용적률: 0, 면적: 30000, 연면적: 0 },
    { 구분: '기타시설용지',    항목: '공공청사', 세부항목: '행정시설', 세분류: '주민센터', 용도지역Key: 'LU0203', 용적률: 300, 면적: 5000, 연면적: 15000 },
  ]
  e.target.value = ''
}

// ── 저장 ─────────────────────────────────────────────────
function onSave() {
  landStore.setDataRows(activePlanId.value, localRows.value)
  emit('save', localRows.value)
  emit('close')
}

// ── 라이프사이클 ──────────────────────────────────────────
onMounted(() => {
  loadZoneList()
  document.addEventListener('click', closeAllDropdowns)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeAllDropdowns)
})
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
  width: 1060px;
  max-height: calc(100vh - 80px);
  background: $color-white;
  border-radius: 20px;
  box-shadow: 2px 0 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// ── 헤더 ─────────────────────────────────────────────────
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
  padding: 0 12px;
  background: $color-white;
  border: 1px solid #e7e7e7;
  border-radius: $radius-full;
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

// ── 콘텐츠 ───────────────────────────────────────────────
.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  min-height: 0;

  &::-webkit-scrollbar       { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #d5d5d5; border-radius: 100px; }
}

// ── 테이블 ───────────────────────────────────────────────
.data-table {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: visible; // dropdown이 테이블 밖으로 나올 수 있게

  &__head {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    height: 34px;
    padding: 0 5px;
    gap: 5px;
    border-bottom: 1px solid #e8e8e8;
    border-radius: 6px 6px 0 0;
  }

  &__row {
    display: flex;
    align-items: center;
    border-top: 1px solid #e8e8e8;
    min-height: 50px;
    padding: 6px 5px;
    gap: 5px;
    background: $color-white;
    position: relative;

    &:first-of-type { border-top: none; }
  }

  &__empty {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 13px;
    color: #6e6e6e;
  }
}

// ── 헤더 셀 ──────────────────────────────────────────────
.hcell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: $font-weight-medium;
  color: #6e6e6e;
  gap: 3px;
  flex-shrink: 0;

  &--group { width: 110px; }

  &--item {
    flex: 1.2;
    min-width: 80px;
    justify-content: center;
  }

  &--sub {
    flex: 1.2;
    min-width: 80px;
    justify-content: center;
  }

  &--leaf {
    flex: 1.2;
    min-width: 80px;
    justify-content: center;
  }
  &--zone  { flex: 1.8; min-width: 130px; }
  &--far   { flex: 0.9; min-width: 70px; }
  &--num   { flex: 1.1; min-width: 80px; }
}

.sort-icon {
  color: #b0b0b0;
}

// ── 데이터 셀 ────────────────────────────────────────────
.dcell {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: $font-weight-medium;
  color: #373737;
  flex-shrink: 0;

  &--group { width: 110px; justify-content: center; }

  &--item {
    flex: 1.2;
    min-width: 80px;
    justify-content: center;
  }

  &--sub {
    flex: 1.2;
    min-width: 80px;
    justify-content: center;
  }

  &--leaf {
    flex: 1.2;
    min-width: 80px;
    justify-content: center;
  }
  &--zone  { flex: 1.8; min-width: 130px; position: relative; }
  &--far   { flex: 0.9; min-width: 70px; }
  &--num   { flex: 1.1; min-width: 80px; }
}

// 그룹 배지
.group-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: $font-weight-semibold;
  letter-spacing: -0.22px;
  white-space: nowrap;
  text-align: center;

  &--0 { background: #e8f0ff; color: #256EF4; }  // 주거용지
  &--1 { background: #fef3e2; color: #c97b00; }  // 상업용지
  &--2 { background: #e6f9f0; color: #1a8c5a; }  // 도시기반시설용지
  &--3 { background: #f3eaff; color: #7c3aed; }  // 기타시설용지
}

// ── selectbox ────────────────────────────────────────────
.select-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 32px;
  padding: 0 8px 0 10px;
  background: #f6f6f6;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  cursor: pointer;
  gap: 4px;
  transition: border-color $transition-fast, background $transition-fast;
  user-select: none;

  &:hover {
    border-color: #c0c0c0;
    background: #f0f0f0;
  }

  &--open {
    border-color: #256EF4;
    background: $color-white;
  }

  &__label {
    flex: 1;
    min-width: 0;
    font-size: 11px;
    font-weight: $font-weight-medium;
    color: #262626;
    letter-spacing: -0.22px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:empty::before,
    &[data-placeholder] {
      color: #c0c0c0;
    }
  }

  &__arrow {
    flex-shrink: 0;
    color: #929292;
    transition: transform $transition-fast;

    .select-box--open & {
      transform: rotate(180deg);
    }
  }
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: $color-white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
  padding: 4px;

  &::-webkit-scrollbar       { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #d5d5d5; border-radius: 100px; }

  &__item {
    padding: 7px 10px;
    font-size: 12px;
    font-weight: $font-weight-medium;
    color: #373737;
    border-radius: 6px;
    cursor: pointer;
    letter-spacing: -0.24px;
    transition: background $transition-fast;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      background: #f0f5ff;
      color: #256EF4;
    }

    &--active {
      background: #e8f0ff;
      color: #256EF4;
      font-weight: $font-weight-semibold;
    }
  }
}

// ── 텍스트 입력 ──────────────────────────────────────────
.text-input {
  width: 100%;
  height: 32px;
  padding: 0 10px;
  background: $color-white;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  font-size: 13px;
  font-weight: $font-weight-medium;
  color: #373737;
  letter-spacing: -0.26px;
  outline: none;
  transition: border-color $transition-fast;

  &:focus { border-color: #256EF4; }
  &::placeholder { color: #c0c0c0; }
}

// ── 숫자 입력 박스 ────────────────────────────────────────
.edit-box {
  display: flex;
  align-items: center;
  gap: 3px;
  width: 100%;
  height: 32px;
  padding: 0 8px;
  background: $color-white;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  transition: border-color $transition-fast;

  &:focus-within { border-color: #256EF4; }

  &__input {
    flex: 1;
    min-width: 0;
    text-align: right;
    font-size: 12px;
    font-weight: $font-weight-medium;
    color: #373737;
    letter-spacing: -0.24px;
    background: none;
    border: none;
    outline: none;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button { -webkit-appearance: none; }
    -moz-appearance: textfield;
  }

  &__unit {
    flex-shrink: 0;
    font-size: 11px;
    color: #929292;
    white-space: nowrap;
  }
}

// ── 푸터 ─────────────────────────────────────────────────
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 66px;
  padding: 16px 20px;
  border-top: 1px solid #e5e5e5;
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
