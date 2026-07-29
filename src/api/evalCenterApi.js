// 직주근접(DR001) 중심지 목록 API
// TODO: 실제 API 연동 시 planId·sido·sigungu 기반으로 필터링된 목록 반환

const DUMMY_DEV_CENTERS = [
  { id: 'DC001', name: '목포 북항 1지구',   lng: 126.4012, lat: 34.8345 },
  { id: 'DC002', name: '목포 남항 2지구',   lng: 126.3754, lat: 34.7821 },
  { id: 'DC003', name: '목포 옥암 3지구',   lng: 126.4312, lat: 34.8120 },
  { id: 'DC004', name: '목포 원도심 4지구', lng: 126.3884, lat: 34.8118 },
]

const DUMMY_CORE_CITIES = [
  { id: 'CC001', name: '목포시청',    lng: 126.3921980, lat: 34.8118771 },
]

/**
 * @returns {Promise<Array<{id:string, name:string, lng:number, lat:number}>>}
 */
export async function fetchDevCenters(planId) {
  await new Promise(r => setTimeout(r, 80))
  return DUMMY_DEV_CENTERS
}

/**
 * @returns {Promise<Array<{id:string, name:string, lng:number, lat:number}>>}
 */
export async function fetchCoreCities(planId) {
  await new Promise(r => setTimeout(r, 80))
  return DUMMY_CORE_CITIES
}

/**
 * 탄소 배출 및 흡수량 산정 — 전력·열 사용량 예측 결과 (dummy)
 */
export async function fetchCarbonData(planId) {
  await new Promise(r => setTimeout(r, 150))
  return {
    electricity: [
      { label: '주거',     value: 34.657 },
      { label: '상업',     value: 78.678 },
      { label: '기반시설', value: 66.849 },
    ],
    electricityTable: {
      rows: [
        { 구분: '단독주택',       sub: null,        규모값: 404,    규모단위: '세대', 단위사용량: '4,955.5', 연간사용량: 2002 },
        { 구분: '공동주택',       sub: '60㎡ 이하',  규모값: 1825,   규모단위: '세대', 단위사용량: '2,866.1', 연간사용량: 5231 },
        { 구분: '공동주택',       sub: '60 ~ 85㎡', 규모값: 4996,   규모단위: '세대', 단위사용량: '3,613.9', 연간사용량: 18055 },
        { 구분: '공동주택',       sub: '85㎡ 초과',  규모값: 1465,   규모단위: '세대', 단위사용량: '3,985.6', 연간사용량: 5707 },
        { 구분: '주상복합',       sub: '60 ~ 85㎡', 규모값: 490,    규모단위: '세대', 단위사용량: '3,613.9', 연간사용량: 1771 },
        { 구분: '준주거(근생)',   sub: null,        규모값: 120728, 규모단위: '㎡',   단위사용량: '195.9',   연간사용량: 23651 },
        { 구분: '일반상업',       sub: null,        규모값: 264124, 규모단위: '㎡',   단위사용량: '195.9',   연간사용량: 51742 },
        { 구분: '주상복합(상업)', sub: null,        규모값: 13460,  규모단위: '㎡',   단위사용량: '195.9',   연간사용량: 2637 },
        { 구분: '업무시설',       sub: null,        규모값: 18460,  규모단위: '㎡',   단위사용량: '178.4',   연간사용량: 3285 },
        { 구분: '유치원',         sub: null,        규모값: 11980,  규모단위: '㎡',   단위사용량: '98.8',    연간사용량: 1184 },
        { 구분: '공공청사',       sub: null,        규모값: 7100,   규모단위: '㎡',   단위사용량: '154.4',   연간사용량: 1096 },
        { 구분: '문화시설',       sub: null,        규모값: 7072,   규모단위: '㎡',   단위사용량: '154.4',   연간사용량: 1092 },
        { 구분: '도시지원시설',   sub: null,        규모값: 309476, 규모단위: '㎡',   단위사용량: '178.4',   연간사용량: 55211 },
        { 구분: '종교시설',       sub: null,        규모값: 11802,  규모단위: '㎡',   단위사용량: '부하율\n적용하여 계산', 연간사용량: 2009 },
        { 구분: '위험물저장시설', sub: null,        규모값: 3451,   규모단위: '㎡',   단위사용량: '부하율\n적용하여 계산', 연간사용량: 653 },
        { 구분: '학교',           sub: null,        규모값: 56772,  규모단위: '㎡',   단위사용량: '98.8',    연간사용량: 5604 },
      ],
      total: 180184,
    },
    heat: {
      maxVal: 10,
      items: [
        { label: '주거',     heating: 7.0, cooling: 0.0, cooking: 1.4 },
        { label: '상업',     heating: 1.1, cooling: 0.7, cooking: 0.5 },
        { label: '기반시설', heating: 0.6, cooling: 0.4, cooking: 0.2 },
      ],
    },
    heatTable: {
      rows: [
        { 구분: '단독주택',       난방: 33488, 냉방: null,  취사: 601,   계: 34069 },
        { 구분: '공동주택',       난방: 93864, 냉방: null,  취사: 11693, 계: 105557 },
        { 구분: '주상복합',       난방: 5556,  냉방: null,  취사: 691,   계: 6247 },
        { 구분: '준주거(근생)',   난방: 7853,  냉방: null,  취사: 2138,  계: 9991 },
        { 구분: '일반상업',       난방: 20878, 냉방: 6966,  취사: 4678,  계: 32522 },
        { 구분: '주상복합(상업)', 난방: 982,   냉방: 355,   취사: 238,   계: 1575 },
        { 구분: '업무시설',       난방: 818,   냉방: 282,   취사: 52,    계: 1152 },
        { 구분: '유치원',         난방: 633,   냉방: 218,   취사: 128,   계: 979 },
        { 구분: '공공청사',       난방: 315,   냉방: 108,   취사: 30,    계: 454 },
        { 구분: '문화시설',       난방: 353,   냉방: 108,   취사: 30,    계: 491 },
        { 구분: '도시지원시설',   난방: 15587, 냉방: 4736,  취사: 879,   계: 21202 },
        { 구분: '종교시설',       난방: 789,   냉방: null,  취사: 34,    계: 823 },
        { 구분: '위험물저장시설', 난방: 218,   냉방: null,  취사: 10,    계: 228 },
        { 구분: '학교',           난방: 748,   냉방: 424,   취사: 607,   계: 2779 },
        { 구분: '도로, 공원 등',  난방: null,  냉방: null,  취사: null,  계: null },
      ],
      total: { 난방: 183082, 냉방: 13198, 취사: 21809, 계: 218089 },
    },
  }
}

