import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useBannerStore = defineStore('banner', () => {
  const banners = ref({})
  const loading = ref(false)
  const error = ref(null)

  async function fetchBanners() {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get('/portal-service/api/v1/5/banners/0001,0002,0003/10')
      banners.value = data
    } catch (e) {
      error.value = e.response?.data?.message ?? e.message ?? '배너를 불러오지 못했습니다.'
    } finally {
      loading.value = false
    }
  }

  return { banners, loading, error, fetchBanners }
})
