/*
 * Matching Memory content — intentionally blank until we add your GIFs and names.
 *
 * There are eight categories and five rounds in each category.
 * Each round's `pairs` array can eventually contain up to TEN items, e.g.
 *   { name: 'Character Name', gif: '../assets/character-name.gif' }
 *
 * `gif` may also be a direct https:// GIF/image URL you have permission to use.
 * A pair only becomes clickable when BOTH its name and GIF are filled in.
 * Do not add placeholder/fake answers: empty arrays leave the board visibly empty.
 */
(() => {
  'use strict';
  const categories = [
    ['hollow-knight', 'Hollow Knight', 'Where little lights are never forgotten', 'forest-04.png'],
    ['silksong', 'Hollow Knight: Silksong', 'Silken threads beneath the moon', 'forest-03.png'],
    ['colossus', 'Shadow of the Colossus', 'An adventure beyond the mist', 'forest-02.png'],
    ['lies-of-p', 'Lies of P', 'A clockwork heart remembers', 'realm-lies.webp'],
    ['terraria', 'Terraria', 'Treasures hidden in the enchanted woods', 'realm-indie.webp'],
    ['dark-souls', 'Dark Souls', 'Embers that never truly fade', 'realm-souls.webp'],
    ['bloodborne', 'Bloodborne', 'Moonlight and whispered secrets', 'realm-blood.webp'],
    ['sanrio', 'Sanrio', 'Sweet little memories and magic', 'realm-princess.webp']
  ];
  window.MEMORY_MATCH_DATA = categories.map(([id, title, tagline, artwork]) => ({
    id, title, tagline, artwork,
    rounds: [
      { pairs: [] }, // Round 1 — ten GIF/name pairs can be added here
      { pairs: [] }, // Round 2
      { pairs: [] }, // Round 3
      { pairs: [] }, // Round 4
      { pairs: [] }  // Round 5
    ]
  }));
})();
