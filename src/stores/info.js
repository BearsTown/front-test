import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useInfoStore = defineStore('info', () => {
  const content = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchContent(contentNo) {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get(`/portal-service/api/v1/contents/${contentNo}`)
      content.value = data
    } catch (e) {
      error.value = e.response?.data?.message ?? e.message ?? '데이터를 불러오지 못했습니다.'
    } finally {
      loading.value = false
    }
  }

  return { content, loading, error, fetchContent }
})
