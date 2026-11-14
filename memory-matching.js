/* Rayan's Dark Forest / Memory Matching
   All interface elements are real controls layered over the CLEAN forest image.
   To supply GIFs and matching names later, edit memory-matching-data.js only. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const worlds=Array.isArray(window.MEMORY_MATCH_DATA)?window.MEMORY_MATCH_DATA:[];
  const MAX=10,ROUNDS=5;
  const KEY='rayans-dark-forest.gif-name-matching.v1';
  const VIEW='rayans-dark-forest.gothic-memory-current.v1';
  const worldNav=$('memory-worlds'),roundNav=$('memory-rounds');
  const gifs=$('memory-gif-list'),names=$('memory-name-list');
  const center=$('memory-board'),connections=$('memory-connections');
  const title=$('memory-world-title'),emblem=$('memory-world-emblem');
  const roundText=$('memory-round-label'),progress=$('memory-progress');
  const feedback=$('memory-feedback'),modalRoot=$('memory-dialog-root');
  const shuffleButton=$('memory-shuffle'),soundButton=$('memory-sound');
  if(!worldNav||!roundNav||!gifs||!names||!center||!connections||!feedback||!worlds.length)return;

  const characters=['♘','✧','♜','♟','♣','♨','☾','♡'];
  const htmlEscape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const saved={completed:{}};
  try {
    const parsed=JSON.parse(localStorage.getItem(KEY)||'{}');
    if(parsed&&typeof parsed.completed==='object'&&parsed.completed&&!Array.isArray(parsed.completed))saved.completed=parsed.completed;
  }catch{}
  let selectedWorld=0,selectedRound=1,chosenByClick=false;
  try {
    const view=JSON.parse(localStorage.getItem(VIEW)||'{}');
    const index=worlds.findIndex(item=>item.id===view.world);
    if(index>=0)selectedWorld=index;
    if(Number.isInteger(view.round)&&view.round>=1&&view.round<=ROUNDS)selectedRound=view.round;
    chosenByClick=Boolean(view.chosenByClick);
  }catch{}
  let game=null,modal=null,previousFocus=null,muted=false,audio=null,mismatchTimer=null,winTimer=null;

  function say(message){ feedback.textContent=message; }
  function saveView(){
    try{localStorage.setItem(VIEW,JSON.stringify({world:worlds[selectedWorld].id,round:selectedRound,chosenByClick}));}catch{}
  }
  function safeImage(source){
    if(typeof source!=='string'||!source.trim())return '';
    try {
      const url=new URL(source.trim(),window.location.href);
      if(url.protocol==='https:'||url.protocol==='http:'||(url.protocol==='file:'&&location.protocol==='file:'))return url.href;
    }catch{}
    return '';
  }
  function pairsFor(world,round){
    const input=world?.rounds?.[round-1]?.pairs;
    if(!Array.isArray(input))return [];
    const out=[],unique=new Set();
    for(let i=0;i<input.length&&out.length<MAX;i++){
      const entry=input[i];
      const name=typeof entry?.name==='string'?entry.name.trim():'';
      const gif=safeImage(entry?.gif);
      if(!name||!gif||unique.has(name.toLocaleLowerCase()))continue;
      unique.add(name.toLocaleLowerCase());
      out.push({id:i,name,gif});
    }
    return out;
  }
  const key=(world,round)=>world.id+':'+round;
  const signature=pairs=>JSON.stringify(pairs.map(pair=>[pair.name,pair.gif]));
  function isComplete(world,round){
    const pairs=pairsFor(world,round);
    return pairs.length>0&&saved.completed[key(world,round)]===signature(pairs);
  }
  function saveCompleted(world,round,pairs){
    saved.completed[key(world,round)]=signature(pairs);
    try{localStorage.setItem(KEY,JSON.stringify(saved));}catch{say('Round completed! Saving is unavailable in this browser.');}
  }
  function shuffle(list){
    const a=list.slice();
    for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return a;
  }
  function chime(pitches){
    if(muted)return;
    try{
      const Context=window.AudioContext||window.webkitAudioContext;
      if(!Context)return;
      audio||=new Context();
      if(audio.state==='suspended')audio.resume();
      const now=audio.currentTime;
      pitches.forEach((pitch,i)=>{
        const osc=audio.createOscillator(),gain=audio.createGain();
        osc.type='sine';osc.frequency.value=pitch;
        const at=now+i*.085;
        gain.gain.setValueAtTime(.0001,at);
        gain.gain.exponentialRampToValueAtTime(.06,at+.025);
        gain.gain.exponentialRampToValueAtTime(.0001,at+.28);
        osc.connect(gain);gain.connect(audio.destination);
        osc.start(at);osc.stop(at+.29);
      });
    }catch{}
  }
  function stopTimers(){clearTimeout(mismatchTimer);clearTimeout(winTimer);mismatchTimer=null;winTimer=null;}
  function categoryArt(world){
    return '../assets/'+String(world.artwork||'forest-04.png').replace(/[^a-zA-Z0-9._-]/g,'');
  }
  function renderCategories(){
    worldNav.innerHTML=worlds.slice(0,8).map((world,i)=>
      `<button type="button" class="memory-category${i===selectedWorld&&chosenByClick?' is-chosen':''}"
        data-world="${i}" aria-pressed="${i===selectedWorld}" aria-label="${htmlEscape(world.title)}, category ${i+1}"
        style="--category-art:url('${categoryArt(world)}')">
        <span class="memory-category-icon" aria-hidden="true" style="--icon-y:-${i*58}px;--icon-y-mobile:-${i*44}px"></span>
        <span class="memory-category-name">${htmlEscape(world.title)}</span>
      </button>`).join('');
  }
  function renderRounds(){
    roundNav.innerHTML=Array.from({length:ROUNDS},(_,i)=>{
      const num=i+1,active=selectedRound===num;
      return `<button type="button" class="memory-round" data-round="${num}"
        aria-label="Round ${num}${isComplete(worlds[selectedWorld],num)?', completed':''}"
        aria-pressed="${active}" ${active?'aria-current="step"':''}>${num}</button>`;
    }).join('');
  }
  function slot(side,pair,row){
    const isGif=side==='gif',empty=!pair;
    const label=empty?`Empty ${isGif?'GIF':'name'} space ${row+1}`:
      isGif?`GIF clue ${row+1}; choose its name`:`${pair.name}; select matching GIF`;
    const body=empty?(isGif?'<span class="memory-gif-label" aria-hidden="true">GIF</span>':'<span class="memory-empty-name" aria-hidden="true"></span>'):
      isGif?`<img src="${htmlEscape(pair.gif)}" alt="" loading="lazy" decoding="async" draggable="false"><span class="memory-gif-label" aria-hidden="true">GIF</span>`:
      `<span>${htmlEscape(pair.name)}</span>`;
    return `<li class="memory-match-row">
      <button type="button" class="memory-match-slot ${empty?'is-empty':'is-filled'}" data-side="${side}" data-row="${row}"
        ${empty?'':`data-pair="${pair.id}"`} aria-label="${htmlEscape(label)}" aria-pressed="false">${body}</button>
    </li>`;
  }
  function updateProgress(){
    const matched=game?game.matched.size:0,total=game&&game.pairs.length?game.pairs.length:MAX;
    progress.textContent=`${matched} / ${total} matched`;
  }
  function updateSelection(){
    if(!game)return;
    center.querySelectorAll('.memory-match-slot').forEach(button=>{
      const id=button.hasAttribute('data-pair')?Number(button.dataset.pair):null;
      const selected=id!==null&&game.selected&&game.selected.id===id&&game.selected.side===button.dataset.side;
      const matched=id!==null&&game.matched.has(id);
      button.classList.toggle('is-selected',Boolean(selected));
      button.classList.toggle('is-matched',Boolean(matched));
      button.setAttribute('aria-pressed',String(Boolean(selected||matched)));
      button.disabled=Boolean(matched);
    });
    updateProgress();drawLinks();
  }
  function drawLinks(){
    if(!game){connections.innerHTML='';return;}
    const stage=connections.getBoundingClientRect();
    const b=center.getBoundingClientRect();
    if(!b.width||!b.height||!stage.width||!stage.height)return;
    connections.setAttribute('viewBox',`0 0 ${stage.width} ${stage.height}`);
    const leftButtons=[...gifs.querySelectorAll('[data-pair]')],rightButtons=[...names.querySelectorAll('[data-pair]')];
    const existing=new Map([...connections.querySelectorAll('path[data-join]')]
      .map(path=>[Number(path.dataset.join),path]));
    for(const id of game.matched){
      const left=leftButtons.find(button=>Number(button.dataset.pair)===id);
      const right=rightButtons.find(button=>Number(button.dataset.pair)===id);
      if(!left||!right)continue;
      const l=left.getBoundingClientRect(),r=right.getBoundingClientRect();
      const x1=l.right-stage.left,y1=l.top+l.height/2-stage.top;
      const x2=r.left-stage.left,y2=r.top+r.height/2-stage.top;
      const m=(x1+x2)/2;
      let path=existing.get(id);
      if(!path){
        path=document.createElementNS('http://www.w3.org/2000/svg','path');
        path.classList.add('memory-line');
        path.dataset.join=String(id);
        path.setAttribute('pathLength','1');
        connections.appendChild(path);
      }
      path.setAttribute('d',`M ${x1} ${y1} C ${m} ${y1}, ${m} ${y2}, ${x2} ${y2}`);
      existing.delete(id);
    }
    for(const path of existing.values())path.remove();
  }
  function resetRound(text){
    stopTimers();closeDialog();
    const world=worlds[selectedWorld],pairs=pairsFor(world,selectedRound);
    const left=shuffle(pairs),right=shuffle(pairs);
    if(right.length>1&&right.every((pair,i)=>pair.id===left[i].id))right.push(right.shift());
    game={world,round:selectedRound,pairs,left,right,selected:null,matched:new Set(),locked:false,done:false};
    title.textContent=world.title;
    emblem.textContent=characters[selectedWorld]||'✧';
    roundText.textContent=`Round ${selectedRound} of 5`;
    renderCategories();renderRounds();
    gifs.innerHTML=Array.from({length:MAX},(_,i)=>slot('gif',left[i],i)).join('');
    names.innerHTML=Array.from({length:MAX},(_,i)=>slot('name',right[i],i)).join('');
    connections.innerHTML='';updateProgress();saveView();
    say(text||(pairs.length?`${world.title} • Round ${selectedRound}: choose a GIF and its matching name.`:
      `${world.title} • Round ${selectedRound}: ten empty GIF spaces and ten empty name spaces are ready for content.`));
    requestAnimationFrame(drawLinks);
  }
  function switchWorld(i){
    if(!Number.isInteger(i)||i<0||i>=worlds.length)return;
    selectedWorld=i;selectedRound=1;chosenByClick=true;
    resetRound(`${worlds[i].title} selected. Round 1 of 5 is ready.`);
    chime([523,659]);
  }
  function switchRound(n){
    if(!Number.isInteger(n)||n<1||n>ROUNDS)return;
    selectedRound=n;resetRound(`Round ${n} selected in ${worlds[selectedWorld].title}.`);
    chime([523,659]);
  }
  function selectSlot(side,id,button){
    const current=game;
    if(!current||current.done||current.locked)return;
    if(id===null){
      button.classList.add('is-selected');
      say(`This ${side==='gif'?'GIF':'name'} space is empty. We can add its content next.`);
      setTimeout(()=>{if(game===current)button.classList.remove('is-selected');},420);
      return;
    }
    if(current.matched.has(id))return;
    if(!current.selected){
      current.selected={side,id};updateSelection();chime([440]);
      say(side==='gif'?'GIF selected — now pick its matching name.':'Name selected — now pick the matching GIF.');
      return;
    }
    if(current.selected.side===side){
      current.selected={side,id};updateSelection();
      say(`Selection changed. Now choose ${side==='gif'?'a name':'a GIF'} on the other side.`);
      return;
    }
    const previous=current.selected;current.selected=null;
    if(previous.id===id){
      current.matched.add(id);updateSelection();chime([523,659,784]);
      const label=current.pairs.find(item=>item.id===id).name;
      say(`A magical match! ${label}. ${current.matched.size} out of ${current.pairs.length} found.`);
      if(current.matched.size===current.pairs.length){
        current.done=true;saveCompleted(current.world,current.round,current.pairs);renderRounds();
        winTimer=setTimeout(()=>{if(game===current)showVictory();},500);
      }
    }else{
      current.locked=true;updateSelection();
      const a=center.querySelector(`[data-side="${previous.side}"][data-pair="${previous.id}"]`);
      const b=center.querySelector(`[data-side="${side}"][data-pair="${id}"]`);
      a?.classList.add('is-wrong');b?.classList.add('is-wrong');
      say('Those two do not match. Try a different pair.');chime([311,277]);
      mismatchTimer=setTimeout(()=>{
        if(game!==current)return;
        current.locked=false;a?.classList.remove('is-wrong');b?.classList.remove('is-wrong');
      },650);
    }
  }
  function closeDialog(){
    if(modal){modal.remove();modal=null;}
    if(previousFocus?.isConnected)previousFocus.focus();
    previousFocus=null;
  }
  function showDialog(content){
    closeDialog();previousFocus=document.activeElement;
    modal=document.createElement('div');modal.className='memory-dialog-backdrop';
    modal.innerHTML=`<div role="dialog" aria-modal="true" aria-labelledby="memory-dialog-title" class="memory-dialog">${content}</div>`;
    modalRoot.appendChild(modal);
    modal.querySelector('button')?.focus();
  }
  function showVictory(){
    if(!game?.done)return;
    const last=selectedRound===ROUNDS;
    showDialog(`<h2 id="memory-dialog-title">Beautifully matched, my sweet boy!</h2>
      <p>All ${game.pairs.length} memories found their names. This enchanted round is saved in our forest.</p>
      <div class="memory-dialog-actions"><button type="button" data-action="replay">Play again</button>
        <button type="button" data-action="next">${last?'Finish':'Next round'}</button>
        <button type="button" data-action="close">Stay here</button></div>`);
    chime([523,659,784,1046]);
  }
  function showGif(id){
    const pair=game?.pairs.find(item=>item.id===id);
    if(!pair)return;
    showDialog(`<h2 id="memory-dialog-title">A closer look</h2>
      <img src="${htmlEscape(pair.gif)}" alt="Enlarged moving picture">
      <div class="memory-dialog-actions"><button type="button" data-action="close">Return to matching</button></div>`);
  }
  function sparkles(){
    const field=$('memory-sparkles');
    if(!field||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    let seed=24711;const rand=()=>((seed=seed*16807%2147483647)-1)/2147483646;
    for(let i=0;i<46;i++){
      const node=document.createElement('i');node.className='memory-fly';
      node.style.setProperty('--x',`${2+96*rand()}%`);
      node.style.setProperty('--y',`${1+97*rand()}%`);
      node.style.setProperty('--r',`${1+2.3*rand()}px`);
      node.style.setProperty('--dx',`${-12+24*rand()}px`);
      node.style.setProperty('--dur',`${3+5*rand()}s`);
      node.style.setProperty('--delay',`${-6*rand()}s`);
      field.appendChild(node);
    }
  }
  worldNav.addEventListener('click',event=>{
    const b=event.target.closest('[data-world]');if(b)switchWorld(Number(b.dataset.world));
  });
  roundNav.addEventListener('click',event=>{
    const b=event.target.closest('[data-round]');if(b)switchRound(Number(b.dataset.round));
  });
  center.addEventListener('click',event=>{
    const b=event.target.closest('button.memory-match-slot');
    if(!b)return;
    const id=b.hasAttribute('data-pair')?Number(b.dataset.pair):null;
    selectSlot(b.dataset.side,id,b);
  });
  center.addEventListener('dblclick',event=>{
    const b=event.target.closest('button[data-side="gif"][data-pair]');
    if(b)showGif(Number(b.dataset.pair));
  });
  shuffleButton.addEventListener('click',()=>{
    resetRound(game?.pairs.length?'The GIFs and names have been shuffled!':'The spaces are still empty, ready for your GIFs and names.');
    chime([494,587]);
  });
  soundButton.addEventListener('click',()=>{
    muted=!muted;soundButton.setAttribute('aria-pressed',String(!muted));
    soundButton.setAttribute('aria-label',muted?'Turn magical sounds on':'Turn magical sounds off');
    $('memory-sound-label').textContent=muted?'Sound off':'Sound on';
    say(muted?'Magical sounds turned off.':'Magical sounds turned on.');
    if(!muted)chime([523,659]);
  });
  modalRoot.addEventListener('click',event=>{
    const action=event.target.closest('button[data-action]')?.dataset.action;
    if(action==='close'){closeDialog();return;}
    if(action==='replay'){resetRound('Round reshuffled — find the matches again!');return;}
    if(action==='next'){
      const next=selectedRound+1;closeDialog();
      if(next<=ROUNDS)switchRound(next);
      else say('You completed all five rounds in this world. Choose another category!');
    }
  });
  window.addEventListener('keydown',event=>{
    if(!modal)return;
    if(event.key==='Escape'){event.preventDefault();closeDialog();return;}
    if(event.key==='Tab'){
      const buttons=[...modal.querySelectorAll('button:not([disabled])')];
      if(!buttons.length)return;
      if(event.shiftKey&&document.activeElement===buttons[0]){event.preventDefault();buttons.at(-1).focus();}
      else if(!event.shiftKey&&document.activeElement===buttons.at(-1)){event.preventDefault();buttons[0].focus();}
    }
  });
  window.addEventListener('resize',drawLinks,{passive:true});
  window.addEventListener('scroll',drawLinks,{passive:true});
  sparkles();resetRound();
})();
