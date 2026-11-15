/*
 * Matching Memory content.
 *
 * Lies of P, Terraria, Shadow of the Colossus, Bloodborne, and Dark Souls
 * each have 50 user-chosen names over 5 rounds of 10. GIFs stay blank.
 *
 * To add a GIF later, assign its keyword to a GIF URL in liesOfPGifs,
 * terrariaGifs, colossusGifs, bloodborneGifs, or darkSoulsGifs.
 * For example, inside liesOfPGifs:
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

  // Bloodborne: exactly 15 people, 15 bosses and 20 important things.
  // Every round will have 3 people, 3 bosses and 4 important things.
  const bloodbornePeople = [
    "The Hunter",
    "Gilbert",
    "Alfred",
    "Djura",
    "Valtr",
    "Master Willem",
    "Provost Laurence",
    "Brador",
    "Simon the Harrowed",
    "Younger Madaras Twin",
    "Henryk",
    "Suspicious Beggar",
    "Oedon Chapel Dweller",
    "Retired Hunter Djura’s Ally",
    "Blood Minister"
  ];
  const bloodborneBosses = [
    "Cleric Beast",
    "Father Gascoigne",
    "Darkbeast Paarl",
    "Shadows of Yharnam",
    "The One Reborn",
    "Micolash, Host of the Nightmare",
    "Gehrman, the First Hunter",
    "Martyr Logarius",
    "Ludwig, the Holy Blade",
    "Orphan of Kos",
    "Beast-possessed Soul",
    "Watchdog of the Old Lords",
    "Undead Giant",
    "Merciless Watchers",
    "Pthumerian Descendant"
  ];
  const bloodborneThings = [
    "Yharnam",
    "Hunter’s Dream",
    "Hunter’s Nightmare",
    "Fishing Hamlet",
    "Healing Church",
    "Byrgenwerth",
    "School of Mensis",
    "The Choir",
    "Great Ones",
    "Old Blood",
    "Beast Scourge",
    "Blood Echoes",
    "Insight",
    "Blood Vial",
    "Quicksilver Bullets",
    "Saw Cleaver",
    "Hunter Axe",
    "Trick Weapons",
    "Caryll Runes",
    "Chalice Dungeons"
  ];
  // Add an exact-name GIF path later (example: 'The Hunter': '../assets/the-hunter.gif').
  const bloodborneGifs = {};

  // Dark Souls I and II — 25 terms from each game.
  // Preserve the owner's exact terms, including the long descriptive names.
  const darkSoulsI = {
    people: [
      "Solaire of Astora",
      "Siegmeyer of Catarina",
      "Siegmeyer’s friend, Laurentius of the Great Swamp",
      "Big Hat Logan",
      "Griggs of Vinheim",
      "Andre of Astora",
      "Hawkeye Gough",
      "Knight Lautrec of Carim"
    ],
    bosses: [
      "Asylum Demon",
      "Taurus Demon",
      "Capra Demon",
      "Iron Golem",
      "Ornstein and Smough",
      "Great Grey Wolf Sif",
      "Gravelord Nito",
      "Seath the Scaleless",
      "Knight Artorias",
      "Gwyn"
    ],
    things: [
      "Firelink Shrine",
      "Anor Londo",
      "Estus Flask",
      "Humanity",
      "Bells of Awakening",
      "Rite of Kindling",
      "First Flame"
    ]
  };
  const darkSoulsII = {
    people: [
      "Benhart of Jugo",
      "Crestfallen Saulden",
      "Merchant Hag Melentia’s bodyguard, Royal Sorcerer Navlaan",
      "Straid of Olaphis",
      "Carhillion of the Fold",
      "Blacksmith Lenigrast",
      "Steady Hand McDuff",
      "Mild-Mannered Pate"
    ],
    bosses: [
      "The Last Giant",
      "The Pursuer",
      "Dragonrider",
      "Old Dragonslayer",
      "Flexile Sentry",
      "Executioner’s Chariot",
      "Old Iron King",
      "Vendrick",
      "Fume Knight",
      "Sir Alonne"
    ],
    things: [
      "Majula",
      "Drangleic Castle",
      "Estus Flask Shard",
      "Human Effigy",
      "King’s Ring",
      "Ashen Mist Heart",
      "Throne of Want"
    ]
  };
  // To attach a GIF in the future: 'Solaire of Astora': '../assets/solaire.gif'
  const darkSoulsGifs = {};

  // Shadow of the Colossus: five agreed sets of ten unique names.
  // The group membership is fixed; the board shuffles positions on each play.
  const colossusRoundNames = [
    [
      "Wander",
      "Valus",
      "Quadratus",
      "Gaius",
      "Forbidden Lands",
      "Shrine of Worship",
      "Ancient Sword",
      "Great Bridge",
      "Weak-point sigils",
      "Grip meter"
    ],
    [
      "Emon",
      "Phaedra",
      "Avion",
      "Barba",
      "Bow and arrows",
      "Save shrines",
      "Secret Garden",
      "Stone idols",
      "Reflected sunlight",
      "Sword stab"
    ],
    [
      "Dormin",
      "Hydrus",
      "Kuromori",
      "Basaran",
      "Colossus fur",
      "White-tailed lizards",
      "Fruit trees",
      "Time Attack",
      "Whistling Arrow",
      "Ancient Harpoon"
    ],
    [
      "Agro",
      "Dirge",
      "Celosia",
      "Pelagia",
      "Sword of the Sun",
      "Queen’s Sword",
      "Cloak of Invisibility",
      "Cloak of Deception",
      "Mask of Strength",
      "Mask of Power"
    ],
    [
      "Emon’s soldiers",
      "Phalanx",
      "Cenobia",
      "Argus",
      "Malus",
      "Mask of the Shaman",
      "Cloak of Force",
      "Flash Arrow",
      "Fruit Tree Map",
      "Lizard Detection Stone"
    ]
  ];
  // Later: 'Wander': '../assets/wander.gif'
  const colossusGifs = {};
  const colossusRounds = colossusRoundNames.map(names => ({
    pairs: names.map(name => ({name, gif: colossusGifs[name] || ''}))
  }));


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

  // Seeded shuffles keep the 5 groups stable while the game independently
  // randomizes visible tile order whenever a round starts or Shuffle is clicked.
  const bloodbornePeopleMixed = shuffledForLevels(bloodbornePeople, 20261118);
  const bloodborneBossesMixed = shuffledForLevels(bloodborneBosses, 20261119);
  const bloodborneThingsMixed = shuffledForLevels(bloodborneThings, 20261120);
  const bloodborneRounds = Array.from({length:5}, (_, round) => ({
    pairs: shuffledForLevels([
      ...bloodbornePeopleMixed.slice(round * 3, round * 3 + 3),
      ...bloodborneBossesMixed.slice(round * 3, round * 3 + 3),
      ...bloodborneThingsMixed.slice(round * 4, round * 4 + 4)
    ], 20261210 + round).map(name => ({
      name, gif: bloodborneGifs[name] || ''
    }))
  }));

  // Each round holds exactly 5 Dark Souls I names and 5 Dark Souls II
  // names. Both games contribute characters, bosses and important things.
  // Distinct, seeded randomized sets remain stable so GIFs can be attached
  // to the exact names later; the board also shuffles tile positions on play.
  function darkSoulsSections(game, seed) {
    return {
      people: shuffledForLevels(game.people, seed),
      bosses: shuffledForLevels(game.bosses, seed + 1),
      things: shuffledForLevels(game.things, seed + 2)
    };
  }
  const darkSoulsIShuffled = darkSoulsSections(darkSoulsI, 20261121);
  const darkSoulsIIShuffled = darkSoulsSections(darkSoulsII, 20261124);
  function fiveTermsForGame(group, round) {
    const peopleStart = round < 3 ? round * 2 : 6 + (round - 3);
    const peopleCount = round < 3 ? 2 : 1;
    const thingsStart = round < 3 ? round : 3 + (round - 3) * 2;
    const thingsCount = round < 3 ? 1 : 2;
    return [
      ...group.people.slice(peopleStart, peopleStart + peopleCount),
      ...group.bosses.slice(round * 2, round * 2 + 2),
      ...group.things.slice(thingsStart, thingsStart + thingsCount)
    ];
  }
  const darkSoulsRounds = Array.from({length:5}, (_, round) => ({
    pairs: shuffledForLevels([
      ...fiveTermsForGame(darkSoulsIShuffled, round),
      ...fiveTermsForGame(darkSoulsIIShuffled, round)
    ], 20261220 + round).map(name => ({name, gif: darkSoulsGifs[name] || ''}))
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
        : id === 'colossus'
          ? colossusRounds
          : id === 'bloodborne'
            ? bloodborneRounds
            : id === 'dark-souls'
              ? darkSoulsRounds
              : Array.from({length:5}, () => ({pairs: []}))
  }));
})();
