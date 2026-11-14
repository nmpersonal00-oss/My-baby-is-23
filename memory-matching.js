(function memoryMatching(){
  'use strict';
  const app=document.getElementById('memory-app');
  const announcer=document.getElementById('memory-announcer');
  const soundButton=document.getElementById('memory-sound');
  const worlds=window.MEMORY_MATCH_DATA;
  if(!app||!announcer||!soundButton||!Array.isArray(worlds)||worlds.length===0)return;

  const STORAGE='rayans-dark-forest.gif-name-matching.v1';
  const MAX_SLOTS=10;
  const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const heart='<svg viewBox="0 0 32 29" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M16 27C11 21 2 15 2 8 2 .5 12-1 16 7 20-1 30 .5 30 8c0 7-9 13-14 19Z"/></svg>';
  const key=(world,level)=>world.id+':'+level;
  const state={completed:{}};
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE)||'{}');
    if(saved&&typeof saved==='object'&&saved.completed&&typeof saved.completed==='object'&&!Array.isArray(saved.completed)){
      state.completed=saved.completed;
    }
  }catch{/* An unavailable save store should never block the game. */}

  const safeImage=src=>{
    if(typeof src!=='string'||!src.trim())return '';
    try{
      const url=new URL(src.trim(),window.location.href);
      return url.protocol==='https:'||url.protocol==='http:'?url.href:'';
    }catch{return '';}
  };
  function pairsFor(world,level){
    const round=world.rounds&&world.rounds[level-1];
    const input=round&&Array.isArray(round.pairs)?round.pairs:[];
    const seen=new Set(),result=[];
    for(let i=0;i<input.length&&result.length<MAX_SLOTS;i++){
      const pair=input[i];
      if(!pair||typeof pair.name!=='string')continue;
      const name=pair.name.trim(),gif=safeImage(pair.gif);
      if(!name||!gif||seen.has(name.toLocaleLowerCase()))continue;
      seen.add(name.toLocaleLowerCase());
      result.push({id:i,name,gif});
    }
    return result;
  }
  const signature=pairs=>JSON.stringify(pairs.map(pair=>[pair.name,pair.gif]));
  const isDone=(world,level)=>{
    const pairs=pairsFor(world,level);
    return pairs.length>0&&state.completed[key(world,level)]===signature(pairs);
  };
  function saveDone(world,level,pairs){
    state.completed[key(world,level)]=signature(pairs);
    try{localStorage.setItem(STORAGE,JSON.stringify(state));}
    catch{announce('All matches found! Saving progress is unavailable in this browser.');}
  }
  const shuffled=values=>{
    const items=values.slice();
    for(let i=items.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [items[i],items[j]]=[items[j],items[i]];
    }
    return items;
  };
  let game=null,modal=null,soundOn=true,audio=null,hideWrongTimer=null;
  const totalDone=()=>worlds.reduce((total,world)=>total+Array.from({length:5},(_,idx)=>isDone(world,idx+1)?1:0).reduce((a,b)=>a+b,0),0);

  function clearTransient(){
    clearTimeout(hideWrongTimer);hideWrongTimer=null;
    if(modal){modal.remove();modal=null;}
  }
  function chime(notes){
    if(!soundOn)return;
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!Audio)return;
      audio ||= new Audio();
      if(audio.state==='suspended')audio.resume();
      const base=audio.currentTime;
      notes.forEach((pitch,i)=>{
        const osc=audio.createOscillator(),gain=audio.createGain();
        osc.type='sine';osc.frequency.value=pitch;
        gain.gain.setValueAtTime(.0001,base+i*.085);
        gain.gain.exponentialRampToValueAtTime(.06,base+i*.085+.025);
        gain.gain.exponentialRampToValueAtTime(.0001,base+i*.085+.29);
        osc.connect(gain);gain.connect(audio.destination);
        osc.start(base+i*.085);osc.stop(base+i*.085+.30);
      });
    }catch{/* Sound is optional. */}
  }
  soundButton.addEventListener('click',()=>{
    soundOn=!soundOn;
    soundButton.setAttribute('aria-pressed',String(soundOn));
    soundButton.setAttribute('aria-label',soundOn?'Turn magical sounds off':'Turn magical sounds on');
    document.getElementById('memory-sound-label').textContent=soundOn?'Sound on':'Sound off';
    if(soundOn)chime([523,659]);
  });
  function announce(message){
    announcer.textContent=message;
    const box=document.getElementById('memory-feedback');
    if(box)box.textContent=message;
  }

  // Mirrors the small, living golden fireflies used on the real forest homepage.
  function makeFireflies(){
    const field=document.getElementById('memory-fireflies');
    if(!field||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    let seed=1761;
    const random=()=>((seed=seed*16807%2147483647)-1)/2147483646;
    for(let i=0;i<43;i++){
      const fly=document.createElement('i');
      fly.className='memory-firefly';
      fly.style.setProperty('--x',(2+random()*96)+'%');
      fly.style.setProperty('--y',(4+random()*91)+'%');
      fly.style.setProperty('--size',(1.4+random()*2.2)+'px');
      fly.style.setProperty('--drift',(-17+random()*34)+'px');
      fly.style.setProperty('--duration',(3+random()*5)+'s');
      fly.style.setProperty('--delay',(-random()*6)+'s');
      field.appendChild(fly);
    }
  }

  function renderLibrary(){
    clearTransient();game=null;
    const done=totalDone(),total=worlds.length*5;
    const worldsDone=worlds.filter(world=>Array.from({length:5},(_,i)=>isDone(world,i+1)).every(Boolean)).length;
    app.innerHTML=`<section class="memory-hero" aria-labelledby="memory-heading">
      <p class="memory-eyebrow">A little wonderland of memories</p>
      <h1 id="memory-heading">Matching <em>Memory</em></h1>
      <div class="memory-flourish">${heart}</div>
      <p class="memory-hero-copy">Some memories are too precious to forget. Match each magical moving picture to the name it belongs to.</p>
      <p class="memory-caption">Eight enchanted worlds · Five rounds each · Made just for my sweet boy</p>
    </section>
    <section class="memory-overview" aria-label="Your progress">
      <strong>Our little enchanted journey</strong>
      <div class="overview-numbers">
        <span><b>${done}</b> / ${total} rounds</span>
        <span><b>${worldsDone}</b> / ${worlds.length} worlds</span>
      </div>
      <div class="memory-track" style="width:min(190px,100%);flex:0 1 190px;--progress:${done/total*100}%" role="progressbar" aria-label="Completed rounds" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"><span></span></div>
    </section>
    <section class="memory-worlds" aria-label="Choose a matching memory world">
      ${worlds.map((world,index)=>{
        const count=Array.from({length:5},(_,i)=>isDone(world,i+1)).filter(Boolean).length;
        const art=String(world.artwork||'').replace(/[^a-z0-9.-]/gi,'');
        return `<article class="memory-world">
          <div class="memory-world-art" aria-hidden="true" style="--world-image:url('../assets/${art}')"></div>
          <div class="memory-world-body">
            <span class="memory-world-index">ENCHANTED WORLD ${String(index+1).padStart(2,'0')}</span>
            <h2 class="memory-world-title"><a href="#/${esc(world.id)}/1">${esc(world.title)}</a></h2>
            <p class="memory-world-subtitle">${esc(world.tagline)}</p>
            <div class="memory-world-spacer"></div>
            <nav class="memory-levels" aria-label="${esc(world.title)} rounds">
              ${Array.from({length:5},(_,i)=>`<a class="memory-level ${isDone(world,i+1)?'done':''}" href="#/${esc(world.id)}/${i+1}" aria-label="${esc(world.title)}, round ${i+1}${isDone(world,i+1)?', completed':''}">${i+1}</a>`).join('')}
            </nav>
            <div class="memory-world-bottom">
              <span><b>${count}</b> / 5 rounds</span>
              <div class="memory-track" role="progressbar" aria-label="${esc(world.title)} progress" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${count}" style="--progress:${count*20}%"><span></span></div>
            </div>
          </div>
        </article>`;
      }).join('')}
    </section>`;
    document.title="Matching Memory · Rayan's Dark Forest";
  }

  function slotMarkup(side,pair,row){
    const isGif=side==='gif',name=isGif?'GIF':'name';
    if(!pair){
      return `<li><button type="button" class="memory-slot is-empty" disabled aria-label="Empty ${name} space ${row+1}"></button></li>`;
    }
    const content=isGif
      ?`<img src="${esc(pair.gif)}" alt="" loading="lazy" decoding="async">`
      :`<span>${esc(pair.name)}</span>`;
    const label=isGif?`GIF clue ${row+1}`:`${pair.name}, name choice ${row+1}`;
    return `<li><button type="button" class="memory-slot" data-side="${side}" data-pair="${pair.id}" data-row="${row}" aria-label="${esc(label)}" aria-pressed="false">${content}</button></li>`;
  }
  function renderGame(world,level){
    clearTransient();
    const pairs=pairsFor(world,level);
    const left=shuffled(pairs),right=shuffled(pairs);
    if(pairs.length>1){
      // Keep the two columns from appearing pre-matched by accident.
      for(let i=0;i<8&&right.every((pair,j)=>pair.id===left[j].id);i++){
        const first=right.shift();right.push(first);
      }
    }
    game={world,level,pairs,left,right,selected:null,matched:new Set(),locked:false,finished:false};
    const ready=pairs.length>0;
    const firstMessage=ready
      ?'Choose a GIF on the left and the matching name on the right.'
      :'The ten GIF spaces and ten name spaces are ready. We can add your pictures and names next.';
    app.innerHTML=`<section class="memory-game-nav">
      <a class="memory-return" href="#library">‹ &nbsp; All eight worlds</a>
      <nav class="memory-rounds" aria-label="Choose a round"><span class="memory-rounds-label">ROUND</span>
        ${Array.from({length:5},(_,i)=>`<a href="#/${esc(world.id)}/${i+1}" class="memory-round ${level===i+1?'current':''} ${isDone(world,i+1)?'done':''}" ${level===i+1?'aria-current="step"':''} aria-label="Round ${i+1}${isDone(world,i+1)?', completed':''}">${i+1}</a>`).join('')}
      </nav>
    </section>
    <header class="memory-game-hero">
      <p class="memory-eyebrow">The Enchanted Matching Memory · Round ${level} of 5</p>
      <h1>${esc(world.title)}</h1>
      <p>${esc(world.tagline)}</p>
    </header>
    <section class="memory-stage" aria-label="Match moving pictures to their names">
      <div class="memory-stats">
        <strong>Magical matches <b id="memory-count">0</b> / <b id="memory-total">${pairs.length||MAX_SLOTS}</b></strong>
        <span class="memory-stats-note">${ready?'Choose a picture, then its name':'All spaces intentionally empty for now'}</span>
      </div>
      <div class="memory-track memory-progress" id="memory-track" role="progressbar" aria-label="Matches found" aria-valuemin="0" aria-valuemax="${pairs.length||MAX_SLOTS}" aria-valuenow="0" style="--progress:0%"><span></span></div>
      <div class="memory-columns" id="memory-columns">
        <section class="memory-column" aria-label="GIF clues">
          <h2 class="memory-column-header"><span>Moving pictures</span><span>GIFS</span></h2>
          <ol class="memory-slot-list">${Array.from({length:MAX_SLOTS},(_,i)=>slotMarkup('gif',left[i],i)).join('')}</ol>
        </section>
        <div class="memory-thread" aria-hidden="true"><span class="memory-thread-rune">✧</span></div>
        <section class="memory-column" aria-label="Name choices">
          <h2 class="memory-column-header"><span>Matching names</span><span>WORDS</span></h2>
          <ol class="memory-slot-list">${Array.from({length:MAX_SLOTS},(_,i)=>slotMarkup('name',right[i],i)).join('')}</ol>
        </section>
        <svg id="memory-matched-lines" class="memory-matched-lines" aria-hidden="true"></svg>
      </div>
      <p id="memory-feedback" class="memory-feedback" role="status" aria-live="polite">${firstMessage}</p>
      <div class="memory-actions">
        <button type="button" class="memory-button" data-action="shuffle">Shuffle &amp; begin again</button>
        <a href="#library" class="memory-button secondary">Choose another world</a>
      </div>
      <p class="memory-tip">One matching GIF + one name makes a pair. Successful matches glow with a little golden thread.</p>
    </section>`;
    document.title=world.title+' · Matching Memory · Rayan\'s Dark Forest';
  }

  function paintState(){
    if(!game)return;
    const selected=game.selected;
    for(const button of document.querySelectorAll('#memory-columns [data-pair]')){
      const id=Number(button.dataset.pair);
      const chosen=selected&&selected.side===button.dataset.side&&selected.id===id;
      const done=game.matched.has(id);
      button.classList.toggle('is-selected',Boolean(chosen));
      button.classList.toggle('is-matched',done);
      button.setAttribute('aria-pressed',String(Boolean(chosen||done)));
      button.disabled=done;
    }
    const found=document.getElementById('memory-count');
    const track=document.getElementById('memory-track');
    if(found)found.textContent=game.matched.size;
    if(track){
      track.setAttribute('aria-valuenow',game.matched.size);
      track.style.setProperty('--progress',(game.matched.size/Math.max(1,game.pairs.length)*100)+'%');
    }
    drawConnections();
  }

  function drawConnections(){
    const board=document.getElementById('memory-columns');
    const svg=document.getElementById('memory-matched-lines');
    if(!game||!board||!svg)return;
    const bounds=board.getBoundingClientRect();
    if(bounds.width===0||bounds.height===0)return;
    svg.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);
    const paths=[];
    for(const id of game.matched){
      const gif=Array.from(board.querySelectorAll('[data-side="gif"]')).find(node=>Number(node.dataset.pair)===id);
      const name=Array.from(board.querySelectorAll('[data-side="name"]')).find(node=>Number(node.dataset.pair)===id);
      if(!gif||!name)continue;
      const a=gif.getBoundingClientRect(),b=name.getBoundingClientRect();
      const x1=a.right-bounds.left,y1=a.top+a.height/2-bounds.top;
      const x2=b.left-bounds.left,y2=b.top+b.height/2-bounds.top;
      const mid=(x1+x2)/2;
      paths.push(`<path d="M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}"/>`);
    }
    svg.innerHTML=paths.join('');
  }

  function completeRound(){
    if(!game||game.finished)return;
    game.finished=true;
    const {world,level,pairs}=game;
    saveDone(world,level,pairs);
    announce('Every moving picture has found its name. Beautifully matched!');
    chime([523,659,784,1046]);
    modal=document.createElement('div');
    modal.className='memory-victory-overlay';
    modal.id='memory-victory-overlay';
    modal.innerHTML=`<div class="memory-victory-card" role="dialog" aria-modal="true" aria-labelledby="memory-victory-heading">
      <div class="memory-victory-mark" aria-hidden="true">♡ ✧ ♡</div>
      <p class="memory-eyebrow">Every memory shines</p>
      <h2 id="memory-victory-heading">You found every match, my sweet boy!</h2>
      <p>All ${pairs.length} pictures found their names. This enchanted round is now saved for you.</p>
      <div class="memory-actions">
        <button type="button" class="memory-button secondary" data-action="replay">Play this round again</button>
        <a class="memory-button" href="${level<5?`#/${esc(world.id)}/${level+1}`:'#library'}">${level<5?'Next round ✧':'Choose another world'}</a>
      </div>
    </div>`;
    document.body.appendChild(modal);
    modal.querySelector('a').focus();
  }

  function choose(side,id){
    const current=game;
    if(!current||current.finished||current.locked||current.matched.has(id)||!current.pairs.some(pair=>pair.id===id))return;
    if(!current.selected){
      current.selected={side,id};
      paintState();chime([440]);
      announce(side==='gif'?'GIF selected. Now choose its matching name.':'Name selected. Now choose its matching GIF.');
      return;
    }
    if(current.selected.side===side){
      current.selected={side,id};
      paintState();
      announce('Selection changed. Choose a '+(side==='gif'?'name':'GIF')+' on the other side.');
      return;
    }
    const first=current.selected;
    current.selected=null;
    if(first.id===id){
      current.matched.add(id);
      paintState();chime([523,659,784]);
      announce('A perfect match! '+current.pairs.find(pair=>pair.id===id).name+' shines in the forest. '+current.matched.size+' of '+current.pairs.length+' matched.');
      if(current.matched.size===current.pairs.length)completeRound();
    }else{
      current.locked=true;paintState();
      const a=document.querySelector(`#memory-columns [data-side="${first.side}"][data-pair="${first.id}"]`);
      const b=document.querySelector(`#memory-columns [data-side="${side}"][data-pair="${id}"]`);
      if(a)a.classList.add('is-wrong');
      if(b)b.classList.add('is-wrong');
      announce('Not quite—those two do not belong together. Try another pair.');
      chime([311,277]);
      hideWrongTimer=setTimeout(()=>{
        if(game!==current)return;
        current.locked=false;
        if(a)a.classList.remove('is-wrong');
        if(b)b.classList.remove('is-wrong');
      },600);
    }
  }

  function route(){
    clearTransient();
    game=null;
    let hash='';
    try{hash=decodeURIComponent(window.location.hash);}catch{/* Invalid URL: open world selection. */}
    const match=/^#\/([a-z0-9-]+)\/([1-5])$/.exec(hash);
    const world=match&&worlds.find(item=>item.id===match[1]);
    if(world)renderGame(world,Number(match[2]));
    else renderLibrary();
    window.scrollTo(0,0);
  }

  app.addEventListener('click',event=>{
    const slot=event.target.closest('#memory-columns [data-side][data-pair]');
    if(slot&&app.contains(slot)){choose(slot.dataset.side,Number(slot.dataset.pair));return;}
    const action=event.target.closest('[data-action="shuffle"]');
    if(action&&game){
      const {world,level}=game;
      renderGame(world,level);
      announce(pairsFor(world,level).length?'The moving pictures and names are shuffled!':'The empty board is ready to fill whenever you are.');
    }
  });
  document.body.addEventListener('click',event=>{
    const action=event.target.closest('#memory-victory-overlay [data-action="replay"]');
    if(action&&game){
      const {world,level}=game;
      renderGame(world,level);
      announce('Ready for another matching adventure!');
    }
  });
  window.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&modal){
      modal.remove();modal=null;
      const link=app.querySelector('[data-action="shuffle"]');
      if(link)link.focus();
    }
  });
  window.addEventListener('resize',drawConnections,{passive:true});
  window.addEventListener('scroll',drawConnections,{passive:true});
  window.addEventListener('hashchange',route);
  makeFireflies();
  route();
})();
