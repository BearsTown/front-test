import axios from 'axios'
import { getCookie } from '@/utils/cookie'

const api = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터: 쿠키에서 토큰 읽어 헤더에 추가
api.interceptors.request.use(
  (config) => {
    const token = getCookie('access-token')
    if (token) {
      config.headers.Authorization = token
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 응답 인터셉터: 401 시 shell에 로그아웃 이벤트 전달
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('carbon:auth', { detail: { loggedIn: false } }))
    }
    return Promise.reject(error)
  },
)

export default api
