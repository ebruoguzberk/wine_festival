# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A single-page React app for the "Engwall Wine Festival - The Thousand & One Night" event. Guests browse Arabian Nights-themed wine tasting concepts across 5 categories (Romantic, Mysterious, Adventurous, Funny, Absurd) and claim one for their pair. Deployed on Netlify.

## Commands

- **Dev server:** `npm run dev` (Vite)
- **Build:** `npm run build`
- **Preview production build:** `npm run preview`
- **Lint:** `npm run lint` (ESLint with react-hooks and react-refresh plugins)

No test framework is configured.

## Deploying to Netlify

`npm` and `netlify` are not on the default PATH. Always prefix with the full nvm node path:

```bash
export PATH="$HOME/.nvm/versions/node/v24.14.1/bin:$PATH"
npm run build
netlify deploy --prod --dir=dist --site=cf415a79-b04b-42c1-944d-2b1c1cff1711
```

If `netlify` is not installed: `npm install -g netlify-cli`
If not logged in:
1. Run `netlify login` — it prints an Authorize URL
2. Open the URL in browser and click Authorize
3. Run `netlify login --check <ticket-id>` to complete
Site ID: `cf415a79-b04b-42c1-944d-2b1c1cff1711`
Live URL: https://engwall-wine-festival.netlify.app

## Architecture

**Single-component frontend:** Almost all UI lives in `src/App.jsx` (~1300 lines) — a monolithic component containing:
- Custom hooks/components at the top: `useInView`, `KineticText`, `TiltCard`, `MagneticBtn`, `ScrollProgress`, `Reveal`, `WordReveal`, `CursorGlow`
- Wine concept data (36 concepts across 5 categories) and category metadata inline
- SVG icon system via `Icon` component (no icon library)
- Tab-based navigation: The Event, Wine Tasting, Games, Dress Code, The Art
- Concept claiming flow with optimistic UI → calls `/.netlify/functions/claims`

**Styling:** All CSS is in `src/App.css` with heavy use of CSS animations and keyframes (kinetic text, scroll reveals, lantern glow, shooting stars, floating particles). Inline styles are used extensively in JSX.

**Backend (Netlify Functions):**
- `netlify/functions/claims.mjs` — GET/POST API at `/api/claims` using `@netlify/blobs` store `wine-claims` for claiming concepts
- `netlify/functions/admin-claims.mjs` — HTML admin view at `/admin/claims` showing all claims

**`engwall_wine_festival.jsx`** at project root is an earlier/alternate version of the app (not imported anywhere).

## Key Details

- React 19 with Vite 8 and `@netlify/vite-plugin`
- ESLint rule: `no-unused-vars` ignores variables starting with uppercase or underscore (`^[A-Z_]`)
- Google Fonts: Playfair Display loaded in `index.html`
- Static assets in `public/`: themed images (carpet, genie, lamp) referenced in the app
- Netlify config: `netlify.toml` sets build command, publish dir (`dist`), and functions directory
