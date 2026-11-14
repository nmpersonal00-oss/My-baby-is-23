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

## Memory Matching · Approved Gothic Citadel design (November 2026)

The Matching Memory tab now implements the **approved second Gothic design** as a
real website interface. The background is the actual clean user-provided
moonlit citadel and waterfalls illustration, published as
`assets/memory-gothic-citadel.avif`. It does **not** use a screenshot of the
finished game UI.

- Real Home button and crowned R sidebar. The sidebar intentionally has
  **no Trivia Quiz or Hangman** buttons.
- Eight illustrated vertical categories: Hollow Knight, Hollow Knight:
  Silksong, Shadow of the Colossus, Lies of P, Terraria, Dark Souls,
  Bloodborne, and Sanrio. The category artwork uses a small sprite cut from
  the supplied design (`assets/memory-category-icons.webp`).
- Five real round buttons per category (40 boards). Ten wide GIF slots
  oppose ten empty name slots, with a clear view of the waterfall between
  them. The GIF image uses `object-fit:contain` and is never distorted.
- **Gold borders by default. Purple glowing borders appear only when a
  category, round, or matching slot is actively selected/matched.**
- The center is clear by default: a purple SVG line only appears between
  an actual, correctly matched GIF/name pair, and stays attached to that pair.
  Incorrect guesses never create a line.
- The matching data stays intentionally empty in
  `memory-matching-data.js`, as requested. To fill a round later, add up to
  ten `{ name: 'Character', gif: '../assets/character.gif' }` entries to
  its `pairs` array. The two sides shuffle separately, and progress for
  completed rounds is saved in localStorage.
- Fully interactive category and round buttons, Shuffle, optional original
  synthesized sound, animated fireflies, match feedback, victory dialog,
  and keyboard/focus support.
- Responsive desktop/tablet/mobile interface; the background is scenic
  while all game controls are actual HTML/CSS/JavaScript.

The homepage and Word Search files are unchanged.
