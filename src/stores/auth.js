import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCookie } from '@/utils/cookie'

// 개발사 앱의 auth store
// 로그인/로그아웃은 shell(shared-shell.iife.js)이 담당하고
// 이 store는 shell이 발행하는 'carbon:auth' 이벤트를 수신해 상태를 동기화합니다.
export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(getCookie('user') || 'null'))
  const loggedIn = ref(!!getCookie('access-token'))

  // shell이 로그인/로그아웃 시 이벤트를 발행 → 여기서 수신해 reactive 상태 업데이트
  window.addEventListener('carbon:auth', (e) => {
    loggedIn.value = e.detail.loggedIn
    user.value = e.detail.user ?? null
  })

  return { user, loggedIn }
})
