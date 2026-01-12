import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@dotpassport/sdk']
  },
  resolve: {
    alias: {
      '@dotpassport/sdk': '../dist/index.js'
    }
  }
})
