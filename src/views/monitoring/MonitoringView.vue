<template>
  <div class="page-wrap">
    <header class="page-header">
      <button class="page-header__back" @click="$router.push('/')">← 홈으로</button>
      <h1 class="page-header__title">탄소중립 도시계획 모니터링</h1>
    </header>
    <main class="page-main">
      <p class="page-placeholder">탄소중립 도시계획 모니터링 서비스입니다.</p>
      <!-- TODO: 실제 콘텐츠 구현 -->
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.page-wrap {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 40px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.page-header__back {
  background: none;
  border: none;
  color: #059176;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
}

.page-header__title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.page-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-placeholder {
  color: #767676;
  font-size: 16px;
}
</style>
