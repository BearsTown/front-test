// 평가항목별 입력 필드 기본값 API
// key 는 각 Body 컴포넌트의 list[].key 와 동일하게 맞춤
// TODO: 실제 API 연동 시 planId·sido·sigungu 등 컨텍스트를 함께 전달
const DUMMY_DEFAULTS = {
  DA001: { col2: 50000  },   // 공원녹지확보비 — 확보기준(㎡)
  DA002: { col2: 200000 },   // 자연지반 면적률 — 전체 개발구역 면적(㎡)
  DR001: { col2: 10000  },   // 직주근접 — 주거용지 면적(㎡)
  DR002: { col2: 5      },   // 대중교통 활성화 — 정류장 수
  DR003: { col2: 8000   },   // 자전거 활성화 — 전체 도로 연장(m)
  DR004: { col2: 3      },   // 녹색교통 활성화 — 전체 교통 면적(㎡)
  DR005: { col2: 100    },   // 녹색건축물 비율 — 전체 건축물 수
  IA001: { col2: 150000 },   // 생태면적률 — 전체 면적(㎡)
}

/**
 * 평가항목의 입력 필드 기본값 조회
 * @param {string} code   - 평가항목 코드 (DA001 등)
 * @param {string} planId - 안 ID (실API 연동 시 활용)
 * @returns {Promise<Record<string, number>>} 필드 key → 기본값
 */
export async function fetchEvalDefaults(code, planId) {
  // return axios.get(`/api/eval/defaults/${code}`, { params: { planId } }).then(r => r.data)
  await new Promise(r => setTimeout(r, 80))
  return DUMMY_DEFAULTS[code] ?? {}
}
