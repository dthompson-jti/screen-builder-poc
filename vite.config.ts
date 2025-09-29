import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Configure the base path for GitHub Pages deployment.
  // This should be the name of your repository.
  base: '/screen-builder-poc/',
})