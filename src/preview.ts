import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PreviewApp from './PreviewApp.vue'
import { vReveal } from './directives/reveal'
import './style.css'

const app = createApp(PreviewApp)
app.use(createPinia())
app.directive('reveal', vReveal)
app.mount('#preview')
