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

## Matching Memory · GIF-to-name matching setup

The Memory chapter at `chapters/memory-game.html` shares the **exact homepage forest illustration** (`assets/rayans-dark-forest.avif`) and the warm, animated, glowing fireflies. Its gold, dark-forest and pink accents match the completed Word Search aesthetic. The homepage and Word Search files are unchanged.

The intended game is **not** flip-card memory. Ten picture/GIF frames appear on the left and ten name/character/item frames on the right. A player selects an animated picture and its matching name; correct matches remain lit and are joined by a golden thread. Incorrect pairs can be tried again.

- **8 original categories**: Hollow Knight, Hollow Knight: Silksong, Shadow of the Colossus, Lies of P, Terraria, Dark Souls, Bloodborne, and Sanrio.
- **5 selectable rounds per category**, for 40 matching-board setups in total.
- All GIF and name positions are **deliberately empty**. There are no demo clues, fake names, or GIFs in the game.
- Content is separate in `memory-matching-data.js`, so adding real GIFs and their corresponding names later won't require rebuilding the page.
- When pairs are added, the two columns shuffle separately, provide tap/click/keyboard matching, visible connection lines, progress, optional chimes, and a round-complete message.
- Completed rounds (once configured with at least one pair) are stored in this browser only using `localStorage` (`rayans-dark-forest.gif-name-matching.v1`).

### Adding GIFs and names later

Edit the `pairs` array for the appropriate category/round inside `memory-matching-data.js`. Each array accepts up to ten matching entries:

```js
{ pairs: [
  { name: 'Character Name', gif: '../assets/character-name.gif' },
  { name: 'Another Character', gif: 'https://example.com/another-character.gif' }
] }
```

The sample above is instructional only; the actual arrays remain empty. For reliable playback, prefer files you can host in `assets/`. Use images you own or are permitted to use. Once supplied, the game displays each GIF on the left, each name on the right, and knows which ones belong together by their shared pair record.

No packages or backend are required. Open `chapters/memory-game.html` from the website's existing forest lantern.
