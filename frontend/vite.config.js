import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Use the repository subpath only when publishing to GitHub Pages.
// Local development still works at http://localhost:5173/.
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/PhotographyPortfolio/' : '/',
})
