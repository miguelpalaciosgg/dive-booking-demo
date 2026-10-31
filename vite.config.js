// Rutas relativas (base './') para que funcione igual en GitHub Pages (/dive-booking-demo/) que en local.
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({ base: './', plugins: [vue()] })
