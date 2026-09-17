# Development guide

This project is a Vite + TypeScript frontend. Most development work is done locally in the browser with static asset files.

## Prerequisites

- Node.js and npm (or pnpm)
- A local browser for manual UI testing

## Install dependencies

```bash
npm install
```

## Common commands

```bash
npm run dev
npm run build
npm run check
```

### `npm run dev`

Starts the Vite development server and serves the app locally.

### `npm run build`

Runs the project checks before building:

- ESLint
- Stylelint
- TypeScript transpilation
- Vite production build into `dist/`

### `npm run check`

Runs formatting validation with Prettier.

## Working on the codebase

### App entry points

- `src/main.ts` imports the custom elements.
- `src/components/App/index.ts` performs UI orchestration.
- `src/store.ts` owns state for poster controls.

### Styling

The project uses CSS files alongside component templates and Shadow DOM. Keep styles scoped when possible to the component that owns them, and preserve the poster's vintage visual language.

### Assets

Static images and icons live in:

- `public/` for site assets and manifest resources
- `src/components/.../images/` for component-specific images if needed

### Contribution notes

- Keep the code focused on the poster generator's browser experience.
- Preserve the app's static, dependency-light architecture.
- If changing the PWA manifest or file-handler behavior, validate the app still works after a production build.