/**
 * DR005 녹색건축물 비율 — 건축물 인증 등급 선택 결과 (dummy)
 * @param {string} planId
 * @param {{ public_building: string, residential: string, other_building: string }} payload
 * @returns {Promise<{ score: number }>}
 */
export async function fetchDR005Scores(planId, payload) {
  await new Promise(r => setTimeout(r, 100))
  const gradeScore = (val, map) => map[val] ?? 0
  const pub  = gradeScore(payload.public_building, {
    '모두 1등급 이상 인증': 2.0,
    '모두 2등급 이상 인증': 1.5,
    '모두 3등급 이상 인증': 1.0,
    '모두 인증':            0.5,
  })
  const res  = gradeScore(payload.residential, {
    '모두 인증':            0.5,
    '모두 3등급 이상 인증': 1.0,
    '모두 2등급 이상 인증': 1.5,
    '없음':                 0,
  })
  const oth  = gradeScore(payload.other_building, { '모두 인증': 0.5, '없음': 0 })
  const score = Number(Math.min(pub + res + oth, 2).toFixed(2))
  return { score }
}

/**
 * DR004 녹색교통 활성화 — 반영 항목 선택 결과 (dummy)
 * @param {string} planId
 * @param {{ brt: boolean, rail_station: boolean, eco_charging: boolean, bus_lane: boolean, transit_center: boolean }} payload
 * @returns {Promise<{ count: number, score: number }>}
 */
export async function fetchDR004Scores(planId, payload) {
  await new Promise(r => setTimeout(r, 100))
  const count = Object.values(payload).filter(Boolean).length
  const weight = 0.5
  const score  = Number((count * (weight / 5)).toFixed(2))
  return { count, score }
}

/**
 * DR002 대중교통 활성화 — 집중도·복합도 산정 결과 (dummy)
 * @returns {Promise<{concentration: object, complexity: object, totalScore: number}>}
 */
export async function fetchDR002Scores(planId) {
  await new Promise(r => setTimeout(r, 120))
  return {
    concentration: {
      transitDensity:  1.24,   // 대중교통영향권 내 개발밀도
      totalDensity:    0.89,   // 개발구역 전체 개발밀도
      score:           3.5,
    },
    complexity: {
      nonResidentialDensity: 0.43,   // 주거외 용도 개발밀도
      density:               1.18,   // 개발밀도
      score:                 2.8,
    },
    totalScore: 6.3,
  }
}
