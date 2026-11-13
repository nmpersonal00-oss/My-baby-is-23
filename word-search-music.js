/* Rayan's Dark Forest: category-based YouTube soundtrack player.
 * Official YouTube embeds only. Audio starts with user consent/browser permission.
 * Music source changes with the Word Search world, never with its level. */
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
  const KEY='rayans-dark-forest.wordsearch.music.v1';
  let saved={};
  try { saved=JSON.parse(localStorage.getItem(KEY)||'{}')||{}; } catch {}
  const settings={
    enabled:saved.enabled !== false,
    picks:saved.picks && typeof saved.picks === 'object' ? saved.picks : {}
  };
  const remember=()=>{
    try {localStorage.setItem(KEY,JSON.stringify(settings));} catch {}
  };
  let world=null, sourceIndex=0, player=null, ready=false, playing=false;
  let apiPending=false, loadingSource=false, skipBusy=false, lastListKey='', soundStarted=false;
  const dock=document.createElement('aside');
  dock.className='ws-music-dock';
  dock.hidden=true;
  dock.setAttribute('aria-label','Puzzle world soundtrack');
  dock.innerHTML=
    '<button type="button" class="ws-music-tab" id="ws-music-tab" aria-expanded="false" aria-controls="ws-music-menu">'+
      '<span aria-hidden="true">♫</span><span id="ws-music-label">World music</span><span class="ws-music-arrow" aria-hidden="true">⌄</span>'+
    '</button>'+
    '<div class="ws-music-menu" id="ws-music-menu" hidden>'+
      '<div class="ws-music-caption">ENCHANTED SOUNDTRACK</div>'+
      '<div class="ws-music-mode" role="group" aria-label="Music on or off">'+
        '<button type="button" id="ws-music-on">On</button>'+
        '<button type="button" id="ws-music-off">Off</button>'+
      '</div>'+
      '<label class="ws-music-field" for="ws-music-source">Soundtrack</label>'+
      '<select id="ws-music-source" aria-label="Choose soundtrack playlist"></select>'+
      '<label class="ws-music-field" for="ws-music-track">Choose a song</label>'+
      '<select id="ws-music-track" aria-label="Choose a song from this playlist" disabled>'+
        '<option>Loading song list…</option></select>'+
      '<div class="ws-music-transport" role="group" aria-label="Song playback">'+
        '<button type="button" id="ws-music-back" title="Previous track" aria-label="Previous track">❮❮</button>'+
        '<button type="button" id="ws-music-play">Play</button>'+
        '<button type="button" id="ws-music-next" title="Next track" aria-label="Next track">❯❯</button>'+
      '</div>'+
      '<a id="ws-music-youtube-link" target="_blank" rel="noopener noreferrer">Open playlist on YouTube ↗</a>'+
    '</div>'+
    '<div class="ws-music-video" id="ws-music-video" hidden>'+
      '<div id="ws-music-player"></div>'+
      '<p id="ws-music-status" class="ws-music-status" role="status" aria-live="polite">Preparing your soundtrack…</p>'+
    '</div>';
  document.body.appendChild(dock);
  const find=id=>dock.querySelector('#'+id);
  const tab=find('ws-music-tab'),menu=find('ws-music-menu'),video=find('ws-music-video');
  const label=find('ws-music-label'),sourceSelect=find('ws-music-source'),trackSelect=find('ws-music-track');
  const playButton=find('ws-music-play'),onButton=find('ws-music-on'),offButton=find('ws-music-off');
  const status=find('ws-music-status'),link=find('ws-music-youtube-link');
  const sources=()=>world?SOUNDTRACKS[world]:[];
  const source=()=>sources()[sourceIndex]||sources()[0];
  const note=msg=>{status.textContent=msg;};
  const stateText=()=>{playButton.textContent=playing?'Pause':'Play';};
  function updateMode(){
    dock.classList.toggle('ws-music-on',settings.enabled);
    onButton.classList.toggle('selected',settings.enabled);
    offButton.classList.toggle('selected',!settings.enabled);
    onButton.setAttribute('aria-pressed',String(settings.enabled));
    offButton.setAttribute('aria-pressed',String(!settings.enabled));
    label.textContent=settings.enabled?(NAMES[world]+' ♫'):(NAMES[world]+' · Off');
    video.hidden=!settings.enabled;
    stateText();
  }
  function fillSources(){
    sourceSelect.textContent='';
    sources().forEach((s,index)=>{
      const opt=document.createElement('option');
      opt.value=String(index);
      opt.textContent=s.label;
      sourceSelect.append(opt);
    });
    sourceSelect.value=String(sourceIndex);
    const s=source();
    link.href=s?s.url:'#';
    link.textContent=s?'Open '+s.label+' on YouTube ↗':'Open YouTube ↗';
    trackSelect.replaceChildren(new Option('Songs load with YouTube',''));
    trackSelect.disabled=true;
    lastListKey='';
  }
  function updateTracks(){
    if(!player||!ready||!source())return;
    let ids=[];
    if(source().kind==='video'){
      ids=[source().id];
    }else{
      try{ids=player.getPlaylist()||[];}catch{}
    }
    if(!ids.length){
      if(source().kind==='playlist'){
        trackSelect.replaceChildren(new Option('Choose a song in the YouTube player',''));
        trackSelect.disabled=true;
      }
      return;
    }
    const listKey=world+':'+sourceIndex+':'+ids.join(',');
    if(lastListKey!==listKey){
      lastListKey=listKey;
      const options=ids.map((id,index)=>new Option('Song '+String(index+1).padStart(2,'0'),String(index)));
      trackSelect.replaceChildren(...options);
      trackSelect.disabled=ids.length===1;
    }
    let index=0;
    try {index=source().kind==='video'?0:Math.max(0,player.getPlaylistIndex());}catch{}
    if(index<ids.length)trackSelect.value=String(index);
    let title='';
    try{title=(player.getVideoData()||{}).title||'';}catch{}
    if(title && index<ids.length){
      const opt=trackSelect.options[index];
      if(opt)opt.textContent='Song '+String(index+1).padStart(2,'0')+' · '+title.slice(0,70);
    }
    if(playing)note((title||source().label)+' · '+(index+1)+'/'+ids.length);
  }
  function loadSource(autoPlay){
    if(!world||!settings.enabled||!player||!ready)return;
    const s=source();
    if(!s)return;
    loadingSource=true;
    playing=false;stateText();fillSources();
    note('Loading '+s.label+'…');
    try{
      player.setLoop(false);
      if(s.kind==='video'){
        if(autoPlay)player.loadVideoById({videoId:s.id});
        else player.cueVideoById({videoId:s.id});
      }else{
        const args={listType:'playlist',list:s.id,index:0};
        if(autoPlay)player.loadPlaylist(args);
        else player.cuePlaylist(args);
      }
      loadingSource=false;
    }catch(err){
      loadingSource=false;
      note('YouTube could not load this soundtrack. Try the playlist link.');
    }
  }
  function nextSource(){
    if(skipBusy||!sources().length)return;
    skipBusy=true;
    sourceIndex=(sourceIndex+1)%sources().length;
    settings.picks[world]=sourceIndex;remember();
    loadSource(true);
    setTimeout(()=>{skipBusy=false;},800);
  }
  function previousSource(){
    if(!sources().length)return;
    sourceIndex=(sourceIndex+sources().length-1)%sources().length;
    settings.picks[world]=sourceIndex;remember();
    loadSource(true);
  }
  function nextSong(){
    if(!ready||!player)return;
    const s=source(),ids=s.kind==='playlist'?(player.getPlaylist()||[]):[s.id];
    const index=s.kind==='video'?0:Math.max(0,player.getPlaylistIndex());
    if(s.kind==='video'||(ids.length&&index>=ids.length-1)){nextSource();return;}
    if(ids.length){player.nextVideo();return;}
    nextSource();
  }
  function previousSong(){
    if(!ready||!player)return;
    const s=source();
    const index=s.kind==='video'?0:Math.max(0,player.getPlaylistIndex());
    if(s.kind==='video'||index===0){previousSource();return;}
    player.previousVideo();
  }
  function setEnabled(enabled){
    settings.enabled=enabled;remember();updateMode();
    if(enabled){
      if(!player){loadAPI();return;}
      if(ready){try {player.playVideo();}catch{loadSource(true);}}
      note('Tap Play if your browser blocks automatic music.');
    }else{
      playing=false;stateText();
      if(player&&ready){try{player.stopVideo();}catch{}}
    }
  }
  function createPlayer(){
    if(player||!world||!settings.enabled||!window.YT||!YT.Player)return;
    video.hidden=false;
    try{
      player=new YT.Player('ws-music-player',{
        width:'250',height:'205',
        playerVars:{autoplay:0,controls:1,playsinline:1,rel:0,origin:location.origin},
        events:{
          onReady(event){
            ready=true;
            try{
              event.target.getIframe().setAttribute('allow','autoplay; encrypted-media; picture-in-picture; fullscreen');
              event.target.setLoop(false);
            }catch{}
            if(world&&settings.enabled)loadSource(true);
          },
          onStateChange(event){
            if(!window.YT||!YT.PlayerState)return;
            if(event.data===YT.PlayerState.PLAYING){
              playing=true;soundStarted=true;stateText();updateTracks();
            }else if(event.data===YT.PlayerState.PAUSED){
              playing=false;stateText();note('Paused · press Play to resume');
            }else if(event.data===YT.PlayerState.CUED){
              updateTracks();
            }else if(event.data===YT.PlayerState.ENDED && settings.enabled){
              playing=false;stateText();
              // YouTube advances automatically inside the playlist. Only the
              // final song switches to the next supplied playlist.
              const s=source();
              let ids=[],index=-1;
              try{ids=event.target.getPlaylist()||[];index=event.target.getPlaylistIndex();}catch{}
              if(!s||s.kind==='video'||(ids.length>0&&index>=ids.length-1)) nextSource();
            }
          },
          onAutoplayBlocked(){
            playing=false;stateText();
            note('Tap Play once to start the music in this browser.');
            menu.hidden=false;tab.setAttribute('aria-expanded','true');
          },
          onError(event){
            playing=false;stateText();
            const code=event.data;
            if(code===100||code===101||code===150){
              note('A YouTube track cannot play here. Skipping…');
              setTimeout(()=>{if(settings.enabled&&world)nextSong();},500);
            }else{
              note('This YouTube video is unavailable. Try another song or the playlist link.');
            }
          }
        }
      });
    }catch{
      note('YouTube player could not initialize. Use the playlist link.');
    }
  }
  function loadAPI(){
    if(!settings.enabled||!world)return;
    if(window.YT&&YT.Player){createPlayer();return;}
    if(apiPending)return;
    apiPending=true;
    note('Connecting to YouTube…');
    const previous=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=()=>{
      if(typeof previous==='function')previous();
      apiPending=false;createPlayer();
    };
    const script=document.createElement('script');
    script.src='https://www.youtube.com/iframe_api';
    script.async=true;
    script.onerror=()=>{apiPending=false;note('YouTube is blocked in this browser. Open the playlist on YouTube.');};
    document.head.appendChild(script);
  }
  function syncRoute(){
    const match=location.hash.match(/^#\/([a-z]+)\/[1-5]$/);
    const nextWorld=match&&SOUNDTRACKS[match[1]]?match[1]:null;
    if(!nextWorld){
      dock.hidden=true;
      if(player&&ready)try{player.pauseVideo();}catch{}
      playing=false;stateText();
      return;
    }
    dock.hidden=false;
    if(nextWorld===world){
      updateMode();
      if(settings.enabled&&player&&ready&&!playing){
        try{player.playVideo();}catch{}
      }
      return;
    }
    world=nextWorld;
    const desired=Number(settings.picks[world]);
    sourceIndex=Number.isInteger(desired)&&desired>=0&&desired<sources().length?desired:0;
    fillSources();updateMode();
    if(settings.enabled){
      if(!player)loadAPI();
      else if(ready)loadSource(true);
      note('The '+NAMES[world]+' soundtrack is ready. Tap Play if needed.');
    }
  }
  tab.addEventListener('click',()=>{
    menu.hidden=!menu.hidden;
    tab.setAttribute('aria-expanded',String(!menu.hidden));
  });
  onButton.addEventListener('click',()=>setEnabled(true));
  offButton.addEventListener('click',()=>setEnabled(false));
  playButton.addEventListener('click',()=>{
    if(!settings.enabled){setEnabled(true);return;}
    if(!ready||!player){loadAPI();return;}
    try{
      if(playing)player.pauseVideo();
      else player.playVideo();
    }catch{note('Please press Play in the YouTube player.');}
  });
  sourceSelect.addEventListener('change',()=>{
    sourceIndex=Math.max(0,Math.min(sources().length-1,Number(sourceSelect.value)||0));
    settings.picks[world]=sourceIndex;remember();
    if(!settings.enabled)setEnabled(true);
    else if(ready)loadSource(true);
    else loadAPI();
  });
  trackSelect.addEventListener('change',()=>{
    if(!ready||!player||trackSelect.disabled)return;
    const index=Number(trackSelect.value);
    if(!Number.isInteger(index)||index<0)return;
    if(!settings.enabled)setEnabled(true);
    try{
      if(source().kind==='playlist')player.playVideoAt(index);
      else player.playVideo();
    }catch{note('Use the YouTube player to select this song.');}
  });
  find('ws-music-next').addEventListener('click',nextSong);
  find('ws-music-back').addEventListener('click',previousSong);
  // Song title and playlist contents are supplied by the embedded player.
  // Refresh the menu as YouTube advances through tracks automatically.
  setInterval(()=>{if(world&&ready&&settings.enabled&&!dock.hidden)updateTracks();},1800);
  window.addEventListener('hashchange',syncRoute);
  syncRoute();
  window.forestMusicDiagnostics=()=>({
    world,sourceCount:sources().length,
    sourceIds:sources().map(s=>s.id),
    enabled:settings.enabled,playing,ready,
    sourceIndex,iframePresent:!!dock.querySelector('iframe'),
    trackChoices:trackSelect.options.length
  });
})();
