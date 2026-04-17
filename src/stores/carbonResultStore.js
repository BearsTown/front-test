import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 탄소배출흡수량 산정 결과 오버레이 상태
 * - Step4CarbonCalc에서 "결과보기" 클릭 시 open(data, tabId)
 * - CarbonResultOverlay에서 "닫기" 클릭 시 close()
 */
export const useCarbonResultStore = defineStore('carbonResult', () => {
  const isOpen  = ref(false)
  const result  = ref(null)
  const tabId   = ref(null)   // '1' | '2' | '3'

  function open(data, tid) {
    result.value = data
    tabId.value  = tid
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return { isOpen, result, tabId, open, close }
})
