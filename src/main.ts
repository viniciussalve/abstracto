import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import FeedbackLayer from '@feedback-layer/vue'
import App from './App.vue'
import './styles/tokens.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./views/ArtistProfile.vue') },
    { path: '/design-system', component: () => import('./views/DesignSystem.vue') },
  ],
})

const app = createApp(App).use(router)

// Feedback Layer: ligado em dev, ou em build com VITE_FEEDBACK=1. O bridge local (feedback-bridge) recebe as notas.
// O espaço do botão vem do <FloatingSafeArea /> da tela (safeArea: 'host').
if (import.meta.env.DEV || import.meta.env.VITE_FEEDBACK) {
  app.use(FeedbackLayer, {
    project: 'design-system-vue',
    from: 'vini',
    to: 'design-system-vue',
    bridge: import.meta.env.VITE_FEEDBACK_BRIDGE ?? 'http://127.0.0.1:7777',
  })
}

app.mount('#app')
