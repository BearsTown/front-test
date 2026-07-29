import { defineStore } from 'pinia'
import { reactive } from 'vue'

const makeState = () => ({
  dataRows: [],        // { 구분, 주택규모, 면적, 인구수, 세대수, 용적률 }[]
  populationRows: [],  // { 구분, 면적, 세대수, 인구, 순밀도 }[]
  totalPopulation: 0,
  populationDistrib: { 단독: 0, 공동: 0, 주상: 0 },
})

// dataRows(원본) → populationRows(구분별 집계) 계산
const GROUP_MAP = {
  단독주택: '단독주택',
  공동주택: '공동주택',
  아파트:   '공동주택',
  주상복합: '주상복합',
}
const GROUP_ORDER = ['단독주택', '공동주택', '주상복합']
const DISTRIB_KEY = { 단독주택: '단독', 공동주택: '공동', 주상복합: '주상' }

function computePopulationRows(rows) {
  const groups = {}
  rows.forEach(r => {
    const key = GROUP_MAP[r.구분] ?? r.구분
    if (!groups[key]) groups[key] = { 구분: key, 면적: 0, 세대수: 0, 인구: 0 }
    groups[key].면적  += Number(r.면적)  || 0
    groups[key].세대수 += Number(r.세대수) || 0
    groups[key].인구  += Number(r.인구수) || 0
  })

  return GROUP_ORDER.filter(k => groups[k]).map(k => {
    const g = groups[k]
    return {
      구분:   g.구분,
      면적:   g.면적,
      세대수: g.세대수,
      인구:   g.인구,
      순밀도: g.면적 > 0 ? Math.round((g.인구 / (g.면적 / 10000)) * 10) / 10 : 0,
    }
  })
}

function computeDistrib(populationRows) {
  const total = populationRows.reduce((s, r) => s + r.인구, 0)
  if (total === 0) return { 단독: 0, 공동: 0, 주상: 0, total: 0 }

  const raw = { 단독: 0, 공동: 0, 주상: 0 }
  populationRows.forEach(r => {
    const k = DISTRIB_KEY[r.구분]
    if (k) raw[k] += r.인구
  })

  const 단독 = Math.round((raw.단독 / total) * 100)
  const 공동 = Math.round((raw.공동 / total) * 100)
  return { 단독, 공동, 주상: 100 - 단독 - 공동, total }
}

export const usePopulationStore = defineStore('population', () => {
  const plans = reactive({
    '1': makeState(),
    '2': makeState(),
    '3': makeState(),
  })

  /**
   * 원본 행 저장 + 구분별 집계 자동 계산
   * PopulationDataDialog 저장 시 호출
   */
  function setDataRows(planId, rows) {
    const state = plans[planId]
    state.dataRows = rows

    const populationRows = computePopulationRows(rows)
    state.populationRows = populationRows

    const distrib = computeDistrib(populationRows)
    state.totalPopulation = distrib.total
    state.populationDistrib.단독 = distrib.단독
    state.populationDistrib.공동 = distrib.공동
    state.populationDistrib.주상 = distrib.주상
  }

  /** 특정 안 인구 데이터 초기화 */
  function clearData(planId) {
    Object.assign(plans[planId], makeState())
  }

  return {
    plans,
    setDataRows,
    clearData,
  }
})
