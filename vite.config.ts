import autoprefixer from 'autoprefixer'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'
// import basicSsl from '@vitejs/plugin-basic-ssl'

import { VitePWA as pwa } from 'vite-plugin-pwa'
import manifest from './manifest.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    checker({ typescript: true }),
    pwa({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: '',
      filename: 'service-worker.ts',
      base: './',
      devOptions: {
        enabled: false,
        type: 'module',
        webManifestUrl: 'manifest.json'
      },
      manifest
    })
    // basicSsl()
  ],
  base: '',
  server: {
    host: true
  },
  css: {
    postcss: {
      plugins: [autoprefixer]
    }
  }
})
