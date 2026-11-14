(() => {
"use strict";
const W=1670,H=941,stage=document.getElementById("memory-stage"),holder=document.getElementById("memory-holder");
const categories=["Hollow Knight","Hollow Knight Silksong","Shadow of the Colossus","Lies of P","Terraria","Dark Souls","Bloodborne","Sanrio"];
const $=id=>document.getElementById(id);let chosenCategory=0,chosenRound=0;
function fit(){const scale=Math.min(innerWidth/W,innerHeight/H);holder.style.width=(W*scale)+"px";holder.style.height=(H*scale)+"px";stage.style.transform="scale("+scale+")";}
function hotspot(parent,x,y,w,h,label,click){const b=document.createElement("button");b.type="button";b.className="hotspot";b.style.cssText="left:"+x+"px;top:"+y+"px;width:"+w+"px;height:"+h+"px";b.setAttribute("aria-label",label);b.addEventListener("click",click);parent.appendChild(b);return b;}
const catButtons=[],roundButtons=[];
categories.forEach((name,i)=>{const ys=[260,323,384,447,507,568,629,690];const b=hotspot($("categories"),233,ys[i],284,59,"Choose "+name,()=>chooseCategory(i));catButtons.push(b);});
for(let i=0;i<5;i++){let b=hotspot($("rounds"),1153+i*56,190,52,57,"Choose round "+(i+1),()=>chooseRound(i));roundButtons.push(b);}
const gifYs=[269,322,376,430,483,538,592,644,699,753];
for(let i=0;i<10;i++){hotspot($("image-slots"),579,gifYs[i],245,50,"Empty image position "+(i+1),()=>{$("memory-status").textContent="Image and name content have not been added yet.";});hotspot($("name-slots"),1170,gifYs[i],265,50,"Empty name position "+(i+1),()=>{$("memory-status").textContent="Image and name content have not been added yet.";});}
function sync(){
  catButtons.forEach((b,i)=>{b.classList.toggle("chosen",i===chosenCategory);b.classList.toggle("original-selected",i===0);b.setAttribute("aria-pressed",String(i===chosenCategory));});
  roundButtons.forEach((b,i)=>{b.classList.toggle("chosen",i===chosenRound);b.classList.toggle("original-selected",i===0);b.setAttribute("aria-pressed",String(i===chosenRound));});
  const cd=$("category-display");cd.textContent=categories[chosenCategory];cd.style.display=chosenCategory===0?"none":"flex";cd.style.fontSize=categories[chosenCategory].length>20?"18px":"27px";
  const rd=$("round-display");rd.textContent="Round "+(chosenRound+1)+" of 5";rd.style.display=chosenRound===0?"none":"flex";
}
function chooseCategory(i){chosenCategory=i;chosenRound=0;sync();$("memory-status").textContent=categories[i]+", round 1 selected.";}
function chooseRound(i){chosenRound=i;sync();$("memory-status").textContent="Round "+(i+1)+" of 5 selected.";}
window.addEventListener("resize",fit,{passive:true});sync();fit();
})();