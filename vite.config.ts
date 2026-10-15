import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import aitDevtools from '@apps-in-toss/devtools/unplugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [aitDevtools.vite(), react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
})

