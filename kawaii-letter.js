/* Kawaii: three quicksilver keepsakes, four playful catches each, and a private letter reveal.
   Original local visuals and native browser animation only. No remote dependencies. */
(() => {
  'use strict';
  const world = document.getElementById('kawaii-world');
  const zone = document.getElementById('kawaii-fly-zone');
  const hunt = document.getElementById('kawaii-hunt');
  const reader = document.getElementById('kawaii-reader');
  const parchment = document.getElementById('kawaii-parchment');
  const envelope = document.getElementById('kawaii-envelope');
  const hint = document.getElementById('kawaii-hint');
  const sparkLayer = document.getElementById('kawaii-spark-layer');
  const replay = document.getElementById('kawaii-replay');
  const close = document.getElementById('kawaii-reader-close');
  const title = document.getElementById('kawaii-letter-title');
  if (!world || !zone || !reader || !envelope || !hint || !replay || !close) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const labels = {moon:'moon',heart:'crystal heart',rose:'enchanted rose'};
  const starts = [[.09,.32],[.47,.08],[.82,.37]];
  const directions = [[97,78],[-91,86],[-109,-66]];
  let seed = 231123;
  function rand(){seed = seed * 16807 % 2147483647;return (seed-1)/2147483646;}
  const charms = Array.from(zone.querySelectorAll('.kawaii-charm')).map((node,i)=>({
    node, name:node.dataset.keepsake, i, x:0,y:0,maxX:0,maxY:0,
    vx:directions[i][0],vy:directions[i][1],clicks:0,caught:false,
    boostUntil:0,placed:false,lastHit:0
  }));
  let complete = false;
  let reading = false;
  let lastTime = 0;
  let unlocking = false;
  let animationHandle;

  function constrain(v, min, max) {return Math.max(min,Math.min(max,v));}
  function measure() {
    if (!zone.clientWidth) return;
    for (const charm of charms) {
      const oldMaxX=charm.maxX,oldMaxY=charm.maxY;
      charm.maxX=Math.max(0,zone.clientWidth-charm.node.offsetWidth-8);
      charm.maxY=Math.max(0,zone.clientHeight-charm.node.offsetHeight-8);
      if (!charm.placed){
        charm.x=starts[charm.i][0]*charm.maxX;
        charm.y=starts[charm.i][1]*charm.maxY;
        charm.placed=true;
      } else {
        charm.x=constrain(oldMaxX?charm.x/oldMaxX*charm.maxX:charm.x,0,charm.maxX);
        charm.y=constrain(oldMaxY?charm.y/oldMaxY*charm.maxY:charm.y,0,charm.maxY);
      }
      draw(charm,performance.now());
    }
  }
  function draw(charm,now){
    if(charm.caught)return;
    const tilt=reduced.matches?0:Math.sin(now/470+charm.i*2)*5;
    const bob=reduced.matches?0:Math.sin(now/380+charm.i*1.7)*4;
    charm.node.style.transform='translate3d('+charm.x.toFixed(1)+'px,'+(charm.y+bob).toFixed(1)+'px,0) rotate('+tilt.toFixed(1)+'deg)';
  }
  function tick(now){
    const dt=lastTime?Math.min(.035,(now-lastTime)/1000):0;
    lastTime=now;
    if (!reading && !unlocking && !reduced.matches && !document.hidden){
      for(const c of charms){
        if(c.caught)continue;
        const boost=now<c.boostUntil?3.3:1;
        c.x+=c.vx*dt*boost;
        c.y+=c.vy*dt*boost;
        if(c.x<0){c.x=-c.x;c.vx=Math.abs(c.vx);}
        if(c.x>c.maxX){c.x=Math.max(0,2*c.maxX-c.x);c.vx=-Math.abs(c.vx);}
        if(c.y<0){c.y=-c.y;c.vy=Math.abs(c.vy);}
        if(c.y>c.maxY){c.y=Math.max(0,2*c.maxY-c.y);c.vy=-Math.abs(c.vy);}
        draw(c,now);
        if(c.node.classList.contains('is-dodging') && now>=c.boostUntil)c.node.classList.remove('is-dodging');
      }
    }
    animationHandle=window.requestAnimationFrame(tick);
  }

  function sparkleAt(anchor, amount=18, intensity=110){
    if(reduced.matches||!sparkLayer)return;
    const box=anchor.getBoundingClientRect();
    const centerX=box.left+box.width/2,centerY=box.top+box.height/2;
    for(let i=0;i<amount;i++){
      const bit=document.createElement('i');
      bit.className='kawaii-burst'+(i%5===0?' is-heart':'');
      const a=Math.PI*2*i/amount+rand()*.3;
      const dist=intensity*(.45+rand()*.9);
      bit.style.setProperty('--x',centerX+'px');
      bit.style.setProperty('--y',centerY+'px');
      bit.style.setProperty('--dx',(Math.cos(a)*dist).toFixed(1)+'px');
      bit.style.setProperty('--dy',(Math.sin(a)*dist).toFixed(1)+'px');
      bit.style.setProperty('--s',(3+rand()*7).toFixed(1)+'px');
      bit.style.setProperty('--scale',(0.65+rand()).toFixed(2));
      bit.style.setProperty('--duration',(700+rand()*1100).toFixed(0)+'ms');
      sparkLayer.appendChild(bit);
      bit.addEventListener('animationend',()=>bit.remove(),{once:true});
      window.setTimeout(()=>bit.remove(),2200);
    }
  }
  function dodge(c){
    const now=performance.now();
    c.boostUntil=now+1080;
    c.node.classList.add('is-dodging');
    c.vx*=-1;
    c.vy=constrain(c.vy*(rand()>.5?-1:1),-145,145);
    if(!reduced.matches){
      const sx=c.vx>=0?1:-1, sy=c.vy>=0?1:-1;
      c.x=constrain(c.x+sx*(48+rand()*35),0,c.maxX);
      c.y=constrain(c.y+sy*(24+rand()*28),0,c.maxY);
    }
    draw(c,now);
    sparkleAt(c.node,9,65);
    hint.textContent=(c.clicks===1?'Boing! ':c.clicks===2?'Almost! ':'One more! ')+labels[c.name]+' escaped!';
  }
  function capture(c){
    c.caught=true;
    c.node.classList.remove('is-dodging');
    c.node.classList.add('is-caught');
    c.node.setAttribute('aria-label',labels[c.name]+' collected');
    c.node.disabled=true;
    const slot=document.querySelector('[data-slot="'+c.name+'"]');
    if(slot){slot.classList.add('is-filled');slot.setAttribute('aria-label',labels[c.name]+' collected');}
    sparkleAt(c.node,31,185);
    const count=charms.filter(charm=>charm.caught).length;
    hint.textContent=count===3?'All three! The royal letter is opening…':count+' of 3 collected! Catch the others!';
    if(count===3){complete=true;unlocking=true;
      window.setTimeout(()=>{
        envelope.classList.add('is-opening');
        sparkleAt(envelope,60,265);
      },600);
      window.setTimeout(()=>{unlocking=false;showReader();},1750);
    }
  }
  function pressCharm(c){
    if(c.caught||reading||unlocking)return;
    const now=performance.now();
    if(now-c.lastHit<125)return;
    c.lastHit=now;
    c.clicks++;
    c.node.setAttribute('aria-label','Catch '+labels[c.name]+'. '+c.clicks+' of 4 catches.');
    if(c.clicks<4)dodge(c);
    else capture(c);
  }
  function showReader(){
    if(!complete)return;
    reading=true;
    reader.hidden=false;
    hunt.hidden=true;
    world.classList.add('kawaii-reading');
    parchment.scrollTop=0;
    document.body.style.overflow='hidden';
    sparkleAt(parchment,45,200);
    window.setTimeout(()=>title.focus({preventScroll:true}),30);
  }
  function hideReader(){
    reading=false;
    reader.hidden=true;
    hunt.hidden=false;
    envelope.classList.remove('is-opening');
    world.classList.remove('kawaii-reading');
    document.body.style.overflow='';
    hint.textContent='All three keepsakes collected. Tap the envelope to read your letter.';
    envelope.focus({preventScroll:true});
    lastTime=0;
  }
  function reset(){
    reading=false;complete=false;unlocking=false;lastTime=0;
    reader.hidden=true;hunt.hidden=false;
    envelope.classList.remove('is-opening','is-wiggling');
    world.classList.remove('kawaii-reading');
    hint.textContent='Catch all three keepsakes to unlock my letter.';
    document.body.style.overflow='';
    for(const c of charms){
      c.node.classList.remove('is-caught','is-dodging');
      c.node.disabled=false;
      c.node.style.opacity='';
      c.node.setAttribute('aria-label','Catch '+labels[c.name]+'. 0 of 4 catches.');
      c.caught=false;c.clicks=0;c.boostUntil=0;c.lastHit=0;c.placed=false;
      c.vx=directions[c.i][0];c.vy=directions[c.i][1];
      const slot=document.querySelector('[data-slot="'+c.name+'"]');
      if(slot){slot.classList.remove('is-filled');slot.setAttribute('aria-label',labels[c.name]+' not yet collected');}
    }
    measure();
    envelope.focus({preventScroll:true});
  }
  charms.forEach(c=>c.node.addEventListener('click',()=>pressCharm(c)));
  envelope.addEventListener('click',()=>{
    if(complete){showReader();return;}
    envelope.classList.remove('is-wiggling');void envelope.offsetWidth;
    envelope.classList.add('is-wiggling');
    hint.textContent='The seal is still locked! Chase the three keepsakes first.';
  });
  close.addEventListener('click',hideReader);
  replay.addEventListener('click',reset);
  window.addEventListener('resize',()=>{lastTime=0;measure();},{passive:true});
  document.addEventListener('visibilitychange',()=>{lastTime=0;});
  document.addEventListener('keydown',event=>{
    if(!reading)return;
    if(event.key==='Escape'){event.preventDefault();hideReader();return;}
    if(event.key!=='Tab')return;
    const items=Array.from(reader.querySelectorAll('button:not([disabled]),a[href]'));
    if(!items.length)return;
    const first=items[0],last=items[items.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    else if(!reader.contains(document.activeElement)){event.preventDefault();first.focus();}
  });
  if(!reduced.matches && sparkLayer){
    for(let i=0;i<33;i++){
      const dot=document.createElement('i');dot.className='kawaii-starlet';
      dot.style.setProperty('--x',(3+rand()*94).toFixed(1)+'%');
      dot.style.setProperty('--y',(8+rand()*82).toFixed(1)+'%');
      dot.style.setProperty('--s',(1.2+rand()*2.8).toFixed(1)+'px');
      dot.style.setProperty('--time',(3.6+rand()*5).toFixed(1)+'s');
      dot.style.setProperty('--delay',(-rand()*10).toFixed(1)+'s');
      sparkLayer.appendChild(dot);
    }
  }
  window.addEventListener('load',measure,{once:true});
  measure();
  animationHandle=window.requestAnimationFrame(tick);
})();
