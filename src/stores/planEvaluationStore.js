import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 탭별(1안/2안/3안) 독립 상태를 위해 tabId를 store ID에 포함
 * 사용: usePlanEvaluationStore('1'), usePlanEvaluationStore('2'), ...
 */
export function usePlanEvaluationStore(tabId) {
  return defineStore(`planEvaluation-${tabId}`, () => {
    const items = ref([])
    const selectedPlanType = ref(null)

    const selectedItems = computed(() => items.value.filter(i => i.selected))

    const carbonAbsorptionItems = computed(() =>
      items.value.filter(i => i.category === 'carbon_absorption')
    )
    const carbonReductionItems = computed(() =>
      items.value.filter(i => i.category === 'carbon_reduction')
    )
    const qualitativeItems = computed(() =>
      items.value.filter(i => i.category === 'qualitative')
    )

    const selectedCarbonAbsorptionItems = computed(() =>
      selectedItems.value.filter(i => i.category === 'carbon_absorption')
    )
    const selectedCarbonReductionItems = computed(() =>
      selectedItems.value.filter(i => i.category === 'carbon_reduction')
    )
    const selectedQualitativeItems = computed(() =>
      selectedItems.value.filter(i => i.category === 'qualitative')
    )

    function setItems(apiItems) {
      items.value = apiItems.map(item => ({
        ...item,
        selected: false,
        result: item.dummyResult ?? null,
      }))
    }

    function selectPlanType(type) {
      selectedPlanType.value = type
      items.value.forEach(item => {
        item.selected = item.type === type
      })
    }

    function toggleItem(code) {
      const item = items.value.find(i => i.code === code)
      if (!item) return
      if (selectedPlanType.value && item.type !== selectedPlanType.value) return
      item.selected = !item.selected
    }

    function setResults(resultsMap) {
      items.value.forEach(item => {
        if (item.code in resultsMap) {
          item.result = resultsMap[item.code]
        }
      })
    }

    return {
      items,
      selectedPlanType,
      selectedItems,
      carbonAbsorptionItems,
      carbonReductionItems,
      qualitativeItems,
      selectedCarbonAbsorptionItems,
      selectedCarbonReductionItems,
      selectedQualitativeItems,
      setItems,
      selectPlanType,
      toggleItem,
      setResults,
    }
  })()
}
