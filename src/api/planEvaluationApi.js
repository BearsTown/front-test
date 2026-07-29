import axios from 'axios'

// ── 더미 데이터 ──────────────────────────────────────────────────────────────
// type        : 계획타입 ('development'=개발계획 / 'implementation'=실시계획)
// priority    : 우선순위 (그룹 내 표시 순서)
// category    : UI 섹션 구분 ('carbon_absorption' / 'carbon_reduction' / 'qualitative')
// title       : 이름
// code        : 코드명 (고유값)
// weight      : 가중치
// icon        : MDI 아이콘명
// resultType  : 결과값 표현 형태 ('simple' | 'percent' | 'multiLabel' | 'count' | 'select')
// dummyResult : 더미 산정 결과 (실제 API 연동 시 별도 결과 API로 대체)
// 사용여부     : false이면 선택 불가 (UI에서 비활성 처리)
const DUMMY_ITEMS = [
  // ── 개발계획 / 탄소흡수 ──────────────────────────────
  {
    type: 'development', category: 'carbon_absorption', priority: 1,
    title: '공원녹지확보비', code: 'DA001', weight: 4, 사용여부: true,
    icon: 'mdi-sprout',
    resultType: 'simple',
    dummyResult: { value: 1.86 },
  },
  {
    type: 'development', category: 'carbon_absorption', priority: 2,
    title: '자연지반 면적률', code: 'DA002', weight: 2, 사용여부: true,
    icon: 'mdi-terrain',
    resultType: 'percent',
    dummyResult: { value: 42.5 },
  },

  // ── 개발계획 / 탄소저감 ──────────────────────────────
  {
    type: 'development', category: 'carbon_reduction', priority: 1,
    title: '직주근접', code: 'DR001', weight: 3, 사용여부: true,
    icon: 'mdi-walk',
    resultType: 'multiLabel',
    dummyResult: { pairs: [{ label: '거리', value: '5.3km' }, { label: '시간', value: '17분' }] },
  },
  {
    type: 'development', category: 'carbon_reduction', priority: 2,
    title: '대중교통 활성화', code: 'DR002', weight: 2, 사용여부: true,
    icon: 'mdi-bus',
    resultType: 'multiLabel',
    dummyResult: { pairs: [{ label: '집중도', value: '0.188' }, { label: '복합도', value: '1.12' }] },
  },
  {
    type: 'development', category: 'carbon_reduction', priority: 3,
    title: '자전거 활성화', code: 'DR003', weight: 1, 사용여부: true,
    icon: 'mdi-bicycle',
    resultType: 'simple',
    dummyResult: { value: 0.92 },
  },
  {
    type: 'development', category: 'carbon_reduction', priority: 4,
    title: '녹색교통 활성화', code: 'DR004', weight: 0.5, 사용여부: true,
    icon: 'mdi-train-car',
    resultType: 'count',
    dummyResult: { value: 0, unit: '가지' },
  },
  {
    type: 'development', category: 'carbon_reduction', priority: 5,
    title: '녹색건축물 비율', code: 'DR005', weight: 2, 사용여부: true,
    icon: 'mdi-office-building-outline',
    resultType: 'simple',
    dummyResult: null,
  },

  // ── 실시계획 / 탄소흡수 ──────────────────────────────
  {
    type: 'implementation', category: 'carbon_absorption', priority: 1,
    title: '생태면적률', code: 'IA001', weight: 4, 사용여부: false,
    icon: 'mdi-tree',
    resultType: 'percent',
    dummyResult: { value: 38.2 },
  },

  // ── 실시계획 / 탄소저감 ──────────────────────────────
  {
    type: 'implementation', category: 'carbon_reduction', priority: 1,
    title: '신재생에너지 이용', code: 'IR001', weight: 0.5, 사용여부: false,
    icon: 'mdi-leaf',
    resultType: 'simple',
    dummyResult: null,
  },
  {
    type: 'implementation', category: 'carbon_reduction', priority: 2,
    title: '빗물이용', code: 'IR002', weight: 0.5, 사용여부: false,
    icon: 'mdi-umbrella-outline',
    resultType: 'simple',
    dummyResult: null,
  },
  {
    type: 'implementation', category: 'carbon_reduction', priority: 3,
    title: '중수이용', code: 'IR003', weight: 0.5, 사용여부: false,
    icon: 'mdi-water-outline',
    resultType: 'simple',
    dummyResult: null,
  },

  {
    type: 'development', category: 'qualitative', priority: 1,
    title: '녹지축 연결 계획', code: 'Q001', weight: 0.1, 사용여부: true,
    icon: 'mdi-transit-connection-variant',
    resultType: 'select',
    dummyResult: { selected: true },
  },
  {
    type: 'development', category: 'qualitative', priority: 2,
    title: '하천보전', code: 'Q002', weight: 0.1, 사용여부: true,
    icon: 'mdi-waves',
    resultType: 'select',
    dummyResult: { selected: false },
  },
  {
    type: 'implementation', category: 'qualitative', priority: 3,
    title: '습지보전지역, 생태경관 보전지역 등의 보호', code: 'Q003', weight: 0.1, 사용여부: true,
    icon: 'mdi-water-plus-outline',
    resultType: 'select',
    dummyResult: { selected: true },
  },
  {
    type: 'implementation', category: 'qualitative', priority: 4,
    title: '바람길', code: 'Q004', weight: 0.1, 사용여부: true,
    icon: 'mdi-weather-windy',
    resultType: 'select',
    dummyResult: { selected: true },
  },
  {
    type: 'implementation', category: 'qualitative', priority: 5,
    title: '주차장', code: 'Q005', weight: 0.1, 사용여부: true,
    icon: 'mdi-parking',
    resultType: 'select',
    dummyResult: null,
  },
  {
    type: 'implementation', category: 'qualitative', priority: 6,
    title: '보행자로', code: 'Q006', weight: 0.1, 사용여부: true,
    icon: 'mdi-walk',
    resultType: 'select',
    dummyResult: { selected: false },
  },
  {
    type: 'implementation', category: 'qualitative', priority: 7,
    title: '폐기물 재활용', code: 'IQ007', weight: 0.1, 사용여부: true,
    icon: 'mdi-recycle',
    resultType: 'select',
    dummyResult: null,
  },
  {
    type: 'implementation', category: 'qualitative', priority: 8,
    title: '집단에너지 공급시설', code: 'Q008', weight: 0.1, 사용여부: true,
    icon: 'mdi-lightning-bolt',
    resultType: 'select',
    dummyResult: null,
  },
  {
    type: 'implementation', category: 'qualitative', priority: 9,
    title: '건축물 에너지관리', code: 'Q009', weight: 0.1, 사용여부: true,
    icon: 'mdi-home-lightning-bolt-outline',
    resultType: 'select',
    dummyResult: null,
  },
  {
    type: 'implementation', category: 'qualitative', priority: 10,
    title: '기타', code: 'Q010', weight: 0.1, 사용여부: true,
    icon: 'mdi-water-plus-outline',
    resultType: 'select',
    dummyResult: { selected: true },
  },
]

/**
 * 개발계획평가 항목 목록 조회
 * TODO: 실제 API 연동 시 아래 주석 해제 후 더미 데이터 제거
 */
export async function fetchPlanEvaluationItems() {
  // return axios.get('/api/plan-evaluation/items').then(res => res.data)
  await new Promise(resolve => setTimeout(resolve, 50))
  return DUMMY_ITEMS
}

export default { fetchPlanEvaluationItems }
