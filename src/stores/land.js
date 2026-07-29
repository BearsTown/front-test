import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const LAND_GROUPS = ['주거용지', '상업용지', '도시기반시설용지', '기타시설용지']

const makeState = () => ({
  activeGroup: '주거용지',
  dataRows: [], // { 구분, 항목, 세부항목, 세분류, 용도지역Key, 용적률, 면적, 연면적 }[]
})

/**
 * 선택된 그룹의 데이터를 CSS Grid 렌더링용 계층 구조로 변환.
 * 각 cell에 gridRow / rowSpan을 계산해 반환한다.
 *   items[].gridRow, items[].rowSpan
 *   items[].subs[].gridRow, .rowSpan
 *   items[].subs[].leafRows[].gridRow
 */
function computeGridItems(rows, group) {
  // 구분 또는 그룹(하위호환) 필드 모두 지원
  const filtered = rows.filter(r => (r.구분 ?? r.그룹) === group)
  if (filtered.length === 0) return []

  // 항목 → 세부항목 → 세분류 순으로 그룹화 (삽입 순서 유지)
  const itemMap = new Map()
  filtered.forEach(r => {
    if (!itemMap.has(r.항목)) itemMap.set(r.항목, new Map())
    const subMap = itemMap.get(r.항목)
    if (!subMap.has(r.세부항목)) subMap.set(r.세부항목, [])
    subMap.get(r.세부항목).push({
      세분류:  r.세분류,
      면적:    Number(r.면적)   || 0,
      연면적:  Number(r.연면적) || 0,
    })
  })

  const items = []
  let row = 2 // row 1 = 헤더

  itemMap.forEach((subMap, 항목) => {
    const itemStart = row
    const subs = []

    subMap.forEach((leafRows, 세부항목) => {
      const subStart = row
      subs.push({
        세부항목,
        gridRow: subStart,
        rowSpan: leafRows.length,
        leafRows: leafRows.map(leaf => ({ ...leaf, gridRow: row++ })),
      })
    })

    items.push({
      항목,
      gridRow: itemStart,
      rowSpan: row - itemStart,
      subs,
    })
  })

  return items
}

export const useLandStore = defineStore('land', () => {
  const plans = reactive({
    '1': makeState(),
    '2': makeState(),
    '3': makeState(),
  })

  function setActiveGroup(planId, group) {
    if (plans[planId] && LAND_GROUPS.includes(group)) {
      plans[planId].activeGroup = group
    }
  }

  function setDataRows(planId, rows) {
    if (plans[planId]) plans[planId].dataRows = rows
  }

  function clearData(planId) {
    Object.assign(plans[planId], makeState())
  }

  function getGridItems(planId, group) {
    return computeGridItems(plans[planId]?.dataRows ?? [], group)
  }

  return { plans, LAND_GROUPS, setActiveGroup, setDataRows, clearData, getGridItems }
})
