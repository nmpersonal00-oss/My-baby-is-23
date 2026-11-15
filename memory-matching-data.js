/*
 * Matching Memory content.
 *
 * Lies of P now has 50 unique user-chosen names, spread across 5 rounds
 * of 10 in a repeatable, randomized order. All GIFs are intentionally blank.
 *
 * To add a Lies of P GIF later, give the exact keyword a file path below,
 * e.g. add a key/value pair to liesOfPGifs such as:
 *   'Pinocchio': '../assets/pinocchio.gif'
 * Each GIF will then match its keyword wherever that keyword appears.
 *
 * For other worlds, add { name: 'Character', gif: '../assets/character.gif' }
 * objects to a round's pairs array. Each round supports up to 10 pairs.
 */
(() => {
  'use strict';

  const liesOfPKeywords = [
  "Lies of P",
  "Pinocchio",
  "Krat",
  "Hotel Krat",
  "Krat Central Station",
  "Elysion Boulevard",
  "Venigni Works",
  "St. Frangelico Cathedral",
  "Malum District",
  "Grand Exhibition",
  "Barren Swamp",
  "Relic of Trismegistus",
  "Arche Abbey",
  "Geppetto",
  "Venigni",
  "Gemini",
  "Simon Manus",
  "Alidoro",
  "Puppet Frenzy",
  "Grand Covenant",
  "Petrification Disease",
  "Ergo",
  "Stargazer",
  "P-Organ",
  "Legion Arm",
  "Puppet String",
  "Fulminis",
  "Flamberge",
  "Aegis",
  "Falcon Eyes",
  "Pandemonium",
  "Deus Ex Machina",
  "Fable Arts",
  "Perfect Guard",
  "Guard Regain",
  "Fatal Attack",
  "Pulse Cell",
  "Wishstone",
  "Gold Coin Fruit",
  "Black Rabbit Brotherhood",
  "Parade Master",
  "Scrapped Watchman",
  "King’s Flame, Fuoco",
  "Fallen Archbishop Andreus",
  "King of Puppets",
  "Champion Victor",
  "Green Monster of the Swamp",
  "Nameless Puppet",
  "Two Dragons Sword",
  "Golden Lie"
  ];

  // Empty until we select each keyword's GIF together.
  const liesOfPGifs = {};

  // Deterministic shuffle: the 50 names are genuinely mixed across rounds,
  // but each round keeps its own ten names after a refresh. The actual order
  // of the ten name tiles is shuffled again whenever a round is opened.
  function shuffledForLevels(values, seed) {
    const list = values.slice();
    let state = seed >>> 0;
    for (let index = list.length - 1; index > 0; index--) {
      state = (Math.imul(1664525, state) + 1013904223) >>> 0;
      const swap = state % (index + 1);
      [list[index], list[swap]] = [list[swap], list[index]];
    }
    return list;
  }
  const liesOfPRounds = Array.from({length:5}, (_, round) => ({
    pairs: shuffledForLevels(liesOfPKeywords, 20261114)
      .slice(round * 10, (round + 1) * 10)
      .map(name => ({name, gif: liesOfPGifs[name] || ''}))
  }));

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
    rounds: id === 'lies-of-p'
      ? liesOfPRounds
      : Array.from({length:5}, () => ({pairs: []}))
  }));
})();
