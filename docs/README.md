# Wiki documentation

This directory contains the project wiki for the One Piece Wanted Poster Maker.

## Quick links

- [Overview](./overview.md) — what the app does and how a typical poster is created
- [User guide](./usage.md) — how to import photos, adjust poster settings, and export results
- [Architecture](./architecture.md) — how the app is organized and how the UI/state system fits together
- [Development guide](./development.md) — local setup, scripts, and contribution workflow
- [Deployment guide](./deployment.md) — how to build and publish the site as a static PWA

## Project at a glance

This project is a Vite-based web app written in TypeScript. It renders a custom wanted-poster layout in the browser, lets the user edit text and styling, and exports the final poster as an image.

Key characteristics:

- Client-side poster composition with custom elements and Shadow DOM
- Reactive state management from a single app store
- Local image upload with drag-and-drop support
- Poster filtering and typography controls
- Progressive Web App setup for installability and offline-friendly behavior

## Start here

If you are new to the repo, begin with the [overview](./overview.md) and [user guide](./usage.md). If you are contributing code, skip to [development guide](./development.md).
