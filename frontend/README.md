# Angelique Vi. — Frontend

React + JavaScript + Vite frontend for the photography portfolio. Project goals, current features, and future work are documented in [../PLAN.md](../PLAN.md).

## Run locally

From the `frontend/` directory:

```powershell
npm.cmd ci
npm.cmd run dev
```

Vite displays the local address (usually `http://localhost:5173/`).

## Checks

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd audit
```

Use `npm` instead of `npm.cmd` on systems where `npm.cmd` is not available.

## Project structure

- `src/pages/`: Home, Portfolio, About Me, Contact, and placeholder routes.
- `src/components/MovingGallery.jsx`, `PhotoCard.jsx`, `PhotoViewer.jsx`: gallery motion and photo viewer.
- `src/components/PhotoManager.jsx`: add, replace, and delete local photos; only shown on Portfolio during Vite development.
- `src/hooks/usePhotoLibrary.js` and `src/lib/photoStorage.js`: shared photo collection and IndexedDB storage.
- `src/lib/collageLayout.js` and `src/lib/imageFiles.js`: dynamic collage, file validation, aspect ratios, and thumbnails.
- `src/data/placeholderPhotos.js`: 12 demo placeholders when there are no real uploaded photos.

## Language and limitations

The existing website and source documentation use **English**. A user-selectable English/Dutch interface is **planned, not implemented**. Keep the code and project documentation in English when localization is introduced.

Uploads remain **in the current browser only**; they do not synchronize via Git, and clearing browser data may remove them. This is not a secure administrator interface; login and server-side uploads belong to a later backend phase.

`vite.config.js` has a conditional base path for GitHub Pages. Directly refreshing non-root routes requires appropriate host-side fallback routing.
