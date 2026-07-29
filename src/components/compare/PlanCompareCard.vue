<template>
  <div class="pcc">

    <!-- 카드 헤더 -->
    <div class="pcc-head">
      <span class="pcc-head__title">{{ planTitle }}</span>
      <button
        class="pcc-checkbox"
        :class="{ 'pcc-checkbox--checked': checked }"
        @click="checked = !checked"
      >
        <v-icon v-if="checked" size="10" color="#fff">mdi-check</v-icon>
      </button>
    </div>

    <!-- ── Section 1: 녹색도시 개발계획 평가 결과 ─────────── -->
    <div class="pcc-section pcc-section--bordered">

      <!-- 타이틀 행 -->
      <div class="pcc-eval-header">
        <span class="pcc-eval-header__title">녹색도시 개발계획 평가 결과</span>
        <div class="pcc-eval-header__right">
          <span class="pcc-grade" :style="gradeStyle">{{ data.grade }}등급</span>
          <v-icon size="20" class="pcc-chevron" :class="{ 'pcc-chevron--closed': !evalOpen }" @click="evalOpen = !evalOpen">
            mdi-chevron-up
          </v-icon>
        </div>
      </div>

      <template v-if="evalOpen">
        <!-- 점수 카드 4개 -->
        <div class="pcc-scores">
          <!-- 최종평점 (강조) -->
          <div class="pcc-score-primary">
            <span class="pcc-score-primary__label">최종평점</span>
            <span class="pcc-score-primary__value">{{ data.scores.final }}</span>
            <v-icon class="pcc-score-primary__info" size="14" color="#b8c8e0">mdi-information-outline</v-icon>
          </div>
          <!-- 나머지 3개 -->
          <div class="pcc-score">
            <span class="pcc-score__label">탄소흡수</span>
            <span class="pcc-score__value">{{ data.scores.absorb }}</span>
          </div>
          <div class="pcc-score">
            <span class="pcc-score__label">탄소저감</span>
            <span class="pcc-score__value">{{ data.scores.reduce }}</span>
          </div>
          <div class="pcc-score">
            <span class="pcc-score__label">정성평가</span>
            <span class="pcc-score__value">{{ data.scores.qualitative }}</span>
          </div>
        </div>

        <!-- 차트 플레이스홀더 -->
        <div class="pcc-chart-placeholder">
          <v-icon size="32" color="#bbb">mdi-chart-bar</v-icon>
        </div>

        <!-- 배출량 3개 카드 -->
        <div class="pcc-emissions">
          <div class="pcc-emission pcc-emission--primary">
            <span class="pcc-emission__label">전체 배출량</span>
            <span class="pcc-emission__value">{{ data.emission.total }}</span>
            <span class="pcc-emission__unit">CO2eq</span>
          </div>
          <div class="pcc-emission">
            <span class="pcc-emission__label">전체 허용량</span>
            <span class="pcc-emission__value">{{ data.emission.allowed }}</span>
            <span class="pcc-emission__unit">CO2eq</span>
          </div>
          <div class="pcc-emission">
            <span class="pcc-emission__label">탄소예산</span>
            <span class="pcc-emission__value">{{ data.emission.budget }}</span>
            <span class="pcc-emission__unit">Percent(%)</span>
          </div>
        </div>
      </template>
    </div>

    <!-- ── Section 탄소흡수 ───────────────────────────────── -->
    <div class="pcc-section pcc-section--bordered">
      <p class="pcc-sec-title">1) 탄소흡수</p>
      <table class="pcc-table">
        <colgroup>
          <col class="pcc-col--item" />
          <col class="pcc-col--value" />
          <col /><col /><col />
        </colgroup>
        <thead>
          <tr class="pcc-table__head-row">
            <th class="pcc-th pcc-th--item">평가항목</th>
            <th class="pcc-th pcc-th--right">값</th>
            <th class="pcc-th pcc-th--right">평점</th>
            <th class="pcc-th pcc-th--right">가중치</th>
            <th class="pcc-th pcc-th--right">환산점수</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in absorbRows" :key="row.title" class="pcc-table__row">
            <td class="pcc-td pcc-td--item">{{ row.title }}</td>
            <td class="pcc-td pcc-td--right">{{ row.value }}</td>
            <td class="pcc-td pcc-td--right">{{ row.score }}</td>
            <td class="pcc-td pcc-td--right">{{ row.weight }}</td>
            <td class="pcc-td pcc-td--right">{{ row.weighted }}</td>
          </tr>
          <tr class="pcc-table__row pcc-table__row--total">
            <td class="pcc-td pcc-td--item">소계</td>
            <td class="pcc-td pcc-td--total-val" colspan="4">{{ absorbTotal }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Section 탄소저감 ───────────────────────────────── -->
    <div class="pcc-section pcc-section--bordered">
      <p class="pcc-sec-title">2) 탄소저감</p>
      <table class="pcc-table">
        <colgroup>
          <col class="pcc-col--item" />
          <col class="pcc-col--value" />
          <col /><col /><col />
        </colgroup>
        <thead>
          <tr class="pcc-table__head-row">
            <th class="pcc-th pcc-th--item">평가항목</th>
            <th class="pcc-th pcc-th--right">값</th>
            <th class="pcc-th pcc-th--right">평점</th>
            <th class="pcc-th pcc-th--right">가중치</th>
            <th class="pcc-th pcc-th--right">환산점수</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in reduceRows" :key="row.title" class="pcc-table__row">
            <td class="pcc-td pcc-td--item">{{ row.title }}</td>
            <td class="pcc-td pcc-td--right">{{ row.value }}</td>
            <td class="pcc-td pcc-td--right">{{ row.score }}</td>
            <td class="pcc-td pcc-td--right">{{ row.weight }}</td>
            <td class="pcc-td pcc-td--right">{{ row.weighted }}</td>
          </tr>
          <tr class="pcc-table__row pcc-table__row--total">
            <td class="pcc-td pcc-td--item">소계</td>
            <td class="pcc-td pcc-td--total-val" colspan="4">{{ reduceTotal }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Section 2: 정성평가 테이블 ──────────────────────── -->
    <div class="pcc-section">

      <p class="pcc-sec-title">3) 정성평가</p>

      <table class="pcc-table">
        <thead>
          <tr class="pcc-table__head-row">
            <th class="pcc-th pcc-th--item">평가항목</th>
            <th class="pcc-th pcc-th--applied">반영여부</th>
            <th class="pcc-th pcc-th--score">평가</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in QUAL_ROWS" :key="i" class="pcc-table__row">
            <td class="pcc-td pcc-td--item">{{ row.item }}</td>
            <td class="pcc-td pcc-td--applied">{{ row.applied }}</td>
            <td class="pcc-td pcc-td--score">{{ row.score }}</td>
          </tr>
          <!-- 소계 -->
          <tr class="pcc-table__row pcc-table__row--total">
            <td class="pcc-td pcc-td--item">소계</td>
            <td class="pcc-td pcc-td--applied-full" colspan="2">
              <span class="pcc-total-val">{{ QUAL_TOTAL }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 최종평점 섹션 -->
      <p class="pcc-sec-title pcc-sec-title--mt">최종평점</p>

      <table class="pcc-table">
        <tbody>
          <tr class="pcc-table__row pcc-table__row--highlight">
            <td class="pcc-td pcc-td--formula">정량평가 합계 x (1+정성평가 합계)</td>
            <td class="pcc-td pcc-td--final">{{ data.scores.final }}</td>
          </tr>
          <tr class="pcc-table__row pcc-table__row--highlight">
            <td class="pcc-td pcc-td--formula">평가 등급</td>
            <td class="pcc-td pcc-td--final">{{ data.grade }}등급</td>
          </tr>
        </tbody>
      </table>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useScenarioStore } from '@/stores/scenario'

