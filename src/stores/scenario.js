import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'

// 안(plan)별 초기 상태 팩토리
const makePlanState = () => ({
  activeStep: 1,
  planType: '',             // 'development' | 'implementation'
  selectedEvalItems: [],    // 선택된 평가항목 code[]
  evalScores: {},           // { [code]: number | null } — step3 점수
  evalResults: {},          // { [code]: { list: [{title,result,unit}], score: number } }
  evalItemLandRows: {},     // { [code]: number[] } — step3 항목별 선택된 토지이용 행 인덱스
  uploadedGrade: null,      // null | 1 | 2  (파일 업로드 분석 후 설정)
  form: {
    title: '',
    housingArea: 0,
    landArea: 0,
  },
  sections: {
    population: false,
    housing: false,
    land: false,
  },
})

export const useScenarioStore = defineStore('scenario', () => {
  // ── 선택된 안(탭) ──────────────────────────────────
  const activePlan = ref('1')

  // ── 각 안별 독립 상태 ─────────────────────────────
  const plans = reactive({
    '1': makePlanState(),
    '2': makePlanState(),
    '3': makePlanState(),
  })

  // 현재 선택된 안의 상태 (편의 computed)
  const currentPlan = computed(() => plans[activePlan.value])

  // ── Actions ───────────────────────────────────────

  /** 탭 전환 */
  function setActivePlan(id) {
    activePlan.value = id
  }

  /** 단계 변경 */
  function setActiveStep(planId, step) {
    plans[planId].activeStep = step
  }

  /** 섹션 접기/펼치기 */
  function toggleSection(planId, sectionKey) {
    plans[planId].sections[sectionKey] = !plans[planId].sections[sectionKey]
  }

  /** 섹션 활성 상태 직접 설정 */
  function setSectionActive(planId, sectionKey, value = true) {
    plans[planId].sections[sectionKey] = value
  }

  /** 파일 업로드 결과(급지) 반영 */
  function setUploadedGrade(planId, grade) {
    plans[planId].uploadedGrade = grade
  }

  /** 개발계획/실시계획 선택 */
  function setPlanType(planId, type) {
    plans[planId].planType = type
  }

  /** step3 항목 점수 설정 */
  function setEvalScore(planId, code, score) {
    plans[planId].evalScores[code] = score === '' || score == null ? null : Number(score)
  }

  /** step3 평가항목별 선택된 토지이용 행 인덱스 저장 */
  function setEvalItemLandRows(planId, code, indices) {
    plans[planId].evalItemLandRows[code] = [...indices]
  }

  /** step3 평가항목 산정 결과 저장 */
  function setEvalResult(planId, code, data) {
    plans[planId].evalResults[code] = data
  }

  /** 평가항목 토글 선택 */
  function toggleEvalItem(planId, code) {
    const arr = plans[planId].selectedEvalItems
    const idx = arr.indexOf(code)
    if (idx >= 0) arr.splice(idx, 1)
    else arr.push(code)
  }

  /** 특정 안의 폼 필드 리셋 */
  function resetPlan(planId) {
    Object.assign(plans[planId], makePlanState())
  }

  return {
    activePlan,
    plans,
    currentPlan,
    setActivePlan,
    setActiveStep,
    setPlanType,
    toggleEvalItem,
    setEvalScore,
    setEvalItemLandRows,
    setEvalResult,
    toggleSection,
    setSectionActive,
    setUploadedGrade,
    resetPlan,
  }
})
