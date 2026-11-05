import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    dedupe: ['vue'], // @feedback-layer/vue é linkado de fora do projeto: precisa usar o mesmo Vue do app
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
