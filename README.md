# Fatina d'Oro

Gioco web in Phaser 3 ispirato a Flappy Bird, ottimizzato per desktop e mobile.

## Requisiti

- Node 20 (vedi `.nvmrc`)

## Setup

```bash
nvm use
npm install
npm run dev
```

## Asset

Inserisci i tuoi asset qui:

- `public/assets/images/fairy.png`
- `public/assets/images/pipe.png`
- `public/assets/images/background.png`
- `public/assets/images/ground.png` (opzionale)
- `public/assets/audio/flap.mp3`
- `public/assets/audio/point.mp3`
- `public/assets/audio/hit.mp3`
- `public/assets/audio/music.mp3`

Se alcuni file mancano, il gioco usa texture di fallback.

## Build

- itch.io / hosting statico generico: `npm run build`
- GitHub Pages: `npm run build:gh`

Per GitHub Pages il path base viene impostato automaticamente a `/fatina-d-oro/`.

## Deploy automatico su GitHub Pages

Il workflow è in `.github/workflows/deploy-gh-pages.yml` e pubblica automaticamente a ogni push su `master`.

Setup una tantum su GitHub:

1. Vai in `Settings -> Pages`.
2. In `Build and deployment`, imposta `Source: GitHub Actions`.
3. Fai push su `master` e attendi il job `Deploy to GitHub Pages`.
