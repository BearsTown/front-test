<template>
  <div id="container">
    <div class="contents">
      <div class="inner">
        <div style="max-width: 48rem; margin: 8rem auto;">
          <h2 style="font-size: 2.4rem; font-weight: 700; color: #1a1a1a; margin-bottom: 3.2rem; text-align: center;">로그인</h2>

          <form style="display: flex; flex-direction: column; gap: 2rem;" @submit.prevent="handleLogin">
            <TextInput
              id="email"
              v-model="email"
              label="이메일"
              type="text"
              placeholder="이메일을 입력하세요"
              size="large"
              autocomplete="email"
            />

            <TextInput
              id="password"
              v-model="password"
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력하세요"
              size="large"
              :showPasswordToggle="true"
              autocomplete="current-password"
            />

            <p v-if="error" style="font-size: 1.4rem; color: #c00; padding: 1rem 1.2rem; background: #fff0f0; border-radius: 0.4rem;">{{ error }}</p>

            <Button type="submit" variant="primary" size="large" :disabled="loading" style="width: 100%;">
              {{ loading ? '로그인 중...' : '로그인' }}
            </Button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { TextInput, Button } from 'krds-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { loading, error } = storeToRefs(authStore)

const email = ref('')
const password = ref('')

async function handleLogin() {
  const success = await authStore.login(email.value, password.value)
  if (success) {
    router.push('/my')
  }
}
</script>
