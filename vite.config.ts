import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this project from /Test/ (the repo's exact name), not the domain root.
  base: '/Test/',
  plugins: [react(), tailwindcss()],
})
