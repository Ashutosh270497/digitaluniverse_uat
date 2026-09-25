import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { technicalSeoPlugin } from './build/seoPlugin.js'
import { SEO_ROUTES } from './src/config/seo.js'

const resolveProjectPath = (path) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  root: resolveProjectPath('./src/'),
  envDir: resolveProjectPath('./'),
  publicDir: resolveProjectPath('./public/'),
  plugins: [react(), technicalSeoPlugin()],
  // Both deployment targets serve the site at the domain root. Absolute asset
  // URLs also keep the custom 404 working for deeply nested missing pages.
  base: '/',
  build: {
    outDir: resolveProjectPath('./dist/'),
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(
        SEO_ROUTES.map((route) => [route.entryName, resolveProjectPath(`./src/${route.entry}`)]),
      ),
    },
  },
})
