import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "src/variables.scss" as *;'
      }
    }
  },
  // Add optimizations for production builds
  build: {
    target: 'es2015',
    minify: 'terser',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['svelte', 'easytimer.js', 'carbon-icons-svelte']
        }
      }
    }
  },
  // Enable source maps in development
  server: {
    hmr: true
  }
})
