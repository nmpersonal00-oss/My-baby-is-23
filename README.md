# Rayan's Dark Forest

A lovingly illustrated, interactive forest home screen built around the exact approved design. **Homepage preserved; Word Search is playable, Memory Matching has a GIF-to-name board, and Secret Love Notes is now an interactive flying-letter garden.**

## Homepage

- Displays the approved artwork as one continuous full-screen image (`assets/rayans-dark-forest.avif`), avoiding seams and dark side margins. The full original PNG remains in the downloadable archive.
- Five transparent, accessible click targets correspond to the original ornaments in the tree.
- Warm, animated fireflies and gentle focus/hover glows decorate the illustration without obscuring it.
- Each ornament opens its own adventure page. The Secret Love Notes room is playable; some other chapters remain placeholders.
- Full-bleed desktop art, a horizontally pannable scene on portrait phones, and reduced-motion accessibility.

## Forest sections

1. Scavenger Hunt
2. Word Search Puzzle — fully playable
3. Matching Memory Game — interactive GIF-to-name matching setup, waiting for GIFs and names
4. Secret Love Notes
5. Mystery Treasure Trail

## Secret Love Notes · The Flying Letter Garden

The Secret Love Notes ornament opens `chapters/love-notes.html`: a full-screen, cinematic garden made with **original AI artwork created in this chat**, stored as local files in `assets/`. There are **no headlines, instructions, descriptions, counters, visible note tabs, or footer copy** layered over the scene—just five illustrated, labeled flying envelopes and an ornate return button.

- The five letters—**Baby**, **Habibi**, **Cutie**, **Love**, **Kawaii**—are separate interactive images that fly and bounce throughout the **entire viewport**, not inside a limited circular arena. Their normal flight is brisk. The first click/tap of a particular letter makes it dart and fly at roughly 2.85x its speed temporarily; the second click/tap opens its own page.
- Each letter links to a dedicated **intentionally empty** destination: `chapters/love-notes/{baby,habibi,cutie,love,kawaii}.html`. Only an unobtrusive back arrow is visible there until personal notes are provided.
- The background, all five winged envelope assets, and the ornate back button are chat-created artwork and self-hosted; no emoji, external fonts, images, libraries, or remote services are used on these pages.
- The interface includes pointer, touch, keyboard navigation, responsive layout, accessible descriptions for screen readers, and reduced-motion support.
- The existing homepage and other games are unchanged.

### Love · Thirty Polaroids (November 2026)

The **Love** envelope opens `chapters/love-notes/love.html`, a fully animated, original-art scrapbook created from the approved chibi-couple illustration.

- A glowing, serpentine string draws itself across the scene. **Thirty individually interactive Polaroids** appear in order, with tiny sparkles and a gentle hanging sway, ending at the illustrated couple in the center.
- The 30 pictures are chat-created kawaii interpretations of the supplied couple reference photos, packaged in a compact local WebP atlas at `assets/love-polaroid-atlas.webp`. The clean matching scenery and the final couple are separate local WebP assets.
- Clicking or tapping a revealed Polaroid opens a larger photo; Escape or the close button dismisses it.
- The illustrated **Love** title remains centered, the Back arrow returns to the flying-note garden, and there are **no top-right navigation icons**.
- The page is built with plain HTML/CSS/JavaScript and loads **no remote images, libraries, emoji packs, or fonts**. Mobile uses a vertical two-column memory trail, while reduced-motion visitors see the completed arrangement immediately.
- The homepage, Baby quiz, and the other three love-letter destinations are unchanged.

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

### Bloodborne: name-only content

Bloodborne now includes the exact 50 supplied keywords: 15 people, 15 bosses,
and 20 important things. Five distinct rounds contain ten unique names each,
balanced at 3 people, 3 bosses, and 4 important things per round. Assignments
are randomly mixed but stable between visits; the displayed order reshuffles
on entry and when Shuffle is clicked.

All Bloodborne GIF spaces remain blank for now. To add an animation later,
assign its path to the corresponding exact name in `bloodborneGifs` inside
`memory-matching-data.js`, for example
`'The Hunter': '../assets/the-hunter.gif'`. Existing Lies of P, Terraria,
Shadow of the Colossus, and other categories are unchanged.

