import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { i18n } from '@/i18n'
import { vReveal } from './directives/reveal'
import { vCard } from './directives/card'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(i18n)
app.directive('reveal', vReveal)
app.directive('card', vCard)
app.mount('#app')
