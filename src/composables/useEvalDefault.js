import { ref, readonly } from 'vue'
import { fetchEvalDefaults } from '@/api/evalDefaultApi'

/**
 * 평가항목 입력 필드 기본값 자동 적용 composable
 *
 * 사용 패턴:
 *   const { loadDefaults, applyIfEmpty, defaultsLoading } = useEvalDefault(itemCode)
 *
 *   onMounted(async () => {
 *     // 1) 기존 저장값 복원 (savedResult)
 *     // 2) 필드가 비어있거나 0이면 API 기본값 적용
 *     await loadDefaults(planId)
 *     applyIfEmpty(myFieldRef, 'col2')
 *   })
 */
export function useEvalDefault(itemCode) {
  const defaults        = ref({})
  const defaultsLoading = ref(false)

  /** API에서 기본값을 조회해 defaults에 저장 */
  async function loadDefaults(planId) {
    defaultsLoading.value = true
    try {
      defaults.value = await fetchEvalDefaults(itemCode, planId)
    } finally {
      defaultsLoading.value = false
    }
  }

  /**
   * fieldRef 가 비어있거나 0인 경우에만 defaults[key] 적용
   * @param {import('vue').Ref<string>} fieldRef - 대상 입력 필드 ref
   * @param {string}                   key       - defaults 내 키 이름
   */
  function applyIfEmpty(fieldRef, key) {
    const current = fieldRef.value
    if (!current || Number(current) === 0) {
      const val = defaults.value[key]
      if (val != null) fieldRef.value = String(val)
    }
  }

  return {
    defaults:        readonly(defaults),
    defaultsLoading: readonly(defaultsLoading),
    loadDefaults,
    applyIfEmpty,
  }
}