### Dark Souls and Dark Souls II: name-only content

The Dark Souls category now includes all 50 names from the provided table,
25 from Dark Souls I and 25 from Dark Souls II. Each of the five rounds
contains ten unique names: five from each game, mixing people, bosses
and important things. Groups are randomized once with fixed seeds so their
membership remains stable for future GIF attachment. The order of the names
on the board is shuffled whenever a round begins or Shuffle is pressed.

The name text is preserved exactly as given, including longer descriptive
entries and curly apostrophes. All GIF slots remain empty until chosen.
To link an animation later, add an exact-name key and path in
`darkSoulsGifs` in `memory-matching-data.js`, for example:
`'Solaire of Astora': '../assets/solaire.gif'`.
The other seven categories and all visuals are unchanged.

### Hollow Knight: name-only content

Hollow Knight now has the exact 50 names supplied: 14 characters,
16 bosses, 6 items, 4 resources and 10 places. Names are distributed
across the previously proposed five rounds of ten with no duplication.
The set of names assigned to each round remains stable, while the game
reshuffles their visible positions when a round starts or Shuffle is pressed.

All Hollow Knight GIF spaces remain blank. Later, match animations by exact
keyword in `hollowKnightGifs` inside `memory-matching-data.js`.

### Hollow Knight: Silksong: name-only content

Silksong now contains all 50 names from the supplied table: 8 characters,
14 bosses, 14 equipment/ability names and 14 places. Each of its five rounds
contains ten uniquely selected names, with a seeded shuffle that balances
characters, bosses, abilities and places across rounds. The names are shuffled
into fresh visual positions whenever a round is opened or Shuffle is pressed.

All Silksong GIF spaces remain empty. Future GIFs can be added by exact name
inside the `silksongGifs` map in `memory-matching-data.js`, for example
`'Sherma': '../assets/sherma.gif'`.

The matching mechanics, approved Gothic background, other six categories and
Word Search/home pages are unchanged.

### Sanrio: name-only content

Sanrio now contains all 50 exact names supplied by the owner: 36 characters,
2 workplace bosses from Aggretsuko and 12 places/groups/important things.
Five rounds each have 10 unique entries; 2 rounds include one workplace boss
each, and all rounds mix characters with other Sanrio names. Seeded shuffling
keeps the membership of each round consistent across page loads, while the
matching game shuffles the visible name positions on round start and Shuffle.

Sanrio GIF slots remain blank for now. To add an animation later, provide a
path keyed by the exact corresponding term inside `sanrioGifs` in
`memory-matching-data.js`, such as
`'Hello Kitty': '../assets/hello-kitty.gif'`.

All eight worlds now have name-only content: 400 names in 40 rounds, with no
GIFs configured. Existing category data, Gothic forest visuals, matching game
logic, homepage, and Word Search are untouched.

### Approved AI-painted world icons

Each of the eight category icons was generated as original AI artwork,
shown together on a review sheet, and explicitly approved by the owner
before this update. The eight individual tiles (not screen captures or
extracted game screenshots) were packed into
`assets/memory-approved-ai-icons.webp` in their approved order:

1. Lies of P: clockwork hand, glowing clock and blue butterfly
2. Terraria: pixel-art tree, pickaxe and blue slime
3. Shadow of the Colossus: rider, horse and towering stone giant
4. Bloodborne: hunter silhouette and crimson moon
5. Dark Souls: flaming greatsword among ruined arches
6. Hollow Knight: white-horned wanderer, blue butterflies and flowers
7. Hollow Knight: Silksong: red-cloaked needle warrior
8. Sanrio: pink neon bow-wearing cat portrait

The live category buttons select these artworks by world ID. Category button
borders remain gold until explicit selection, then gain their existing purple
glow. The selected world header uses the same approved artwork rather than
a generic symbol. The watercolor/gothic background, 400 names, all blank GIF
slots and matching logic are unchanged.

### Islamic Hangman: 400 playable levels (November 2026)

The approved Gothic Hangman interface at `chapters/hangman.html` is preserved,
including the separately approved AI-painted background, gold navigation,
illustrated five-stage gallows, keyboard, Restart and Hint (3).

