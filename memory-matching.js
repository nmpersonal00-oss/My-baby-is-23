/* The approved artwork stays unaltered. Accessible controls are aligned on top. */
(() => {
  'use strict';
  const SCENE_WIDTH=1447, SCENE_HEIGHT=1087;
  const COUNT=10;
  const worlds=Array.isArray(window.MEMORY_MATCH_DATA)?window.MEMORY_MATCH_DATA:[];
  const $=id=>document.getElementById(id);
  const worldNav=$('memory-worlds'),roundNav=$('memory-rounds'),slots=$('memory-slots');
  if(!worldNav||!roundNav||!slots||worlds.length===0)return;
  const KEY='rayans-dark-forest.gif-name-matching.v1';
  const escaped=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pct=(n,total)=>`${(100*n/total).toFixed(5)}%`;
  let saved={};
  try{
    const val=JSON.parse(localStorage.getItem(KEY)||'{}');
    if(val&&typeof val==='object'&&val.completed&&typeof val.completed==='object')saved=val.completed;
  }catch{};

  function imageURL(path){
    if(typeof path!=='string'||!path.trim())return '';
    try{
      const url=new URL(path.trim(),location.href);
      if(['https:','http:'].includes(url.protocol)||(location.protocol==='file:'&&url.protocol==='file:'))return url.href;
    }catch{}
    return '';
  }
  function configuredPairs(world,round){
    const raw=world?.rounds?.[round-1]?.pairs;
    if(!Array.isArray(raw))return [];
    const names=new Set(),out=[];
    for(let i=0;i<raw.length&&out.length<COUNT;i++){
      const item=raw[i],name=typeof item?.name==='string'?item.name.trim():'';
      const gif=imageURL(item?.gif);
      if(!name||!gif||names.has(name.toLocaleLowerCase()))continue;
      names.add(name.toLocaleLowerCase());
      out.push({id:i,name,gif});
    }
    return out;
  }
  const key=(world,round)=>`${world.id}:${round}`;
  const signature=pairs=>JSON.stringify(pairs.map(p=>[p.name,p.gif]));
  function finishedRound(world,round){
    const pairs=configuredPairs(world,round);
    return pairs.length>0&&saved[key(world,round)]===signature(pairs);
  }
  function saveComplete(world,round,pairs){
    saved[key(world,round)]=signature(pairs);
    try{localStorage.setItem(KEY,JSON.stringify({completed:saved}));}
    catch{say('All GIFs have found their names. Your browser could not save progress.');}
  }
  function shuffled(items){
    const out=items.slice();
    for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
    return out;
  }
  const categoryLeft=[223,345,464,586,707,830,950,1074];
  const categoryWidths=[119,115,116,118,120,118,123,124];
  const roundLeft=[353,503,647,794,938];
  const roundWidth=[128,123,124,123,123];
  const gifX=310,gifW=397,namesX=831,nameW=298;
  const centers=[517,558,600,643,684,726,767,806,848,889];
  const slotHeight=37;
  let worldIndex=0,round=1,game=null,soundOn=true,audio=null,wrongTimeout=null,dialog=null;
  function say(message){$('memory-live').textContent=message;}
  function tone(notes){
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
        gain.gain.exponentialRampToValueAtTime(.07,start+i*.08+.024);
        gain.gain.exponentialRampToValueAtTime(.0001,start+i*.08+.3);
        oscillator.connect(gain);gain.connect(audio.destination);
        oscillator.start(start+i*.08);oscillator.stop(start+i*.08+.31);
      });
    }catch{}
  }
  function place(element,x,y,w,h){
    element.style.left=pct(x,SCENE_WIDTH);element.style.top=pct(y,SCENE_HEIGHT);
    element.style.width=pct(w,SCENE_WIDTH);element.style.height=pct(h,SCENE_HEIGHT);
  }
  function buildNav(){
    worlds.forEach((world,index)=>{
      if(index>=categoryLeft.length)return;
      const button=document.createElement('button');
      button.type='button';button.className='memory-world';
      button.setAttribute('aria-label',`Choose ${world.title}`);button.title=world.title;
      button.dataset.world=world.id;
      place(button,categoryLeft[index],217,categoryWidths[index],117);
      button.addEventListener('click',()=>{
        worldIndex=index;round=1;newRound();say(`${world.title} selected, round 1 of 5.`);
        tone([523,659]);
      });
      worldNav.appendChild(button);
    });
    for(let i=0;i<5;i++){
      const button=document.createElement('button');
      button.type='button';button.className='memory-round';button.dataset.round=String(i+1);
      button.innerHTML=`<span aria-hidden="true" class="round-dot"></span><span>Round ${i+1}</span>`;
      button.setAttribute('aria-label',`Choose round ${i+1}`);
      place(button,roundLeft[i],350,roundWidth[i],35);
      button.addEventListener('click',()=>{round=i+1;newRound();say(`${worlds[worldIndex].title}: round ${round} of 5.`);tone([523,659]);});
      roundNav.appendChild(button);
    }
  }
  function updateNav(){
    worldNav.querySelectorAll('button').forEach((button,index)=>{
      button.setAttribute('aria-pressed',String(index===worldIndex));
      button.setAttribute('aria-label',`${worlds[index].title}${index===worldIndex?' selected':''}`);
    });
    roundNav.querySelectorAll('button').forEach((button,index)=>{
      button.setAttribute('aria-pressed',String(index+1===round));
      button.title=finishedRound(worlds[worldIndex],index+1)?`Round ${index+1} completed`:`Round ${index+1}`;
    });
  }
  function clearTransient(){clearTimeout(wrongTimeout);wrongTimeout=null;if(dialog){dialog.remove();dialog=null;}}
  function buildSlot(side,item,row){
    const el=document.createElement('button');el.type='button';el.className='memory-slot';
    el.dataset.side=side;el.dataset.row=String(row);
    const isGif=side==='gif';
    place(el,isGif?gifX:namesX,centers[row]-slotHeight/2,isGif?gifW:nameW,slotHeight);
    if(!item){
      el.disabled=true;el.tabIndex=-1;
      el.setAttribute('aria-label',`Empty ${isGif?'GIF':'name'} slot ${row+1}`);
      return el;
    }
    el.classList.add('is-filled');el.dataset.pair=String(item.id);
    el.setAttribute('aria-pressed','false');
    el.setAttribute('aria-label',isGif?`GIF ${row+1}, select matching picture`:`${item.name}, name ${row+1}`);
    if(isGif){
      const img=document.createElement('img');img.src=item.gif;img.alt='';img.loading='lazy';
      img.decoding='async';img.draggable=false;el.appendChild(img);
      el.title='Select the matching GIF (double-click to enlarge)';
      el.addEventListener('dblclick',()=>showGifPreview(item));
    }else{el.textContent=item.name;}
    el.addEventListener('click',()=>choose(side,item.id));
    return el;
  }
  function newRound(){
    clearTransient();
    const world=worlds[worldIndex],pairs=configuredPairs(world,round);
    const left=shuffled(pairs),right=shuffled(pairs);
    if(pairs.length>1&&left.every((p,i)=>p.id===right[i].id))right.push(right.shift());
    game={world,round,pairs,left,right,selected:null,matched:new Set(),locked:false,done:false};
    slots.replaceChildren();
    for(let i=0;i<COUNT;i++){
      slots.appendChild(buildSlot('gif',left[i],i));
      slots.appendChild(buildSlot('name',right[i],i));
    }
    updateNav();updateProgress();renderConnections();
    $('memory-note').textContent=pairs.length
      ?`Match each moving GIF to its name · ${pairs.length} ${pairs.length===1?'pair':'pairs'} ready to discover.`
      :'The GIF and name spaces are empty for now. We will fill them together soon.';
  }
  function updateProgress(){
    const matched=game?game.matched.size:0,max=game&&game.pairs.length?game.pairs.length:COUNT;
    const percent=100*matched/max;
    $('memory-progress-fill').style.width=pct(580*percent/100,SCENE_WIDTH);
    $('memory-progress-text').textContent=`${Math.round(percent)}% (${matched} / ${max})`;
  }
  function paintSlots(){
    if(!game)return;
    slots.querySelectorAll('[data-pair]').forEach(el=>{
      const id=Number(el.dataset.pair);
      const sel=game.selected&&game.selected.id===id&&game.selected.side===el.dataset.side;
      const matched=game.matched.has(id);
      el.classList.toggle('is-selected',Boolean(sel));el.classList.toggle('is-matched',matched);
      el.setAttribute('aria-pressed',String(Boolean(sel||matched)));
      el.disabled=matched;
    });
    updateProgress();renderConnections();
  }
  function renderConnections(){
    const svg=$('memory-connections');
    if(!game){svg.replaceChildren();return;}
    const fragment=document.createDocumentFragment();
    for(const id of game.matched){
      const li=game.left.findIndex(p=>p.id===id),ri=game.right.findIndex(p=>p.id===id);
      if(li<0||ri<0)continue;
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');
      const y1=centers[li],y2=centers[ri];
      path.setAttribute('d',`M 710 ${y1} C 770 ${y1}, 770 ${y2}, 831 ${y2}`);
      fragment.appendChild(path);
    }
    svg.replaceChildren(fragment);
  }
  function choose(side,id){
    const current=game;
    if(!current||current.done||current.locked||current.matched.has(id))return;
    if(!current.pairs.some(p=>p.id===id))return;
    if(!current.selected){
      current.selected={side,id};paintSlots();tone([440]);
      say(side==='gif'?'GIF chosen. Select its matching name.':'Name chosen. Select its matching GIF.');
      return;
    }
    if(current.selected.side===side){
      current.selected={side,id};paintSlots();
      say(`Selection changed. Choose ${side==='gif'?'a name':'a GIF'} on the other side.`);
      return;
    }
    const previous=current.selected;current.selected=null;
    if(previous.id===id){
      current.matched.add(id);paintSlots();tone([523,659,784]);
      const name=current.pairs.find(p=>p.id===id)?.name||'the pair';
      say(`Perfect match! ${name}. ${current.matched.size} of ${current.pairs.length} pairs found.`);
      if(current.matched.size===current.pairs.length){
        current.done=true;saveComplete(current.world,current.round,current.pairs);
        updateNav();setTimeout(()=>{if(game===current)showVictory();},390);
      }
    }else{
      current.locked=true;paintSlots();
      const buttons=[...slots.querySelectorAll('[data-pair]')].filter(el=>
        (el.dataset.side===previous.side&&Number(el.dataset.pair)===previous.id)||
        (el.dataset.side===side&&Number(el.dataset.pair)===id));
      buttons.forEach(el=>el.classList.add('is-wrong'));tone([311,277]);
      say('Not quite. Try a different name or GIF.');
      wrongTimeout=setTimeout(()=>{
        if(game!==current)return;
        current.locked=false;buttons.forEach(el=>el.classList.remove('is-wrong'));
      },680);
    }
  }
  function showVictory(){
    if(!game||!game.done)return;
    clearTransient();
    const {world,round,pairs}=game;
    dialog=document.createElement('div');dialog.className='memory-dialog-backdrop';
    dialog.innerHTML=`<section class="memory-dialog" role="dialog" aria-modal="true" aria-labelledby="memory-victory-title">
      <div class="memory-dialog-mark" aria-hidden="true">♡ ✦ ♡</div>
      <h2 id="memory-victory-title">Beautifully matched, my sweet boy!</h2>
      <p>All ${pairs.length} GIFs found their names. This little moment is saved in our enchanted forest.</p>
      <div class="memory-dialog-actions"><button type="button" class="memory-dialog-button" data-choice="replay">Play again</button>
      <button type="button" class="memory-dialog-button" data-choice="next">${round<5?'Next round':'Choose a world'}</button></div>
    </section>`;
    dialog.addEventListener('click',event=>{
      const choice=event.target.closest('[data-choice]')?.dataset.choice;
      if(choice==='replay')newRound();
      if(choice==='next'){
        if(round<5){round++;newRound();}
        else{$('memory-worlds').querySelector('button')?.focus();clearTransient();}
      }
    });
    $('memory-dialog-root').appendChild(dialog);dialog.querySelector('button')?.focus();tone([523,659,784,1046]);
  }
  function showGifPreview(pair){
    if(dialog)return;
    dialog=document.createElement('div');dialog.className='memory-dialog-backdrop';
    const panel=document.createElement('section');panel.className='memory-dialog';
    panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
    const title=document.createElement('h2');title.textContent='A closer look';
    const img=document.createElement('img');img.src=pair.gif;img.alt='Selected moving picture';
    img.style.cssText='display:block;max-width:100%;max-height:50vh;width:auto;height:auto;object-fit:contain;margin:16px auto;border-radius:12px';
    const button=document.createElement('button');button.className='memory-dialog-button';button.textContent='Return to the game';
    button.addEventListener('click',clearTransient);
    panel.append(title,img,button);dialog.appendChild(panel);
    $('memory-dialog-root').appendChild(dialog);button.focus();
  }
  function makeFireflies(){
    const field=$('memory-fireflies');
    if(!field||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    let seed=1761;const random=()=>((seed=seed*16807%2147483647)-1)/2147483646;
    for(let i=0;i<43;i++){
      const light=document.createElement('i');light.className='memory-firefly';light.setAttribute('aria-hidden','true');
      light.style.setProperty('--x',`${random()*100}%`);light.style.setProperty('--y',`${random()*100}%`);
      light.style.setProperty('--sz',`${1.5+random()*2.4}px`);light.style.setProperty('--drift',`${-17+random()*34}px`);
      light.style.setProperty('--duration',`${3+random()*5}s`);light.style.setProperty('--delay',`${-random()*7}s`);
      field.appendChild(light);
    }
  }
  $('memory-sound').addEventListener('click',()=>{
    soundOn=!soundOn;const button=$('memory-sound');button.setAttribute('aria-pressed',String(soundOn));
    button.setAttribute('aria-label',soundOn?'Turn enchanted sounds off':'Turn enchanted sounds on');
    button.dataset.muted=String(!soundOn);if(soundOn)tone([523,659]);
  });
  $('memory-shuffle').addEventListener('click',()=>{newRound();say(game.pairs.length?'GIFs and names shuffled. Good luck!':'The empty GIF and name spaces are ready for us to fill.');tone([494,587]);});
  $('memory-choose-world').addEventListener('click',()=>{
    say('Choose a world from the eight illustrated worlds above.');
    worldNav.querySelector('button')?.focus();tone([523,659]);
  });
  window.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&dialog){clearTransient();$('memory-shuffle').focus();}
  });
  buildNav();makeFireflies();newRound();
})();
