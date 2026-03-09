import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/minimax-bill/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
