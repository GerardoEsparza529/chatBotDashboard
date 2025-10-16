import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Escuchar en todas las interfaces de red
    port: 5173, // Puerto específico
    open: true, // Abrir automáticamente en el navegador
  },
})
