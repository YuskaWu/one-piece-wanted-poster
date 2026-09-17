# Overview

One Piece Wanted Poster Maker is a browser-based poster generator inspired by the classic anime wanted-poster aesthetic. Users can upload a portrait, set a wanted name and bounty, tweak the title styling, apply filters, and export the finished poster as an image.

## Core features

- Upload any local image and use it as the poster photo
- Resize and reposition the portrait within the poster layout
- Adjust tone with brightness, contrast, grayscale, sepia, saturation, and other CSS filters
- Customize name spacing, bounty spacing, font family, weight, and offset
- Add shadow and poster overlays for the classic wanted-poster look
- Export the poster to a file from the browser
- Install the app as a PWA and use file-handler support for local image import

## Typical user flow

1. Open the app in the browser.
2. Import a portrait image from the device or drag and drop a file into the app.
3. Edit the character name and bounty text.
4. Adjust the photo and typography settings using the control panel.
5. Preview the final poster composition.
6. Export the generated poster image.

## Special mode

The app includes a hidden `#warcriminal` hash mode that changes the poster styling and image set to a parody "war criminal" variant. This feature is toggled via the hash in the browser URL and is a light, optional easter egg rather than the main product flow.

## Product goals

The app emphasizes a lightweight, single-page, offline-friendly experience rather than a backend-driven workflow. Most logic stays on the client, which keeps the project simple, portable, and easy to host on static infrastructure.
