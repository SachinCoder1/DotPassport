import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['@dotpassport/sdk']  // Pre-bundle CommonJS SDK for Vite
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      // NOTE: To use local SDK for development, uncomment the line below:
      // '@dotpassport/sdk': path.resolve(__dirname, '../sdk/dist/index.js')
    },
  },
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'sonner'],
          'vendor-charts': ['recharts', 'date-fns'],
          'vendor-code': ['react-syntax-highlighter'],
        }
      }
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Source maps for production debugging
    sourcemap: false,
    // Minification
    minify: 'esbuild',
  },
})
