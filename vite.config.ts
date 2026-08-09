import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import seoPrerender from './vite-plugins/seo'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ mode }) => ({
  base: mode === 'local' || mode === 'development' ? '/' : '/app/portfolio/',
  plugins: [vue(), tailwindcss(), seoPrerender()],
  resolve: {
    alias: { '@': resolve(rootDir, 'src') },
  },
  build: {
    assetsInlineLimit: (file: string) => !file.includes('country-flag-icons'),
    rollupOptions: {
      input: {
        main: resolve(rootDir, 'index.html'),
        preview: resolve(rootDir, 'preview.html'),
      },
      output: {
        manualChunks: {
          vue: ['vue'],
        },
      },
    },
  },
}))
