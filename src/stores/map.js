import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { useScenarioStore } from './scenario'
import { useLayerStore } from './layer'

// 임시 목포시 개발사업구역 GeoJSON (추후 백엔드 .shp 분석 결과로 교체)
const MOCK_SHP_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { use: '주거지역', color: '#F4A261' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[126.368, 34.792], [126.382, 34.792], [126.382, 34.804], [126.368, 34.804], [126.368, 34.792]]],
      },
    },
    {
      type: 'Feature',
      properties: { use: '상업지역', color: '#E76F51' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[126.382, 34.792], [126.396, 34.792], [126.396, 34.800], [126.382, 34.800], [126.382, 34.792]]],
      },
    },
    {
      type: 'Feature',
      properties: { use: '녹지지역', color: '#52B788' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[126.368, 34.780], [126.396, 34.780], [126.396, 34.792], [126.368, 34.792], [126.368, 34.780]]],
      },
    },
    {
      type: 'Feature',
      properties: { use: '공업지역', color: '#ADB5BD' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[126.396, 34.780], [126.414, 34.780], [126.414, 34.804], [126.396, 34.804], [126.396, 34.780]]],
      },
    },
  ],
}

export const useMapStore = defineStore('map', () => {
  // ── 네비게이션 ────────────────────────────────────
  const activeMenu = ref('scenario')

  function toggleMenu(key) {
    activeMenu.value = activeMenu.value === key ? null : key
  }

  function closeMenu() {
    activeMenu.value = null
  }

  // ── 프로젝트 ──────────────────────────────────────
  const savedProject = reactive({ name: '', sido: '', sigungu: '', note: '' })
  const showProjectDialog = ref(false)
  const showMessageDialog = ref(false)

  function openProjectDialog() {
    showProjectDialog.value = true
  }

  function closeProjectDialog() {
    showProjectDialog.value = false
  }

  function saveProject(project) {
    Object.assign(savedProject, project)
    if (!savedProject.name) {
      const now = new Date()
      savedProject.name = `프로젝트_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
    }
    showProjectDialog.value = false
    showMessageDialog.value = true
  }

  function closeMessage() {
    showMessageDialog.value = false
  }

  // ── 안별 ContentDialog 활성화 상태 ─────────────────
  // planId(1/2/3) × dialogKey(population/housing/land)로 독립 관리.
  // 탭 전환 시 activePlan이 바뀌면 해당 안의 상태로 자동 전환됨.
  // 향후 새 ContentDialog 추가 시 각 planDialogs 객체에 key만 추가한다.
  const planDialogs = reactive({
    '1': { population: false, housing: false, land: false, area: false, electricity: false, heat: false },
    '2': { population: false, housing: false, land: false, area: false, electricity: false, heat: false },
    '3': { population: false, housing: false, land: false, area: false, electricity: false, heat: false },
  })

  // ── Step 3 평가항목 ContentDialog ────────────────────
  // 안별로 독립적으로 어떤 항목 코드가 열려 있는지 저장
  const planEvalDialogs = reactive({
    '1': { code: null },
    '2': { code: null },
    '3': { code: null },
  })

  function openPlanDialog(planId, key) {
    if (!planDialogs[planId]) return
    // 같은 안에서 한 번에 하나만 활성화
    Object.keys(planDialogs[planId]).forEach(k => {
      planDialogs[planId][k] = k === key
    })
  }

  function closePlanDialog(planId, key) {
    if (planDialogs[planId]) planDialogs[planId][key] = false
  }

  // ── 인구 및 수용 계획 ContentDialog ─────────────────
  // Step 1 전용 — 현재 step이 1일 때만 표시
  const showPopulationDialog = computed(() => {
    const s = useScenarioStore()
    return (planDialogs[s.activePlan]?.population ?? false) &&
           (s.plans[s.activePlan]?.activeStep === 1)
  })

  // MapLayout :plan-id: 항상 현재 활성 안을 가리킴
  const populationDialogPlanId = computed(() => useScenarioStore().activePlan)

  function openPopulationDialog(planId) {
    openPlanDialog(planId, 'population')
  }

  function closePopulationDialog() {
    const s = useScenarioStore()
    closePlanDialog(s.activePlan, 'population')
  }

  // ── 토지이용계획 ContentDialog ───────────────────────
  // Step 1 전용
  const showLandDialog = computed(() => {
    const s = useScenarioStore()
    return (planDialogs[s.activePlan]?.land ?? false) &&
           (s.plans[s.activePlan]?.activeStep === 1)
  })

  const landDialogPlanId = computed(() => useScenarioStore().activePlan)

  function openLandDialog(planId) {
    openPlanDialog(planId, 'land')
  }

  function closeLandDialog() {
    const s = useScenarioStore()
    closePlanDialog(s.activePlan, 'land')
  }

  const showLandDataDialog = ref(false)

  function openLandDataDialog() {
    showLandDataDialog.value = true
  }

  function closeLandDataDialog() {
    showLandDataDialog.value = false
  }

  // ── 면적 구성비 ContentDialog ─────────────────────────
  // Step 4 전용
  const showAreaDialog = computed(() => {
    const s = useScenarioStore()
    return (planDialogs[s.activePlan]?.area ?? false) &&
           (s.plans[s.activePlan]?.activeStep === 4)
  })

  const areaDialogPlanId = computed(() => useScenarioStore().activePlan)

  function openAreaDialog(planId) {
    openPlanDialog(planId, 'area')
  }

  function closeAreaDialog() {
    const s = useScenarioStore()
    closePlanDialog(s.activePlan, 'area')
  }

  // ── 전력 사용량 예측 ContentDialog ───────────────────
  // Step 4 전용
  const showElectricityDialog = computed(() => {
    const s = useScenarioStore()
    return (planDialogs[s.activePlan]?.electricity ?? false) &&
           (s.plans[s.activePlan]?.activeStep === 4)
  })

  const electricityDialogPlanId = computed(() => useScenarioStore().activePlan)

  function openElectricityDialog(planId) {
    openPlanDialog(planId, 'electricity')
  }

  function closeElectricityDialog() {
    const s = useScenarioStore()
    closePlanDialog(s.activePlan, 'electricity')
  }

  // ── 열 사용량 예측 ContentDialog ─────────────────────
  // Step 4 전용
  const showHeatDialog = computed(() => {
    const s = useScenarioStore()
    return (planDialogs[s.activePlan]?.heat ?? false) &&
           (s.plans[s.activePlan]?.activeStep === 4)
  })

  const heatDialogPlanId = computed(() => useScenarioStore().activePlan)

  function openHeatDialog(planId) {
    openPlanDialog(planId, 'heat')
  }

  function closeHeatDialog() {
    const s = useScenarioStore()
    closePlanDialog(s.activePlan, 'heat')
  }

  // ── 결과보기 패널 ────────────────────────────────────
  const showResultPanel = ref(false)

  function openResultPanel() {
    showResultPanel.value = true
  }

  function closeResultPanel() {
    showResultPanel.value = false
  }

  // ── 인구 및 주택건설 계획 ContentDialog ──────────────
  // Step 1 전용
  const showHousingDialog = computed(() => {
    const s = useScenarioStore()
    return (planDialogs[s.activePlan]?.housing ?? false) &&
           (s.plans[s.activePlan]?.activeStep === 1)
  })

  const housingDialogPlanId = computed(() => useScenarioStore().activePlan)

  function openHousingDialog(planId) {
    openPlanDialog(planId, 'housing')
  }

  function closeHousingDialog() {
    const s = useScenarioStore()
    closePlanDialog(s.activePlan, 'housing')
  }

  // ── Step 3 평가항목 ContentDialog ────────────────────
  // Step 3 전용 — 현재 step이 3일 때만 표시
  const showEvalItemDialog = computed(() => {
    const s = useScenarioStore()
    return planEvalDialogs[s.activePlan]?.code !== null &&
           (s.plans[s.activePlan]?.activeStep === 3)
  })

  const evalItemDialogPlanId = computed(() => useScenarioStore().activePlan)

  const evalItemCode = computed(() => {
    const s = useScenarioStore()
    return planEvalDialogs[s.activePlan]?.code ?? null
  })

  function openEvalItemDialog(planId, code) {
    if (!planEvalDialogs[planId]) return
    // 같은 안의 Step 1 dialog 모두 닫기
    if (planDialogs[planId]) {
      Object.keys(planDialogs[planId]).forEach(k => { planDialogs[planId][k] = false })
    }
    planEvalDialogs[planId].code = code
  }

  function closeEvalItemDialog() {
    const s = useScenarioStore()
    if (planEvalDialogs[s.activePlan]) {
      planEvalDialogs[s.activePlan].code = null
    }
  }

  // ── 토지이용 선택 다이얼로그 (EvalItemDialog > 데이터선택) ─────
  const showLandSelectDialog = ref(false)
  const landSelectContext = reactive({ planId: null, itemCode: null })

  function openLandSelectDialog(planId, itemCode) {
    landSelectContext.planId   = planId
    landSelectContext.itemCode = itemCode
    showLandSelectDialog.value = true
  }

  function closeLandSelectDialog() {
    showLandSelectDialog.value = false
  }

  // ── 평가용 임시 포인트 마커 ──────────────────────────
  // { [pointId]: { name, lng, lat } }  — TheMap.vue가 watch해서 OL 레이어에 반영
  const evalPoints = reactive({})

  function setEvalPoint(pointId, point) {
    if (point == null) delete evalPoints[pointId]
    else evalPoints[pointId] = point
  }

  function clearEvalPoints() {
    Object.keys(evalPoints).forEach(k => delete evalPoints[k])
  }

  // ── 데이터 관리 다이얼로그 (backdrop modal) ───────────
  // DataDialog는 planId prop 없이 scenarioStore.activePlan을 직접 구독.
  // 탭 전환 시 해당 안의 데이터로 자동 전환됨.
  // 향후 추가되는 DataDialog도 동일 패턴을 따른다.
  const showPopulationDataDialog = ref(false)

  function openPopulationDataDialog() {
    showPopulationDataDialog.value = true
  }

  function closePopulationDataDialog() {
    showPopulationDataDialog.value = false
  }

  const showHousingDataDialog = ref(false)

  function openHousingDataDialog() {
    showHousingDataDialog.value = true
  }

  function closeHousingDataDialog() {
    showHousingDataDialog.value = false
  }

  // ── 파일 업로드 ───────────────────────────────────
  const showFileUploadDialog = ref(false)
  const showUploadResultDialog = ref(false)
  const uploadResult = reactive({ fileName: '', grade: '1급지' })
  const uploadDone = ref(false)

  function openFileUploadDialog() {
    showFileUploadDialog.value = true
  }

  function confirmFileUpload(data) {
    showFileUploadDialog.value = false
    uploadResult.fileName = data.fileName

    // 임시 분석 결과 (추후 백엔드 .shp 전송 → 분석 → 결과 수신으로 교체)
    const mockGrade = 1   // 1 또는 2
    uploadResult.grade = `${mockGrade}급지`
    uploadDone.value = true
    showUploadResultDialog.value = true

    const scenarioStore = useScenarioStore()
    const layerStore = useLayerStore()
    const planId = scenarioStore.activePlan

    // 현재 선택된 안(plan)에만 급지 저장
    scenarioStore.setUploadedGrade(planId, mockGrade)

    // 현재 선택된 안(plan)에만 SHP 레이어 추가
    layerStore.addPlanLayer(planId, {
      id: `shp_plan${planId}_${Date.now()}`,
      name: data.fileName,
      type: 'shp',
      visible: true,
      data: MOCK_SHP_GEOJSON,
    })
  }

  function closeUploadResult() {
    showUploadResultDialog.value = false
  }

  return {
    // 네비게이션
    activeMenu,
    toggleMenu,
    closeMenu,
    // 프로젝트
    savedProject,
    showProjectDialog,
    showMessageDialog,
    openProjectDialog,
    closeProjectDialog,
    saveProject,
    closeMessage,
    // 안별 ContentDialog 상태 (PlanPanel isDialogActive에서 직접 참조)
    planDialogs,
    // 인구 및 수용 계획 ContentDialog
    showPopulationDialog,
    populationDialogPlanId,
    openPopulationDialog,
    closePopulationDialog,
    // 토지이용계획 ContentDialog
    showLandDialog,
    landDialogPlanId,
    openLandDialog,
    closeLandDialog,
    showLandDataDialog,
    openLandDataDialog,
    closeLandDataDialog,
    // 인구 및 주택건설 계획 ContentDialog
    showHousingDialog,
    housingDialogPlanId,
    openHousingDialog,
    closeHousingDialog,
    // 면적 구성비 ContentDialog (Step 4)
    showAreaDialog,
    areaDialogPlanId,
    openAreaDialog,
    closeAreaDialog,
    // 전력 사용량 예측 ContentDialog (Step 4)
    showElectricityDialog,
    electricityDialogPlanId,
    openElectricityDialog,
    closeElectricityDialog,
    // 열 사용량 예측 ContentDialog (Step 4)
    showHeatDialog,
    heatDialogPlanId,
    openHeatDialog,
    closeHeatDialog,
    // 결과보기 패널
    showResultPanel,
    openResultPanel,
    closeResultPanel,
    // Step 3 평가항목 ContentDialog
    showEvalItemDialog,
    // 토지이용 선택 다이얼로그
    showLandSelectDialog,
    landSelectContext,
    openLandSelectDialog,
    closeLandSelectDialog,
    evalItemDialogPlanId,
    evalItemCode,
    openEvalItemDialog,
    closeEvalItemDialog,
    // 데이터 관리 다이얼로그
    showPopulationDataDialog,
    openPopulationDataDialog,
    closePopulationDataDialog,
    showHousingDataDialog,
    openHousingDataDialog,
    closeHousingDataDialog,
    // 평가 포인트 마커
    evalPoints,
    setEvalPoint,
    clearEvalPoints,
    // 파일 업로드
    showFileUploadDialog,
    showUploadResultDialog,
    uploadResult,
    uploadDone,
    openFileUploadDialog,
    confirmFileUpload,
    closeUploadResult,
  }
})
