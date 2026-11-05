import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
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

async function start() {
  // Feedback Layer: ferramenta de desenvolvimento. Ligado em dev, ou em build com VITE_FEEDBACK=1.
  // Import dinâmico dentro do `if`: sem a flag, o bundle de produção nem carrega o pacote.
  // O bridge local (feedback-bridge) recebe as notas. O espaço do botão vem do <FloatingSafeArea /> da tela.
  if (import.meta.env.DEV || import.meta.env.VITE_FEEDBACK) {
    const { default: FeedbackLayer } = await import('@feedback-layer/vue')
    app.use(FeedbackLayer, {
      project: 'design-system-vue',
      from: import.meta.env.VITE_FEEDBACK_FROM ?? 'vini',
      to: 'design-system-vue',
      bridge: import.meta.env.VITE_FEEDBACK_BRIDGE ?? 'http://127.0.0.1:7777',
    })
  }
  app.mount('#app')
}

void start()
