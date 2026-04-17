import axios from '@/api/axios'

// ── 더미 데이터 ──────────────────────────────────────────────────────────────
const DUMMY_ITEMS = [
  // ── 개발계획 / 탄소흡수 ──────────────────────────────
  { type: 'development', category: 'carbon_absorption', priority: 1, title: '공원녹지확보비', code: 'DA001', weight: 4, icon: 'mdi-sprout', resultType: 'simple', dummyResult: { value: 1.86 } },
  { type: 'development', category: 'carbon_absorption', priority: 2, title: '자연지반 면적률', code: 'DA002', weight: 2, icon: 'mdi-terrain', resultType: 'percent', dummyResult: { value: 42.5 } },

  // ── 개발계획 / 탄소저감 ──────────────────────────────
  { type: 'development', category: 'carbon_reduction', priority: 1, title: '직주근접', code: 'DR001', weight: 3, icon: 'mdi-walk', resultType: 'multiLabel', dummyResult: { pairs: [{ label: '거리', value: '5.3km' }, { label: '시간', value: '17분' }] } },
  { type: 'development', category: 'carbon_reduction', priority: 2, title: '대중교통 활성화', code: 'DR002', weight: 2, icon: 'mdi-bus', resultType: 'multiLabel', dummyResult: { pairs: [{ label: '집중도', value: '0.188' }, { label: '복합도', value: '1.12' }] } },
  { type: 'development', category: 'carbon_reduction', priority: 3, title: '자전거 활성화', code: 'DR003', weight: 1, icon: 'mdi-bicycle', resultType: 'simple', dummyResult: { value: 0.92 } },
  { type: 'development', category: 'carbon_reduction', priority: 4, title: '녹색교통 활성화', code: 'DR004', weight: 0.5, icon: 'mdi-train-car', resultType: 'count', dummyResult: { value: 0, unit: '가지' } },
  { type: 'development', category: 'carbon_reduction', priority: 5, title: '녹색건축물 비율', code: 'DR005', weight: 2, icon: 'mdi-office-building-outline', resultType: 'simple', dummyResult: null },

  // ── 개발계획 / 정성평가 ──────────────────────────────
  { type: 'development', category: 'qualitative', priority: 1, title: '녹지축 연결 계획', code: 'DQ001', weight: 0.1, icon: 'mdi-transit-connection-variant', resultType: 'select', dummyResult: { selected: true } },
  { type: 'development', category: 'qualitative', priority: 2, title: '하천보전', code: 'DQ002', weight: 0.1, icon: 'mdi-waves', resultType: 'select', dummyResult: { selected: false } },

  // ── 실시계획 / 탄소흡수 ──────────────────────────────
  { type: 'implementation', category: 'carbon_absorption', priority: 1, title: '생태면적률', code: 'IA001', weight: 4, icon: 'mdi-tree', resultType: 'percent', dummyResult: { value: 38.2 } },

  // ── 실시계획 / 탄소저감 ──────────────────────────────
  { type: 'implementation', category: 'carbon_reduction', priority: 1, title: '신재생에너지 이용', code: 'IR001', weight: 0.5, icon: 'mdi-leaf', resultType: 'simple', dummyResult: null },
  { type: 'implementation', category: 'carbon_reduction', priority: 2, title: '빗물이용', code: 'IR002', weight: 0.5, icon: 'mdi-umbrella-outline', resultType: 'simple', dummyResult: null },
  { type: 'implementation', category: 'carbon_reduction', priority: 3, title: '중수이용', code: 'IR003', weight: 0.5, icon: 'mdi-water-outline', resultType: 'simple', dummyResult: null },

  // ── 실시계획 / 정성평가 ──────────────────────────────
  { type: 'implementation', category: 'qualitative', priority: 1, title: '바람길', code: 'IQ001', weight: 0.1, icon: 'mdi-weather-windy', resultType: 'select', dummyResult: { selected: true } },
  { type: 'implementation', category: 'qualitative', priority: 2, title: '친환경 주차장 등', code: 'IQ002', weight: 0.1, icon: 'mdi-parking', resultType: 'select', dummyResult: null },
  { type: 'implementation', category: 'qualitative', priority: 3, title: '보행자로', code: 'IQ003', weight: 0.1, icon: 'mdi-walk', resultType: 'select', dummyResult: { selected: false } },
  { type: 'implementation', category: 'qualitative', priority: 4, title: '폐기물 재활용', code: 'IQ004', weight: 0.1, icon: 'mdi-recycle', resultType: 'select', dummyResult: null },
  { type: 'implementation', category: 'qualitative', priority: 5, title: '집단에너지 공급시설', code: 'IQ005', weight: 0.1, icon: 'mdi-lightning-bolt', resultType: 'select', dummyResult: null },
  { type: 'implementation', category: 'qualitative', priority: 6, title: '건축물 에너지관리', code: 'IQ006', weight: 0.1, icon: 'mdi-home-lightning-bolt-outline', resultType: 'select', dummyResult: null },
  { type: 'implementation', category: 'qualitative', priority: 7, title: '습지보전지역, 생태경관 보전지역 등의 보호', code: 'IQ007', weight: 0.1, icon: 'mdi-water-plus-outline', resultType: 'select', dummyResult: { selected: true } },
]

/**
 * 개발계획평가 항목 목록 조회
 * TODO: 실제 API 연동 시 아래 주석 해제 후 더미 데이터 제거
 */
export async function fetchPlanEvaluationItems() {
  // return axios.get('/api/plan-evaluation/items').then(res => res.data)
  await new Promise(resolve => setTimeout(resolve, 300))
  return DUMMY_ITEMS
}

export default { fetchPlanEvaluationItems }
