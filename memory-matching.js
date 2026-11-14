(() => {
  "use strict";
  const W=1670,H=941;
  const stage=document.getElementById("memory-stage"),holder=document.getElementById("memory-holder");
  const categories=["Hollow Knight","Hollow Knight Silksong","Shadow of the Colossus","Lies of P","Terraria","Dark Souls","Bloodborne","Sanrio"];
  const $=id=>document.getElementById(id);
  let shownCategory=0,shownRound=0,chosenCategory=null,chosenRound=null;
  const categoryButtons=[],roundButtons=[];
  function fit(){const width=holder.clientWidth||innerWidth,height=holder.clientHeight||innerHeight;stage.style.transform=`scale(${width/W},${height/H})`;}
  function hotspot(parent,x,y,w,h,label,click){const b=document.createElement("button");b.type="button";b.className="hotspot";b.style.cssText=`left:${x}px;top:${y}px;width:${w}px;height:${h}px`;b.setAttribute("aria-label",label);b.addEventListener("click",click);parent.appendChild(b);return b;}
  const catYs=[260,322,385,446,507,568,629,690];
  categories.forEach((name,i)=>categoryButtons.push(hotspot($("categories"),231,catYs[i],286,58,`Choose ${name}`,()=>chooseCategory(i))));
  const roundXs=[1152,1228,1288,1346,1404];
  roundXs.forEach((x,i)=>roundButtons.push(hotspot($("rounds"),x,188,56,62,`Choose round ${i+1}`,()=>chooseRound(i))));
  const svgFrame=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 264 49" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="inner" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#11152a"/><stop offset=".55" stop-color="#140c27"/><stop offset="1" stop-color="#0b0b20"/></linearGradient><linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff0b5"/><stop offset=".36" stop-color="#cf8135"/><stop offset=".65" stop-color="#ffd084"/><stop offset="1" stop-color="#aa582a"/></linearGradient></defs><path d="M24 3 L240 3 Q247 3 248 9 L252 13 L252 18 L260 25 L252 31 L252 36 L246 44 L23 45 L16 42 L12 37 L8 35 L8 30 L3 25 L8 19 L8 14 L13 11 Q14 4 24 3Z" fill="url(#inner)" stroke="url(#gold)" stroke-width="2.4" stroke-linejoin="round"/><path d="M22 7 L237 7 M23 41 L240 41" fill="none" stroke="#a56c39" stroke-width=".9" opacity=".7"/><path d="M13 17 L18 15 L18 10 M13 33 L18 35 L18 40 M247 10 L244 15 L250 18 M247 39 L243 35 L249 31" fill="none" stroke="#f4c37c" stroke-width="1.4"/><circle cx="13" cy="25" r="1.3" fill="#ffd893"/><circle cx="251" cy="25" r="1.3" fill="#ffd893"/></svg>`;
  const ys=[266,320,375,429,484,538,592,647,701,756];
  for(let i=0;i<10;i++){
    const gif=hotspot($("image-slots"),575,ys[i],254,48,`Empty image position ${i+1}`,()=>{$("memory-status").textContent="This slot will be filled later.";});
    gif.classList.add('empty-slot');gif.innerHTML=svgFrame;
    const name=hotspot($("name-slots"),1167,ys[i],278,48,`Empty name position ${i+1}`,()=>{$("memory-status").textContent="This slot will be filled later.";});
    name.classList.add('empty-slot');name.innerHTML=svgFrame;
  }
  function sync(){
    categoryButtons.forEach((b,i)=>{b.classList.toggle("chosen",i===chosenCategory);b.setAttribute("aria-pressed",String(i===chosenCategory));});
    roundButtons.forEach((b,i)=>{b.classList.toggle("chosen",i===chosenRound);b.setAttribute("aria-pressed",String(i===chosenRound));});
    const name=categories[shownCategory];
    const cd=$("category-display");cd.textContent=name;cd.style.fontSize=name.length>22?"17px":name.length>15?"21px":"28px";
    $("round-display").textContent=`Round ${shownRound+1} of 5`;
  }
  function chooseCategory(i){shownCategory=i;shownRound=0;chosenCategory=i;chosenRound=null;sync();$("memory-status").textContent=`${categories[i]} chosen.`;}
  function chooseRound(i){shownRound=i;chosenRound=i;sync();$("memory-status").textContent=`Round ${i+1} of 5 chosen.`;}
  window.addEventListener('resize',fit,{passive:true});sync();fit();
})();
