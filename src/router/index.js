import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// simulation 앱: 로그인이 필요한 경로 (홈 화면 이외 모든 서비스 페이지)
// TODO: 로그인 연동 완료 후 아래 목록 복원
// const AUTH_REQUIRED = ['/carbon-estimation', '/green-city', '/plan-support', '/monitoring']
const AUTH_REQUIRED = []

// views/**/*.vue 파일을 자동으로 라우트로 등록
// 경로 변환 규칙 (파일명에서 View.vue 제거 후 kebab-case 변환)
//   HomeView.vue                              → /
//   carbon-estimation/CarbonEstimationView.vue → /carbon-estimation
//   green-city/GreenCityView.vue              → /green-city
//   plan-support/PlanSupportView.vue          → /plan-support
//   monitoring/MonitoringView.vue             → /monitoring
const viewModules = import.meta.glob('@/views/**/*.vue')

const autoRoutes = Object.entries(viewModules).map(([filePath, component]) => {
  let path = filePath
    .replace('/src/views/', '')            // 접두사 제거
    .replace(/View\.vue$/, '')             // View.vue 제거
    .replace(/([a-z])([A-Z])/g, '$1-$2')  // PascalCase → kebab-case
    .toLowerCase()
    .replace(/^(.+)\/\1$/, '$1')           // "green-city/green-city" → "green-city" (중복 세그먼트 제거)

  if (path === 'home') path = ''           // HomeView → 루트 경로

  return { path, component }
})

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: autoRoutes,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 인증 가드: 미로그인 시 홈으로 리다이렉트
router.beforeEach((to) => {
  const needsAuth = AUTH_REQUIRED.some(p => to.path.startsWith(p))
  if (!needsAuth) return true

  const authStore = useAuthStore()
  if (authStore.loggedIn) return true

  // simulation은 독립 창으로 열리므로 홈으로 이동 (app의 로그인 모달 없음)
  return '/'
})

export default router
