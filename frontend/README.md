# Angelique Vi. — Frontend

React + JavaScript + Vite frontend van het fotografieportfolio. Algemene projectstatus en toekomstplannen staan in [../PLAN.md](../PLAN.md).

## Starten

Vanuit deze map (`frontend/`):

```powershell
npm.cmd ci
npm.cmd run dev
```

De lokale Vite-server vermeldt het adres (meestal `http://localhost:5173/`).

## Controles

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd audit
```

Gebruik `npm` in plaats van `npm.cmd` op een systeem waar `npm.cmd` niet bestaat.

## Opbouw

- `src/pages/`: Home, Portfolio, About Me, Contact en placeholderpagina's.
- `src/components/MovingGallery.jsx`, `PhotoCard.jsx`, `PhotoViewer.jsx`: bewegende galerij en fotoviewer.
- `src/components/PhotoManager.jsx`: lokale foto toevoegen, vervangen en verwijderen, alleen zichtbaar in Vite-ontwikkelmodus op Portfolio.
- `src/hooks/usePhotoLibrary.js` en `src/lib/photoStorage.js`: gedeelde fotoverzameling en IndexedDB-opslag.
- `src/lib/collageLayout.js` en `src/lib/imageFiles.js`: dynamische collage, afbeeldingsvalidatie, fotoverhoudingen en thumbnails.
- `src/data/placeholderPhotos.js`: 12 demo-placeholders zolang geen echte foto's zijn toegevoegd.

## Belangrijke beperkingen

Foto's die je via de UI toevoegt, worden **alleen in de lokale browser** bewaard. Een andere laptop of browser krijgt die foto's niet via Git. Wis je browsergegevens niet zonder de originele beelden elders te bewaren. Het is geen beveiligd adminsysteem; een echte backend en login zijn toekomstig werk.

Voor GitHub Pages bestaat een conditionele `base`-instelling in `vite.config.js`. Routing bij rechtstreeks verversen van subpagina's vereist een geschikte hostingfallback.
