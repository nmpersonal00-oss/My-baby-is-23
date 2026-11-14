/* Rayan's Dark Forest: discreet category soundtrack links.
 * YouTube's player must remain visible when it plays; never obscure the puzzle
 * with an embedded video or use an invisible audio-only YouTube iframe. */
(() => {
  'use strict';
  const SOUNDTRACKS = {
    souls: [
      {label:'Dark Souls soundtrack',kind:'playlist',id:'PLxh_0CD1_70Or5zVrJS7G5jWehpTzFNH6',url:'https://www.youtube.com/watch?v=iZ0Yp79Odl8&list=PLxh_0CD1_70Or5zVrJS7G5jWehpTzFNH6'}
    ],
    lies: [
      {label:'Lies of P soundtrack',kind:'playlist',id:'OLAK5uy_nNysIktxUo4ylYfm9jiIrM0LVe4r3x6aM',url:'https://youtube.com/playlist?list=OLAK5uy_nNysIktxUo4ylYfm9jiIrM0LVe4r3x6aM'}
    ],
    blood: [
      {label:'Bloodborne soundtrack',kind:'playlist',id:'OLAK5uy_ksDVl9ILD0rpEIzn7rXkw49gXIjd5PerE',url:'https://youtube.com/playlist?list=OLAK5uy_ksDVl9ILD0rpEIzn7rXkw49gXIjd5PerE'}
    ],
    stars: [
      {label:'Star Wars — special track',kind:'video',id:'oJZfEh3EciU',url:'https://youtu.be/oJZfEh3EciU'},
      {label:'Star Wars — playlist 1',kind:'playlist',id:'PLTmJuovQUxPtYb0bWHsXs58fGhwAXH1Ov',url:'https://www.youtube.com/watch?v=qn7uTlqrJ9M&list=PLTmJuovQUxPtYb0bWHsXs58fGhwAXH1Ov'},
      {label:'Star Wars — playlist 2',kind:'playlist',id:'PLDisKgcnAC4Q2BAuwB1Eub1iDQo0LTZ2X',url:'https://www.youtube.com/watch?v=rW0q8ZbcNxc&list=PLDisKgcnAC4Q2BAuwB1Eub1iDQo0LTZ2X'}
    ],
    terraria: [
      {label:'Terraria soundtrack',kind:'playlist',id:'OLAK5uy_ks1N_G2FdFTULuwfUsR_cMZmKwcFiTonk',url:'https://youtube.com/playlist?list=OLAK5uy_ks1N_G2FdFTULuwfUsR_cMZmKwcFiTonk'}
    ],
    princess: [
      {label:'My Princess World soundtrack',kind:'playlist',id:'PLBbaCNQOmOYZMN7j6qa5dI-qEL7an35hh',url:'https://www.youtube.com/watch?v=dpCmtvtRAog&list=PLBbaCNQOmOYZMN7j6qa5dI-qEL7an35hh'}
    ],
    hollow: [
      {label:'Hollow Knight soundtrack',kind:'playlist',id:'PLmOldskd2VbKCFNaN2kRCGbFVZaKPpeZ-',url:'https://www.youtube.com/watch?v=243Uguc-6mQ&list=PLmOldskd2VbKCFNaN2kRCGbFVZaKPpeZ-'},
      {label:'Silksong soundtrack',kind:'playlist',id:'PLbNT78Q7M14yC4iIN4RaQqGa6q6zY6bqc',url:'https://www.youtube.com/watch?v=yUfD7w5y3Ug&list=PLbNT78Q7M14yC4iIN4RaQqGa6q6zY6bqc'}
    ]
  };
  const NAMES = {
    souls:'Dark Souls I & II',lies:'Lies of P',blood:'Bloodborne',
    stars:'Star Wars',terraria:'Terraria',princess:'Princess World',
    hollow:'Hollow Knight & Silksong'
  };

  const pickKey='rayans-dark-forest.wordsearch.playlist-choice.v2';
  let choices={};
  try{choices=JSON.parse(localStorage.getItem(pickKey)||'{}')||{};}catch{}
  let realm=null;
  const wrap=document.createElement('aside');
  wrap.className='ws-music-dock';
  wrap.hidden=true;
  wrap.setAttribute('aria-label','Soundtrack playlists');
  wrap.innerHTML=`<button type="button" class="ws-music-tab" id="ws-music-tab" aria-expanded="false" aria-controls="ws-music-menu"><span aria-hidden="true">♫</span><span id="ws-music-label">Soundtracks</span><span aria-hidden="true" class="ws-music-arrow">⌄</span></button>
  <div class="ws-music-menu" id="ws-music-menu" hidden>
    <p class="ws-music-caption">YOUR SOUNDTRACKS</p>
    <label class="ws-music-field" for="ws-music-source">Choose playlist</label>
    <select id="ws-music-source" aria-label="Choose a soundtrack playlist"></select>
    <a id="ws-music-youtube-link" class="ws-music-open" target="_blank" rel="noopener noreferrer">Listen on YouTube ↗</a>
    <p class="ws-music-help">Playlists open separately so no video covers your word search. Songs continue in YouTube's playlist.</p>
  </div>`;
  document.body.append(wrap);
  const tab=wrap.querySelector('#ws-music-tab');
  const menu=wrap.querySelector('#ws-music-menu');
  const source=wrap.querySelector('#ws-music-source');
  const link=wrap.querySelector('#ws-music-youtube-link');
  const label=wrap.querySelector('#ws-music-label');
  const save=()=>{try{localStorage.setItem(pickKey,JSON.stringify(choices));}catch{}};
  const update=()=>{
    const sources=SOUNDTRACKS[realm]||[];
    if(!sources.length)return;
    let index=Number(choices[realm]||0);
    if(!Number.isInteger(index)||index<0||index>=sources.length)index=0;
    choices[realm]=index;
    source.replaceChildren(...sources.map((entry,i)=>new Option(entry.label,String(i))));
    source.value=String(index);
    link.href=sources[index].url;
    link.setAttribute('aria-label','Listen to '+sources[index].label+' on YouTube in a separate tab');
    label.textContent=NAMES[realm]+' ♫';
  };
  const sync=()=>{
    const match=location.hash.match(/^#\/([a-z]+)\/[1-5]$/);
    const next=match&&SOUNDTRACKS[match[1]]?match[1]:null;
    if(!next){
      wrap.hidden=true;menu.hidden=true;tab.setAttribute('aria-expanded','false');
      return;
    }
    wrap.hidden=false;
    if(realm!==next){realm=next;update();}
  };
  tab.addEventListener('click',()=>{
    menu.hidden=!menu.hidden;
    tab.setAttribute('aria-expanded',String(!menu.hidden));
  });
  source.addEventListener('change',()=>{
    if(!realm)return;
    const index=Number(source.value);
    if(!Number.isInteger(index)||index<0||index>=SOUNDTRACKS[realm].length)return;
    choices[realm]=index;save();
    update();
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!menu.hidden){
      menu.hidden=true;tab.setAttribute('aria-expanded','false');tab.focus();
    }
  });
  window.addEventListener('hashchange',sync);
  sync();
  window.forestMusicDiagnostics=()=>({
    world:realm,sourceCount:realm?SOUNDTRACKS[realm].length:0,
    selection:realm?Number(choices[realm]||0):0,
    embeddedPlayer:false
  });
})();
