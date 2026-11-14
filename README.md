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

## Matching Memory · Approved enchanted artwork (November 2026)

The Matching Memory chapter is based directly on the approved **Matching Memory** illustration
at `assets/memory-matching-approved.avif`. It preserves the luminous moonlit forest,
gold borders, pink blossoms, waterfalls, illustrated world tiles, and ten wide GIF slots
opposite ten name slots. Animated fireflies and subtle interaction glows float above the artwork.

- Eight original worlds: Hollow Knight, Hollow Knight: Silksong, Shadow of the Colossus,
  Lies of P, Terraria, Dark Souls, Bloodborne, and Sanrio.
- Five selectable rounds per world, 40 matching boards total.
- Each round has ten GIF positions and ten name positions, intentionally **empty** until
  the owner's GIFs and names are chosen; nothing is prefilled with fake examples.
- Future content goes into `memory-matching-data.js`: each round's `pairs` can include
  up to ten `{ name: 'Name', gif: '../assets/file.gif' }` objects.
- Once the content is added, selecting one GIF and one name checks the match, draws
  a glowing connection line, gives optional sound feedback, and saves completion
  in this browser. Double-click a loaded GIF to see it larger. GIFs use
  `object-fit: contain`, never distorted or stretched.
- Full illustration scales without distortion. Narrow portrait screens can
  horizontally pan across the magical board, as on the original forest homepage.
- No build tools or backend required. Homepage and Word Search source files are untouched.

The original approved illustration is used as the actual page artwork, not a
reconstruction from generic panels.
