import axios from 'axios'

// 용도지역 더미 데이터
// key: 시스템 식별자, title: 표시명, value: 용적률(%)
const ZONE_DUMMY = [
  { key: 'LU0101', title: '제1종전용주거지역', value: 50 },
  { key: 'LU0102', title: '제2종전용주거지역', value: 80 },
  { key: 'LU0201', title: '제1종일반주거지역', value: 100 },
  { key: 'LU0202', title: '제2종일반주거지역', value: 150 },
  { key: 'LU0203', title: '제3종일반주거지역', value: 300 },
  { key: 'LU0301', title: '준주거지역',         value: 400 },
  { key: 'LU0401', title: '중심상업지역',        value: 1500 },
  { key: 'LU0402', title: '일반상업지역',        value: 1300 },
  { key: 'LU0403', title: '근린상업지역',        value: 900 },
  { key: 'LU0404', title: '유통상업지역',        value: 1100 },
  { key: 'LU0501', title: '전용공업지역',        value: 300 },
  { key: 'LU0502', title: '일반공업지역',        value: 350 },
  { key: 'LU0503', title: '준공업지역',          value: 400 },
  { key: 'LU0601', title: '보전녹지지역',        value: 50 },
  { key: 'LU0602', title: '생산녹지지역',        value: 50 },
  { key: 'LU0603', title: '자연녹지지역',        value: 100 },
  { key: 'LU0701', title: '보전관리지역',        value: 50 },
  { key: 'LU0702', title: '생산관리지역',        value: 50 },
  { key: 'LU0703', title: '계획관리지역',        value: 100 },
  { key: 'LU0801', title: '농림지역',            value: 50 },
  { key: 'LU0901', title: '자연환경보전지역',    value: 50 },
]

/**
 * 시도/시군구 기준 용도지역 목록 조회
 * @param {string} sido   - 시도명
 * @param {string} sigungu - 시군구명
 * @returns {Promise<Array<{key:string, title:string, value:number}>>}
 */
export async function fetchZoneList(sido, sigungu) {
  // 실제 API 연동 시 아래 주석 해제
  // const res = await axios.get('/api/land/zone-list', { params: { sido, sigungu } })
  // return res.data

  // 더미: 50ms 지연 후 목록 반환 (시도/시군구 무관하게 동일 목록)
  await new Promise(r => setTimeout(r, 50))
  return ZONE_DUMMY
}
