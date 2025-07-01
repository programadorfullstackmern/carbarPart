import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://backCarbarPart.onrender.com/',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          reactRouter: ['react-router-dom'],
          // Agrega otras librerías grandes aquí
          vendor: ['lodash', 'axios'], // Ejemplo de otras dependencias
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Aumenta el límite de advertencia a 1000kB
  }
})