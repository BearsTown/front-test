<template>
  <div id="container">
    <div class="contents">
      <div class="inner">

        <Breadcrumb ariaLabel="접근성" :items="breadcrumbItems" />

        <div class="page-header" style="padding: 4rem 0 2rem;">
          <h2 style="font-size: 3.2rem; font-weight: 700; color: #1a1a1a;">마이페이지</h2>
        </div>

        <section v-if="user" style="padding: 4rem 0; border-top: 2px solid #1a1a1a;">
          <table class="my-table">
            <tbody>
              <tr>
                <th>이름</th>
                <td>{{ user.userName }}</td>
              </tr>
              <tr>
                <th>이메일</th>
                <td>{{ user.email }}</td>
              </tr>
              <tr>
                <th>권한</th>
                <td>{{ user.roleId }}</td>
              </tr>
              <tr>
                <th>상태</th>
                <td>{{ user.userStateCode === '01' ? '정상' : '비활성' }}</td>
              </tr>
              <tr>
                <th>소셜 계정</th>
                <td>{{ user.isSocialUser ? '소셜 로그인' : '이메일 로그인' }}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 3.2rem;">
            <button class="krds-btn secondary large" @click="handleLogout">로그아웃</button>
          </div>
        </section>

        <div v-else style="padding: 4rem 0; color: #666;">
          사용자 정보를 불러오지 못했습니다.
          <a href="/login" style="color: #1a4d9e; margin-left: 1rem;">로그인 하기</a>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Breadcrumb } from 'krds-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const breadcrumbItems = [
  { text: '홈', href: '/' },
  { text: '마이페이지', href: '/my' },
]

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.my-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.5rem;
}

.my-table th,
.my-table td {
  padding: 1.6rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  text-align: left;
}

.my-table th {
  width: 16rem;
  font-weight: 600;
  color: #555;
  background: #f8f9fa;
}

.my-table td {
  color: #1a1a1a;
}
</style>
