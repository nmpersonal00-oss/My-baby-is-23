# Custom animated GIF library — memory-matching game

This folder contains the **exact 350 answer names** used across all non-Hollow-Knight categories.
The original Hollow Knight category is intentionally excluded and must not be edited.

The inventory lives in `assets/memory-gif-inventory.json`. Every answer has one distinct
`assets/<category>/<slug>.gif` destination, independent of shuffled card order.

## Requirements

- Cinematic, recognizable character/location/object artwork matching the **exact answer**
- An actual looped GIF, **480 × 210 pixels**, at least 2 animated frames
- No answer text burned into the art (the matching game's answer should remain a clue)
- Do not fill missing assets with generic icons, recycled unrelated pictures, or placeholders

## Installing verified artwork

Copy completed GIFs into the paths in the inventory, install Pillow (`pip install Pillow`),
then run `python scripts/install-memory-gifs.py` at the repository root. This validates
the GIFs, updates only the seven relevant category name-to-GIF maps in
`memory-matching-data.js`, and increments its cache-busting version in
`chapters/memory-game.html`.

Unfinished answers remain blank. The script intentionally never changes `hollowKnightGifs`
or any existing Hollow Knight assets.