const props = defineProps({
  planId: { type: String, required: true },
})

const scenarioStore = useScenarioStore()
const checked = ref(false)
const evalOpen = ref(true)

// 안 이름: scenarioStore form.title이 있으면 사용, 없으면 기본값
const PLAN_DEFAULTS = {
  '1': { title: '기본개발', grade: '3', scores: { final: 71.02, absorb: 33.3, reduce: 37.7, qualitative: 0.02 }, emission: { total: '125,502', allowed: '1,000,000', budget: '874,498' } },
  '2': { title: '녹지친화', grade: '3', scores: { final: 74.97, absorb: 32.5, reduce: 41.0, qualitative: 0.02 }, emission: { total: '122,325', allowed: '1,000,000', budget: '874,498' } },
  '3': { title: '상업활성화', grade: '4', scores: { final: 69.87, absorb: 28.5, reduce: 40.0, qualitative: 0.02 }, emission: { total: '130,321', allowed: '1,000,000', budget: '874,498' } },
}

const data = computed(() => PLAN_DEFAULTS[props.planId])

const planTitle = computed(() => {
  const formTitle = scenarioStore.plans[props.planId]?.form?.title?.trim()
  const subtitle = formTitle || data.value.title
  return `${props.planId}안 : ${subtitle}`
})

const GRADE_STYLES = {
  '3': { background: '#ffde81', color: '#724b00' },
  '4': { background: '#ffcea2', color: '#9f3b14' },
}
const gradeStyle = computed(() => GRADE_STYLES[data.value.grade] ?? { background: '#e0e0e0', color: '#555' })

