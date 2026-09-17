# Deployment guide

This project can be deployed as a static site because the app is fully client-side.

## Local production build

```bash
npm run build
```

This generates the production bundle in the `dist/` directory.

## Static hosting

Because the app is built with Vite and configured with `base: ''`, it can be served from any static host, including:

- GitHub Pages
- Netlify
- Vercel static output
- any CDN or custom web server that serves `dist/`

The repo README already points to the GitHub Pages demo, which is a good reference for the expected production output.

## PWA considerations

The generated app uses a service worker and web manifest, so deployment should preserve the static asset paths and the generated `dist/` directory structure. If a host rewrites paths or applies unusual caching rules, verify that the manifest and service worker still resolve correctly after deployment.

## Verification checklist

Before publishing:

- run `npm run build`
- confirm the app loads without console errors
- verify local image import still works
- confirm the service worker and manifest are being served from the deploy target
- test the export flow from a production build instead of only from dev mode
