import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const data = defineStore('statistics', () => {
  const content = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchContent(contentNo) {
    loading.value = true
    error.value = null
    try {
      const { data: result } = await api.get('/portal-service/api/v1/statistics/monthly/1')
      content.value = result
    } catch (e) {
      error.value = e.response?.data?.message ?? e.message ?? '데이터를 불러오지 못했습니다.'
    } finally {
      loading.value = false
    }

  }

  return { content, loading, error, fetchContent }
})
