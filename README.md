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
- **Lies of P** now contains the 50 supplied keywords: exactly 10 unique names
  in each of its 5 rounds. They are distributed using a seeded shuffle, so
  the assignments are mixed but stable across reloads; the display order of
  the 10 names reshuffles each round start or press of Shuffle.
- The 10 GIF spaces in all Lies of P rounds are **still blank**. Only name
  plaques are populated. No fake GIFs, and no connecting lines before actual
  matches. Clicking a name gives feedback that its GIF is not yet supplied.
- Later, assign a matching GIF file to a keyword in the `liesOfPGifs` map in
  `memory-matching-data.js` — there is no need to rearrange words or change
  any game's matching logic. Other seven categories remain empty.
- When every one of a round's 10 keywords has a GIF, matching all ten pairs
  completes that round and saves progress locally.
- Fully interactive category and round buttons, Shuffle, optional original
  synthesized sound, animated fireflies, match feedback, victory dialog,
  and keyboard/focus support.
- Responsive desktop/tablet/mobile interface; the background is scenic
  while all game controls are actual HTML/CSS/JavaScript.

The homepage and Word Search files are unchanged.

### Lies of P: name-only content

The provided keyword list is preserved verbatim, including “King’s Flame, Fuoco”.
The 50 words are mixed across the five rounds without duplication, and the five
sets stay consistent so future GIFs can be linked to their keywords. Until GIFs
are supplied, the names display and shuffle but cannot produce correct matches.

### Terraria: name-only content

Terraria now contains exactly 50 names from the provided list: 15 people,
15 bosses, and 20 important things. They are mixed across 5 fixed rounds with
10 unique names each: 3 people, 3 bosses, and 4 important things per round. The names appear in a freshly shuffled display order
when each round starts or Shuffle is pressed.

All Terraria GIF slots remain blank. Once a GIF is chosen, add a key with
that item's exact name to `terrariaGifs` in `memory-matching-data.js`,
for example `'Guide': '../assets/guide.gif'`. The correct name-to-GIF
relationship will work without changing the game mechanics. Lies of P and
the other six categories retain their existing data and styles.

### Shadow of the Colossus: name-only content

Shadow of the Colossus now has all 50 names supplied by the owner, in the
five explicitly agreed sets of 10. The lists include people, colossi, places,
items, and gameplay elements, with exact punctuation such as “Emon’s soldiers”
and “Queen’s Sword”. Every term appears once, and each round's names are
reshuffled visually when the round starts or Shuffle is pressed.

Its ten GIF spaces remain empty in every round until images are selected.
To attach a GIF later, add the matching name/path to `colossusGifs` in
`memory-matching-data.js` (for example,
`'Wander': '../assets/wander.gif'`). Lies of P, Terraria, and all
other categories remain unchanged.
