import path from 'node:path'
import { crx } from '@crxjs/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite-plus'
import zip from 'vite-plugin-zip-pack'
import manifest from './manifest.config.ts'
import pkg from './package.json'
import { crxjsVite8Compat } from './vite.crxjs-vite8-compat.js'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    crxjsVite8Compat(),
    tailwindcss(),
    react(),
    crx({ manifest }),
    zip({
      outDir: 'release',
      outFileName: `crx-${pkg.name}-${pkg.version}.zip`,
    }),
  ],
  server: {
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
})