The puzzle bank in `hangman-phrases.js` has **400 unique answers**, mixing
Islamic words, recognizable terms, short phrases, and factual sentences.
They are organized into eight topics with 50 levels each:

1. The Quran
2. The Prophets
3. The Seerah (life of Prophet Muhammad)
4. Worship
5. Faith & Values
6. Islamic History
7. Sacred Places
8. Islamic Terms

The ninth option, **Random — All Topics**, plays the full set of 400 in a
fixed shuffled order, avoiding repeats in that run. Each individual topic
provides its own stable 50-level sequence. A small **Level X of 50 / 400**
indicator and non-spoiler topic clue appear above the answer blanks.

- Five incorrect guesses end a puzzle, with each error advancing the
  on-screen SVG illustration.
- Three hints per puzzle reveal an unguessed correct letter without
  using a mistake; multiple instances of a letter appear together.
- Correct guesses fill letter slots; spaces and punctuation are displayed.
  Multiple-word answers wrap as groups for readability on phones.
- **Restart** replays the current level. **Next Level** appears after
  a win or loss and advances to the following puzzle. At the last level,
  it offers to replay from Level 1.
- The current level for each topic and Random mode, plus completed puzzles,
  are stored in browser `localStorage` under
  `rayans-dark-forest.islam-hangman.v1`.
- The content targets a **moderate** knowledge level, mixing familiar
  concepts with more specific terms. English transliterations of Arabic
  words can vary; the puzzle answer displays the chosen form. The content
  is original puzzle wording rather than quotations from scripture.

