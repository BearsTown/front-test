import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

// nginx.conf.template의 location 블록을 파싱해 proxy 경로를 자동 추출
// → API 경로 추가 시 nginx.conf.template만 수정하면 dev/Docker 동시 반영
function loadProxyPrefixes() {
  const template = fs.readFileSync('./nginx.conf.template', 'utf-8')
  return [...template.matchAll(/location\s+(\/\S+\/)/g)]
    .map(m => m[1].slice(0, -1)) // trailing slash 제거
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.BACKEND_URL || 'http://localhost:8000'

  const proxy = Object.fromEntries(
    loadProxyPrefixes().map(prefix => [prefix, { target: backendUrl, changeOrigin: true }])
  )

  return {
    plugins: [
      vue(),
      // vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `@use "@/assets/scss/variables" as *;`
        }
      }
    },
    server: { proxy },
  }
})
