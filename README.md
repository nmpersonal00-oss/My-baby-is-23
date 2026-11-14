# Rayan's Dark Forest

A lovingly illustrated, interactive forest home screen built around the exact approved design. **Homepage preserved; Word Search is playable, and Matching Memory has an empty GIF-to-name matching board ready for content.**

## Homepage

- Displays the approved artwork as one continuous full-screen image (`assets/rayans-dark-forest.avif`), avoiding seams and dark side margins. The full original PNG remains in the downloadable archive.
- Five transparent, accessible click targets correspond to the original ornaments in the tree.
- Warm, animated fireflies and gentle focus/hover glows decorate the illustration without obscuring it.
- Each ornament opens its own dedicated placeholder page, ready for a future game or love note.
- Full-bleed desktop art, a horizontally pannable scene on portrait phones, and reduced-motion accessibility.

## Forest sections

1. Scavenger Hunt
2. Word Search Puzzle — fully playable
3. Matching Memory Game — interactive GIF-to-name matching setup, waiting for GIFs and names
4. Secret Love Notes
5. Mystery Treasure Trail

## Deployment

No packages, build tools, external fonts, or remote image services are required. The site works as static files. For GitHub Pages, use **Settings → Pages → Deploy from a branch → `main` / `(root)`**. Open `index.html` to preview locally.

## Word Search · Phase 2

- Seven illustrated collections: **Dark Souls I & II**, **Lies of P**, **Bloodborne**, **Star Wars**, **Terraria**, **Hollow Knight / Silksong**, and **My Spoiled Little Princess**.
- Five selectable levels per collection, with **35 curated terms per level** (35 levels, 1,225 hidden words total).
- Find words in eight directions by dragging, or choose their first and last letters using touch, mouse, or keyboard.
- Progress, completed levels, and used hints are stored automatically in this browser using `localStorage`; they do not sync across devices or private-browsing sessions.
- Each level has three optional hints. Completed levels display a celebration and can be replayed.
- Enchanted AI art, warm-glow fireflies, optional original chime effects, responsive letter boards, and reduced-motion support.
- The game lives at `chapters/word-search.html` and preserves the original homepage unchanged.

## Exact illustrated Word Search (new)

The Word Search page now supports the seven illustrated puzzle cards in the approved artwork, with 5 playable levels per card and 35 words per level. The transparent click targets align with the illustrated level numbers and the original local progress key is retained. The approved illustration is now published in this repository at `assets/wordsearch-worlds.webp`. The game uses it directly, with invisible interactive buttons aligned to each illustrated level badge. The original PNG is retained in the downloadable build, while the website uses a web-optimized copy. If the image cannot load, the standard playable menu remains available.

## Matching Memory · Real interactive game (November 2026)

The Matching Memory chapter lives at `chapters/memory-game.html`. The first build
mistakenly used a full screenshot of the approved mockup as the page itself, with
transparent hotspots over the picture. That has been replaced with **real HTML
buttons, image elements, text labels, level selectors, and accessible controls**.

The page keeps the approved visual direction: deep moonlit forest scenery, ornate
glowing gold frames, pink flower details, eight illustrated world tiles, five
round buttons, sparkles, and a wide GIF-to-name matching board. The old approved
illustration is used **only as cropped decorative scenery at the screen edges**,
not as the interface or the source of visible button labels. The forest background
is the existing `assets/rayans-dark-forest.avif` artwork.

### How the matching game works

- 8 worlds: Hollow Knight, Hollow Knight: Silksong, Shadow of the Colossus,
  Lies of P, Terraria, Dark Souls, Bloodborne, and Sanrio.
- 5 playable round selectors per world: 40 boards in total.
- Each board has 10 **real interactive GIF/image slots** and 10 matching name
  slots. By design all 40 boards are initially empty; there are no fake clues.
- The **Choose Another World** button opens an actual world-selection dialog.
  **Shuffle** reacts even while empty and shuffles both columns once content is
  added. The sound control visibly toggles on and off.
- Add up to ten `{ name: 'Character', gif: '../assets/character.gif' }` items
  to any round inside `memory-matching-data.js`. Both GIF and name must be
  present; missing pairs stay blank.
- Click/tap/keyboard-select a GIF on the left and its name on the right.
  Correct pairs glow and are linked by an SVG thread. Incorrect matches can
  be retried. Completed levels are saved in browser localStorage.
- GIFs use `object-fit: contain` and a separate zoom control, so they are
  displayed without stretching. The wide matching board can be horizontally
  scrolled on smaller screens without squeezing the GIFs too narrow.
- No JavaScript packages or backend are needed. The homepage and Word Search
  source files have not been modified.

The page is interactive even before any content is supplied: selecting worlds,
rounds and empty slots produces immediate, visible status feedback. Empty
slots deliberately cannot produce a match until GIF/name content is configured.
