import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this project from /test/, not the domain root.
  base: '/test/',
  plugins: [react(), tailwindcss()],
})
