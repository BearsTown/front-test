import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import 'ol/ol.css'
import '@/assets/css/tokens.css'
import '@/assets/scss/global.scss'

const pinia = createPinia()
const app   = createApp(App)
app.use(pinia).use(router).use(vuetify).mount('#app')

// DEV 환경 전용: 1안 테스트 데이터 초기 세팅
if (import.meta.env.DEV) {
    import('./dev/seedTestData.js').then(({ seedTestData }) => seedTestData())
}
