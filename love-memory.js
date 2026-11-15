/* Love — original-art, 30-Polaroid animated string scrapbook. All local. */
(() => {
  'use strict';
  const scene = document.getElementById('love-memory-scene');
  const stage = document.getElementById('memory-thread-stage');
  const wall = document.getElementById('memory-polaroids');
  const svg = document.getElementById('memory-thread');
  const core = document.getElementById('memory-thread-core');
  const aura = document.getElementById('memory-thread-aura');
  const sparkleField = document.getElementById('memory-sparkle-bursts');
  const ambience = document.getElementById('memory-ambient');
  const announcement = document.getElementById('memory-announcement');
  const lightbox = document.getElementById('memory-lightbox');
  const lightboxClose = document.getElementById('memory-lightbox-close');
  const lightboxPhoto = document.getElementById('memory-lightbox-picture');
  const lightboxLabel = document.getElementById('memory-lightbox-label');
  if (!scene || !stage || !wall || !core || !aura || !svg) return;

  const descriptions = [
    'Our happy little selfie', 'A pretty day together', 'Watching the sunset',
    'A kiss on the cheek', 'Smiling side by side', 'Snuggling close',
    'Our movie date', 'A playful night out', 'Making cute faces',
    'A cozy winter memory', 'A walk beneath the blossoms', 'Our silly faces',
    'A little hug', 'Sharing something sweet', 'Our favorite smiles',
    'Stealing a kiss', 'Matching sunglasses', 'A sleepy cuddle',
    'A magical night together', 'A kiss for you', 'Having an adventure',
    'Playing games together', 'A night of fairy lights', 'A little date',
    'Wishing on a star', 'The warmest hug', 'Reading together',
    'Our golden-hour moment', 'One more selfie', 'A sweet surprise'
  ];
  const N = 30;
  const mobile = window.matchMedia('(max-width:850px) and (orientation:portrait)');
  const reduced = window.matchMedia('(prefers-reduced-motion:reduce)');
  const heartSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M12 21s-9-5.6-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.4-9 12-9 12Z" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  let rng = 713923;
  const random = () => ((rng = (rng * 16807) % 2147483647) - 1) / 2147483646;
  const photos = [];
  let len = 1;
  let anchors = [];
  let began = 0;
  let lastShown = -1;
  let raf = 0;
  let finished = false;
  let lastFocused = null;
  const duration = 23700;

  const logicalPos = (i) => {
    const k = i % 10;
    if (i < 10) return {x:139 + k * 154.5, y:124 + Math.sin(k * .84) * 8};
    if (i < 20) return {x:1534 - k * 154.5, y:307 + Math.sin(k * .9) * 9};
    return {x:139 + k * 154.5, y:492 + Math.sin(k * .85) * 8};
  };

  for (let i = 0; i < N; i++) {
    const position = logicalPos(i);
    const col = i % 6, row = Math.floor(i / 6);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'memory-polaroid';
    card.dataset.memory = String(i + 1);
    card.tabIndex = -1;
    card.disabled = true;
    card.setAttribute('aria-label', 'View memory ' + (i + 1) + ' of 30: ' + descriptions[i]);
    card.style.setProperty('--x', (position.x / 1672 * 100).toFixed(4) + '%');
    card.style.setProperty('--y', (position.y / 941 * 100).toFixed(4) + '%');
    card.style.setProperty('--atlas-x', (col * 20) + '%');
    card.style.setProperty('--atlas-y', (row * 25) + '%');
    card.style.setProperty('--tilt', ((i % 2 ? 1 : -1) * (2.3 + (i * 11 % 4))).toFixed(1) + 'deg');
    card.style.setProperty('--sway-time', (3 + (i % 5) * .39).toFixed(2) + 's');
    card.style.setProperty('--sway-delay', (-i * .17).toFixed(2) + 's');
    // Snake through the two-column mobile grid, so the animated string never jumps rows.
    card.style.order = i % 4 === 2 ? i + 1 : i % 4 === 3 ? i - 1 : i;
    card.innerHTML = '<span class="memory-polaroid-inner"><span class="memory-polaroid-clip"></span><span class="memory-polaroid-frame"><span class="memory-polaroid-image"></span><span class="memory-polaroid-heart">' + heartSVG + '</span></span></span>';
    card.addEventListener('click', () => showLightbox(i, card));
    wall.appendChild(card);
    photos.push({button:card,pos:position,description:descriptions[i],col,row});
  }

  function createPath() {
    const compact = mobile.matches;
    const W = compact ? Math.round(stage.clientWidth) : 1672;
    const H = compact ? Math.round(stage.clientHeight) : 941;
    if (!W || !H) return;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const points = photos.map(p => {
      if (!compact) return p.pos;
      const el=p.button;
      return {x:el.offsetLeft + el.offsetWidth/2, y:el.offsetTop + 7};
    });
    let d = `M ${compact ? -8 : -25} ${points[0].y - (compact ? 24 : 4)} `;
    anchors = [];
    const getLength = () => {core.setAttribute('d', d);return core.getTotalLength();};
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (i === 0) {
        d += `Q ${p.x - 44} ${p.y + 21} ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
      } else {
        const a = points[i-1];
        if (!compact && i === 10) {
          d += `C 1640 ${a.y + 33} 1642 ${p.y - 42} ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
        } else if (!compact && i === 20) {
          d += `C 31 ${a.y + 35} 29 ${p.y - 40} ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
        } else if (compact && Math.abs(p.y - a.y) > 35) {
          const far = p.x > W/2 ? W - 7 : 7;
          d += `C ${far} ${a.y + 16} ${far} ${p.y - 16} ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
        } else {
          const x = (p.x+a.x)/2;
          const y = (p.y+a.y)/2 + (compact ? 14 : 21);
          d += `Q ${x.toFixed(1)} ${y.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
        }
      }
      anchors.push(getLength());
    }
    if (compact) {
      const end=points[points.length-1];
      const x=W/2, y=H-14;
      d += `C ${(W-14).toFixed(1)} ${(end.y+65).toFixed(1)} ${(x+W*.20).toFixed(1)} ${(y-55).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
    } else {
      d += 'C 1586 612 1411 647 1256 620 S 978 604 836 622';
    }
    core.setAttribute('d',d);
    aura.setAttribute('d',d);
    len=Math.max(1,core.getTotalLength());
    [core,aura].forEach(path=>{
      path.style.strokeDasharray = String(len);
      path.style.strokeDashoffset = finished ? '0' : String(len);
    });
    return true;
  }

  function twinkleAt(photo) {
    if (reduced.matches || !sparkleField) return;
    let x = photo.pos.x / 1672 * 100;
    let y = photo.pos.y / 941 * 100;
    if (mobile.matches) {
      x=(photo.button.offsetLeft+photo.button.offsetWidth/2)/Math.max(1,stage.clientWidth)*100;
      y=(photo.button.offsetTop+12)/Math.max(1,stage.clientHeight)*100;
    }
    for(let j=0;j<7;j++) {
      const dot=document.createElement('span');
      dot.className='memory-sparkle-particle';
      dot.style.setProperty('--sx',x+'%');
      dot.style.setProperty('--sy',y+'%');
      dot.style.setProperty('--size',(2+random()*4)+'px');
      const angle=random()*Math.PI*2, radius=17+random()*50;
      dot.style.setProperty('--dx',Math.cos(angle)*radius+'px');
      dot.style.setProperty('--dy',Math.sin(angle)*radius+'px');
      dot.addEventListener('animationend',()=>dot.remove(),{once:true});
      sparkleField.appendChild(dot);
    }
  }

  function reveal(i) {
    if (i <= lastShown) return;
    const photo=photos[i];
    if (!photo) return;
    photo.button.classList.add('is-visible');
    photo.button.tabIndex = 0;
    photo.button.disabled = false;
    twinkleAt(photo);
    lastShown=i;
    if (announcement && (i === 0 || i === 14 || i === 29)) announcement.textContent=(i+1)+' of 30 polaroid memories revealed.';
  }

  function finale() {
    if (finished) return;
    finished=true;
    scene.classList.add('is-finished');
    if (announcement) announcement.textContent='All thirty memories are here, ending with our picture together.';
    if (!reduced.matches && sparkleField) {
      const x = mobile.matches ? 50 : 50, y = mobile.matches ? 99 : 74;
      for (let j=0;j<19;j++) {
        const dot=document.createElement('span');
        dot.className='memory-sparkle-particle';
        dot.style.setProperty('--sx',x+'%');dot.style.setProperty('--sy',y+'%');
        dot.style.setProperty('--size',(3+random()*5)+'px');
        const angle=random()*Math.PI*2, radius=30+random()*110;
        dot.style.setProperty('--dx',Math.cos(angle)*radius+'px');
        dot.style.setProperty('--dy',Math.sin(angle)*radius+'px');
        dot.addEventListener('animationend',()=>dot.remove(),{once:true});
        sparkleField.appendChild(dot);
      }
    }
  }

  function animate(time) {
    if (!began) began=time;
    const progress=Math.max(0,Math.min(1,(time-began)/duration));
    const drawn=progress*len;
    core.style.strokeDashoffset = aura.style.strokeDashoffset = String(len-drawn);
    while (lastShown+1 < N && anchors[lastShown+1] <= drawn+8) reveal(lastShown+1);
    if (progress<1) raf=requestAnimationFrame(animate);
    else {for(let i=lastShown+1;i<N;i++)reveal(i);finale();}
  }

  function paintAmbience() {
    if (!ambience || reduced.matches || ambience.childElementCount) return;
    for(let i=0;i<24;i++) {
      const p=document.createElement('span');p.className='memory-fairy';
      p.style.setProperty('--x',(3+random()*93)+'%');p.style.setProperty('--y',(8+random()*88)+'%');
      p.style.setProperty('--size',(1.1+random()*2.5)+'px');
      p.style.setProperty('--drift',(-25+random()*50)+'px');
      p.style.setProperty('--duration',(3+random()*4)+'s');p.style.setProperty('--delay',(-random()*9)+'s');
      ambience.appendChild(p);
    }
    for(let i=0;i<14;i++) {
      const p=document.createElement('span');p.className='memory-petal';
      p.style.setProperty('--x',(random()*100)+'%');p.style.setProperty('--size',(5+random()*10)+'px');
      p.style.setProperty('--drift',(-170+random()*340)+'px');
      p.style.setProperty('--duration',(12+random()*15)+'s');p.style.setProperty('--delay',(-random()*25)+'s');
      ambience.appendChild(p);
    }
  }

  function showLightbox(i, trigger) {
    if (!lightbox || !lightboxPhoto || !lightboxLabel) return;
    const photo=photos[i]; if (!photo) return;
    lastFocused=trigger;
    lightboxPhoto.style.setProperty('--atlas-x',(photo.col*20)+'%');
    lightboxPhoto.style.setProperty('--atlas-y',(photo.row*25)+'%');
    lightboxLabel.textContent=photo.description;
    lightbox.hidden=false;
    document.body.classList.add('memory-modal-open');
    lightboxClose.focus();
  }
  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden=true;
    document.body.classList.remove('memory-modal-open');
    if (lastFocused) lastFocused.focus({preventScroll:true});
  }
  if (lightboxClose) lightboxClose.addEventListener('click',closeLightbox);
  if (lightbox) lightbox.addEventListener('click',event=>{if(event.target===lightbox)closeLightbox();});
  document.addEventListener('keydown',event=>{
    if (!lightbox || lightbox.hidden) return;
    if (event.key==='Escape') {event.preventDefault();closeLightbox();}
    if(event.key==='Tab') {event.preventDefault();lightboxClose.focus();}
  });

  let resizeJob;
  window.addEventListener('resize',()=>{
    clearTimeout(resizeJob);
    resizeJob=setTimeout(()=>{
      createPath();
      if (reduced.matches) {
        core.style.strokeDashoffset=aura.style.strokeDashoffset='0';
      } else if (!finished) {
        cancelAnimationFrame(raf);
        const time=performance.now();
        began=time - Math.min(1,(time-began)/duration)*duration;
        raf=requestAnimationFrame(animate);
      }
    },150);
  },{passive:true});

  paintAmbience();
  requestAnimationFrame(()=>{
    createPath();
    if (reduced.matches) {
      core.style.strokeDashoffset=aura.style.strokeDashoffset='0';
      photos.forEach((_,i)=>reveal(i));
      finale();
    } else {
      raf=requestAnimationFrame(animate);
    }
  });
})();
