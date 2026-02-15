import autoprefixer from 'autoprefixer'
import checker from 'vite-plugin-checker'
import { VitePWA } from 'vite-plugin-pwa'
// import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // basicSsl(),
    checker({ typescript: true }),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src/service-worker',
      filename: 'sw.ts',
      base: './',
      injectRegister: 'auto',

      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}']
      },

      devOptions: {
        enabled: true,
        navigateFallback: 'index.html',
        suppressWarnings: true,
        type: 'module'
      },

      manifest: {
        id: 'one-piece-wanted-poster-maker',
        start_url: './',
        name: 'One Piece Wanted Poster Maker',
        short_name: 'One Piece Wanted Poster Maker',
        description:
          'Free online web application for creating One Piece wanted poster.',
        background_color: '#584034',
        theme_color: '#584034',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        launch_handler: {
          client_mode: 'navigate-existing'
        },
        screenshots: [
          {
            src: './images/pwa/screenshot-narrow.jpg',
            type: 'image/jpg',
            sizes: '1080x2163',
            form_factor: 'narrow'
          },
          {
            src: './images/pwa/screenshot-wide.jpg',
            type: 'image/jpg',
            sizes: '2561x1217',
            form_factor: 'wide'
          }
        ],
        icons: [
          {
            src: './images/pwa/icon-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: './images/pwa/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: './images/pwa/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: './images/pwa/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: './images/pwa/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: './images/pwa/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: './images/pwa/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: './images/pwa/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: './images/pwa/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        file_handlers: [
          {
            action: './',
            accept: {
              'image/*': [
                '.png',
                '.jpg',
                '.jpeg',
                '.jfif',
                '.pjpeg',
                '.pjp',
                '.apng',
                '.avif',
                '.gif',
                '.webp',
                '.bmp',
                '.tif',
                '.tiff'
              ]
            },
            // about launch_type:
            // https://developer.chrome.com/blog/new-in-chrome-102#file-handlers
            // @ts-expect-error new config
            launch_type: 'single-client'
          }
        ]
      }
    })
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
