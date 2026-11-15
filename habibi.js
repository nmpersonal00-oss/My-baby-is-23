/* Eight original, fully-local kawaii scenes; no emoji, fonts, images or scripts fetched online. */
(() => {
  'use strict';
  const root = document.getElementById('habibi-app');
  const deck = document.getElementById('habibi-deck');
  const final = document.getElementById('habibi-finale');
  const image = document.getElementById('habibi-scene-image');
  const frame = document.getElementById('habibi-scene-frame');
  const picture = document.getElementById('habibi-scene-picture');
  const title = document.getElementById('habibi-scene-title');
  const message = document.getElementById('habibi-scene-message');
  const reaction = document.getElementById('habibi-reaction');
  const action = document.getElementById('habibi-action');
  const actionLabel = document.getElementById('habibi-action-text');
  const count = document.getElementById('habibi-count');
  const dots = document.getElementById('habibi-dots');
  const prev = document.getElementById('habibi-prev');
  const next = document.getElementById('habibi-next');
  const controls = document.getElementById('habibi-controls');
  const glimmer = document.getElementById('habibi-glimmer');
  const announcer = document.getElementById('habibi-slide-announcer');
  const replay = document.getElementById('habibi-replay');
  const magic = document.getElementById('habibi-magic');
  if (!root || !deck || !final || !image || !frame || !picture || !title || !message || !reaction || !action || !dots || !prev || !next) return;

  const scenes = [
    { title:'Your Eyes', action:'Boop his glasses!', kind:'boop', text:'I love your eyes. The way they sparkle when you look at me makes my whole heart melt.', reaction:'Boop! Those pretty eyes are all mine to admire.', alt:'She playfully points to his glasses and sparkling eyes, making him blush.' },
    { title:'Your Hair', action:'Fluff his hair!', kind:'fluff', text:'I love your hair. It is impossibly cute, and you know I will never resist fluffing it.', reaction:'FLUFF FLUFF! Somebody has extra floofy hair now.', alt:'She ruffles his hair with both hands while they giggle.' },
    { title:'Your Muscles', action:'Poke his muscles!', kind:'poke', text:'I love your muscles. My strong boy makes me feel safe—and I will still poke him to be silly.', reaction:'Poke! Wow, excuse me, whose strong boy is this?', alt:'He flexes a muscle while she pokes his arm with an excited smile.' },
    { title:'Your Chest', action:'Tap his heartbeat!', kind:'heartbeat', text:'I love your chest. It is my favorite place to lay my head and hear your heartbeat.', reaction:'Thump thump! That is my favorite sound.', alt:'She gently rests her hand over the glowing heart on his chest.' },
    { title:'Your Arms', action:'Tiny arm chomp!', kind:'chomp', text:'I love your arms. They give me the warmest hugs, even when I am being a little menace and nibbling your sleeve.', reaction:'Nom! Sorry, you are just too cute.', alt:'She gives his clothed sleeve a playful tiny pretend nibble, and he laughs.' },
    { title:'Your Legs', action:'Hug his leg!', kind:'leg', text:'I love your legs too. I would hug them, pretend to nibble your pant leg, and still look at you like you are my entire world.', reaction:'Caught you! Even your legs are getting cuddles.', alt:'She wraps her arms around his clothed leg and smiles mischievously.' },
    { title:'Your Toes', action:'Step on his toes!', kind:'toes', text:'I even love your little toes. Yes, all ten of them. I will step on your shoes and still expect you to adore me.', reaction:'Tiptoe attack! You cannot escape this tiny menace.', alt:'She playfully steps near the tips of his shoes while they laugh.' },
    { title:'Your Hugs', action:'Give him the biggest hug!', kind:'hug', text:'I love your hugs most of all. When you hold me close, it feels like the whole world finally makes sense.', reaction:'The biggest hug, forever and always.', alt:'The smiling chibi couple shares a long, loving hug among floating hearts.' }
  ];
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');
  const totals = scenes.length;
  const originalHref = '../../assets/habibi-scene-';
  let position = 0;
  let reactionTimer = null;
  let transitionTimer = null;
  let suppressClickUntil = 0;
  let pointerStart = null;
  let seed = 261123;
  const rng = () => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646;
  const localAssets = scenes.map((_,i)=>originalHref+(i+1)+'.webp'+(i>=4?'?v=sharp-20261115':''));
  localAssets.forEach(src=>{const img=new Image();img.src=src;});

  // All floating artwork is drawn in local CSS: zero emoji/remote assets.
  if (glimmer && !REDUCED.matches) {
    for (let i=0;i<38;i++) {
      const dot=document.createElement('i'); dot.className='habibi-ambient-dot';
      dot.style.setProperty('--x',(rng()*100).toFixed(1)+'%');
      dot.style.setProperty('--y',(rng()*100).toFixed(1)+'%');
      dot.style.setProperty('--size',(1.6+rng()*3.6).toFixed(1)+'px');
      dot.style.setProperty('--time',(3.5+rng()*6).toFixed(2)+'s');
      dot.style.setProperty('--delay',(-rng()*12).toFixed(2)+'s');
      glimmer.appendChild(dot);
    }
  }
  function heartBurst(anchor, total=15) {
    if (REDUCED.matches || !glimmer) return;
    const area=anchor.getBoundingClientRect();
    const x=area.left+area.width/2, y=area.top+area.height/2;
    for(let i=0;i<total;i++) {
      const bit=document.createElement('span');bit.className='habibi-burst-heart';
      const angle=(i/total*Math.PI*2)+rng()*.55;
      const distance=50+rng()*(total>30?240:150);
      bit.style.left=x+'px';bit.style.top=y+'px';
      bit.style.setProperty('--dx',Math.cos(angle)*distance+'px');
      bit.style.setProperty('--dy',Math.sin(angle)*distance-50+'px');
      bit.style.setProperty('--scale',(.55+rng()*1.2).toFixed(2));
      bit.style.setProperty('--duration',(1050+rng()*1000).toFixed(0)+'ms');
      glimmer.appendChild(bit);
      bit.addEventListener('animationend',()=>bit.remove(),{once:true});
    }
  }

  function react() {
    if (position>=totals || performance.now()<suppressClickUntil) return;
    const scene=scenes[position];
    frame.classList.remove('is-reacting');
    frame.dataset.reaction=scene.kind;
    // Restart the animation every time, including repeated taps of the same scene.
    void frame.offsetWidth;
    frame.classList.add('is-reacting');
    reaction.textContent=scene.reaction;
    actionLabel.textContent='Again!';
    heartBurst(frame,20);
    clearTimeout(reactionTimer);
    reactionTimer=setTimeout(()=>{
      frame.classList.remove('is-reacting');
      if(position<totals)actionLabel.textContent=scenes[position].action;
    },1450);
  }
  function show(n, {focus=false}={}) {
    const target=Math.max(0,Math.min(totals,n));
    position=target;
    clearTimeout(reactionTimer);
    clearTimeout(transitionTimer);
    frame.classList.remove('is-reacting');
    root.classList.remove('habibi-ending');
    deck.hidden=(target===totals);
    final.hidden=(target!==totals);
    controls.hidden=(target===totals);
    if (target===totals) {
      root.classList.add('habibi-ending');
      if(announcer)announcer.textContent='The final love letter has appeared.';
      if (focus) document.getElementById('habibi-finale-title')?.focus({preventScroll:true});
      heartBurst(final,48);
      window.scrollTo({top:0,behavior:REDUCED.matches?'instant':'smooth'});
      return;
    }
    const s=scenes[target];
    image.src=localAssets[target];
    image.alt=s.alt;
    title.textContent=s.title;
    message.textContent=s.text;
    reaction.textContent='Tap the picture for a little surprise.';
    actionLabel.textContent=s.action;
    count.textContent=String(target+1).padStart(2,'0')+' / 08';
    frame.dataset.reaction=s.kind;
    prev.disabled=target===0;
    next.setAttribute('aria-label',target===totals-1?'Reveal the final love letter':'Next little moment');
    for(const button of dots.children) {
      const active=Number(button.dataset.index)===target;
      button.classList.toggle('is-current',active);
      if(active)button.setAttribute('aria-current','step');
      else button.removeAttribute('aria-current');
    }
    frame.classList.remove('habibi-scene-enter');
    void frame.offsetWidth;
    frame.classList.add('habibi-scene-enter');
    transitionTimer=setTimeout(()=>frame.classList.remove('habibi-scene-enter'),700);
    if(announcer)announcer.textContent='Moment '+(target+1)+' of eight. '+s.title+'.';
    if(focus)title.focus({preventScroll:true});
    if(window.innerWidth<850)window.scrollTo({top:0,behavior:REDUCED.matches?'instant':'smooth'});
  }

  scenes.forEach((s,i)=>{
    const dot=document.createElement('button');dot.type='button';dot.className='habibi-dot';
    dot.dataset.index=String(i);dot.setAttribute('aria-label','View moment '+(i+1)+': '+s.title);
    dot.addEventListener('click',()=>show(i,{focus:true})); dots.appendChild(dot);
  });
  action.addEventListener('click',react);
  picture.addEventListener('click',react);
  prev.addEventListener('click',()=>show(position-1,{focus:true}));
  next.addEventListener('click',()=>show(position+1,{focus:true}));
  if(replay)replay.addEventListener('click',()=>show(0,{focus:true}));
  if(magic)magic.addEventListener('click',()=>heartBurst(final,55));

  // Swipe to explore, without breaking touch activation of the reaction button.
  picture.addEventListener('pointerdown',e=>{
    if(e.pointerType==='touch')pointerStart={x:e.clientX,y:e.clientY};
  },{passive:true});
  picture.addEventListener('pointerup',e=>{
    if(!pointerStart)return;
    const dx=e.clientX-pointerStart.x,dy=e.clientY-pointerStart.y;
    pointerStart=null;
    if(Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)*1.15){
      suppressClickUntil=performance.now()+350;
      show(position+(dx<0?1:-1));
    }
  },{passive:true});
  picture.addEventListener('pointercancel',()=>{pointerStart=null;});
  document.addEventListener('keydown',e=>{
    if(e.altKey||e.ctrlKey||e.metaKey)return;
    if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
    if(e.key==='ArrowRight' && position<totals){e.preventDefault();show(position+1);}
    if(e.key==='ArrowLeft' && position>0){e.preventDefault();show(position-1);}
  });
  show(0);
})();
