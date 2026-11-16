(() => {
  "use strict";
  // The entire viewport is the playfield. A first catch speeds up only
  // that envelope; catching the same envelope again opens its own blank page.
  const board = document.getElementById("love-letter-playfield");
  const announcer = document.getElementById("love-announcer");
  const sparkLayer = document.getElementById("love-glimmer");
  if (!board) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const start = [[.12,.23],[.71,.13],[.81,.71],[.38,.65],[.46,.34]];
  const speed = [[137,81],[-113,119],[-149,-95],[116,-137],[157,103]];
  const letters = Array.from(board.querySelectorAll("[data-letter]")).map((el,i)=>({
    el,i,name:el.dataset.letter,x:0,y:0,maxX:0,maxY:0,
    vx:speed[i][0],vy:speed[i][1],teased:false,boostUntil:0,
    placed:false
  }));
  let previous = 0;
  let lastKeyboard = false;
  let seed = 199923;
  const rand = () => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646;

  if (sparkLayer && !reducedMotion.matches) {
    for (let i=0;i<26;i++) {
      const el=document.createElement("i");
      el.className="love-spark";
      el.style.setProperty("--x",(2+rand()*96).toFixed(2)+"%");
      el.style.setProperty("--y",(5+rand()*90).toFixed(2)+"%");
      el.style.setProperty("--s",(1.4+rand()*2.6).toFixed(1)+"px");
      el.style.setProperty("--dur",(3+rand()*5).toFixed(1)+"s");
      el.style.setProperty("--delay",(-rand()*12).toFixed(1)+"s");
      el.style.setProperty("--drift",(-25+rand()*50).toFixed(1)+"px");
      sparkLayer.appendChild(el);
    }
    for (let i=0;i<9;i++) {
      const el=document.createElement("i");
      el.className="love-falling-petal";
      el.style.setProperty("--x",(5+rand()*90).toFixed(2)+"%");
      el.style.setProperty("--s",(5+rand()*9).toFixed(1)+"px");
      el.style.setProperty("--dur",(10+rand()*14).toFixed(1)+"s");
      el.style.setProperty("--delay",(-rand()*25).toFixed(1)+"s");
      el.style.setProperty("--drift",(-160+rand()*320).toFixed(1)+"px");
      sparkLayer.appendChild(el);
    }
  }

  function clamp(value,min,max) { return Math.max(min,Math.min(max,value)); }
  function measure() {
    const w=board.clientWidth,h=board.clientHeight;
    if (w===0||h===0) return;
    for (const letter of letters) {
      const formerX=letter.maxX,formerY=letter.maxY;
      letter.maxX=Math.max(0,w-letter.el.offsetWidth-8);
      letter.maxY=Math.max(0,h-letter.el.offsetHeight-8);
      if(!letter.placed) {
        letter.x=letter.maxX*start[letter.i][0];
        letter.y=letter.maxY*start[letter.i][1];
        letter.placed=true;
      } else {
        letter.x=clamp(formerX?letter.x/formerX*letter.maxX:letter.x,0,letter.maxX);
        letter.y=clamp(formerY?letter.y/formerY*letter.maxY:letter.y,0,letter.maxY);
      }
      letter.el.style.transform="translate3d("+letter.x+"px,"+letter.y+"px,0)";
    }
  }

  function move(time) {
    const dt=previous?Math.min((time-previous)/1000,.034):0;
    previous=time;
    // Interactive chase remains playable even when OS reduced-motion is enabled.
    // Decorative petals and glimmers still respect that accessibility preference.
    if(!document.hidden) {
      const rangeScale=clamp(board.clientWidth/1180,.75,1.28);
      for(const l of letters) {
        if(lastKeyboard&&document.activeElement===l.el)continue;
        const multiplier=time<l.boostUntil?2.85:1;
        l.x+=l.vx*rangeScale*multiplier*dt;
        l.y+=l.vy*rangeScale*multiplier*dt;
        if(l.x<0){l.x=0;l.vx=Math.abs(l.vx)}
        if(l.x>l.maxX){l.x=l.maxX;l.vx=-Math.abs(l.vx)}
        if(l.y<0){l.y=0;l.vy=Math.abs(l.vy)}
        if(l.y>l.maxY){l.y=l.maxY;l.vy=-Math.abs(l.vy)}
        const tilt=Math.sin(time/850+l.i*1.6)*4;
        const bob=Math.sin(time/650+l.i*2.2)*4;
        l.el.style.transform="translate3d("+l.x.toFixed(2)+"px,"+(l.y+bob).toFixed(2)+"px,0) rotate("+tilt.toFixed(2)+"deg)";
        if(time>=l.boostUntil)l.el.classList.remove("is-dashing");
      }
    }
    window.requestAnimationFrame(move);
  }

  for(const l of letters) {
    l.el.addEventListener("click",event=>{
      if(l.teased) return; // second click: follow the real href
      event.preventDefault();
      l.teased=true;
      l.boostUntil=performance.now()+2800;
      l.el.classList.add("is-dashing");
      l.vx*=-1; l.vy*=-1;
      l.x=clamp(l.x+Math.sign(l.vx)*18,0,l.maxX);
      l.y=clamp(l.y+Math.sign(l.vy)*12,0,l.maxY);
      l.el.setAttribute("aria-label",l.name+". Catch again to open.");
      if(announcer)announcer.textContent=l.name+" darted away! Catch it again.";
    });
  }

  document.addEventListener("keydown",()=>{lastKeyboard=true});
  document.addEventListener("pointerdown",()=>{lastKeyboard=false},{passive:true});
  document.addEventListener("visibilitychange",()=>{previous=0});
  window.addEventListener("resize",measure,{passive:true});
  if(reducedMotion.addEventListener)reducedMotion.addEventListener("change",()=>{previous=0;measure()});
  measure();
  window.requestAnimationFrame(move);
})();
