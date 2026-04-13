import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import config from './config'

const API = config.API_URL

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: API,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
