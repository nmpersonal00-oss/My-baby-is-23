(function memoryApp() {
  'use strict';

  const WORLDS = [
    {id:'souls',title:'Dark Souls I & II',tagline:'A flame worth remembering',cards:[
      ['Bonfire','♨'],['Estus Flask','✦'],['Humanity','♡'],['Solaire','☀'],['Ember','✧'],['Phantom','♜'],
      ['Titanite','◆'],['Majula','⌂'],['Moonlight','☾'],['Fire Keeper','✺'],['Sunlight','☼'],['Greatsword','⚔']
    ]},
    {id:'lies',title:'Lies of P',tagline:'Secrets hidden in every heartbeat',cards:[
      ['Krat','♜'],['Puppet','♧'],['Stargazer','✦'],['Sophia','♡'],['Geppetto','⚙'],['Ergo','◇'],
      ['Legion Arm','⚔'],['Venigni','❖'],['Golden Lie','✧'],['Romeo','☽'],['Quartz','✹'],['Blue Fairy','✿']
    ]},
    {id:'blood',title:'Bloodborne',tagline:'Whispers beneath a violet moon',cards:[
      ['Yharnam','♜'],['Hunter','⚔'],['Dream','☾'],['Insight','✧'],['Lantern','✺'],['Blood Echo','❖'],
      ['Doll','♡'],['Chalice','♛'],['Raven','◆'],['Workshop','⚙'],['Moon','☽'],['Rune','✦']
    ]},
    {id:'stars',title:'Star Wars',tagline:'Memories written in the stars',cards:[
      ['Jedi','✧'],['Sith','◆'],['Force','✦'],['Droid','⚙'],['Tatooine','☼'],['Falcon','➶'],
      ['Leia','♛'],['Luke','☀'],['Yoda','❖'],['Starlight','✺'],['Lightsaber','⚔'],['Galaxy','☾']
    ]},
    {id:'terraria',title:'Terraria',tagline:'Tiny treasures, grand adventures',cards:[
      ['Slime','●'],['Pickaxe','⚒'],['Mana','✧'],['Crystal','◆'],['Torch','✺'],['Forest','♣'],
      ['Starfall','✦'],['Minecart','➶'],['Bunny','♡'],['Boss','♛'],['Potion','❖'],['Treasure','◇']
    ]},
    {id:'princess',title:'My Spoiled Little Princess',tagline:'The sweetest world is ours',cards:[
      ['My Love','♡'],['Sweet Boy','♥'],['Princess','♛'],['Forever','∞'],['Kisses','✿'],['Promise','✧'],
      ['Starlight','✦'],['Cuddles','❣'],['Darling','❀'],['Our Story','❖'],['Always','☾'],['Heart','♡']
    ]},
    {id:'hollow',title:'Hollow Knight / Silksong',tagline:'A delicate light in the dark',cards:[
      ['Hallownest','♜'],['Hornet','✦'],['Knight','⚔'],['Dream Nail','☾'],['Geo','◇'],['Grub','♡'],
      ['Silksong','❖'],['Needle','➶'],['Charm','✿'],['Bench','⌂'],['Mask','♧'],['Radiance','☼']
    ]}
  ];

  const PAIR_COUNTS=[4,6,8,10,12];
  const STORE='rayans-dark-forest.memory.v2';
  const app=document.getElementById('memory-app');
  const announcer=document.getElementById('memory-announcer');
  const soundButton=document.getElementById('memory-sound');
  if(!app||!announcer||!soundButton)return;

  const esc=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const heart='<svg viewBox="0 0 32 29" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M16 27C11 21 2 15 2 8 2 .5 12-1 16 7 20-1 30 .5 30 8c0 7-9 13-14 19Z"/></svg>';
  const key=(world,round)=>world.id+':'+round;
  const empty=()=>({best:{}});
  function load(){
    try{
      const value=JSON.parse(localStorage.getItem(STORE)||'{}');
      return value&&typeof value==='object'&&value.best&&typeof value.best==='object'&&!Array.isArray(value.best)?{best:value.best}:empty();
    }catch{return empty();}
  }
  const progress=load();
  const best=(world,round)=>{
    const result=progress.best[key(world,round)];
    return result&&Number.isInteger(result.moves)&&result.moves>=PAIR_COUNTS[round-1]&&Number.isFinite(result.seconds)&&result.seconds>=0?result:null;
  };
  function storeBest(world,round,moves,seconds){
    const previous=best(world,round);
    const improved=!previous||moves<previous.moves||(moves===previous.moves&&seconds<previous.seconds);
    if(improved){
      progress.best[key(world,round)]={moves,seconds};
    }
    try{localStorage.setItem(STORE,JSON.stringify(progress));}
    catch{announce('Round finished! Browser storage is unavailable, so scores may not stay after this visit.');}
    return improved;
  }
  const completed=(world)=>PAIR_COUNTS.reduce((total,_,i)=>total+(best(world,i+1)?1:0),0);
  const totalCompleted=()=>WORLDS.reduce((total,world)=>total+completed(world),0);
  const timerText=seconds=>{
    const n=Math.max(0,Math.floor(seconds));
    return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
  };
  function shuffle(items){
    for(let i=items.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [items[i],items[j]]=[items[j],items[i]];
    }
    return items;
  }
  function makeCards(world,round){
    const count=PAIR_COUNTS[round-1];
    const start=((round-1)*3)%world.cards.length;
    const chosen=Array.from({length:count},(_,i)=>(start+i)%world.cards.length);
    return shuffle(chosen.flatMap(pair=>[0,1].map(copy=>({
      pair,copy,label:world.cards[pair][0],symbol:world.cards[pair][1],up:false,matched:false
    }))));
  }
  let soundOn=true;
  let context=null;
  let active=null;
  let mismatchTimeout=null;
  let victoryTimeout=null;
  let timerInterval=null;

  function clearTimers(){
    clearTimeout(mismatchTimeout);
    clearTimeout(victoryTimeout);
    clearInterval(timerInterval);
    mismatchTimeout=null;victoryTimeout=null;timerInterval=null;
  }
  function chime(notes){
    if(!soundOn)return;
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!Audio)return;
      context ||= new Audio();
      if(context.state==='suspended')context.resume();
      const now=context.currentTime;
      notes.forEach((pitch,i)=>{
        const tone=context.createOscillator(),gain=context.createGain();
        tone.type='sine';tone.frequency.value=pitch;
        gain.gain.setValueAtTime(.0001,now+i*.09);
        gain.gain.exponentialRampToValueAtTime(.06,now+i*.09+.025);
        gain.gain.exponentialRampToValueAtTime(.0001,now+i*.09+.28);
        tone.connect(gain);gain.connect(context.destination);
        tone.start(now+i*.09);tone.stop(now+i*.09+.3);
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
    const feedback=document.getElementById('memory-feedback');
    if(feedback)feedback.textContent=message;
  }
  function fireworks(){
    const holder=document.getElementById('memory-fireflies');
    if(!holder||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    let seed=27183;
    const random=()=>((seed=seed*16807%2147483647)-1)/2147483646;
    for(let i=0;i<25;i++){
      const light=document.createElement('i');
      light.className='memory-firefly';
      light.style.setProperty('--x',(2+random()*96)+'%');
      light.style.setProperty('--y',(5+random()*87)+'%');
      light.style.setProperty('--speed',(3+random()*5)+'s');
      light.style.setProperty('--delay',(-random()*6)+'s');
      holder.appendChild(light);
    }
  }

  function renderLibrary(){
    active=null;
    clearTimers();
    const done=totalCompleted();
    const worldsFinished=WORLDS.filter(world=>completed(world)===5).length;
    app.innerHTML=`<section class="memory-hero" aria-labelledby="memory-heading">
      <p class="memory-eyebrow">Seven enchanted collections · Thirty-five magical rounds</p>
      <h1 id="memory-heading">The Enchanted <span>Memory Game</span></h1>
      <div class="memory-flourish">${heart}</div>
      <p class="memory-tagline">Every little memory is a light we keep. Turn the cards, find their twins, and let our forest glow.</p>
      <p class="memory-subtitle">Choose a world and a round to begin your adventure</p>
    </section>
    <section class="memory-overview" aria-label="Your memory adventure progress">
      <strong>Your enchanted journey</strong>
      <div class="overview-numbers"><span><b>${done}</b> / 35 rounds</span><span><b>${worldsFinished}</b> / 7 worlds</span><span><b>${Math.round(done/35*100)}%</b> complete</span></div>
      <div class="memory-track" style="width:min(190px,100%);flex:0 1 190px;--progress:${done/35*100}%" role="progressbar" aria-valuemin="0" aria-valuemax="35" aria-valuenow="${done}" aria-label="Completed rounds"><span></span></div>
    </section>
    <section class="memory-worlds" aria-label="Choose your memory world">
      ${WORLDS.map((world,i)=>{
        const count=completed(world);
        return `<article class="memory-world" data-world="${esc(world.id)}">
          <div class="memory-world-art" aria-hidden="true"></div>
          <div class="memory-world-content">
            <span class="memory-world-number">ENCHANTED WORLD ${String(i+1).padStart(2,'0')}</span>
            <h2 class="memory-world-title"><a href="#/${world.id}/1">${esc(world.title)}</a></h2>
            <p class="memory-world-tagline">${esc(world.tagline)}</p>
            <div class="memory-world-spacer"></div>
            <nav class="memory-levels" aria-label="${esc(world.title)} rounds">
              ${PAIR_COUNTS.map((_,idx)=>`<a href="#/${world.id}/${idx+1}" class="memory-level ${best(world,idx+1)?'done':''}" aria-label="${esc(world.title)} round ${idx+1}${best(world,idx+1)?', completed':''}">${idx+1}</a>`).join('')}
            </nav>
            <div class="memory-world-bottom"><span><b>${count}</b> / 5 rounds</span><div class="memory-track" role="progressbar" aria-label="${esc(world.title)} progress" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${count}" style="--progress:${count/5*100}%"><span></span></div><span>${count===5?'World complete':(count*20)+'% complete'}</span></div>
          </div>
        </article>`;
      }).join('')}
    </section>`;
    document.title="The Enchanted Memory Game · Rayan's Dark Forest";
  }

  function cardMarkup(card,index){
    return `<button class="memory-tile" type="button" data-card="${index}" aria-label="Card ${index+1}, face down" aria-pressed="false">
      <span class="memory-tile-inner">
        <span class="memory-face memory-face-hidden" aria-hidden="true"><span class="memory-sigil">✦</span><small>Dark Forest</small></span>
        <span class="memory-face memory-face-shown" aria-hidden="true"><span class="memory-symbol">${esc(card.symbol)}</span><span class="memory-word">${esc(card.label)}</span></span>
      </span>
    </button>`;
  }

  function renderGame(world,round){
    clearTimers();
    const old=document.getElementById('memory-victory-shade');
    if(old)old.remove();
    active={world,round,cards:makeCards(world,round),first:null,locked:false,moves:0,matched:0,startedAt:0,finishedSeconds:null,finished:false};
    const count=PAIR_COUNTS[round-1],previous=best(world,round);
    const columns=count>10?6:count>8?5:4;
    app.innerHTML=`<section class="memory-game-nav">
      <a class="memory-library-link" href="#library">‹ &nbsp; All 7 worlds</a>
      <nav class="memory-rounds" aria-label="Choose a round"><span class="memory-rounds-label">ROUND</span>
        ${PAIR_COUNTS.map((_,i)=>`<a href="#/${world.id}/${i+1}" class="memory-round ${i+1===round?'current':''} ${best(world,i+1)?'done':''}" ${i+1===round?'aria-current="step"':''} aria-label="${esc(world.title)} round ${i+1}${best(world,i+1)?', completed':''}">${i+1}</a>`).join('')}
      </nav>
    </section>
    <header class="memory-game-title">
      <p class="memory-eyebrow">World ${WORLDS.indexOf(world)+1} of 7 · Round ${round} of 5</p>
      <h1>${esc(world.title)}</h1>
      <p>${esc(world.tagline)} · Find ${count} matching pairs</p>
    </header>
    <section class="memory-game-panel" aria-label="Matching memory game board">
      <div class="memory-metrics">
        <div class="memory-metric"><strong id="memory-pairs">0 / ${count}</strong>Pairs found</div>
        <div class="memory-metric"><strong id="memory-moves">0</strong>Moves</div>
        <div class="memory-metric"><strong id="memory-time">00:00</strong>Time</div>
        <div class="memory-metric"><strong id="memory-best">${previous?previous.moves+' moves':'—'}</strong>Personal best</div>
      </div>
      <div class="memory-track memory-game-track" id="memory-board-track" role="progressbar" aria-label="Pairs matched" aria-valuemin="0" aria-valuemax="${count}" aria-valuenow="0" style="--progress:0%"><span></span></div>
      <div class="memory-board" id="memory-board" style="--columns:${columns}" aria-label="${count*2} memory cards">
        ${active.cards.map(cardMarkup).join('')}
      </div>
      <p class="memory-feedback" id="memory-feedback">Turn over two cards to find a matching pair.</p>
      <div class="memory-actions">
        <button type="button" class="memory-button" data-action="restart">Shuffle &amp; replay</button>
        <a class="memory-button secondary" href="#library">Choose another world</a>
      </div>
      <p class="memory-tip">A match stays glowing. Find them all to complete this round.</p>
    </section>`;
    document.title=world.title+" · Memory Game · Rayan's Dark Forest";
  }

  function elapsed(){
    if(!active)return 0;
    if(active.finishedSeconds!==null)return active.finishedSeconds;
    return active.startedAt?Math.floor((Date.now()-active.startedAt)/1000):0;
  }
  function updateTime(){
    const item=document.getElementById('memory-time');
    if(item&&active)item.textContent=timerText(elapsed());
  }
  function paintCard(index){
    if(!active)return;
    const card=active.cards[index],button=document.querySelector(`[data-card="${index}"]`);
    if(!card||!button)return;
    button.classList.toggle('is-revealed',card.up);
    button.classList.toggle('is-matched',card.matched);
    button.setAttribute('aria-pressed',String(card.up||card.matched));
    button.setAttribute('aria-label',card.matched?`Card ${index+1}, ${card.label}, matched`:card.up?`Card ${index+1}, ${card.label}, face up`:`Card ${index+1}, face down`);
    button.disabled=card.matched;
  }
  function syncMetrics(){
    if(!active)return;
    const count=PAIR_COUNTS[active.round-1];
    document.getElementById('memory-pairs').textContent=active.matched+' / '+count;
    document.getElementById('memory-moves').textContent=String(active.moves);
    const track=document.getElementById('memory-board-track');
    track.style.setProperty('--progress',(active.matched/count*100)+'%');
    track.setAttribute('aria-valuenow',String(active.matched));
    updateTime();
  }
  function flip(index){
    const game=active;
    if(!game||game.finished||game.locked||!Number.isInteger(index)||index<0||index>=game.cards.length)return;
    const card=game.cards[index];
    if(card.up||card.matched)return;
    if(!game.startedAt){
      game.startedAt=Date.now();
      timerInterval=setInterval(updateTime,1000);
    }
    card.up=true;paintCard(index);chime([440]);
    if(game.first===null){
      game.first=index;
      announce('First card revealed: '+card.label+'. Find its match.');
      return;
    }
    const firstIndex=game.first,firstCard=game.cards[firstIndex];
    game.first=null;
    game.moves++;
    if(firstCard.pair===card.pair){
      firstCard.matched=true;card.matched=true;
      game.matched++;
      paintCard(firstIndex);paintCard(index);syncMetrics();
      chime([523,659,784]);
      announce('A match! '+card.label+' is glowing. '+game.matched+' of '+PAIR_COUNTS[game.round-1]+' pairs found.');
      if(game.matched===PAIR_COUNTS[game.round-1]){
        game.finished=true;
        game.finishedSeconds=elapsed();
        clearInterval(timerInterval);timerInterval=null;
        game.newBest=storeBest(game.world,game.round,game.moves,game.finishedSeconds);
        announce('Every pair found! Round '+game.round+' completed in '+game.moves+' moves.');
        victoryTimeout=setTimeout(()=>{if(active===game)showVictory();},500);
      }
    }else{
      game.locked=true;syncMetrics();
      announce('Not a match. Remember '+firstCard.label+' and '+card.label+'.');
      mismatchTimeout=setTimeout(()=>{
        if(active!==game)return;
        firstCard.up=false;card.up=false;game.locked=false;
        paintCard(firstIndex);paintCard(index);
        announce('Try another pair.');
      },1000);
    }
  }

  function showVictory(){
    if(!active||!active.finished)return;
    const game=active;
    const last=game.round===5;
    const target=last?'#library':`#/${game.world.id}/${game.round+1}`;
    const modal=document.createElement('div');
    modal.className='memory-victory-shade';modal.id='memory-victory-shade';
    modal.innerHTML=`<div class="memory-victory" role="dialog" aria-modal="true" aria-labelledby="memory-victory-heading">
      <div class="memory-victory-icon" aria-hidden="true">♡ ✦ ♡</div>
      <p class="memory-eyebrow">A magical memory completed</p>
      <h2 id="memory-victory-heading">Beautifully done, my sweet boy!</h2>
      <p>You found all ${PAIR_COUNTS[game.round-1]} pairs in <strong>${game.moves} moves</strong> and <strong>${timerText(game.finishedSeconds)}</strong>. ${game.newBest?'A new personal best is shining in the forest!':'Your completed round is shining in the forest!'}</p>
      <div class="memory-actions">
        <button type="button" class="memory-button secondary" data-action="replay">Play again</button>
        <a href="${target}" class="memory-button" id="memory-victory-next">${last?'Choose a world':'Next round ✦'}</a>
      </div>
      <div class="memory-actions"><a href="#library" class="memory-button secondary">All 7 worlds</a></div>
    </div>`;
    document.body.appendChild(modal);
    const focusTarget=modal.querySelector('#memory-victory-next');
    if(focusTarget)focusTarget.focus();
    chime([523,659,784,1046]);
  }

  function route(){
    clearTimers();
    const modal=document.getElementById('memory-victory-shade');
    if(modal)modal.remove();
    let hash='';
    try{hash=decodeURIComponent(window.location.hash);}catch{/* Treat malformed URLs as the library. */}
    const match=/^#\/([a-z]+)\/([1-5])$/.exec(hash);
    const world=match&&WORLDS.find(item=>item.id===match[1]);
    if(world)renderGame(world,Number(match[2]));else renderLibrary();
    window.scrollTo(0,0);
  }

  app.addEventListener('click',event=>{
    const button=event.target.closest('[data-card]');
    if(button&&app.contains(button)){
      flip(Number(button.dataset.card));
      return;
    }
    const action=event.target.closest('[data-action]');
    if(action){
      if(action.dataset.action==='restart'||action.dataset.action==='replay'){
        const game=active;
        if(game){renderGame(game.world,game.round);announce('Cards reshuffled. Find the matching pairs!');}
      }
    }
  });
  document.body.addEventListener('click',event=>{
    const action=event.target.closest('#memory-victory-shade [data-action="replay"]');
    if(action&&active){
      const {world,round}=active;
      renderGame(world,round);
      announce('Cards reshuffled. Find the matching pairs!');
    }
  });
  window.addEventListener('keydown',event=>{
    if(event.key==='Escape'){
      const modal=document.getElementById('memory-victory-shade');
      if(modal){modal.remove();const button=document.querySelector('[data-action="restart"]');if(button)button.focus();}
    }
  });
  window.addEventListener('hashchange',route);
  fireworks();
  route();
})();
