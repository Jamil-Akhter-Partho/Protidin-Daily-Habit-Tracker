import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Relative base so the built folder works on any static host or sub-path.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
