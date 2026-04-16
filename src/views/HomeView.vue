<template>
  <div class="home-wrapper">
    <!-- 배경 이미지 -->
    <div class="home-bg">
      <img :src="bgImage" alt="배경" class="home-bg__img"/>
      <div class="home-bg__overlay"></div>
    </div>

    <!-- 상단 헤더 영역 -->
    <header class="home-header">
      <div class="home-header__logo">LOGO</div>
      <div class="home-header__user" v-if="userName">
        <span class="home-header__user-name">{{ userName }}</span>
        <span> 님 반갑습니다</span>
      </div>
    </header>

    <!-- 메인 타이틀 -->
    <div class="home-title">
      <h1>탄소중립 도시계획수립 지원도구</h1>
    </div>

    <!-- 메뉴 카드 영역 -->
    <div class="home-cards">
      <router-link
          v-for="menu in menuItems"
          :key="menu.id"
          :to="menu.route"
          class="home-card"
      >
        <div class="home-card__icon">
          <img :src="menu.icon" :alt="menu.title"/>
        </div>
        <div class="home-card__text">
          <h3 class="home-card__title">{{ menu.title }}</h3>
          <p class="home-card__desc">
            <span v-for="(line, i) in menu.desc" :key="i">
              {{ line }}<br v-if="i < menu.desc.length - 1"/>
            </span>
          </p>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import iconCarbonEstimation from '@/assets/icons/icon-carbon-estimation.svg'
import iconGreenCity from '@/assets/icons/icon-green-city.svg'
import iconPlanSupport from '@/assets/icons/icon-plan-support.svg'
import iconMonitoring from '@/assets/icons/icon-monitoring.svg'
import bgImage from '@/assets/images/bg-home.png'

// TODO: 실제 사용자 정보는 쿠키 또는 store에서 가져오기
const userName = ref('홍길동')

const menuItems = [
  {
    id: 'carbon-estimation',
    title: '시가화 예정용지\n탄소배출량 추정',
    icon: iconCarbonEstimation,
    desc: ['도시 군 기본계획에 따른 개발에 대해', '탄소 배출량을 추정하는 서비스입니다.'],
    route: '/carbon-estimation',
  },
  {
    id: 'green-city',
    title: '녹색도시 개발계획 평가',
    icon: iconGreenCity,
    desc: ['도시개발계획의 탄소중립 전략', '수립을 지원하는 서비스입니다.'],
    route: '/green-city',
  },
  {
    id: 'plan-support',
    title: '탄소중립 도시계획 수립지원',
    icon: iconPlanSupport,
    desc: ['탄소중립 도시계획 메뉴는', '3번을 위한 영역입니다.'],
    route: '/plan-support',
  },
  {
    id: 'monitoring',
    title: '탄소중립 도시계획 모니터링',
    icon: iconMonitoring,
    desc: ['탄소중립 도시계획 메뉴는', '4번을 위한 영역입니다.'],
    route: '/monitoring',
  },
]
</script>

<style scoped>
/* ===== 전체 래퍼 ===== */
.home-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ===== 배경 ===== */
.home-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.home-bg__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.home-bg__overlay {
  position: absolute;
  inset: 0;
  background: rgba(14, 55, 69, 0.2);
}

/* ===== 상단 헤더 ===== */
.home-header {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40px 240px 0;
}

.home-header__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 77px;
  height: 47px;
  background: #059176;
  border-radius: 10px;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.36px;
}

.home-header__user {
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: -0.36px;
}

.home-header__user-name {
  text-decoration: underline;
}

/* ===== 메인 타이틀 ===== */
.home-title {
  position: relative;
  z-index: 10;
  text-align: center;
  flex: 0 0 auto;
  margin-top: 12vh;
}

.home-title h1 {
  color: #fff;
  font-size: clamp(28px, 3.6vw, 55px);
  font-weight: 600;
  letter-spacing: -1.1px;
  text-shadow: 0px 0px 10px rgba(0, 56, 56, 0.3);
  margin: 0;
}

