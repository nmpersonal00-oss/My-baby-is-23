/* Render the approved image as a real, interactive 35-level selection screen. */
(() => {
 'use strict';
 const app=document.getElementById('app'),realms=window.WS_REALMS;
 if(!app||!Array.isArray(realms)||realms.length!==7)return;
 const asset='../assets/wordsearch-worlds.webp';
 const storeKey='rayans-dark-forest.wordsearch.v1';
 const coord=(x,y,w,h)=>'left:'+(x/1672*100)+'%;top:'+(y/941*100)+'%;width:'+(w/1672*100)+'%;height:'+(h/941*100)+'%';
 const safe=x=>String(x).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const cards=[
 ['souls',[88,245,397,187],[198,245,293,340,387],466,352],
 ['lies',[503,248,399,179],[609,655,703,750,797],466,413],
 ['blood',[916,248,403,179],[1020,1069,1117,1164,1211],466,472],
 ['stars',[112,527,328,210],[197,245,292,340,386],769,531],
 ['terraria',[453,526,286,210],[515,562,609,656,705],769,590],
 ['princess',[750,526,264,210],[788,834,878,924,969],769,727],
 ['hollow',[1026,527,302,210],[1088,1136,1180,1224,1265],769,658]
 ];
 let ready=false,rendering=false;
 const image=new Image();
 image.onload=()=>{ready=true;paint()};
 // Never show broken artwork if the image is still being uploaded.
 image.onerror=()=>{ready=false;document.body.classList.remove('atlas-home')};
 image.src=asset;
 function paint(){
  if(rendering||!ready)return;
  if(!app.querySelector('.world-grid')){
   if(!app.querySelector('.atlas-scene'))document.body.classList.remove('atlas-home');
   return;
  }
  rendering=true;
  let stored={};
  try{stored=JSON.parse(localStorage.getItem(storeKey)||'{}').found||{}}catch{}
  const controls=cards.map(([id,card,levels,y,meter])=>{
   const realm=realms.find(r=>r.id===id);if(!realm)return '';
   const found=realm.chapters.map((c,i)=>{
    const valid=new Set(c.words.map(w=>w.toUpperCase().replace(/[^A-Z]/g,'')));
    const list=stored[id+':'+i];
    return Array.isArray(list)?list.filter(w=>valid.has(w)).length:0;
   });
   const percent=Math.round(found.reduce((sum,n)=>sum+n,0)/175*100);
   const [x,top,w,h]=card;
   const cardLink='<a class="atlas-card" style="'+coord(x,top,w,h)+'" href="#/'+id+'/1" aria-label="Open '+safe(realm.title)+', level one">'+safe(realm.title)+'</a>';
   const pips=levels.map((center,i)=>'<a class="atlas-level '+(found[i]===35?'is-done':found[i]>0?'is-started':'')+'" href="#/'+id+'/'+(i+1)+'" style="left:'+(center/1672*100)+'%;top:'+(y/941*100)+'%" title="'+safe(realm.title)+' level '+(i+1)+': '+found[i]+' / 35 words" aria-label="'+safe(realm.title)+' level '+(i+1)+': '+found[i]+' of 35 words found">Level '+(i+1)+'</a>').join('');
   const meterMarkup=percent>0?'<span class="atlas-meter-fill" style="left:'+(1442/1672*100)+'%;top:'+((meter-3)/941*100)+'%;--fill:'+(percent/100)+'" aria-hidden="true"></span><span class="atlas-meter-number" style="left:'+(1574/1672*100)+'%;top:'+((meter-10)/941*100)+'%" aria-hidden="true">'+percent+'%</span>':'';
   return cardLink+pips+meterMarkup;
  }).join('');
  app.innerHTML='<section class="atlas-viewport" aria-label="Word Search Puzzle Worlds"><div class="atlas-scene"><img src="'+asset+'" class="atlas-art" width="1672" height="941" alt="" draggable="false"><a href="../index.html" class="atlas-return" aria-label="Back to Rayan\'s Forest">Back to Forest</a>'+controls+'<h1 class="atlas-sr">Word Search Puzzle · Rayan\'s Dark Forest</h1></div></section>';
  document.body.classList.add('atlas-home');
  rendering=false;
 }
 const observer=new MutationObserver(()=>requestAnimationFrame(paint));
 observer.observe(app,{childList:true});
 window.addEventListener('hashchange',()=>requestAnimationFrame(paint));
 paint();
})();