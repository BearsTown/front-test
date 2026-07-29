import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// simulation 앱: 로그인이 필요한 경로 (홈 화면 이외 모든 서비스 페이지)
// TODO: 로그인 연동 완료 후 아래 목록 복원
// const AUTH_REQUIRED = ['/carbon-estimation', '/green-city', '/plan-support', '/monitoring']
const AUTH_REQUIRED = []

const routes = [
  { path: '/', redirect: '/scenario' },
  { path: '/map', redirect: '/scenario' },
  {
    path: '/scenario',
    component: () => import('@/components/layout/ScenarioLayout.vue'),
    children: [
      {
        path: '',
        name: 'Scenario',
        component: () => import('@/views/MapView.vue'),
        meta: { title: '시나리오 | 탄소 녹색도시 ' },
      },
    ],
  },
  {
    path: '/compare',
    name: 'Compare',
    component: () => import('@/components/layout/CompareLayout.vue'),
    meta: { title: '비교분석 | 탄소 녹색도시' },
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

  const authStore  = useAuthStore()
  if (authStore.loggedIn) return true

  // simulation은 독립 창으로 열리므로 홈으로 이동 (app의 로그인 모달 없음)
  return '/'
})

export default router
