<template>
  <Teleport to="body">
    <div class="summary-overlay" @click.self="$emit('close')">
      <div class="summary-dialog">

        <!-- ── Header (고정) ── -->
        <div class="summary-dialog__header">
          <span class="summary-dialog__header-title">녹색도시 개발계획 평가총괄표</span>
          <button class="summary-dialog__close" @click="$emit('close')">
            <v-icon size="24">mdi-close</v-icon>
          </button>
        </div>

        <!-- ── Content (스크롤) ── -->
        <div class="summary-dialog__content">
          <div v-if="loading" class="summary-loading">데이터를 분석하는 중...</div>
          <template v-else-if="summary">

            <div class="summary-paper">
              <h2 class="summary-paper__title">녹색도시 개발계획 평가총괄표</h2>

              <div class="summary-sections">

                <!-- 1) 탄소흡수 -->
                <div class="summary-sec">
                  <p class="summary-sec__label">1) 탄소흡수</p>
                  <table class="st">
                    <colgroup>
                      <col class="st__col--name" />
                      <col class="st__col--plan" />
                      <col /><col /><col />
                    </colgroup>
                    <thead>
                      <tr class="st__head-row">
                        <th class="st__th">평가항목</th>
                        <th class="st__th">계획 또는 목표치</th>
                        <th class="st__th">평점</th>
                        <th class="st__th">가중치</th>
                        <th class="st__th">환산점수</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in summary.absorptionItems" :key="row.code" class="st__row">
                        <td class="st__td">{{ row.title }}</td>
                        <td class="st__td st__td--right">{{ row.planValue }}</td>
                        <td class="st__td st__td--right">{{ row.rating }}</td>
                        <td class="st__td st__td--right">{{ row.weight }}</td>
                        <td class="st__td st__td--right">{{ row.convertedScore }}</td>
                      </tr>
                      <tr class="st__row st__row--subtotal">
                        <td class="st__td">탄소흡수 부문평가 합계 (만점: 50점)</td>
                        <td class="st__td st__td--right st__td--accent" colspan="4">
                          {{ summary.absorptionSubtotal }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- 2) 탄소저감 -->
                <div class="summary-sec">
                  <p class="summary-sec__label">2) 탄소저감</p>
                  <table class="st">
                    <colgroup>
                      <col class="st__col--name" />
                      <col class="st__col--plan" />
                      <col /><col /><col />
                    </colgroup>
                    <thead>
                      <tr class="st__head-row">
                        <th class="st__th">평가항목</th>
                        <th class="st__th">계획 또는 목표치</th>
                        <th class="st__th">평점</th>
                        <th class="st__th">가중치</th>
                        <th class="st__th">환산점수</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in summary.reductionItems" :key="row.code" class="st__row">
                        <td class="st__td">{{ row.title }}</td>
                        <td class="st__td st__td--right">{{ row.planValue }}</td>
                        <td class="st__td st__td--right">{{ row.rating }}</td>
                        <td class="st__td st__td--right">{{ row.weight }}</td>
                        <td class="st__td st__td--right">{{ row.convertedScore }}</td>
                      </tr>
                      <tr class="st__row st__row--subtotal">
                        <td class="st__td">탄소저감 부문평가 합계 (만점: 50점)</td>
                        <td class="st__td st__td--right st__td--accent" colspan="4">
                          {{ summary.reductionSubtotal }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- 합계 -->
                <div class="summary-sec">
                  <p class="summary-sec__label">합계</p>
                  <table class="st">
                    <colgroup><col /><col class="st__col--total-val" /></colgroup>
                    <tbody>
                      <tr class="st__row st__row--subtotal">
                        <td class="st__td">정량 평가 합계 (탄소흡수 + 탄소저감, 만점: 100점)</td>
                        <td class="st__td st__td--right st__td--accent">
                          {{ summary.quantitativeTotal }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- 4) 정성평가 -->
                <div class="summary-sec">
                  <p class="summary-sec__label">4) 정성평가</p>
                  <table class="st">
                    <colgroup>
                      <col class="st__col--name" />
                      <col />
                      <col class="st__col--qual" />
                    </colgroup>
                    <thead>
                      <tr class="st__head-row">
                        <th class="st__th">평가항목</th>
                        <th class="st__th">반영여부</th>
                        <th class="st__th">평가</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in summary.qualRows" :key="row.code" class="st__row">
                        <td class="st__td">{{ row.title }}</td>
                        <td class="st__td st__td--right">{{ row.reflected }}</td>
                        <td class="st__td st__td--right">{{ row.display }}</td>
                      </tr>
                      <tr class="st__row st__row--subtotal">
                        <td class="st__td">
                          정성평가 합계 (항목 당 0.01로 산정하고 최고 0.05를 초과할 수 없다)
                        </td>
                        <td class="st__td st__td--right st__td--accent" colspan="2">
                          {{ summary.qualitativeTotal }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- 최종평점 -->
                <div class="summary-sec">
                  <p class="summary-sec__label">최종평점</p>
                  <table class="st">
                    <colgroup><col /><col class="st__col--total-val" /></colgroup>
                    <tbody>
                      <tr class="st__row st__row--subtotal">
                        <td class="st__td">최종 평점 : 정량평가 합계 x (1+정성평가 합계)</td>
                        <td class="st__td st__td--right st__td--accent">
                          {{ summary.finalScore }}
                        </td>
                      </tr>
                      <tr class="st__row st__row--subtotal">
                        <td class="st__td">평가 등급</td>
                        <td class="st__td st__td--right st__td--accent">
                          {{ summary.grade }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

          </template>
        </div>

        <!-- ── Footer ── -->
        <div class="summary-dialog__footer">
          <div class="summary-dialog__footer-right">
            <button class="sdf-btn sdf-btn--cancel" @click="$emit('close')">취소</button>
            <button class="sdf-btn sdf-btn--confirm" @click="$emit('close')">확인</button>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useScenarioStore }         from '@/stores/scenario'
import { useEvalSummaryStore }      from '@/stores/evalSummary'
import { fetchPlanEvaluationItems } from '@/api/planEvaluationApi'

const props = defineProps({
  planId: { type: String, required: true },
})
defineEmits(['close'])

const scenarioStore    = useScenarioStore()
const evalSummaryStore = useEvalSummaryStore()

const loading = ref(true)

const summary = computed(() => evalSummaryStore.summaries[props.planId] ?? null)

onMounted(async () => {
  const allItems = await fetchPlanEvaluationItems()
  const plan     = scenarioStore.plans[props.planId]
  evalSummaryStore.buildSummary(props.planId, allItems, plan)
  loading.value = false
})
</script>

<style lang="scss" scoped>
// ── Overlay ───────────────────────────────────────────────
.summary-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

// ── Dialog ───────────────────────────────────────────────
.summary-dialog {
  width: min(90vw, 900px);
  max-height: 90vh;
  background: #fff;
  border-radius: 20px;
  box-shadow: 2px 0 24px 0 rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  // ── Header ──
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 18px 20px;
    border-bottom: 1px solid #eaeaea;
    flex-shrink: 0;
  }

  &__header-title {
    font-size: 16px;
    font-weight: var(--fw-bold);
    color: #333;
    letter-spacing: -0.32px;
  }

  &__close {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: #929292;
    display: flex;
    align-items: center;
    transition: color var(--transition-fast);
    &:hover { color: #333; }
  }

  // ── Content ──
  &__content {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
    min-height: 0;

    &::-webkit-scrollbar       { width: 5px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb {
      background: #c5c5c5;
      border-radius: 100px;
    }
  }

  // ── Footer ──
  &__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 14px 20px;
    border-top: 1px solid #e5e5e5;
    flex-shrink: 0;
    height: 66px;
  }

  &__footer-right {
    display: flex;
    gap: 10px;
    align-items: center;
  }
}

// ── Loading ───────────────────────────────────────────────
.summary-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-size: 14px;
  color: #929292;
}