General cross-check references for fundamental terms and practices:
[Islamic Relief UK — Five Pillars](https://www.islamic-relief.org.uk/resources/knowledge-base/five-pillars-of-islam/),
[Pew Research Center — Glossary](https://www.pewresearch.org/religion/2017/07/26/appendix-a-glossary/).
These are background references, not sources for every individual puzzle.

The memory matching game (400 names, 40 rounds, GIFs still blank),
Word Search, and the homepage have not been changed by this update.

### Hangman guess feedback and level-completion effects

- The wrong-guess number is calculated from the **distinct incorrect letters**
  guessed on the current puzzle. It displays `0 / 5 wrong` through
  `5 / 5 wrong`, in sync with the five diamonds and hangman illustration.
  Duplicate guesses, correct letters, and hints do **not** increment it.
- Each new wrong letter briefly shakes the answer frame and pulses pink-red
  light through the answer, gallows frame, and filled diamonds.
- Completing every letter produces original CSS gold, pink and violet petal
  confetti and a prominent **LEVEL COMPLETE!** result panel with a
  **MOVE TO NEXT LEVEL** button immediately below the answer.
- The button also appears on a loss, allowing continuation rather than
  blocking the level path. Restart replays the current answer.
- Switching categories, restarting, or proceeding clears any effects and
  resets the mistake counter. Reduced-motion preferences are respected.



### Hollow Knight Matching Memory — Round 1 animated GIFs

The first Hollow Knight round now includes 10 distinct animated clue GIFs,
stored under `assets/hollow-knight/round-1/`. They correspond one-to-one
to The Knight, Quirrel, Elderbug, False Knight, Soul Master, Watcher Knights,
Dream Nail, Geo, Hallownest, and Dirtmouth. Each animation has subject-specific
movement or local effects over a fixed scenic layer, rather than scrolling
the background. The approved AI-painted visual references were used for
the characters and setting; there are no screenshot-based UI overlays.

The exact name-to-animation mapping lives in `hollowKnightGifs` in
`memory-matching-data.js`. The matching game shuffles the image and name
columns separately, but comparisons use stable IDs, so the order cannot
change correctness. A line appears only when the selected image and name
are a correct pair. Finishing all ten matches saves Round 1 completion.

Filled image slots show **the animation without a 'GIF' badge**.
Rounds 2–5 of Hollow Knight, and all other categories, retain their
name-only lists and blank GIF columns until their artwork is created.

### Compact Memory Matching board

The Memory Matching playboard shows all ten picture cards and all ten name
cards in a **two-column by five-row grid on each side**. Its card proportions
remain 16:7 (the original 480x210 GIF ratio). A single SVG overlay sits
behind the clickable cards, with connection lines calculated from each
actual matched GIF/name button position. Incorrect selections never draw a
connection. Existing match IDs, shuffled positions, round completion and
400 name entries are unchanged.

The board scales its maximum width based on the viewport height so that its
five rows fit at ordinary laptop/desktop sizes without vertical page
scrolling. Mid-size tablets show a horizontally scrollable category strip
above a larger game board. Very narrow phones use a **horizontal swipe
within the game board** rather than shrinking the 20 controls until they
are unreadable; the five rows remain grouped without internal vertical
scrolling. The approved background and AI-painted category icons remain.

Round 1 of Hollow Knight still uses the same ten approved GIF assets;
further background/animation revisions are a separate content stage.


## Word Search · Music on each world

The Word Search has its own built-in player, separate from sound effects and all other games. Each of the seven puzzle worlds has an independent playlist. Music starts when you enter a world, stays on the same track as you switch its five levels, advances to the next song, and stops when you return to the seven-world menu. Use **Play / Pause**, **Next**, and the **♫** settings button; the player is only displayed inside Word Search levels.

**Add music once on each device/browser:** Download your audio albums from the private [Google Drive music folder](https://drive.google.com/drive/folders/1S38pJPgosGG6fcqvf70Gvw7U2NmgZ0s5), and extract downloaded ZIP files. Open any Word Search level, press **♫**, and choose **Import downloaded album folders** to select a folder containing the ten named soundtrack subfolders. The app maps Dark Souls 1/2 to Dark Souls, Lies of P to Lies, Bloodborne to Bloodborne, Mandalorian / Jedi Survivor to Star Wars, Terraria to Terraria, Kawaii Lofi to Princess, and Hollow Knight / Silksong to Hollow Knight. Alternatively, use **Add songs to this world** to choose MP3s for only the current category. MP3 is recommended; MP4 audio plays only when the browser supports its codec. Files are saved privately in browser IndexedDB, not uploaded to GitHub or sent to a server. Check that the browser has enough available storage. Browser data clearing or using a new device requires importing again.

**Autoplay limits:** Clicking a world usually permits the soundtrack to start immediately. If the browser blocks sound on a restored/direct link, tap **Play** or touch the puzzle once. A manual Pause is respected until you press Play or enter a different world. Since private Drive files cannot be streamed directly by a public static website, the existing recordings are not embedded or published in this public repository. Only file imports on the user's device enable playback.

## Whole-app Cozy Library background music (November 2026)

All twelve HTML pages, including the main forest, Scavenger Hunt, Memory Matching, Treasure Trail, Hangman, Word Search selection screen, Secret Love Notes and all five letter destinations, now load `forest-music.js` and `forest-music.css`. The compact, bottom-left **Cozy Library** controls offer Play/Pause, volume and an import/settings menu.

**First-use setup (per device and browser):** Open the homepage, select **⚙** beside Cozy Library, press **Choose Cozy Library MP3**, and choose the supplied `Cozy Library ｜ Smooth Fireside Jazz, Rainy Window & Fireplace Sounds for Reading.mp3` (or another audio recording you are authorized to use). The music is saved privately in browser IndexedDB and can be played on every app page. The original uploaded MP3 is more than 100 MB and was deliberately not added to this public GitHub repository; no Drive credentials or recordings are exposed. Browser storage must have sufficient free space. Changing devices or clearing site data requires a new import.

When navigating between pages, the website resumes the most recently saved position where browser playback permissions allow. Pressing **Pause** persists the pause preference across pages; Play resumes it. On direct entry or after some full-page navigations, browsers may prohibit autoplay with sound until a tap or keypress; an explicit Play button is available. Static HTML pages cannot guarantee uninterrupted, cross-navigation audio. The current playback automatically pauses and the Cozy player hides inside any **Word Search category level**, allowing the existing category-specific music player to run without simultaneous background audio. Returning to the Word Search selection screen resumes Cozy Library when not manually paused.

The music player is independent of sound-effect toggles in the games. It does not modify puzzles, progress, artwork or rules.
