# User guide

This page explains how to use the poster maker from the browser UI.

## Getting started

1. Install dependencies with `npm install`.
2. Start the app with `npm run dev`.
3. Open the local Vite URL in the browser.

## Adding a photo

The app supports multiple ways to load an image:

- Click the import button and select a file from your device
- Drag a valid image file onto the poster area
- Use the browser file-handling flow when the app is installed as a PWA

The imported image becomes the poster's main subject. The app stores the image URL in the shared app state and re-renders the poster when the state changes.

## Editing the poster

The main editing panel exposes the text and styling configuration:

- Character name
- Bounty text
- Typography controls
- Filter adjustments
- Shadow intensity
- Spacing values

These settings are centralized through the store so the poster and controls stay in sync.

## Exporting the poster

When you are satisfied with the composition:

1. Click the export button.
2. The app renders the poster to an image and downloads or saves the result.
3. Use the exported file in a social share, profile banner, or local backup.

The export flow is handled by the poster component and is surfaced through the UI with a loading state while generation is in progress.

## Tips and behavior notes

- The app uses browser-side rendering, so export quality depends on how the browser handles canvas and image composition.
- The poster is highly stylized and intentionally mimics the classic anime wanted-poster template.
- The app can be installed as a standalone app via the PWA metadata and service worker configuration.
