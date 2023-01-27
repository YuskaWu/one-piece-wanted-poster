import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'

import { VitePWA as pwa } from 'vite-plugin-pwa'
import manifest from './manifest.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    checker({ typescript: true }),
    pwa({
      strategies: 'injectManifest',
      srcDir: '',
      filename: 'service-worker.ts',
      base: './',
      manifest
    })
  ],
  base: '',
  server: {
    host: true
  }
})
