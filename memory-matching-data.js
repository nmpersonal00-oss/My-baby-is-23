/*
 * Matching Memory content.
 *
 * All eight categories now each have 50 owner-supplied names across
 * five rounds of 10. GIFs are added by exact keyword. Unassigned GIFs remain blank until added.
 *
 * To add a GIF later, assign its keyword to a GIF URL in liesOfPGifs,
 * terrariaGifs, colossusGifs, bloodborneGifs, darkSoulsGifs,
 * hollowKnightGifs, silksongGifs, or sanrioGifs.
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


  // Hollow Knight: the 50 exact names and the five previously proposed sets.
  // These round memberships remain stable for future GIF matching.
  const hollowKnightRoundNames = [
    [
      "The Knight",
      "Quirrel",
      "Elderbug",
      "False Knight",
      "Soul Master",
      "Watcher Knights",
      "Dream Nail",
      "Geo",
      "Hallownest",
      "Dirtmouth"
    ],
    [
      "Cornifer",
      "Sly",
      "Zote the Mighty",
      "Failed Champion",
      "Soul Tyrant",
      "Traitor Lord",
      "Mothwing Cloak",
      "Essence",
      "Forgotten Crossroads",
      "Greenpath"
    ],
    [
      "Tiso",
      "Nailsmith",
      "Nailmaster Oro",
      "Dung Defender",
      "White Defender",
      "Uumuu",
      "Mantis Claw",
      "Pale Ore",
      "Fungal Wastes",
      "City of Tears"
    ],
    [
      "Nailmaster Mato",
      "Paintmaster Sheo",
      "Relic Seeker Lemm",
      "Broken Vessel",
      "Lost Kin",
      "Nosk",
      "Crystal Heart",
      "SOUL",
      "Deepnest",
      "Crystal Peak"
    ],
    [
      "Grubfather",
      "The Last Stag",
      "The Hollow Knight",
      "Pure Vessel",
      "Troupe Master Grimm",
      "Nightmare King Grimm",
      "Monarch Wings",
      "Isma’s Tear",
      "The Abyss",
      "Black Egg Temple"
    ]
  ];
  // Approved action loops for Hollow Knight Rounds 1 and 2. Each entry is keyed
  // by its exact answer, so shuffling never changes match correctness.
  const hollowKnightGifs = {
    "The Knight": '../assets/hollow-knight/round-1/r01-01-the-knight.gif?v=2',
    "Quirrel": '../assets/hollow-knight/round-1/r01-02-quirrel.gif?v=2',
    "Elderbug": '../assets/hollow-knight/round-1/r01-03-elderbug.gif?v=2',
    "False Knight": '../assets/hollow-knight/round-1/r01-04-false-knight.gif?v=2',
    "Soul Master": '../assets/hollow-knight/round-1/r01-05-soul-master.gif?v=2',
    "Watcher Knights": '../assets/hollow-knight/round-1/r01-06-watcher-knights.gif?v=2',
    "Dream Nail": '../assets/hollow-knight/round-1/r01-07-dream-nail.gif?v=2',
    "Geo": '../assets/hollow-knight/round-1/r01-08-geo.gif?v=2',
    "Hallownest": '../assets/hollow-knight/round-1/r01-09-hallownest.gif?v=2',
    "Dirtmouth": '../assets/hollow-knight/round-1/r01-10-dirtmouth.gif?v=2',
    "Cornifer": '../assets/hollow-knight/round-2/r02-01-cornifer.gif?v=1',
    "Sly": '../assets/hollow-knight/round-2/r02-02-sly.gif?v=1',
    "Zote the Mighty": '../assets/hollow-knight/round-2/r02-03-zote-the-mighty.gif?v=1',
    "Failed Champion": '../assets/hollow-knight/round-2/r02-04-failed-champion.gif?v=1',
    "Soul Tyrant": '../assets/hollow-knight/round-2/r02-05-soul-tyrant.gif?v=1',
    "Traitor Lord": '../assets/hollow-knight/round-2/r02-06-traitor-lord.gif?v=1',
    "Mothwing Cloak": '../assets/hollow-knight/round-2/r02-07-mothwing-cloak.gif?v=1',
    "Essence": '../assets/hollow-knight/round-2/r02-08-essence.gif?v=1',
    "Forgotten Crossroads": '../assets/hollow-knight/round-2/r02-09-forgotten-crossroads.gif?v=1',
    "Greenpath": '../assets/hollow-knight/round-2/r02-10-greenpath.gif?v=1',
    "Tiso": '../assets/hollow-knight/round-3/r03-01-tiso.gif?v=1',
    "Nailsmith": '../assets/hollow-knight/round-3/r03-02-nailsmith.gif?v=1',
    "Nailmaster Oro": '../assets/hollow-knight/round-3/r03-03-nailmaster-oro.gif?v=1',
    "Dung Defender": '../assets/hollow-knight/round-3/r03-04-dung-defender.gif?v=1',
    "White Defender": '../assets/hollow-knight/round-3/r03-05-white-defender.gif?v=1',
    "Uumuu": '../assets/hollow-knight/round-3/r03-06-uumuu.gif?v=1',
    "Mantis Claw": '../assets/hollow-knight/round-3/r03-07-mantis-claw.gif?v=1',
    "Pale Ore": '../assets/hollow-knight/round-3/r03-08-pale-ore.gif?v=1',
    "Fungal Wastes": '../assets/hollow-knight/round-3/r03-09-fungal-wastes.gif?v=1',
    "City of Tears": '../assets/hollow-knight/round-3/r03-10-city-of-tears.gif?v=1',
    "Nailmaster Mato": '../assets/hollow-knight/round-4/r04-01-nailmaster-mato.gif?v=3',
    "Paintmaster Sheo": '../assets/hollow-knight/round-4/r04-02-paintmaster-sheo.gif?v=3',
    "Relic Seeker Lemm": '../assets/hollow-knight/round-4/r04-03-relic-seeker-lemm.gif?v=2',
    "Broken Vessel": '../assets/hollow-knight/round-4/r04-04-broken-vessel.gif?v=2',
    "Lost Kin": '../assets/hollow-knight/round-4/r04-05-lost-kin.gif?v=2',
    "Nosk": '../assets/hollow-knight/round-4/r04-06-nosk.gif?v=3',
    "Crystal Heart": '../assets/hollow-knight/round-4/r04-07-crystal-heart.gif?v=3',
    "SOUL": '../assets/hollow-knight/round-4/r04-08-soul.gif?v=3',
    "Deepnest": '../assets/hollow-knight/round-4/r04-09-deepnest.gif?v=3',
    "Crystal Peak": '../assets/hollow-knight/round-4/r04-10-crystal-peak.gif?v=3'
  };
  const hollowKnightRounds = hollowKnightRoundNames.map(names => ({
    pairs: names.map(name => ({name, gif: hollowKnightGifs[name] || ''}))
  }));

  // Silksong: 8 characters, 14 bosses, 14 abilities/equipment and 14 places.
  // Seeded category shuffles mix the terms while ensuring every round has
  // characters, bosses, equipment, and places rather than clustering them.
  const silksongCharacters = [
    "Sherma",
    "Garmond",
    "Green Prince",
    "Grindle",
    "Fleamaster Mooshka",
    "Mister Mushroom",
    "Lumble the Lucky",
    "Vaultkeeper Cardinius"
  ];
  const silksongBosses = [
    "Fourth Chorus",
    "Moorwing",
    "Skull Tyrant",
    "Great Conchflies",
    "Trobbio",
    "Father of the Flame",
    "Voltvyrm",
    "Groal the Great",
    "Forebrothers Signis & Gron",
    "Crawfather",
    "Crust King Khann",
    "Gurr the Outcast",
    "Shrine Guardian Seth",
    "Raging Conchfly"
  ];
  const silksongAbilities = [
    "Needolin",
    "Silkspear",
    "Swift Step",
    "Cling Grip",
    "Drifter’s Cloak",
    "Faydown Cloak",
    "Clawline",
    "Silk Soar",
    "Thread Storm",
    "Cross Stitch",
    "Sharpdart",
    "Rune Rage",
    "Pale Nails",
    "Needle Strike"
  ];
  const silksongPlaces = [
    "Pharloom",
    "Bonebottom",
    "Moss Grotto",
    "The Marrow",
    "Deep Docks",
    "Far Fields",
    "Greymoor",
    "Shellwood",
    "Bellhart",
    "Blasted Steps",
    "The Citadel",
    "Underworks",
    "Mount Fay",
    "The Slab"
  ];
  const silksongGifs = {}; // e.g. 'Sherma': '../assets/sherma.gif'

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


  // Each round receives a stable mixed set of ten. The game handles a fresh
  // visible shuffle every time a round is selected or Shuffle is pressed.
  const mixedSilksong = {
    characters: shuffledForLevels(silksongCharacters, 20261126),
    bosses: shuffledForLevels(silksongBosses, 20261127),
    abilities: shuffledForLevels(silksongAbilities, 20261128),
    places: shuffledForLevels(silksongPlaces, 20261129)
  };
  const silksongPerRound = [
    [2, 3, 3, 2],
    [2, 3, 2, 3],
    [2, 2, 3, 3],
    [1, 3, 3, 3],
    [1, 3, 3, 3]
  ];
  const silksongPools = [
    mixedSilksong.characters,
    mixedSilksong.bosses,
    mixedSilksong.abilities,
    mixedSilksong.places
  ];
  const silksongOffsets = [0, 0, 0, 0];
  const silksongRounds = silksongPerRound.map((counts, round) => {
    const names = counts.flatMap((count, category) => {
      const start = silksongOffsets[category];
      silksongOffsets[category] += count;
      return silksongPools[category].slice(start, start + count);
    });
    return {
      pairs: shuffledForLevels(names, 20261240 + round)
        .map(name => ({name, gif: silksongGifs[name] || ''}))
    };
  });


  // Sanrio: 36 named characters, 2 Aggretsuko workplace bosses,
  // and 12 places, groups and important things from the owner's list.
  // Exact names/punctuation are preserved (including red bow and Café).
  const sanrioCharacters = [
    "Hello Kitty",
    "Dear Daniel",
    "My Melody",
    "Kuromi",
    "Cinnamoroll",
    "Pompompurin",
    "Pochacco",
    "Keroppi",
    "Chococat",
    "Badtz-Maru",
    "Kiki",
    "Lala",
    "Tuxedosam",
    "Hangyodon",
    "Mimmy",
    "Charmmy Kitty",
    "My Sweet Piano",
    "Wish Me Mell",
    "Gudetama",
    "Cogimyun",
    "Pekkle",
    "Monkichi",
    "Marroncream",
    "Bonbonribbon",
    "Usahana",
    "Corocorokuririn",
    "Kirimichan",
    "Tiny Chum",
    "Patty",
    "Jimmy",
    "Littleforestfellow",
    "Strawberry King",
    "Gaopowerroo",
    "Hanamaruobake",
    "Retsuko",
    "Fenneko"
  ];
  const sanrioBosses = [
    "Director Ton",
    "Director Gori"
  ];
  const sanrioThings = [
    "Sanrio Puroland",
    "Harmonyland",
    "Little Twin Stars",
    "Sugarbunnies",
    "Lloromannic",
    "Jewelpet",
    "Aggretsuko",
    "Show By Rock!!",
    "Hello Kitty’s red bow",
    "Café Cinnamon",
    "Hello Kitty Island Adventure",
    "Sanrio Character Ranking"
  ];
  // Round 1: custom animated GIF artwork lives in assets/sanrio/round-1.
  const sanrioGifs = {}; // Awaiting faithful, visually verified animation artwork.

  // Fixed mixed groups, freshly randomized board positions each time.
  // Rounds 2 and 4 include one workplace boss each; every round includes
  // several places/groups/items alongside characters.
  const sanrioCharacterPool = shuffledForLevels(sanrioCharacters, 20261201);
  const sanrioBossPool = shuffledForLevels(sanrioBosses, 20261202);
  const sanrioThingsPool = shuffledForLevels(sanrioThings, 20261203);
  const sanrioRoundDistribution = [
    [8, 0, 2],
    [7, 1, 2],
    [7, 0, 3],
    [7, 1, 2],
    [7, 0, 3]
  ];
  const sanrioOffsets = [0, 0, 0];
  const sanrioPools = [sanrioCharacterPool, sanrioBossPool, sanrioThingsPool];
  const sanrioRounds = sanrioRoundDistribution.map((counts, round) => {
    const names = counts.flatMap((count, category) => {
      const start = sanrioOffsets[category];
      sanrioOffsets[category] += count;
      return sanrioPools[category].slice(start, start + count);
    });
    return {
      pairs: shuffledForLevels(names, 20261270 + round)
        .map(name => ({name, gif: sanrioGifs[name] || ''}))
    };
  });

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
    rounds: id === 'hollow-knight'
      ? hollowKnightRounds
      : id === 'silksong'
        ? silksongRounds
        : id === 'lies-of-p'
          ? liesOfPRounds
      : id === 'terraria'
        ? terrariaRounds
        : id === 'colossus'
          ? colossusRounds
          : id === 'bloodborne'
            ? bloodborneRounds
            : id === 'dark-souls'
              ? darkSoulsRounds
              : id === 'sanrio'
                ? sanrioRounds
                : Array.from({length:5}, () => ({pairs: []}))
  }));
})();