const QUAL_ROWS = [
  { item: '녹지축 연결 계획', applied: '반영', score: '0.01' },
  { item: '하천보전', applied: '미반영', score: '-' },
  { item: '습지보전지역, 생태경관보전지역 등의 보호', applied: '반영', score: '0.01' },
]
const QUAL_TOTAL = '0.02'

const EVAL_DATA = {
  '1': {
    absorb: [
      { title: '공원녹지확보비', value: '1.86',        score: 5, weight: 4   },
      { title: '자연지반면적률', value: '42.5%',        score: 5, weight: 2   },
    ],
    reduce: [
      { title: '직주근접',        value: '5.3km, 17분', score: 5, weight: 3   },
      { title: '대중교통 활성화', value: '0.188, 1.12', score: 5, weight: 2   },
      { title: '자전거 활성화',   value: '0.92',        score: 5, weight: 1   },
      { title: '녹색교통 활성화', value: '0가지',       score: 0, weight: 0.5 },
      { title: '녹색건축물 비율', value: '2등급',       score: 5, weight: 2   },
    ],
  },
  '2': {
    absorb: [
      { title: '공원녹지확보비', value: '2.14',        score: 5, weight: 4   },
      { title: '자연지반면적률', value: '38.2%',        score: 4, weight: 2   },
    ],
    reduce: [
      { title: '직주근접',        value: '4.8km, 14분', score: 5, weight: 3   },
      { title: '대중교통 활성화', value: '0.210, 1.08', score: 4, weight: 2   },
      { title: '자전거 활성화',   value: '1.05',        score: 5, weight: 1   },
      { title: '녹색교통 활성화', value: '2가지',       score: 2, weight: 0.5 },
      { title: '녹색건축물 비율', value: '3등급',       score: 4, weight: 2   },
    ],
  },
  '3': {
    absorb: [
      { title: '공원녹지확보비', value: '1.52',        score: 4, weight: 4   },
      { title: '자연지반면적률', value: '31.8%',        score: 3, weight: 2   },
    ],
    reduce: [
      { title: '직주근접',        value: '6.1km, 18분', score: 5, weight: 3   },
      { title: '대중교통 활성화', value: '0.165, 1.35', score: 5, weight: 2   },
      { title: '자전거 활성화',   value: '0.78',        score: 4, weight: 1   },
      { title: '녹색교통 활성화', value: '1가지',       score: 1, weight: 0.5 },
      { title: '녹색건축물 비율', value: '3등급',       score: 4, weight: 2   },
    ],
  },
}

const evalData    = computed(() => EVAL_DATA[props.planId] ?? EVAL_DATA['1'])
const absorbRows  = computed(() => evalData.value.absorb.map(r => ({ ...r, weighted: r.score * r.weight })))
const absorbTotal = computed(() => absorbRows.value.reduce((s, r) => s + r.weighted, 0))
const reduceRows  = computed(() => evalData.value.reduce.map(r => ({ ...r, weighted: r.score * r.weight })))
const reduceTotal = computed(() => reduceRows.value.reduce((s, r) => s + r.weighted, 0))
</script>

<style lang="scss" scoped>
// ── 카드 레이아웃 ──────────────────────────────────────
.pcc {
  flex-shrink: 0;
  width: 588px;
  background: $color-white;
  border-radius: 12px;
  box-shadow: -2px 0px 24px 0px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

// ── 카드 헤더 ─────────────────────────────────────────
.pcc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eaeaea;
  flex-shrink: 0;

  &__title {
    font-size: 18px;
    font-weight: $font-weight-bold;
    color: #272727;
    letter-spacing: -0.18px;
  }
}

