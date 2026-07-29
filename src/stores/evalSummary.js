import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useEvalSummaryStore = defineStore('evalSummary', () => {
  // planId → computed summary object
  const summaries = reactive({})

  // ── 계획/목표치 대표값 추출 ───────────────────────────────
  function getPlanValue(list) {
    if (!list?.length) return '-'

    // DR001: 거리 + 시간
    const dist = list.find(i => i.key === 'distance')
    const time = list.find(i => i.key === 'time')
    if (dist && time) return `${dist.result}km, ${time.result}분`

    // DR002: 집중도 + 복합도 밀도
    const transit = list.find(i => i.key === 'transitDensity')
    const cDens   = list.find(i => i.key === 'complexityDensity')
    if (transit && cDens) return `${transit.result}, ${cDens.result}`

    // ratio 기반 항목 (DA001, DA002, DR003)
    const ratio = list.find(i => i.key === 'ratio')
    if (ratio) return ratio.unit ? `${ratio.result} (${ratio.unit})` : `${ratio.result}`

    // fallback
    const first = list[0]
    return first?.result ?? '-'
  }

  // ── 최종 등급 산정 ────────────────────────────────────────
  function getGrade(score) {
    if (score >= 90) return '1등급'
    if (score >= 80) return '2등급'
    if (score >= 70) return '3등급'
    if (score >= 60) return '4등급'
    return '5등급'
  }

  // ── 총괄표 데이터 산정 ─────────────────────────────────────
  // allItems: planEvaluationApi 반환 항목 배열
  // plan    : scenarioStore.plans[planId]
  function buildSummary(planId, allItems, plan) {
    const selectedCodes = plan.selectedEvalItems ?? []
    const evalResults   = plan.evalResults ?? {}

    // 카테고리별 정량항목 산정
    const buildSection = (categoryKey) =>
      allItems
        .filter(i => i.category === categoryKey && selectedCodes.includes(i.code))
        .sort((a, b) => a.priority - b.priority)
        .map(item => {
          const result        = evalResults[item.code]
          const convertedScore = Number((result?.score ?? 0).toFixed(2))
          const rating         = item.weight > 0
            ? Number((convertedScore / item.weight).toFixed(2))
            : 0
          return {
            code:          item.code,
            title:         item.title,
            planValue:     getPlanValue(result?.list),
            rating,
            weight:        item.weight,
            convertedScore,
          }
        })

    const absorptionItems = buildSection('carbon_absorption')
    const reductionItems  = buildSection('carbon_reduction')

    const absorptionSubtotal  = Number(absorptionItems.reduce((s, i) => s + i.convertedScore, 0).toFixed(2))
    const reductionSubtotal   = Number(reductionItems.reduce((s, i) => s + i.convertedScore, 0).toFixed(2))
    const quantitativeTotal   = Number((absorptionSubtotal + reductionSubtotal).toFixed(2))

    // 정성평가: 선택 여부만으로 반영 판단 (0.01/항목, max 0.05)
    const allQualItems = allItems
      .filter(i => i.category === 'qualitative')
      .sort((a, b) => a.priority - b.priority)

    const qualRows = allQualItems.map(item => {
      const reflected = selectedCodes.includes(item.code)
      return {
        code:      item.code,
        title:     item.title,
        reflected: reflected ? '반영' : '미반영',
        display:   reflected ? '0.01' : '-',
        score:     reflected ? 0.01 : 0,
      }
    })

    const qualitativeTotal = Number(
      Math.min(qualRows.filter(r => r.score > 0).length * 0.01, 0.05).toFixed(2)
    )

    // 최종평점 = 정량 × (1 + 정성)
    const finalScore = Number((quantitativeTotal * (1 + qualitativeTotal)).toFixed(2))
    const grade      = getGrade(finalScore)

    summaries[planId] = {
      absorptionItems,
      absorptionSubtotal,
      reductionItems,
      reductionSubtotal,
      quantitativeTotal,
      qualRows,
      qualitativeTotal,
      finalScore,
      grade,
    }
  }

  return { summaries, buildSummary }
})