// ── Paper (내부 총괄표 영역) ────────────────────────────────
.summary-paper {
  border: 1px solid #e1e1e1;
  padding: 10px;
  min-height: 100%;

  &__title {
    font-size: 24px;
    font-weight: var(--fw-bold);
    color: #141414;
    text-align: center;
    letter-spacing: -0.24px;
    line-height: 28px;
    margin-bottom: 10px;
  }
}

.summary-sections {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

// ── Section ───────────────────────────────────────────────
.summary-sec {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__label {
    font-size: 14px;
    font-weight: var(--fw-bold);
    color: #262626;
    letter-spacing: -0.28px;
  }
}

// ── Table ─────────────────────────────────────────────────
.st {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e8e8e8;
  font-size: 12px;
  table-layout: fixed;

  &__col--name      { width: 370px; }
  &__col--plan      { width: 276px; }
  &__col--qual      { width: 76px;  }
  &__col--total-val { width: 89px;  }

  // Header row
  &__head-row {
    height: 32px;
    background: #f5f5f5;
    border: 1px solid #e8e8e8;
  }

  &__th {
    padding: 0 16px;
    font-weight: var(--fw-medium);
    color: #6e6e6e;
    text-align: center;
    border-right: 1px solid #e8e8e8;
    white-space: nowrap;
    overflow: hidden;

    &:last-child { border-right: none; }
  }

  // Data row
  &__row {
    border: 1px solid #e8e8e8;
    background: #fff;

    &--subtotal {
      background: #e9f1fe;
    }
  }

  &__td {
    padding: 5px 12px;
    border-right: 1px solid #e8e8e8;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 19px;

    &:last-child { border-right: none; }

    &--right  { text-align: right; }
    &--accent { color: #3b7df5; font-weight: var(--fw-bold); }
  }
}

// ── Footer Buttons ─────────────────────────────────────────
.sdf-btn {
  height: 34px;
  padding: 0 16px;
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
    &:hover { background: #f5f5f5; }
  }

  &--confirm {
    background: #256ef4;
    border: 1px solid #256ef4;
    color: #fff;
    &:hover { background: #1a5fd9; }
  }
}
</style>
