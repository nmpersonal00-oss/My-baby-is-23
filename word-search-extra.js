/* Seven independently playable illustrated realms. Preserves the old word-search progress. */
(() => {
 'use strict';
 const list=window.WS_REALMS;
 if(!Array.isArray(list)||list.length!==6)return;
 const indie=list.find(x=>x.id==='indie'), princess=list.find(x=>x.id==='princess');
 if(!indie||!princess)return;
 const toList=x=>x.split('|').map(w=>w.trim()).filter(Boolean);
 const norm=x=>x.toUpperCase().replace(/[^A-Z]/g,'');
 const makeChapter=(name,subtitle,focus,core)=>{
   const seen=new Set(), words=[];
   [...toList(focus),...toList(core)].forEach(w=>{const k=norm(w);if(k.length>=3&&k.length<=24&&!seen.has(k)){seen.add(k);if(words.length<35)words.push(w)}});
   if(words.length!==35)throw Error('Missing themed words in '+name+': '+words.length);
   return {name,subtitle,words};
 };
 const tc='Terraria|Pickaxe|Workbench|Anvil|Furnace|Hellforge|Sawmill|Loom|Pylon|Nurse|Merchant|Dryad|Guide|Arms Dealer|Demolitionist|Goblin Tinkerer|Steampunker|Witch Doctor|Wizard|Mechanic|Truffle|Pirate|Party Girl|Princess|Angler|Painter|Zoologist|Stylist|Clothier|Slime|Jungle|Desert|Snow Biome|Corruption|Crimson|Hallow|Dungeon|Underworld|Hardmode|Crafting|Mana|Life Fruit|Terra Blade|Zenith|Wings';
 const hc='Hornet|The Knight|Hallownest|Pharloom|Silksong|Soul|Nail|Mask|Vessel|Essence|Dream Nail|Silk|Crest|Caravan|Bell|Chant|Needle|Rosary|Charm|Grub|Bench|Stag Station|Shade|Void|Pale King|White Lady|Radiance|Mantis|Sentry|Fungal|Crystal|Moss|Shell|Weaver|Pilgrim|Citadel|Choir|Deepnest|Dirtmouth|Dreamer|Lantern|Stag|Moth';
 const terraria={id:'terraria',title:'Terraria',tagline:'Dig, discover, and defeat the moon',color:'#a0db83',chapters:[
 indie.chapters[0],indie.chapters[1],
 makeChapter('Metals and Magic','A treasure map beneath the earth','Obsidian|Cobalt|Palladium|Mythril|Orichalcum|Adamantite|Titanium|Chlorophyte|Luminite|Soul of Night|Soul of Light|Soul of Fright|Soul of Might|Soul of Sight|Mana Flower|Celestial Magnet|Band of Starpower|Sorcerer Emblem|Mana Regeneration|Crystal Ball|Magic Cuffs|Spectre Armor|Nebula Armor|Last Prism|Razorblade Typhoon|Golden Shower|Crystal Storm|Sky Fracture',tc),
 makeChapter('Build Your Kingdom','A home in every biome','Living Wood|Mahogany|Marble|Granite|Honey Block|Ash Block|Dirt Block|Mud Block|Sandstone|Mushroom Grass|Tinkerers Workshop|Alchemy Table|Crystal Ball|Extractinator|Hallowed Bar|Chlorophyte Bar|Living Loom|Keg|Cooking Pot|Dye Vat|Cannon|Graveyard|Goblin Scout|Sunflower|Daybloom|Moonglow|Blinkroot|Fireblossom',tc),
 makeChapter('Lunar Reckoning','The final fight beneath the stars','Solar Pillar|Vortex Pillar|Nebula Pillar|Stardust Pillar|Celestial Sigil|Stardust Dragon|Solar Eruption|Daybreak|Phantasm|Vortex Beater|Nebula Blaze|Nebula Arcanum|Meowmere|Star Wrath|Terrarian|Last Prism|Lunar Portal|Moon Lord|True Excalibur|True Nights Edge|Terra Blade|Zenith|Celestial Shell|Celestial Stone|Ankh Shield|Master Ninja Gear|Frozen Turtle Shell|Wings',tc)
 ]};
 const hollow={id:'hollow',title:'Hollow Knight & Silksong',tagline:'Hallownest to Pharloom',color:'#c2d4f5',chapters:[
 indie.chapters[2],indie.chapters[3],indie.chapters[4],
 makeChapter('Charms of Hallownest','A charm for every little knight','Wayward Compass|Gathering Swarm|Stalwart Shell|Soul Catcher|Shaman Stone|Soul Eater|Dashmaster|Sprintmaster|Grubsong|Grubberfly Elegy|Fragile Heart|Fragile Greed|Fragile Strength|Spell Twister|Steady Body|Heavy Blow|Quick Slash|Longnail|Mark of Pride|Fury of the Fallen|Thorns of Agony|Baldur Shell|Flukenest|Defenders Crest|Glowing Womb|Quick Focus|Deep Focus|Lifeblood Heart|Hiveblood',hc),
 makeChapter('Echoes of Silk','A final pilgrimage through Pharloom','Hornet|Lace|Shakra|Bell Beast|Moss Mother|Sister Splinter|Grand Mother Silk|Last Judge|Moorwing|Trobbio|The Citadel|The Cradle|Bellhart|Greymoor|Shellwood|Bilewater|Deep Docks|Far Fields|Bone Bottom|Moss Grotto|Cogwork Core|Choral Chambers|The Marrow|Silk|Needle|Thread|Weaver|Pilgrim|Rosary|Crest',hc)
 ]};
 list.splice(list.findIndex(x=>x.id==='indie'),2,terraria,princess,hollow);
 // Migrate the 5 older combined levels without erasing anyone's progress.
 const key='rayans-dark-forest.wordsearch.v1';
 try{
   const save=JSON.parse(localStorage.getItem(key)||'{}');
   if(save?.found){
     [[0,'terraria',0],[1,'terraria',1],[2,'hollow',0],[3,'hollow',1],[4,'hollow',2]].forEach(([old,id,level])=>{
       const before='indie:'+old,after=id+':'+level;
       if(save.found[before]&&!save.found[after])save.found[after]=save.found[before];
       if(save.hints?.[before]!==undefined&&save.hints[after]===undefined)save.hints[after]=save.hints[before];
     });
     localStorage.setItem(key,JSON.stringify(save));
   }
 }catch{}
})();