import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { vReveal } from './directives/reveal'
import { vCard } from './directives/card'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.directive('reveal', vReveal)
app.directive('card', vCard)
app.mount('#app')
