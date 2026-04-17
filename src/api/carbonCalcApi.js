import axios from '@/api/axios'

// ── 더미 데이터 ──────────────────────────────────────────────────────────────
const DUMMY_DATA = {
  totalFloorArea: 2003538,
  floorAreaBreakdown: [
    { label: '주거',     value: 901591, color: '#FBBF24' },
    { label: '상업',     value: 601061, color: '#FCA5A5' },
    { label: '기반시설', value: 500886, color: '#93C5FD' },
  ],
  electricityUsage: [
    { label: '주거',     value: 34657 },
    { label: '상업',     value: 78678 },
    { label: '기반시설', value: 66849 },
  ],
  heatUsage: [
    { label: '주거',     heating: 245000, cooling:      0, cooking: 78000 },
    { label: '상업',     heating:  52000, cooling:  38000, cooking: 18000 },
    { label: '기반시설', heating:  18000, cooling:  12000, cooking:  7000 },
  ],
  result: {
    grade:                  3,
    gradeLabel:             '3등급',
    finalScore:             73.95,
    carbonAbsorptionScore:  30,
    carbonReductionScore:   42.5,
    qualitativeScore:       0.02,
    totalEmission:          125502,
    byUsage: [
      { label: '주거',     value: 40880 },
      { label: '상업',     value: 58302 },
      { label: '기반시설', value: 26320 },
    ],
    breakdown: [
      { label: '단독주택', ratio: 10, color: '#FBBF24' },
      { label: '공동주택', ratio: 15, color: '#86EFAC' },
      { label: '일반상업', ratio: 16, color: '#FCA5A5' },
      { label: '근린상업', ratio: 18, color: '#C4B5FD' },
      { label: '공공청사', ratio: 14, color: '#6EE7B7' },
      { label: '의료시설', ratio: 12, color: '#93C5FD' },
      { label: '기타시설', ratio: 15, color: '#D1D5DB' },
    ],
  },
}

/**
 * 탄소배출흡수량 산정 데이터 조회
 * TODO: 실제 API 연동 시 아래 주석 해제 후 더미 데이터 제거
 */
export async function fetchCarbonCalcResult() {
  // return axios.get('/api/carbon-calc/result').then(res => res.data)
  await new Promise(resolve => setTimeout(resolve, 400))
  return DUMMY_DATA
}

export default { fetchCarbonCalcResult }
