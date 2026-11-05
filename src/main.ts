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

createApp(App).use(router).mount('#app')
