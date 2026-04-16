import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
// KRDS CSS 미사용 (layout.css / output.css로 스타일 관리)
// import 'krds-vue/dist/index.css'

createApp(App).use(createPinia()).use(router).mount('#app')
