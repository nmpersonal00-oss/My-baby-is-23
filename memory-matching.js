/* Matching Memory: genuine interactive controls, never screenshot hotspots.
   GIF and name content lives in memory-matching-data.js (empty until provided). */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const worlds=Array.isArray(window.MEMORY_MATCH_DATA)?window.MEMORY_MATCH_DATA:[];
  const worldNav=$('memory-worlds'),roundNav=$('memory-rounds');
  const gifList=$('memory-gif-list'),nameList=$('memory-name-list');
  const progressTrack=$('memory-progress-track'),progressFill=$('memory-progress-fill');
  const progressText=$('memory-progress-text'),feedback=$('memory-feedback');
  const note=$('memory-note'),live=$('memory-live');
  const dialogRoot=$('memory-dialog-root');
  const board=$('memory-grid'),connections=$('memory-connections');
  const shuffleButton=$('memory-shuffle'),chooseWorldButton=$('memory-choose-world');
  const soundButton=$('memory-sound');
  const MAX=10,ROUNDS=5,KEY='rayans-dark-forest.gif-name-matching.v1';
  const LAST='rayans-dark-forest.memory-last-view.v1';
  if(!worldNav||!roundNav||!gifList||!nameList||!progressTrack||!connections||!dialogRoot)return;
  const escapeHTML=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const symbols=['♘','✦','♜','⚙','♣','⚔','☾','♡'];
  const pictureIcon='<svg viewBox="0 0 32 28" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="2.5" y="3" width="27" height="22" rx="3"/><circle cx="10" cy="10" r="2.5"/><path d="m4 22 8-8 6 5 5-7 6 9"/></svg>';
  const progress={completed:{}};
  try{
    const saved=JSON.parse(localStorage.getItem(KEY)||'{}');
    if(saved&&typeof saved==='object'&&saved.completed&&typeof saved.completed==='object'&&!Array.isArray(saved.completed)){
      progress.completed=saved.completed;
    }
  }catch{}
  let selectedWorld=0,selectedRound=1;
  try{
    const saved=JSON.parse(localStorage.getItem(LAST)||'{}');
    const index=worlds.findIndex(world=>world.id===saved.world);
    if(index>=0)selectedWorld=index;
    if(Number.isInteger(saved.round)&&saved.round>=1&&saved.round<=ROUNDS)selectedRound=saved.round;
  }catch{}
  let game=null,modal=null,lastFocused=null,soundOn=true,audio=null,mismatchTimer=null,pulseTimer=null,winTimer=null;

  function announce(message){
    if(feedback)feedback.textContent=message;
    if(live)live.textContent=message;
  }
  function saveView(){
    try{localStorage.setItem(LAST,JSON.stringify({world:worlds[selectedWorld].id,round:selectedRound}));}catch{}
  }
  function safeURL(raw){
    if(typeof raw!=='string'||!raw.trim())return '';
    try{
      const url=new URL(raw.trim(),window.location.href);
      if(url.protocol==='https:'||url.protocol==='http:'||(window.location.protocol==='file:'&&url.protocol==='file:'))return url.href;
    }catch{}
    return '';
  }
  function pairsFor(world,round){
    const source=world&&world.rounds&&world.rounds[round-1]&&world.rounds[round-1].pairs;
    if(!Array.isArray(source))return [];
    const seen=new Set(),result=[];
    for(let i=0;i<source.length&&result.length<MAX;i++){
      const pair=source[i];
      const name=pair&&typeof pair.name==='string'?pair.name.trim():'';
      const gif=safeURL(pair&&pair.gif);
      if(!name||!gif||seen.has(name.toLocaleLowerCase()))continue;
      seen.add(name.toLocaleLowerCase());
      result.push({id:i,name,gif});
    }
    return result;
  }
  const progressKey=(world,round)=>world.id+':'+round;
  const signature=pairs=>JSON.stringify(pairs.map(pair=>[pair.name,pair.gif]));
  function roundDone(world,round){
    const pairs=pairsFor(world,round);
    return pairs.length>0&&progress.completed[progressKey(world,round)]===signature(pairs);
  }
  function saveCompletion(world,round,pairs){
    progress.completed[progressKey(world,round)]=signature(pairs);
    try{localStorage.setItem(KEY,JSON.stringify(progress));}
    catch{announce('All pairs matched! Your browser could not save the progress.');}
  }
  function shuffle(items){
    const list=items.slice();
    for(let i=list.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [list[i],list[j]]=[list[j],list[i]];
    }
    return list;
  }
  function sound(notes){
    if(!soundOn)return;
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!Audio)return;
      audio ||= new Audio();
      if(audio.state==='suspended')audio.resume();
      const start=audio.currentTime;
      notes.forEach((pitch,i)=>{
        const oscillator=audio.createOscillator(),gain=audio.createGain();
        oscillator.type='sine';oscillator.frequency.value=pitch;
        gain.gain.setValueAtTime(.0001,start+i*.08);
        gain.gain.exponentialRampToValueAtTime(.055,start+i*.08+.025);
        gain.gain.exponentialRampToValueAtTime(.0001,start+i*.08+.28);
        oscillator.connect(gain);gain.connect(audio.destination);
        oscillator.start(start+i*.08);oscillator.stop(start+i*.08+.29);
      });
    }catch{}
  }
  function clearTimers(){
    clearTimeout(mismatchTimer);clearTimeout(pulseTimer);clearTimeout(winTimer);
    mismatchTimer=null;pulseTimer=null;winTimer=null;
  }
  function flashBoard(){
    board.classList.remove('is-shuffling');
    // A reflow allows consecutive clicks to restart the sparkle animation.
    void board.offsetWidth;
    board.classList.add('is-shuffling');
    clearTimeout(pulseTimer);
    pulseTimer=setTimeout(()=>board.classList.remove('is-shuffling'),700);
  }
  function worldArtwork(world){
    const name=String(world.artwork||'').replace(/[^a-zA-Z0-9._-]/g,'');
    return '../assets/'+name;
  }
  function renderWorlds(){
    worldNav.innerHTML=worlds.map((world,index)=>`
      <button type="button" class="memory-world" data-world="${index}"
        aria-pressed="${String(selectedWorld===index)}" aria-label="${escapeHTML(world.title)}${selectedWorld===index?', selected':''}"
        style="--world-art:url('${worldArtwork(world)}')">
        <span class="memory-world-mark" aria-hidden="true">${symbols[index]||'✦'}</span>
        <span>${escapeHTML(world.title)}</span>
      </button>`).join('');
  }
  function renderRounds(){
    roundNav.innerHTML=Array.from({length:ROUNDS},(_,index)=>{
      const round=index+1,active=selectedRound===round,done=roundDone(worlds[selectedWorld],round);
      return `<button type="button" class="memory-round" data-round="${round}" aria-pressed="${String(active)}"
        aria-label="Round ${round}${done?', completed':''}">
        <span class="memory-round-dot" aria-hidden="true"></span><span>Round ${round}${done?' ✧':''}</span>
      </button>`;
    }).join('');
  }
  function slotMarkup(side,pair,index){
    const empty=!pair,kind=side==='gif'?'GIF':'name';
    const content=empty?(side==='gif'
      ?`<span class="memory-placeholder" aria-hidden="true">${pictureIcon}<span>GIF</span></span>`
      :'<span class="memory-placeholder" aria-hidden="true"></span>')
      :side==='gif'? `<img src="${escapeHTML(pair.gif)}" alt="" loading="lazy" decoding="async" draggable="false">`
      :`<span>${escapeHTML(pair.name)}</span>`;
    const label=empty?`Empty ${kind} space ${index+1}; no content yet`:
      side==='gif'?`GIF ${index+1}; choose its matching name`:`${pair.name}; choose its matching GIF`;
    return `<li class="memory-slot-row"><span class="memory-slot-number" aria-hidden="true">${index+1}.</span>
      <button type="button" class="memory-slot${empty?' is-empty':''}" data-side="${side}" data-row="${index}"
        ${empty?'':`data-pair="${pair.id}"`} aria-label="${escapeHTML(label)}" aria-pressed="false">
        ${content}
      </button>
      ${!empty&&side==='gif'? `<button type="button" class="memory-preview" data-preview="${pair.id}" aria-label="Enlarge GIF ${index+1}">⌕</button>`:''}
    </li>`;
  }
  function updateProgress(){
    const count=game?game.matched.size:0,total=game&&game.pairs.length?game.pairs.length:MAX;
    const percent=Math.round(100*count/total);
    progressFill.style.width=percent+'%';
    progressText.textContent=`${percent}% (${count} / ${total})`;
    progressTrack.setAttribute('aria-valuenow',String(count));
    progressTrack.setAttribute('aria-valuemax',String(total));
  }
  function drawConnections(){
    if(!game)return;
    const box=board.getBoundingClientRect();
    if(!box.width||!box.height)return;
    connections.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
    const paths=[];
    for(const id of game.matched){
      const a=gifList.querySelector(`[data-pair="${id}"]`);
      const b=nameList.querySelector(`[data-pair="${id}"]`);
      if(!a||!b)continue;
      const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();
      const x1=ra.right-box.left,y1=ra.top+ra.height/2-box.top;
      const x2=rb.left-box.left,y2=rb.top+rb.height/2-box.top;
      const mid=(x1+x2)/2;
      paths.push(`<path d="M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}"/>`);
    }
    connections.innerHTML=paths.join('');
  }
  function updateSlots(){
    if(!game)return;
    for(const slot of board.querySelectorAll('.memory-slot[data-pair]')){
      const id=Number(slot.dataset.pair),side=slot.dataset.side;
      const selected=game.selected&&game.selected.id===id&&game.selected.side===side;
      const matched=game.matched.has(id);
      slot.classList.toggle('is-selected',Boolean(selected));
      slot.classList.toggle('is-matched',matched);
      slot.setAttribute('aria-pressed',String(Boolean(selected||matched)));
      slot.disabled=matched;
    }
    for(const preview of gifList.querySelectorAll('.memory-preview')){
      preview.disabled=game.matched.has(Number(preview.dataset.preview));
    }
    updateProgress();drawConnections();
  }
  function newRound(message){
    clearTimers();
    const world=worlds[selectedWorld],pairs=pairsFor(world,selectedRound);
    const left=shuffle(pairs),right=shuffle(pairs);
    if(pairs.length>1&&left.every((pair,i)=>pair.id===right[i].id)){
      right.push(right.shift());
    }
    game={world,round:selectedRound,pairs,left,right,selected:null,matched:new Set(),locked:false,done:false};
    gifList.innerHTML=Array.from({length:MAX},(_,i)=>slotMarkup('gif',left[i],i)).join('');
    nameList.innerHTML=Array.from({length:MAX},(_,i)=>slotMarkup('name',right[i],i)).join('');
    note.textContent=pairs.length
      ?`Choose a GIF on the left, then the correct name on the right. ${pairs.length} ${pairs.length===1?'pair':'pairs'} ready.`
      :'The GIF and name slots are intentionally empty for now. This is a real interactive board, ready for our GIFs.';
    renderWorlds();renderRounds();updateProgress();drawConnections();saveView();
    announce(message||(pairs.length
      ?`${world.title}, round ${selectedRound}: find the matching names.`
      :`${world.title}, round ${selectedRound}: all ten GIF and name spaces are ready. We'll add the content next.`));
  }
  function selectWorld(index){
    if(!Number.isInteger(index)||index<0||index>=worlds.length)return;
    selectedWorld=index;selectedRound=1;
    newRound(worlds[index].title+' selected. Round 1 of 5.');
    sound([523,659]);closeDialog();
  }
  function selectRound(value){
    if(!Number.isInteger(value)||value<1||value>ROUNDS)return;
    selectedRound=value;newRound('Round '+value+' of 5 selected for '+worlds[selectedWorld].title+'.');
    sound([523,659]);
  }
  function choose(side,id,slot){
    const current=game;
    if(!current||current.done||current.locked)return;
    if(id===null||!current.pairs.some(pair=>pair.id===id)){
      if(slot){slot.classList.add('is-selected');setTimeout(()=>slot.classList.remove('is-selected'),470);}
      announce('This '+(side==='gif'?'GIF':'name')+' space is empty for now. We will add the '+(side==='gif'?'animation':'name')+' later.');
      return;
    }
    if(current.matched.has(id))return;
    if(!current.selected){
      current.selected={side,id};updateSlots();sound([440]);
      announce(side==='gif'?'GIF selected. Now choose its correct name.':'Name selected. Now choose the matching GIF.');
      return;
    }
    if(current.selected.side===side){
      current.selected={side,id};updateSlots();
      announce('Selection changed. Choose '+(side==='gif'?'a name':'a GIF')+' on the other side.');
      return;
    }
    const previous=current.selected;current.selected=null;
    if(previous.id===id){
      current.matched.add(id);updateSlots();sound([523,659,784]);
      const pair=current.pairs.find(p=>p.id===id);
      announce('Perfect match! '+pair.name+'. '+current.matched.size+' of '+current.pairs.length+' pairs found.');
      if(current.matched.size===current.pairs.length){
        current.done=true;
        saveCompletion(current.world,current.round,current.pairs);
        renderRounds();
        winTimer=setTimeout(()=>{if(game===current)showVictory();},500);
      }
    }else{
      current.locked=true;updateSlots();
      const a=board.querySelector(`[data-side="${previous.side}"][data-pair="${previous.id}"]`);
      const b=board.querySelector(`[data-side="${side}"][data-pair="${id}"]`);
      if(a)a.classList.add('is-wrong');
      if(b)b.classList.add('is-wrong');
      announce('Those two do not match. Give it another try.');
      sound([311,277]);
      mismatchTimer=setTimeout(()=>{
        if(game!==current)return;
        current.locked=false;
        if(a)a.classList.remove('is-wrong');
        if(b)b.classList.remove('is-wrong');
      },660);
    }
  }
  function closeDialog(){
    if(modal){modal.remove();modal=null;}
    if(lastFocused&&lastFocused.isConnected)lastFocused.focus();
    lastFocused=null;
  }
  function openDialog(content){
    closeDialog();
    lastFocused=document.activeElement;
    modal=document.createElement('div');
    modal.className='memory-dialog-shade';
    modal.innerHTML='<div class="memory-dialog" role="dialog" aria-modal="true" aria-labelledby="memory-dialog-title">'+content+'</div>';
    dialogRoot.appendChild(modal);
    modal.querySelector('button')?.focus();
  }
  function showWorldPicker(){
    const options=worlds.map((world,index)=>
      `<button type="button" data-choose-world="${index}">${symbols[index]||'✧'} &nbsp; ${escapeHTML(world.title)}</button>`).join('');
    openDialog(`<h2 id="memory-dialog-title">Choose another enchanted world</h2>
      <p>Where shall our next memory adventure begin?</p>
      <div class="memory-dialog-worlds">${options}</div>
      <div class="memory-dialog-buttons"><button type="button" data-close-dialog>Return to the game</button></div>`);
    announce('World chooser opened. Select one of eight worlds.');
  }
  function showGifPreview(id){
    const pair=game&&game.pairs.find(p=>p.id===id);
    if(!pair)return;
    openDialog(`<h2 id="memory-dialog-title">A closer look</h2>
      <img src="${escapeHTML(pair.gif)}" alt="Enlarged GIF clue">
      <div class="memory-dialog-buttons"><button type="button" data-close-dialog>Return to matching</button></div>`);
  }
  function showVictory(){
    if(!game||!game.done)return;
    const {world,round,pairs}=game;
    sound([523,659,784,1046]);
    openDialog(`<h2 id="memory-dialog-title">Beautifully matched, my sweet boy!</h2>
      <p>All ${pairs.length} moving pictures found their names. This round now glows in our forest.</p>
      <div class="memory-dialog-buttons">
        <button type="button" data-replay>Play again</button>
        <button type="button" data-next-round>${round<ROUNDS?'Next round':'Choose another world'}</button>
        <button type="button" data-close-dialog>Stay here</button>
      </div>`);
    announce(world.title+' round '+round+' completed!');
  }
  function makeFireflies(){
    const field=$('memory-fireflies');
    if(!field||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    let seed=1761;
    const random=()=>((seed=seed*16807%2147483647)-1)/2147483646;
    for(let i=0;i<38;i++){
      const fly=document.createElement('i');fly.className='memory-firefly';fly.setAttribute('aria-hidden','true');
      fly.style.setProperty('--x',(1+random()*98)+'%');
      fly.style.setProperty('--y',(2+random()*94)+'%');
      fly.style.setProperty('--sz',(1.4+random()*2.3)+'px');
      fly.style.setProperty('--drift',(-16+random()*32)+'px');
      fly.style.setProperty('--duration',(3+random()*5)+'s');
      fly.style.setProperty('--delay',(-random()*8)+'s');
      field.appendChild(fly);
    }
  }

  worldNav.addEventListener('click',event=>{
    const button=event.target.closest('button[data-world]');
    if(button)selectWorld(Number(button.dataset.world));
  });
  roundNav.addEventListener('click',event=>{
    const button=event.target.closest('button[data-round]');
    if(button)selectRound(Number(button.dataset.round));
  });
  board.addEventListener('click',event=>{
    const preview=event.target.closest('button[data-preview]');
    if(preview){showGifPreview(Number(preview.dataset.preview));return;}
    const slot=event.target.closest('button.memory-slot');
    if(slot)choose(slot.dataset.side,slot.hasAttribute('data-pair')?Number(slot.dataset.pair):null,slot);
  });
  shuffleButton.addEventListener('click',()=>{
    newRound();
    flashBoard();
    announce(game.pairs.length?'GIFs and names reshuffled. Try a new matching path!':
      'The empty GIF and name spaces sparkle, but there is nothing to shuffle until we add GIFs and names.');
    sound([494,587,659]);
  });
  chooseWorldButton.addEventListener('click',showWorldPicker);
  dialogRoot.addEventListener('click',event=>{
    const worldButton=event.target.closest('button[data-choose-world]');
    if(worldButton){selectWorld(Number(worldButton.dataset.chooseWorld));return;}
    if(event.target.closest('[data-close-dialog]')){closeDialog();return;}
    if(event.target.closest('[data-replay]')){
      closeDialog();newRound('This round has been reset. Let the matching begin!');
      return;
    }
    if(event.target.closest('[data-next-round]')){
      const last=selectedRound>=ROUNDS;closeDialog();
      if(last){showWorldPicker();return;}
      selectRound(selectedRound+1);
    }
  });
  soundButton.addEventListener('click',()=>{
    soundOn=!soundOn;
    soundButton.setAttribute('aria-pressed',String(soundOn));
    soundButton.setAttribute('aria-label',soundOn?'Turn magical sounds off':'Turn magical sounds on');
    $('memory-sound-label').textContent=soundOn?'Sound on':'Sound off';
    $('memory-sound-icon').textContent=soundOn?'♫':'♪';
    announce(soundOn?'Magical sounds turned on.':'Magical sounds turned off.');
    if(soundOn)sound([523,659]);
  });
  window.addEventListener('keydown',event=>{
    if(!modal)return;
    if(event.key==='Escape'){event.preventDefault();closeDialog();return;}
    if(event.key==='Tab'){
      const focusable=[...modal.querySelectorAll('button:not([disabled])')];
      if(!focusable.length)return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  window.addEventListener('resize',drawConnections,{passive:true});
  document.querySelector('.memory-grid-scroller')?.addEventListener('scroll',drawConnections,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)drawConnections();});
  makeFireflies();
  if(!worlds.length){
    worldNav.textContent='Worlds will appear when the game data loads.';
    announce('The matching-world data did not load.');
  }else{
    newRound();
  }
})();
