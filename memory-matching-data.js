/*
 * Matching Memory content.
 *
 * Lies of P and Terraria each have 50 user-chosen names, spread across
 * 5 rounds of 10 in a repeatable, randomized order. GIFs are blank for now.
 *
 * To add a GIF later, assign its keyword to a GIF URL in liesOfPGifs
 * or terrariaGifs. For example, inside liesOfPGifs:
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

  // Terraria: the 15 people, 15 bosses, and 20 important things supplied.
  // These are deliberately shuffled together across all five rounds.
  const terrariaKeywords = [
    "Guide",
    "Merchant",
    "Demolitionist",
    "Dye Trader",
    "Angler",
    "Arms Dealer",
    "Goblin Tinkerer",
    "Witch Doctor",
    "Clothier",
    "Painter",
    "Party Skeleton (Skeleton Merchant)",
    "Pirate",
    "Truffle",
    "Wizard",
    "Tax Collector",
    "King Slime",
    "Eye of Cthulhu",
    "Eater of Worlds",
    "Brain of Cthulhu",
    "Skeletron",
    "Deerclops",
    "Wall of Flesh",
    "The Destroyer",
    "The Twins",
    "Skeletron Prime",
    "Plantera",
    "Golem",
    "Duke Fishron",
    "Lunatic Cultist",
    "Moon Lord",
    "Life Crystal",
    "Mana Crystal",
    "Life Fruit",
    "Magic Mirror",
    "Recall Potion",
    "Grappling Hook",
    "Hermes Boots",
    "Obsidian Shield",
    "Pylon",
    "Demon Altar",
    "Shadow Orb",
    "Crimson Heart",
    "Guide Voodoo Doll",
    "Pwnhammer",
    "Hardmode",
    "The Hallow",
    "Chlorophyte Ore",
    "Terra Blade",
    "Celestial Sigil",
    "Zenith"
  ];
  const terrariaGifs = {}; // Add GIFs by exact keyword later.


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

  // Shuffle each source pool independently so that every round includes
  // 3 Terraria people, 3 bosses and 4 important things (10 total).
  // Group membership stays fixed for adding the correct GIF later.
  // The actual positions are randomized again on every round/replay.
  const shuffledPeople = shuffledForLevels(terrariaKeywords.slice(0, 15), 20261115);
  const shuffledBosses = shuffledForLevels(terrariaKeywords.slice(15, 30), 20261116);
  const shuffledThings = shuffledForLevels(terrariaKeywords.slice(30, 50), 20261117);
  const terrariaRounds = Array.from({length:5}, (_, round) => ({
    pairs: shuffledForLevels([
      ...shuffledPeople.slice(round * 3, round * 3 + 3),
      ...shuffledBosses.slice(round * 3, round * 3 + 3),
      ...shuffledThings.slice(round * 4, round * 4 + 4)
    ], 20261200 + round).map(name => ({
      name, gif: terrariaGifs[name] || ''
    }))
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
      : id === 'terraria'
        ? terrariaRounds
        : Array.from({length:5}, () => ({pairs: []}))
  }));
})();
