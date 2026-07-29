/**
 * DEV 전용 테스트 데이터 초기화 (main.js에서 DEV 환경일 때만 호출)
 * 1안(planId='1') 기준으로 Step 1~3 전체 흐름 테스트에 필요한 데이터를 세팅합니다.
 */
import { useMapStore }        from '@/stores/map'
import { useScenarioStore }   from '@/stores/scenario'
import { useLandStore }       from '@/stores/land'
import { usePopulationStore } from '@/stores/population'
import { useHousingStore }    from '@/stores/housing'
import { getFilteredIndices } from '@/components/scenario/evalLandFilters.js'

const PLAN_ID = '1'

// ── 토지이용계획 행 ──────────────────────────────────────────────────────────
const LAND_ROWS = [
  { 구분: '주거용지', 항목: '단독주택용지', 세부항목: '단독주택',   세분류: '단독주택',   용도지역Key: 'LU0203', 용적률: 300,  면적:  15000, 연면적:  45000 },
  { 구분: '주거용지', 항목: '단독주택용지', 세부항목: '다가구주택', 세분류: '다가구주택', 용도지역Key: 'LU0202', 용적률: 150,  면적:  12000, 연면적:  18000 },
  { 구분: '주거용지', 항목: '공동주택용지', 세부항목: '아파트',     세분류: '아파트',     용도지역Key: 'LU0203', 용적률: 300,  면적:  80000, 연면적: 240000 },
  { 구분: '주거용지', 항목: '공동주택용지', 세부항목: '연립주택',   세분류: '연립주택',   용도지역Key: 'LU0202', 용적률: 150,  면적:  25000, 연면적:  37500 },
  { 구분: '상업용지', 항목: '근린상업용지', 세부항목: '근린상업',   세분류: '근린상업',   용도지역Key: 'LU0403', 용적률: 900,  면적:  15000, 연면적: 135000 },
  { 구분: '상업용지', 항목: '일반상업용지', 세부항목: '일반상업',   세분류: '일반상업',   용도지역Key: 'LU0402', 용적률: 1300, 면적:  25000, 연면적: 325000 },
  { 구분: '도시기반시설용지', 항목: '공간시설', 세부항목: '공원', 세분류: '공원',     용도지역Key: '', 용적률: 0, 면적: 291211, 연면적: 0 },
  { 구분: '도시기반시설용지', 항목: '공간시설', 세부항목: '녹지', 세분류: '완충녹지', 용도지역Key: '', 용적률: 0, 면적:  66311, 연면적: 0 },
  { 구분: '도시기반시설용지', 항목: '공간시설', 세부항목: '녹지', 세분류: '경관녹지', 용도지역Key: '', 용적률: 0, 면적:  69347, 연면적: 0 },
  { 구분: '도시기반시설용지', 항목: '공간시설', 세부항목: '녹지', 세분류: '연결녹지', 용도지역Key: '', 용적률: 0, 면적:  17749, 연면적: 0 },
  { 구분: '도시기반시설용지', 항목: '방재시설용지', 세부항목: '하천', 세분류: '하천', 용도지역Key: 'LU0203', 용적률: 100, 면적:  24280, 연면적: 24280 },
  { 구분: '도시기반시설용지', 항목: '방재시설용지', 세부항목: '유수지', 세분류: '저류시설', 용도지역Key: 'LU0203', 용적률: 100, 면적:  21147, 연면적: 21147 },
  { 구분: '도시기반시설용지', 항목: '유통및공급시설용지', 세부항목: '수도공급시설', 세분류: '수도용지', 용도지역Key: 'LU0203', 용적률: 100, 면적:  4062, 연면적: 4062 },
]

// ── 인구 및 주택 원본 행 ──────────────────────────────────────────────────────
const HOUSING_ROWS = [
  { 구분: '아파트',   주택규모: '60 ~ 85㎡', 면적: 120000, 인구수: 9600, 세대수: 3200, 용적률: 150 },
  { 구분: '아파트',   주택규모: '85㎡ 초과', 면적:  80000, 인구수: 4800, 세대수: 1200, 용적률: 300 },
  { 구분: '단독주택', 주택규모: '85㎡ 초과', 면적:  50000, 인구수: 2500, 세대수:  625, 용적률: 100 },
]

// ── Step 2 선택 항목 코드 ─────────────────────────────────────────────────────
const SELECTED_EVAL_ITEMS = [
  'DA001', 'DA002',          // 탄소흡수
  'DR001', 'DR002', 'DR003', 'DR004', 'DR005', // 탄소저감
  'Q001',  'Q002',           // 정성평가 (개발계획)
]

// ── 토지이용 데이터 연결이 필요한 항목 ───────────────────────────────────────
// evalLandFilters.js 의 필터를 통과하는 행 전체를 자동 선택
const LAND_LINKED_ITEMS = ['DA001', 'DA002', 'DR002']

// ─────────────────────────────────────────────────────────────────────────────

export function seedTestData() {
  const mapStore        = useMapStore()
  const scenarioStore   = useScenarioStore()
  const landStore       = useLandStore()
  const populationStore = usePopulationStore()
  const housingStore    = useHousingStore()

  // ── 프로젝트 기본 정보 ────────────────────────────
  Object.assign(mapStore.savedProject, {
    name:    '목포시 도시개발사업',
    sido:    '전라남도',
    sigungu: '목포시',
    note:    '',
  })

  // ── Step 1: 토지이용계획 ──────────────────────────
  landStore.setDataRows(PLAN_ID, LAND_ROWS)

  // ── Step 1: 인구 및 주택 ──────────────────────────
  populationStore.setDataRows(PLAN_ID, HOUSING_ROWS)
  housingStore.setDataRows(PLAN_ID, HOUSING_ROWS)

  // ── Step 1: 기본 폼 정보 ─────────────────────────
  scenarioStore.setUploadedGrade(PLAN_ID, 1)
  Object.assign(scenarioStore.plans[PLAN_ID].form, {
    title:       '목포시 도시개발사업',
    housingArea: 250000,
    landArea:    600000,
  })
  Object.assign(scenarioStore.plans[PLAN_ID].sections, {
    population: true,
    housing:    true,
    land:       true,
  })

  // ── Step 2: 계획 타입 및 평가항목 선택 ───────────
  scenarioStore.setPlanType(PLAN_ID, 'development')
  SELECTED_EVAL_ITEMS.forEach(code => scenarioStore.toggleEvalItem(PLAN_ID, code))

  // ── Step 3: 필터 통과 행 전체를 기본 선택 ─────────
  LAND_LINKED_ITEMS.forEach(code => {
    const indices = getFilteredIndices(code, LAND_ROWS)
    if (indices.length) scenarioStore.setEvalItemLandRows(PLAN_ID, code, indices)
  })

  // ── 마지막: 활성 단계를 3으로 이동 ───────────────
  scenarioStore.setActiveStep(PLAN_ID, 3)

  console.info('[DEV] 테스트 데이터 세팅 완료 — 1안 기준')
}
