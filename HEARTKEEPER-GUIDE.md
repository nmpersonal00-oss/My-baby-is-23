# The Last Heartkeeper — Player Guide

This original, self-contained illustrated game is unlocked from **Mystery Treasure Trail** after finding the six-digit secret in **Scavenger Hunt**. The original door artwork and code **670304** remain unchanged.

## How to play

1. Enter the treasure door's correct code, and the secret kingdom opens. A short **How to Play** introduction appears on the first visit.
2. The brightest floating symbol in a painted environment is the next recommended thing to touch. Follow the short objective at the bottom; use the **?** icon whenever you need detailed instructions.
3. **The Moonlit Labyrinth:** turn the mirror symbols in the order described by its riddle, cross the bridge by choosing three pictured symbols, and find the butterfly with a crescent on its wings three times.
4. **The Clockmaker's Curse:** cross the numbered stones in order, switching to **Past** for moons and **Present** for roses. Then stop the clock hand at the gold arc three times.
5. **The Vault of Wishes:** listen to all three paintings, use their clues to set the heart seal, and choose the correct display case for the Heart Key.
6. **The Eclipse Warden:** read each announced attack. An attack from the left means **Dodge Right**; an attack from the right means **Dodge Left**; for an **Eclipse Pulse**, **Raise Shield**. When the Warden is exposed, choose the correct relic. Three phases have checkpoints.
7. Touch the restored heart to discover the personal ending.

The journal records collected relics and optional memory petals. Chapter progress saves automatically in the same browser. On mobile, swipe sideways across the illustrated world to view the whole panorama.

## Presentation and accessibility

- All six backgrounds are original AI paintings stored locally in `assets/heartkeeper/` as WebP images.
- The experience uses CSS perspective, cursor-responsive depth, foreground parallax, particles and lighting. This is **cinematic 2.5D**, not polygon-based free-roaming 3D; there are no third-party engines or remote assets.
- Custom SVG icons, keyboard-accessible puzzle controls, visible focus states, screen reader labels, and reduced-motion support are included.
- The forest's other games are unchanged.
- The secret game page uses a same-tab session flag from the existing Treasure Trail code unlock; it is a story gate, **not cryptographic access control** on a static site.

## Troubleshooting

If the secret game sends you back to the door, enter the six-digit code again in the same browser tab. To replay or reset, use the Journal in the upper-right. If sound is off, use the question-mark guide to enable original chimes.

