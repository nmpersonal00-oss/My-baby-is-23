/* Rayan's Enchanted Word Hunt — self-contained, no backend, no game libraries. */
(() => {
  'use strict';
  const REALMS = window.WS_REALMS;
  const app = document.getElementById('app');
  const announcer = document.getElementById('announcer');
  const soundButton = document.getElementById('sound-switch');
  if (!app || !Array.isArray(REALMS) || REALMS.length !== 7) return;
  const STORE = 'rayans-dark-forest.wordsearch.v1';
  const abc = text => text.toUpperCase().replace(/[^A-Z]/g, '');
  const esc = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const heart = `<svg viewBox="0 0 32 29" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M16 27C11 21 2 15 2 8 2 .5 12-1 16 7 20-1 30 .5 30 8c0 7-9 13-14 19Z"/></svg>`;
  const sparkle = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m12 2 2.3 7.7L22 12l-7.7 2.3L12 22l-2.3-7.7L2 12l7.7-2.3L12 2Z"/></svg>`;
  const chevron = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m15 5-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const rand = seed => () => {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
  const directions = [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
  const boards = new Map();
  const load = () => {
    try {
      const data = JSON.parse(localStorage.getItem(STORE) || '{}');
      return data && typeof data === 'object' ? {found: data.found && typeof data.found === 'object' ? data.found : {}, hints: data.hints && typeof data.hints === 'object' ? data.hints : {}} : {found:{},hints:{}};
    } catch { return {found:{},hints:{}}; }
  };
  let progress = load();
  let game = null;
  let soundEnabled = false;
  let audio = null;
  let victory = null;
  let announced = '';
  const keyFor = (realm, level) => `${realm.id}:${level}`;
  const getFound = (realm, level) => {
    const valid = new Set(realm.chapters[level].words.map(abc));
    const stored = progress.found[keyFor(realm, level)];
    return new Set(Array.isArray(stored) ? stored.filter(item => valid.has(item)) : []);
  };
  const save = () => { try {localStorage.setItem(STORE, JSON.stringify(progress));} catch {notice('Progress is saved while this tab stays open. Browser storage is unavailable.');} };
  function stats() {
    let levels = 0, words = 0;
    REALMS.forEach(realm => realm.chapters.forEach((chapter,index) => {
      const count = getFound(realm,index).size;
      words += count;
      if (count === 35) levels++;
    }));
    return {levels, words, worlds: REALMS.filter(realm => realm.chapters.every((c,i)=>getFound(realm,i).size===35)).length};
  }
  function notice(message) {
    announced = message;
    announcer.textContent = message;
    const msg = document.getElementById('game-feedback');
    if (msg) msg.textContent = message;
  }
  function chime(notes = [523,659,784]) {
    if (!soundEnabled) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      audio ||= new Audio();
      if (audio.state === 'suspended') audio.resume();
      const time = audio.currentTime;
      notes.forEach((frequency,i) => {
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.type = 'sine'; oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(.0001,time+i*.085);
        gain.gain.exponentialRampToValueAtTime(.075,time+i*.085+.025);
        gain.gain.exponentialRampToValueAtTime(.0001,time+i*.085+.32);
        oscillator.connect(gain); gain.connect(audio.destination);
        oscillator.start(time+i*.085); oscillator.stop(time+i*.085+.34);
      });
    } catch { /* Sound is optional. The puzzle never depends on it. */ }
  }
  soundButton.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundButton.setAttribute('aria-pressed',String(soundEnabled));
    soundButton.title = soundEnabled ? 'Magical sounds (on)' : 'Magical sounds (off)';
    soundButton.querySelector('#sound-label').textContent = soundEnabled ? 'Sound on' : 'Sound off';
    soundButton.querySelector('svg').innerHTML = soundEnabled ? '<path d="M4 9v6h4l6 4V5L8 9H4Z" stroke-linejoin="round"/><path d="M17 9a5 5 0 0 1 0 6M19 5a10 10 0 0 1 0 14" stroke-linecap="round"/>' : '<path d="M4 9v6h4l6 4V5L8 9H4Z" stroke-linejoin="round"/><path d="M18 9l4 6m0-6-4 6" stroke-linecap="round"/>';
    if (soundEnabled) chime([523,659]);
  });
  function makeBoard(realmIndex, levelIndex) {
    const realm = REALMS[realmIndex], chapter = realm.chapters[levelIndex];
    const cacheKey = keyFor(realm,levelIndex);
    if (boards.has(cacheKey)) return boards.get(cacheKey);
    const entries = chapter.words.map(label => ({label,code:abc(label)}));
    const hash = [...cacheKey].reduce((number,char) => ((number*31+char.charCodeAt(0))>>>0),0);
    let board = null;
    // Retry deterministically when the tighter boards cannot fit all 35 words.
    for (let dimension = 24+levelIndex; dimension <= 34 && !board; dimension++) {
      for (let attempt = 0; attempt < 9 && !board; attempt++) {
        const random = rand((hash ^ (dimension * 1373107) ^ (attempt * 279470273)) >>> 0 || 1);
        const cells = Array(dimension * dimension).fill('');
        const placed = [];
        const ordered = [...entries].sort((a,b) => b.code.length - a.code.length || a.code.localeCompare(b.code));
        let failed = false;
        for (const entry of ordered) {
          const word = entry.code;
          let best = null;
          for (let tries=0; tries<1250; tries++) {
            const [dr,dc] = directions[Math.floor(random()*8)];
            const row = Math.floor(random()*dimension), col = Math.floor(random()*dimension);
            const endRow = row + (word.length-1)*dr, endCol = col + (word.length-1)*dc;
            if (endRow < 0 || endCol < 0 || endRow >= dimension || endCol >= dimension) continue;
            const path = Array.from({length:word.length}, (_,i) => (row+i*dr)*dimension+col+i*dc);
            let conflicts = false, overlap = 0;
            for(let i=0;i<path.length;i++) {
              const letter = cells[path[i]];
              if (letter && letter !== word[i]) { conflicts = true; break; }
              if (letter) overlap++;
            }
            if (conflicts) continue;
            // Favor intersecting words, but preserve variety among valid paths.
            const score = overlap*4 + random()*8;
            if (!best || score > best.score) best = {path,score};
            if (overlap >= Math.min(7,Math.ceil(word.length*.6))) break;
          }
          if (!best) {failed = true; break;}
          best.path.forEach((position,i) => {cells[position] = word[i];});
          placed.push({...entry,cells:best.path});
        }
        if (!failed) {
          for (let i=0;i<cells.length;i++) if (!cells[i]) cells[i] = String.fromCharCode(65 + Math.floor(random()*26));
          board = {size:dimension,letters:cells,placed,lookup:new Map(placed.map(entry=>[entry.code,entry]))};
        }
      }
    }
    if (!board) throw Error('Could not generate this forest chapter.');
    boards.set(cacheKey,board);
    return board;
  }
  function titleHero() {
    return `<section class="hero"><p class="eyebrow">Six enchanted volumes · Thirty moonlit chapters</p><h1>The <span class="accent">Enchanted</span> Word Hunt</h1><div class="gold-flourish">${heart}</div><p class="tagline">For my sweet boy, every letter hides a little magic.</p><span class="tiny-caption"><b>6</b> puzzle worlds &nbsp; · &nbsp; <b>5</b> levels each &nbsp; · &nbsp; <b>35</b> words per level</span></section>`;
  }
  function renderLibrary() {
    game = null;
    const count = stats();
    app.innerHTML = `${titleHero()}
      <section class="overview" aria-label="Saved progress"><strong>Your enchanted journey</strong><div class="stats"><span><b>${count.worlds}</b> / 6 collections complete</span><span><b>${count.levels}</b> / 30 chapters complete</span><span><b>${count.words}</b> / 1,050 words found</span></div><div class="progress-track" style="flex-basis:100%"><div class="progress-fill" style="--percent:${count.levels/30*100}%"></div></div></section>
      <section class="world-grid" aria-label="Choose a puzzle collection">
      ${REALMS.map((realm,r) => {
        const done = realm.chapters.filter((chapter,i)=>getFound(realm,i).size===35).length;
        const started = realm.chapters.map((chapter,i)=>getFound(realm,i).size);
        return `<article class="realm-card" data-realm="${esc(realm.id)}"><div class="card-art" aria-hidden="true"></div><div class="card-content"><span class="card-number">BOOK ${String(r+1).padStart(2,'0')} · FIVE CHAPTERS</span><h2 class="realm-title">${esc(realm.title)}</h2><p class="realm-subtitle">${esc(realm.tagline)}</p><div class="card-spacer"></div><div class="level-pips" aria-label="Five playable levels">
        ${realm.chapters.map((chapter,l)=>`<button type="button" class="level-pip ${started[l]===35?'done':started[l]>0?'started':''} ${realm.id==='princess'?'pink':''}" data-open="${r}:${l}" title="${esc(chapter.name)} — ${started[l]} of 35 words found" aria-label="${esc(realm.title)} level ${l+1}, ${started[l]} of 35 found">${started[l]===35?'✓':l+1}</button>`).join('')}</div><div class="card-bottom"><span>${done} / 5 complete</span><div class="progress-track" aria-hidden="true"><div class="progress-fill" style="--percent:${done*20}%"></div></div><b>${Math.round(done*20)}%</b></div></div></article>`;
      }).join('')}</section><p class="little-love">Each finished chapter is remembered on this device. Choose any level and return whenever you like.</p>`;
    app.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click',()=> {
      const [r,l] = button.dataset.open.split(':').map(Number);
      location.hash = `#/${REALMS[r].id}/${l+1}`;
    }));
  }
  function renderChapter(realmIndex, levelIndex) {
    const realm = REALMS[realmIndex];
    const chapter = realm.chapters[levelIndex];
    const board = makeBoard(realmIndex,levelIndex);
    const found = getFound(realm,levelIndex);
    game = {realmIndex,levelIndex,board,found,pending:null,gesture:null,preview:[],hinted:[]};
    const hintCount = Math.min(3,Number(progress.hints[keyFor(realm,levelIndex)])||0);
    app.innerHTML = `<section class="chapter-head"><div class="chapter-crumb"><a href="#library" class="back-library">${chevron} All 7 worlds</a><small>BOOK ${realmIndex+1} / CHAPTER ${levelIndex+1}</small></div><nav class="level-switch" aria-label="Choose level"><span>LEVEL</span>${realm.chapters.map((c,i)=>`<button class="level-button ${i===levelIndex?'active':''} ${getFound(realm,i).size===35?'completed':''}" data-level="${i}" title="${esc(c.name)}" aria-label="Level ${i+1}: ${esc(c.name)}" ${i===levelIndex?'aria-current="step"':''}>${i+1}</button>`).join('')}</nav></section>
      <section class="chapter-title-block"><p class="eyebrow">${esc(realm.title)}</p><h1>${esc(chapter.name)}</h1><p>${esc(chapter.subtitle)}</p><div class="chapter-meta"><span class="meta-chip">Level <b>${levelIndex+1}</b> / 5</span><span class="meta-chip"><b>35</b> words</span><span class="meta-chip">Straight · Backward · Diagonal</span></div></section>
      <section class="play-layout" aria-label="Interactive word search game" style="--realm-glow:${esc(realm.color)}"><div class="board-frame"><div class="board-ornament">${sparkle} The hidden letters ${sparkle}</div><div class="board-scroller" id="board-scroller"><div class="letter-grid" id="letter-grid" role="group" aria-label="${board.size} by ${board.size} word search grid. Tap the first and last letter of each word. You can also drag." style="--cell:clamp(23px,1.93vw,29px);grid-template-columns:repeat(${board.size},var(--cell))">${board.letters.map((letter,index)=>`<button type="button" class="letter" data-i="${index}" aria-label="Row ${Math.floor(index/board.size)+1}, column ${index%board.size+1}: ${letter}">${letter}</button>`).join('')}</div></div><div class="board-scroll-controls"><button type="button" class="pan-button" data-pan="-1" aria-label="Move grid to the left">${chevron}</button><span>Move across the letter map</span><button type="button" class="pan-button" data-pan="1" aria-label="Move grid to the right" style="transform:rotate(180deg)">${chevron}</button></div><p class="board-instructions"><b>Drag</b> across letters, or <b>tap the first and last letter</b>. Find all 35 to complete this chapter.</p><p class="game-feedback" id="game-feedback" role="status" aria-live="polite"></p></div>
      <aside class="word-frame"><div class="word-title"><h2>Words to discover</h2><span class="word-count" id="word-count">${found.size} / 35</span></div><div class="word-progress"><div class="progress-track"><div class="progress-fill" id="word-progress" style="--percent:${found.size/35*100}%"></div></div></div><div class="words-list" id="words-list">${[...chapter.words].sort((a,b)=>a.localeCompare(b)).map(label => `<div class="word-chip ${found.has(abc(label))?'done':''}" data-code="${abc(label)}"><span class="word-dot" aria-hidden="true"></span><span>${esc(label)}</span></div>`).join('')}</div><div class="tool-row"><button type="button" class="gold-button" id="hint-button" ${hintCount>=3||found.size>=35?'disabled':''}>${sparkle} <span id="hint-label">Hint (${3-hintCount} left)</span></button><button type="button" class="ghost-button" id="restart-button">Restart level</button></div><p class="mini-help">Every correctly found word lights up gold. Your discoveries are saved automatically.</p></aside></section>`;
    const grid = document.getElementById('letter-grid');
    const buttonNodes = [...grid.querySelectorAll('.letter')];
    game.buttonNodes = buttonNodes;
    updateFoundVisuals();
    document.querySelectorAll('[data-level]').forEach(button => button.addEventListener('click',() => {
      location.hash = `#/${realm.id}/${Number(button.dataset.level)+1}`;
      if (Number(button.dataset.level)===levelIndex) renderChapter(realmIndex,levelIndex);
    }));
    document.getElementById('hint-button').addEventListener('click', hint);
    document.getElementById('restart-button').addEventListener('click', () => {
      if (!confirm('Start this level over? All 35 word discoveries for this level will be cleared.')) return;
      progress.found[keyFor(realm,levelIndex)] = [];
      progress.hints[keyFor(realm,levelIndex)] = 0;
      save();renderChapter(realmIndex,levelIndex);notice('A fresh chapter is ready. Every word is hidden again.');
    });
    document.querySelectorAll('[data-pan]').forEach(button => button.addEventListener('click',() => {
      document.getElementById('board-scroller').scrollBy({left:Number(button.dataset.pan)*260,behavior:'smooth'});
    }));
    const cellAt = event => {
      const element = document.elementFromPoint(event.clientX,event.clientY)?.closest?.('.letter');
      return element && grid.contains(element) ? Number(element.dataset.i) : null;
    };
    grid.addEventListener('pointerdown',event => {
      if (event.button !== 0 || !event.target.closest('.letter')) return;
      const first = Number(event.target.closest('.letter').dataset.i);
      game.gesture = {start:first,last:first,moved:false};
      try {grid.setPointerCapture(event.pointerId);} catch{}
      paintPreview(game.pending !== null ? game.pending : first,first);
    });
    grid.addEventListener('pointermove',event => {
      if (!game?.gesture) return;
      const index = cellAt(event);
      if (index === null) return;
      if (index !== game.gesture.start) game.gesture.moved = true;
      game.gesture.last = index;
      paintPreview(game.gesture.start,index);
    });
    grid.addEventListener('pointerup',event => {
      if (!game?.gesture) return;
      const gesture = game.gesture;
      const end = cellAt(event) ?? gesture.last;
      game.gesture = null;
      if (gesture.moved && end !== gesture.start) {
        game.pending = null;
        submit(gesture.start,end);
      } else if (game.pending === null) {
        game.pending = gesture.start;
        paintPreview(gesture.start,gesture.start);
        notice('First letter chosen. Choose the last letter of the word.');
      } else if (game.pending === gesture.start) {
        game.pending = null; paintPreview(null,null);
        notice('Selection cleared. Choose a new first letter.');
      } else {
        const from = game.pending;
        game.pending = null;
        submit(from,gesture.start);
      }
    });
    grid.addEventListener('pointercancel',()=> {if(game)game.gesture=null; paintPreview(game?.pending ?? null,game?.pending ?? null);});
    // Keyboard (Enter or Space) taps without pointer events.
    grid.addEventListener('click', event => {
      if (event.detail !== 0 || !game) return;
      const cell = event.target.closest('.letter');
      if (!cell) return;
      const index = Number(cell.dataset.i);
      if (game.pending === null) {game.pending=index;paintPreview(index,index);notice('First letter chosen. Choose its last letter.');}
      else {const start=game.pending;game.pending=null;submit(start,index);}
    });
    if (found.size === 35) notice('This chapter is complete. You can replay it, or choose another chapter.');
    else notice(`Chapter ${levelIndex+1}: ${35-found.size} words left to discover.`);
  }
  function pathBetween(start,end) {
    if (!game || start === null || end === null) return [];
    const size = game.board.size;
    const r0=Math.floor(start/size), c0=start%size, r1=Math.floor(end/size),c1=end%size;
    const dr=r1-r0,dc=c1-c0;
    if (dr!==0 && dc!==0 && Math.abs(dr)!==Math.abs(dc)) return [];
    const steps=Math.max(Math.abs(dr),Math.abs(dc));
    if (!steps) return [start];
    return Array.from({length:steps+1},(_,n)=>(r0+n*Math.sign(dr))*size+c0+n*Math.sign(dc));
  }
  function paintPreview(from,to) {
    if (!game) return;
    const path = pathBetween(from,to);
    for (const index of game.preview) {
      game.buttonNodes[index]?.classList.remove('preview','pending');
    }
    game.preview = path;
    path.forEach((index,i) => game.buttonNodes[index]?.classList.add(i===0?'pending':'preview'));
  }
  function updateFoundVisuals() {
    if (!game) return;
    const {board,found,buttonNodes} = game;
    const lit=new Set();
    for(const word of found) board.lookup.get(word)?.cells.forEach(i=>lit.add(i));
    buttonNodes.forEach((cell,i) => {cell.classList.toggle('found',lit.has(i)); cell.setAttribute('aria-pressed',String(lit.has(i)));});
    document.querySelectorAll('.word-chip').forEach(entry => entry.classList.toggle('done',found.has(entry.dataset.code)));
    document.getElementById('word-count').textContent = `${found.size} / 35`;
    document.getElementById('word-progress').style.setProperty('--percent',`${found.size/35*100}%`);
  }
  function submit(start,end) {
    if (!game) return;
    const path = pathBetween(start,end);
    paintPreview(null,null);
    if (path.length <= 1) {notice('Choose the first and last letter of a hidden word.'); return;}
    const match = game.board.placed.find(entry => entry.cells.length === path.length &&
      (entry.cells.every((cell,i)=>cell===path[i]) || entry.cells.every((cell,i)=>cell===path[path.length-i-1])));
    if (!match) {notice('That trail hides no listed word. Try a straight path, backwards or diagonally.');return;}
    if (game.found.has(match.code)) {notice(`Already found: ${match.label}. Try another!`);return;}
    game.found.add(match.code);
    const realm = REALMS[game.realmIndex];
    progress.found[keyFor(realm,game.levelIndex)] = [...game.found];
    save(); updateFoundVisuals(); chime();
    if (game.found.size === 35) {
      notice(`All 35 discovered! ${realm.chapters[game.levelIndex].name} is complete.`);
      chime([659,784,1047,1318]);
      showVictory();
    } else {
      notice(`${match.label} found! ${35-game.found.size} more to uncover.`);
    }
  }
  function hint() {
    if (!game) return;
    const realm = REALMS[game.realmIndex];
    const key = keyFor(realm,game.levelIndex);
    const used = Math.min(3, Number(progress.hints[key])||0);
    if (used >= 3 || game.found.size>=35) return;
    const unFound = game.board.placed.filter(entry => !game.found.has(entry.code) && !game.hinted.includes(entry.code));
    const options = unFound.length ? unFound : game.board.placed.filter(entry => !game.found.has(entry.code));
    const chosen = options[0]; if (!chosen) return;
    game.hinted.push(chosen.code);
    progress.hints[key] = used+1;save();
    const cell=game.buttonNodes[chosen.cells[0]];
    const scroller=document.getElementById('board-scroller');
    scroller.scrollTo({left:Math.max(0,cell.offsetLeft-scroller.clientWidth/2),behavior:'smooth'});
    cell.classList.remove('hint-flash'); void cell.offsetWidth;cell.classList.add('hint-flash');
    const button=document.getElementById('hint-button');
    document.getElementById('hint-label').textContent = `Hint (${2-used} left)`;
    if (used+1>=3) button.disabled=true;
    notice(`A glowing letter marks the beginning of ${chosen.label}.`);
  }
  function showVictory() {
    if (victory) victory.remove();
    const realm=REALMS[game.realmIndex];
    const level=game.levelIndex;
    victory=document.createElement('div');
    victory.className='victory-shade';
    victory.innerHTML=`<div class="victory-card" role="dialog" aria-modal="true" aria-labelledby="victory-heading"><div class="victory-heart">${heart}</div><p class="eyebrow">An enchanted chapter completed</p><h2 id="victory-heading">You found them all!</h2><p>All 35 words of <em>${esc(realm.chapters[level].name)}</em> now shine in the forest. Your progress has been saved, my sweet boy.</p><div class="victory-actions"><button type="button" class="ghost-button" data-victory="books">Choose a book</button><button type="button" class="gold-button" data-victory="next">${level<4?'Next chapter':'See all levels'} ${sparkle}</button></div></div>`;
    for(let i=0;i<35;i++) {
      const star=document.createElement('i'); star.className='confetti-star';
      const angle=i*2.399, radius=90+(i*17)%260;
      star.style.setProperty('--tx',`${Math.cos(angle)*radius}px`);
      star.style.setProperty('--ty',`${Math.sin(angle)*radius}px`);
      star.style.animationDelay=`${(i%7)*.04}s`;
      victory.append(star);
    }
    document.body.append(victory);
    victory.querySelector('[data-victory="next"]').focus();
    victory.addEventListener('click',event=>{
      const choice=event.target.closest('[data-victory]')?.dataset.victory;
      if (!choice) return;
      victory.remove();victory=null;
      if(choice==='books' || level===4) location.hash='#library';
      else location.hash=`#/${realm.id}/${level+2}`;
    });
    const dismiss=event => {
      if(event.key!=='Escape')return;
      victory?.remove();victory=null;window.removeEventListener('keydown',dismiss);
    };
    window.addEventListener('keydown',dismiss,{once:true});
  }
  function route() {
    if(victory){victory.remove();victory=null;}
    const hash=decodeURIComponent(location.hash);
    const match=hash.match(/^#\/([a-z]+)\/([1-5])$/);
    if (!match) {renderLibrary();return;}
    const realmIndex=REALMS.findIndex(realm => realm.id===match[1]);
    if (realmIndex<0) {renderLibrary();return;}
    renderChapter(realmIndex,Number(match[2])-1);
    window.scrollTo({top:0,behavior:'instant'});
  }
  // The fireflies are decorative and never obstruct inputs.
  if (!window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
    const dust=document.getElementById('fairy-dust');
    const random=rand(91276241);
    for(let i=0;i<37;i++) {
      const star=document.createElement('i');star.className='wisp';
      star.style.setProperty('--x',`${random()*100}%`);
      star.style.setProperty('--y',`${random()*100}%`);
      star.style.setProperty('--duration',`${4+random()*6}s`);
      star.style.setProperty('--delay',`${-random()*8}s`);
      dust.append(star);
    }
  }
  window.addEventListener('hashchange',route);
  route();
  // A small optional test hook; never used for gameplay and never writes progress.
  Object.defineProperty(window,'forestWordSearchDiagnostics',{value:()=>REALMS.map((r,ri)=>({realm:r.id,levels:r.chapters.map((c,li)=>({count:c.words.length,size:makeBoard(ri,li).size,placed:makeBoard(ri,li).placed.length}))})),configurable:false});
})();
