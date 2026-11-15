
/* Original AI artwork + native interactions; no remote resources or emoji packs. */
(() => {
  'use strict';
  const layout=document.querySelector('.memory-layout');
  if(!layout || document.getElementById('memory-construction'))return;
  const root=document.createElement('section');
  root.id='memory-construction';
  root.className='memory-construction';
  root.setAttribute('aria-label','Memory Matching is under construction. Hangman is available.');
  root.innerHTML=[
    '<img class="memory-construction-art" src="../assets/memory-under-construction.avif" alt="" draggable="false" aria-hidden="true">',
    '<div class="memory-construction-flare" aria-hidden="true"></div>',
    '<nav class="memory-construction-mobile" aria-label="Available games">',
    '<a href="../index.html">HOME</a><a href="hangman.html">HANGMAN</a></nav>',
    '<div class="memory-construction-fallback" aria-label="Memory Matching is under construction">',
    '<p>Rayan’s enchanted forest is getting a magical makeover</p>',
    '<h2>Pssst... no peeking, handsome!</h2>',
    '<p>Our tiny magical builders are working on Memory Matching. Try Hangman while they finish!</p>',
    '<div class="construction-stripe"></div>',
    '<a href="hangman.html">HANGMAN IS OPEN</a>',
    '<button type="button" data-no-peek="yes">Go on, try to peek</button></div>',
    '<div class="memory-construction-tell" role="status" aria-live="polite" aria-atomic="true"></div>',
    '<div class="memory-construction-mobile-message">',
    '<strong>Pssst... no peeking, handsome!</strong>',
    '<span>Memory Matching is still being built. Tap the bunny or sign — if you dare!</span>',
    '</div>'
  ].join('');
  document.body.classList.add('memory-under-construction');
  layout.inert=true;
  layout.setAttribute('aria-hidden','true');
  document.body.appendChild(root);
  const art=root.querySelector('.memory-construction-art');
  const tell=root.querySelector('.memory-construction-tell');
  const jokes=[
    'HEY! Stop that, mister! No peeking!',
    'Ahem! Did you just try to sneak a peek?',
    'Excuse me, handsome! This is a top-secret princess project!',
    "Nope nope nope! The magic isn't finished yet!",
    'Careful! My tiny construction crew is watching you!',
    "Nice try, baby! The surprise isn't ready!",
    'One more peek and the bunny is calling security!',
    'Sir! Those matching cards are still in their pajamas!',
    'You again?! The little builders said NO!',
    'Kisses are allowed. Peeking is absolutely not!'
  ];
  let clicks=0,timer=0,audio;
  function chime(){
    try {
      const Context=window.AudioContext||window.webkitAudioContext;
      if(!Context)return;
      audio ||= new Context();
      if(audio.state==='suspended')audio.resume();
      const start=audio.currentTime;
      [659.25,880,987.77].forEach((hz,i)=>{
        const oscillator=audio.createOscillator(),gain=audio.createGain();
        oscillator.type='sine';oscillator.frequency.setValueAtTime(hz,start+i*.075);
        gain.gain.setValueAtTime(.0001,start+i*.075);
        gain.gain.exponentialRampToValueAtTime(.045,start+i*.075+.025);
        gain.gain.exponentialRampToValueAtTime(.0001,start+i*.075+.3);
        oscillator.connect(gain);gain.connect(audio.destination);
        oscillator.start(start+i*.075);oscillator.stop(start+i*.075+.31);
      });
    }catch{/* Browser-generated sounds are optional. */}
  }
  function noPeek(event){
    tell.textContent=jokes[clicks%jokes.length];clicks++;
    const bounds=root.getBoundingClientRect();
    const x=typeof event?.clientX==='number'&&event.clientX>0?event.clientX-bounds.left:bounds.width*.52;
    const y=typeof event?.clientY==='number'&&event.clientY>0?event.clientY-bounds.top:bounds.height*.46;
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      for(let i=0;i<12;i++){
        const spark=document.createElement('i');spark.className='memory-construction-pop';
        const angle=i*Math.PI/6,spread=38+seeded(clicks*23+i)*65;
        spark.style.setProperty('--pop-x',x+'px');spark.style.setProperty('--pop-y',y+'px');
        spark.style.setProperty('--pop-dx',Math.cos(angle)*spread+'px');
        spark.style.setProperty('--pop-dy',Math.sin(angle)*spread+'px');
        spark.style.setProperty('--size',4+seeded(clicks*42+i)*6+'px');
        root.appendChild(spark);spark.addEventListener('animationend',()=>spark.remove(),{once:true});
      }
    }
    clearTimeout(timer);
    root.classList.remove('is-peeking');void root.offsetWidth;
    root.classList.add('is-peeking');tell.classList.add('is-visible');
    chime();
    timer=setTimeout(()=>{
      root.classList.remove('is-peeking');tell.classList.remove('is-visible');
    },2900);
  }
  // Coordinates match the approved 1672 x 941 image and object-fit: cover.
  const hotspots=[
    {name:'Return home',x:0,y:222,w:207,h:163,url:'../index.html'},
    {name:'Play Hangman',x:0,y:375,w:210,h:164,url:'hangman.html'},
    {name:'Hangman is open, play now',x:1325,y:399,w:291,h:272,url:'hangman.html'},
    {name:'Tap the bunny to hear her no-peeking warning',x:260,y:115,w:565,h:780,react:true},
    {name:'Tap the construction sign',x:801,y:179,w:516,h:590,react:true}
  ];
  const zones=hotspots.map(item=>{
    const el=document.createElement(item.url?'a':'button');
    el.className='memory-construction-zone'+(item.react?' no-peek':'');
    el.setAttribute('aria-label',item.name);
    if(item.url)el.href=item.url;
    else {el.type='button';el.addEventListener('click',noPeek);}
    root.appendChild(el);return el;
  });
  function positionHotspots(){
    const width=root.clientWidth,height=root.clientHeight,iw=1672,ih=941;
    const zoom=Math.max(width/iw,height/ih);
    const dx=(width-iw*zoom)/2,dy=(height-ih*zoom)/2;
    hotspots.forEach((item,i)=>{
      const el=zones[i];el.style.left=(dx+item.x*zoom)+'px';
      el.style.top=(dy+item.y*zoom)+'px';
      el.style.width=(item.w*zoom)+'px';el.style.height=(item.h*zoom)+'px';
      el.hidden=width<=720 && !!item.url;
    });
  }
  positionHotspots();
  window.addEventListener('resize',positionHotspots,{passive:true});
  if(art.complete&&art.naturalWidth)root.classList.add('is-illustrated');
  art.addEventListener('load',()=>root.classList.add('is-illustrated'));
  art.addEventListener('error',()=>root.classList.remove('is-illustrated'));
  root.querySelector('[data-no-peek]')?.addEventListener('click',noPeek);
  root.addEventListener('pointerdown',event=>{
    if(root.clientWidth>720)return;
    if(event.target.closest('a,button,.memory-construction-mobile-message'))return;
    noPeek();
  });
  const seeded=(n)=>{
    const val=Math.sin(n*147.29+13.07)*43758.5453;return val-Math.floor(val);
  };
  const sparkles=document.createDocumentFragment();
  for(let i=0;i<35;i++){
    const dot=document.createElement('i');
    dot.className='memory-construction-sparkle';
    dot.setAttribute('aria-hidden','true');
    dot.style.left=(7+seeded(i+1)*86)+'%';
    dot.style.top=(9+seeded(i+56)*82)+'%';
    const size=1+seeded(i+90)*3;dot.style.width=dot.style.height=size+'px';
    dot.style.setProperty('--dur',(2.8+seeded(i+120)*3.2)+'s');
    dot.style.setProperty('--delay',(-seeded(i+189)*5)+'s');
    sparkles.appendChild(dot);
  }
  root.appendChild(sparkles);
})();
