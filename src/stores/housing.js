import { defineStore } from 'pinia'
import { reactive } from 'vue'

const HOUSING_TYPES = ['단독주택', '공동주택', '주상복합']
const SCALE_ORDER   = ['60㎡ 이하', '60 ~ 85㎡', '85㎡ 초과']

const GROUP_MAP = {
  단독주택: '단독주택',
  공동주택: '공동주택',
  아파트:   '공동주택',
  주상복합: '주상복합',
}

const makeState = () => ({
  dataRows:        [], // { 구분, 주택규모, 면적, 인구수, 세대수, 용적률 }[]
  housingTypeRows: [], // 주택유형별 공급계획 크로스 테이블
  housingPlanRows: [], // 인구 및 주택건설계획 수직 테이블 (rowKind 포함)
})

function computeRows(rows) {
  // 유형별 집계
  const typeAcc  = {}  // { [type]: { 면적, 세대수, 인구수 } }
  // 공동주택 주택규모별 집계
  const scaleAcc = {}  // { [주택규모]: { 면적, 세대수, 인구수 } }

  rows.forEach(r => {
    const type  = GROUP_MAP[r.구분] || r.구분
    const scale = r.주택규모 || ''
    const area  = Number(r.면적)   || 0
    const hh    = Number(r.세대수) || 0
    const pop   = Number(r.인구수) || 0

    if (!typeAcc[type]) typeAcc[type] = { 면적: 0, 세대수: 0, 인구수: 0 }
    typeAcc[type].면적   += area
    typeAcc[type].세대수 += hh
    typeAcc[type].인구수 += pop

    if (type === '공동주택' && scale) {
      if (!scaleAcc[scale]) scaleAcc[scale] = { 주택규모: scale, 면적: 0, 세대수: 0, 인구수: 0 }
      scaleAcc[scale].면적   += area
      scaleAcc[scale].세대수 += hh
      scaleAcc[scale].인구수 += pop
    }
  })

  const totalArea = HOUSING_TYPES.reduce((s, t) => s + (typeAcc[t]?.면적 || 0), 0)
  const totalHH   = HOUSING_TYPES.reduce((s, t) => s + (typeAcc[t]?.세대수 || 0), 0)
  const totalPop  = HOUSING_TYPES.reduce((s, t) => s + (typeAcc[t]?.인구수 || 0), 0)

  // 면적 기준 구성비 (소수점 1자리)
  const mkPct = (area) => totalArea > 0 ? +((area / totalArea) * 100).toFixed(1) : 0

  // ── 주택유형별 공급계획 (cross table) ──────────────────
  // 행: 면적(㎡), 구성비(%)
  const housingTypeRows = [
    {
      구분:     '면적(㎡)',
      합계:     totalArea,
      단독주택: typeAcc['단독주택']?.면적 ?? 0,
      공동주택: typeAcc['공동주택']?.면적 ?? 0,
      주상복합: typeAcc['주상복합']?.면적 ?? 0,
    },
    {
      구분:     '구성비(%)',
      합계:     100,
      단독주택: mkPct(typeAcc['단독주택']?.면적 ?? 0),
      공동주택: mkPct(typeAcc['공동주택']?.면적 ?? 0),
      주상복합: mkPct(typeAcc['주상복합']?.면적 ?? 0),
    },
  ]

  // ── 인구 및 주택건설계획 (vertical plan table) ──────────
  // rowKind: 'total' | 'group' | 'nested_group' | 'subtotal'
  const housingPlanRows = [
    {
      rowKind: 'total',
      구분: '합계',
      면적: totalArea, 세대수: totalHH, 인구수: totalPop, 구성비: 100,
    },
  ]

  HOUSING_TYPES.forEach(type => {
    if (!typeAcc[type]) return
    const g = typeAcc[type]

    if (type === '공동주택') {
      // 공동주택: 주택규모별 세부 행 포함
      const subRows = SCALE_ORDER
        .filter(s => scaleAcc[s])
        .map(s => ({
          주택규모: s,
          ...scaleAcc[s],
          구성비: mkPct(scaleAcc[s].면적),
        }))

      housingPlanRows.push({
        rowKind: 'nested_group',
        구분: '공동주택',
        subRows,
        면적: g.면적, 세대수: g.세대수, 인구수: g.인구수, 구성비: mkPct(g.면적),
      })
    } else {
      housingPlanRows.push({
        rowKind: 'group',
        구분: type,
        면적: g.면적, 세대수: g.세대수, 인구수: g.인구수, 구성비: mkPct(g.면적),
      })
    }

    // 소계 (각 유형 다음)
    housingPlanRows.push({
      rowKind: 'subtotal',
      구분: '소계',
      면적: g.면적, 세대수: g.세대수, 인구수: g.인구수, 구성비: mkPct(g.면적),
    })
  })

  return { housingTypeRows, housingPlanRows }
}

export const useHousingStore = defineStore('housing', () => {
  const plans = reactive({
    '1': makeState(),
    '2': makeState(),
    '3': makeState(),
  })

  function setDataRows(planId, rows) {
    const state = plans[planId]
    state.dataRows = rows
    const { housingTypeRows, housingPlanRows } = computeRows(rows)
    state.housingTypeRows = housingTypeRows
    state.housingPlanRows = housingPlanRows
  }

  function clearData(planId) {
    Object.assign(plans[planId], makeState())
  }

  return { plans, setDataRows, clearData }
})