.pcc-checkbox {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-white;
  border: 1px solid #bababa;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
  transition: border-color $transition-fast;

  &--checked {
    border-color: $color-primary;
    background: $color-primary;
  }

  &:hover:not(.pcc-checkbox--checked) { border-color: #888; }
}

// ── 섹션 공통 ─────────────────────────────────────────
.pcc-section {
  padding: 18px 18px 20px;

  &--bordered {
    border-bottom: 1px solid #f1f1f1;
  }
}

// ── 평가결과 헤더 ─────────────────────────────────────
.pcc-eval-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  &__title {
    font-size: 16px;
    font-weight: $font-weight-bold;
    color: #262626;
    letter-spacing: -0.32px;
    line-height: 32px;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.pcc-grade {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 18px;
  font-weight: $font-weight-bold;
  line-height: 22px;
  letter-spacing: -0.18px;
  white-space: nowrap;
}

.pcc-chevron {
  color: #888;
  cursor: pointer;
  transition: transform $transition-base;

  &--closed { transform: rotate(180deg); }
}

// ── 점수 카드 ─────────────────────────────────────────
.pcc-scores {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 16px;
}

.pcc-score-primary {
  position: relative;
  flex-shrink: 0;
  width: 156px;
  height: 68px;
  background: #ecf2fe;
  border-radius: 16px;

  &__label {
    position: absolute;
    left: 16px;
    top: 13px;
    font-size: 12px;
    font-weight: $font-weight-medium;
    color: #373737;
    letter-spacing: -0.24px;
    white-space: nowrap;
  }

  &__value {
    position: absolute;
    left: 16px;
    top: 30px;
    font-size: 22px;
    font-weight: $font-weight-bold;
    color: #272727;
    letter-spacing: -0.22px;
    white-space: nowrap;
  }

  &__info {
    position: absolute;
    right: 12px;
    top: 12px;
  }
}

.pcc-score {
  position: relative;
  flex: 1;
  height: 68px;
  background: #f8f8f8;
  border-radius: 16px;

  &__label {
    position: absolute;
    left: 16px;
    top: 13px;
    font-size: 12px;
    font-weight: $font-weight-medium;
    color: #656565;
    letter-spacing: -0.24px;
    white-space: nowrap;
  }

  &__value {
    position: absolute;
    left: 16px;
    top: 30px;
    font-size: 22px;
    font-weight: $font-weight-semibold;
    color: #212121;
    letter-spacing: -0.22px;
    white-space: nowrap;
  }
}

// ── 차트 플레이스홀더 ─────────────────────────────────
.pcc-chart-placeholder {
  height: 265px;
  background: #d9d9d9;
  border-radius: 12px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// ── 배출량 카드 3개 ───────────────────────────────────
.pcc-emissions {
  display: flex;
  gap: 10px;
}

.pcc-emission {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 11px 16px;
  background: #f6f6f6;
  border-radius: 12px;

  &--primary { background: #ecf2fe; }

  &__label {
    font-size: 12px;
    font-weight: $font-weight-medium;
    color: #6e6e6e;
    letter-spacing: -0.24px;
  }

  &__value {
    font-size: 22px;
    font-weight: $font-weight-bold;
    color: #454545;
    letter-spacing: -0.22px;
    line-height: 1.2;
  }

  &__unit {
    font-size: 12px;
    font-weight: $font-weight-semibold;
    color: #98a29f;
    letter-spacing: -0.24px;
  }
}

// ── 섹션 타이틀 ──────────────────────────────────────
.pcc-sec-title {
  font-size: 14px;
  font-weight: $font-weight-bold;
  color: #262626;
  letter-spacing: -0.28px;
  margin-bottom: 12px;

  &--mt { margin-top: 16px; }
}

// ── 테이블 ───────────────────────────────────────────
.pcc-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 6px 6px 0 0;
  overflow: hidden;

  &__head-row {
    background: #f5f5f5;
    border: 1px solid #e8e8e8;
    height: 32px;
  }

  &__row {
    height: 36px;
    border: 1px solid #e8e8e8;
    background: $color-white;

    &--total { background: #e9f1fe; }
    &--highlight { background: #e9f1fe; border-color: #e8e8e8; }
  }
}

.pcc-th {
  font-size: 12px;
  font-weight: $font-weight-medium;
  color: #6e6e6e;
  text-align: left;
  padding: 0 16px;
  border-right: 1px solid #e8e8e8;

  &--item { width: 140px; }
  &--applied { /* flex-1 via table layout */ }
  &--score { width: 75px; }

  &:last-child { border-right: none; }
}

.pcc-td {
  font-size: 14px;
  font-weight: $font-weight-medium;
  color: #333;
  padding: 0 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-right: 1px solid #e8e8e8;

  &:last-child { border-right: none; }

  &--item { width: 140px; }
  &--applied { text-align: right; }
  &--score { width: 75px; text-align: right; }

  // colspan: 반영여부+평가 합친 소계 오른쪽 영역
  &--applied-full {
    text-align: right;
  }

  &--formula { }
  &--final {
    width: 89px;
    text-align: right;
    font-weight: $font-weight-bold;
    color: #256ef4;
  }
}

.pcc-total-val {
  font-weight: $font-weight-bold;
  color: #256ef4;
}

// ── 탄소흡수/저감 테이블 컬럼 ────────────────────────
.pcc-col--item  { width: 140px; }
.pcc-col--value { width: 129px; }

.pcc-th--right { text-align: right; }

.pcc-td--right {
  text-align: right;
  border-right: 1px solid #e8e8e8;
  &:last-child { border-right: none; }
}

.pcc-td--total-val {
  text-align: right;
  font-weight: $font-weight-bold;
  color: #256ef4;
  border-right: none;
}
</style>