/* ===== 메뉴 카드 영역 ===== */
.home-cards {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  gap: clamp(12px, 1.2vw, 20px);
  margin-top: 20vh;
  padding: 0 clamp(16px, 12.5vw, 240px);
  flex: 0 0 auto;
}

/* ===== 개별 카드 ===== */
.home-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 1 0;
  max-width: 345px;
  aspect-ratio: 345 / 300;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-radius: 20px;
  text-decoration: none;
  color: inherit;
  padding: clamp(12px, 1.5vw, 20px) clamp(16px, 2.2vw, 36px);
  box-sizing: border-box;
  transition: all 0.25s ease;
  cursor: pointer;
}

.home-card:hover {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0px 4px 26px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

/* 카드 아이콘 */
.home-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  margin-bottom: 4px;
}

.home-card__icon img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* 카드 타이틀 */
.home-card__title {
  font-size: clamp(14px, 1.15vw, 22px);
  font-weight: 600;
  color: #000;
  text-align: center;
  letter-spacing: -0.44px;
  line-height: 1.3;
  margin: 0;
  white-space: pre-line;
  flex: 0 0 auto;
}

/* 카드 설명 */
.home-card__desc {
  font-size: clamp(11px, 0.85vw, 16px);
  font-weight: 500;
  color: #767676;
  text-align: center;
  letter-spacing: -0.32px;
  line-height: 1.4;
  margin: 6px 0 0;
  flex: 0 0 auto;
}

/* ================================================================
   반응형 — 태블릿 (1024px 이하)
   ================================================================ */
@media (max-width: 1024px) {
  .home-header {
    padding: 24px 40px 0;
  }

  .home-cards {
    flex-wrap: wrap;
    max-width: 720px;
    margin-left: auto;
    margin-right: auto;
    padding: 0 40px;
  }

  .home-card {
    flex: 1 1 calc(50% - 12px);
    max-width: calc(50% - 12px);
    aspect-ratio: auto;
    height: auto;
    min-height: 200px;
    padding: 20px 24px;
  }

  .home-card__icon {
    height: 80px;
    flex: 0 0 80px;
  }
}

/* ================================================================
   반응형 — 모바일 (600px 이하)
   ================================================================ */
@media (max-width: 600px) {
  .home-wrapper {
    height: 100vh;
    height: 100dvh; /* 모바일 주소창 대응 */
  }

  .home-header {
    padding: 16px 20px 0;
  }

  .home-header__logo {
    width: 60px;
    height: 36px;
    font-size: 14px;
    border-radius: 8px;
  }

  .home-header__user {
    font-size: 14px;
  }

  .home-title {
    margin-top: 6vh;
  }

  .home-cards {
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-top: 4vh;
    padding: 0 20px;
    max-width: 100%;
  }

  .home-card {
    flex: 0 0 auto;
    max-width: 100%;
    width: 100%;
    min-height: 0;
    flex-direction: row;
    align-items: center;
    padding: 14px 20px;
    border-radius: 14px;
    gap: 16px;
  }

  .home-card__icon {
    flex: 0 0 56px;
    width: 56px;
    height: 56px;
    margin-bottom: 0;
  }

  .home-card__icon img {
    max-width: 48px;
    max-height: 48px;
  }

  .home-card__title {
    text-align: left;
    white-space: normal;
    font-size: 15px;
    line-height: 1.25;
  }

  .home-card__desc {
    text-align: left;
    font-size: 12px;
    margin: 2px 0 0;
  }

  /* 모바일에서 텍스트 영역을 묶어주는 래퍼가 없으므로 카드 내부를 wrap */
  .home-card__text {
    flex: 1 1 auto;
    min-width: 0;
  }

  .home-card:hover {
    transform: none;
  }
}
</style>
