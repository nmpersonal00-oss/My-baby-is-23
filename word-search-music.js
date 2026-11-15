/* Word Search soundtrack player: streamed albums when hosting is connected, with local import fallback. */
(() => {
  'use strict';
  const HOSTED = Boolean(window.FOREST_AUDIO_CONFIG?.baseUrl && window.FOREST_AUDIO_MANIFEST?.worlds);
  const LABELS = {
    souls:'Dark Souls I & II', lies:'Lies of P', blood:'Bloodborne',
    stars:'Star Wars', terraria:'Terraria', princess:'Princess World',
    hollow:'Hollow Knight & Silksong'
  };
  const player = document.createElement('audio');
  player.preload = 'auto';
  player.volume = 0.55;
  player.setAttribute('aria-label','Word Search background music');
  document.body.appendChild(player);
  const dock = document.createElement('aside');
  dock.className = 'ws-music-dock';
  dock.hidden = true;
  dock.setAttribute('aria-label','Word Search soundtrack');
  dock.innerHTML = [
    '<button type="button" class="ws-music-toggle" id="ws-music-toggle" aria-label="Expand world music controls" aria-expanded="false" aria-controls="ws-music-body" title="World music">✦</button>',
    '<div class="ws-music-body" id="ws-music-body" hidden>',
    '<div class="ws-music-main">',
    '<button type="button" id="ws-play" aria-label="Play music">▶ Play</button>',
    '<button type="button" id="ws-next" aria-label="Next song" title="Next song">⇥</button>',
    '<button type="button" id="ws-options" aria-controls="ws-details" aria-expanded="false" aria-label="Music settings">♫</button>',
    '</div><p class="ws-now-playing" id="ws-status" aria-live="polite">Preparing music…</p>',
    '<div class="ws-music-details" id="ws-details" hidden>',
    '<strong id="ws-category"></strong>',
    '<label for="ws-select">Song</label><select id="ws-select"></select>',
    '<label for="ws-volume">Volume</label><input id="ws-volume" type="range" min="0" max="100" value="55">',
    '<div class="ws-local-area" id="ws-local-area">',
    '<strong>Drag your music folders into the Forest</strong>',
    '<p id="ws-local-help">Drag a downloaded, extracted album folder anywhere onto this page. Or click Choose music folder. The songs play directly from his laptop.</p>',
    '<button type="button" id="ws-add-folders">Choose music folder</button>',

    '<button type="button" id="ws-add">Or choose audio files</button>',
    '<div id="ws-local-drop" class="ws-local-drop" aria-label="Drop music folder here">Drop your music folders anywhere onto the Forest</div>',

    '<p class="ws-local-feedback" id="ws-local-feedback" role="status" aria-live="polite">Music stays on the laptop. Reselect the folder after closing the site.</p>',
    '</div>',
    '<input id="ws-file-input" type="file" accept="audio/*,.mp3,.m4a,.mp4,.ogg,.wav,.aac,.flac" multiple hidden>',
    '<button type="button" id="ws-delete">Remove this world’s saved songs</button>',
    '</div>',
    '</div>'
  ].join('');
  document.body.appendChild(dock);
  const node = id => dock.querySelector('#' + id);
  const musicToggle = node('ws-music-toggle'), musicBody = node('ws-music-body');
  musicToggle.addEventListener('click', () => {
    musicBody.hidden = !musicBody.hidden;
    const open = !musicBody.hidden;
    dock.classList.toggle('is-open', open);
    musicToggle.setAttribute('aria-expanded', String(open));
    musicToggle.setAttribute('aria-label', open ? 'Minimize world music controls' : 'Expand world music controls');
  });
  const play = node('ws-play'), next = node('ws-next'), options = node('ws-options');
  const details = node('ws-details'), status = node('ws-status');
  const selection = node('ws-select'), category = node('ws-category');
  const volume = node('ws-volume');
  const fileInput = node('ws-file-input');
  const localFeedback = node('ws-local-feedback');
  const remove = node('ws-delete');
  const hub = window.forestLocalMusic;
  const groups = () => Object.fromEntries(Object.keys(LABELS).map(id => [id,[]]));
  let lists = groups(), db = null, ready = false, realm = null, index = 0;
  let wantsMusic = false, userPaused = false, generation = 0, notice = '';
  // The shared library holds read-only laptop files across game navigation.
  const objectUrls = new Map();
  try {
    const savedVolume = localStorage.getItem('rayans-wordsearch-music-volume');
    if (savedVolume !== null) {
      const value = Number(savedVolume);
      if (Number.isFinite(value) && value >= 0 && value <= 1) player.volume = value;
    }
  } catch {}
  volume.value = String(Math.round(player.volume * 100));

  function openDb() {
    return new Promise((resolve,reject) => {
      if (!window.indexedDB) { reject(Error('Music storage unavailable')); return; }
      const req = indexedDB.open('rayans-wordsearch-music-v1',1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains('audio')) req.result.createObjectStore('audio',{keyPath:'id'});
        if (!req.result.objectStoreNames.contains('info')) req.result.createObjectStore('info',{keyPath:'id'});
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(Error('Close the other app tab and retry'));
    });
  }
  function get(store,key) {
    return new Promise((resolve,reject) => {
      const request = db.transaction(store,'readonly').objectStore(store);
      const result = key === undefined ? request.getAll() : request.get(key);
      result.onsuccess = () => resolve(result.result);
      result.onerror = () => reject(result.error);
    });
  }
  function storeFile(id,world,file) {
    return new Promise((resolve,reject) => {
      const tx = db.transaction(['audio','info'],'readwrite');
      tx.objectStore('audio').put({id,file});
      tx.objectStore('info').put({id,realm:world,name:file.name,size:file.size});
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }
  function clearUrls() {
    objectUrls.forEach(url => URL.revokeObjectURL(url));
    objectUrls.clear();

  }
  async function songUrl(song) {
    if (objectUrls.has(song.id)) return objectUrls.get(song.id);
    const sharedFile = hub?.getFile(song.id);
    if (sharedFile) {
      const url = URL.createObjectURL(sharedFile);
      objectUrls.set(song.id,url);
      return url;
    }
    if (!db) throw Error('Music has not been imported');
    const saved = await get('audio',song.id);
    if (!saved?.file) throw Error('Missing music file');
    const url = URL.createObjectURL(saved.file);
    objectUrls.set(song.id,url);
    return url;
  }
  async function refresh() {
    const oldId = realm ? lists[realm][index]?.id : null;
    lists = groups();
    if (db) for (const row of await get('info')) if (lists[row.realm]) lists[row.realm].push(row);
    if (hub) for (const world of Object.keys(lists)) lists[world].push(...hub.worldSongs(world));
    for (const songs of Object.values(lists)) songs.sort((a,b) => a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:'base'}));
    if (realm) {
      index = Math.max(0,lists[realm].findIndex(s => s.id === oldId));
      player.loop = lists[realm].length === 1;
    }
    show();
    // Preload the first song per category, so category clicks can start sound
    // during the user gesture instead of waiting for an IndexedDB callback.
    await Promise.all(Object.values(lists).map(songs => songs[0])
      .filter(Boolean).map(song => songUrl(song).catch(() => null)));
  }
  function show() {
    if (!realm) return;
    const songs = lists[realm], current = songs[index];
    category.textContent = LABELS[realm] + ' soundtrack';
    play.disabled = !ready || !songs.length;
    next.disabled = !ready || songs.length < 2;
    remove.disabled = !ready || !songs.length || HOSTED;
    const isPlaying = !player.paused && wantsMusic;
    play.textContent = isPlaying ? '❚❚ Pause' : '▶ Play';
    play.setAttribute('aria-label',isPlaying ? 'Pause music' : 'Play music');
    selection.replaceChildren(...songs.map((song,n) => new Option(song.name,String(n))));
    selection.disabled = !songs.length;
    selection.value = String(index);
    status.textContent = notice || (!ready ? 'Loading your music library…'
      : !current ? (HOSTED ? 'This soundtrack is being prepared.' : 'No songs yet — open ♫ to add music.')
      : (isPlaying ? '♫ ' : '') + current.name);
  }
  async function start() {
    if (!realm || !ready || !wantsMusic) { show(); return; }
    const world = realm, song = lists[realm][index];
    if (!song) { notice = HOSTED ? 'Soundtrack unavailable.' : 'Add songs through ♫ to start your soundtrack.'; show(); return; }
    const token = ++generation;
    notice = 'Loading ' + song.name + '…';
    show();
    try {
      if (player.dataset.songId !== song.id) {
        const url = song.key ? window.forestMusicUrl(song.key)
          : objectUrls.get(song.id) || await songUrl(song);
        if (!url) throw Error('Music hosting URL is not configured');
        if (token !== generation || world !== realm || !wantsMusic) return;
        player.pause();
        player.src = url;
        player.dataset.songId = song.id;
        player.load();
      }
      const attempt = player.play();
      if (attempt && typeof attempt.then === 'function') await attempt;
      if (token !== generation || !wantsMusic) return;
      notice = '';
    } catch (err) {
      if (token !== generation) return;
      notice = err?.name === 'NotAllowedError'
        ? 'Tap Play to enable sound in this browser.'
        : HOSTED ? 'Music could not load from the sound library. Try Next.'
        : 'This file cannot play here. Choose another song or try MP3.';
    }
    show();
  }
  function enter(world) {
    if (world === realm) return;
    ++generation;
    player.pause();
    player.removeAttribute('src');
    delete player.dataset.songId;
    player.load();

    realm = world;
    player.loop = Boolean(world && lists[world]?.length === 1);
    index = 0;
    notice = '';
    userPaused = false;
    wantsMusic = Boolean(world);
    dock.hidden = !world;
    musicBody.hidden = true;
    dock.classList.remove('is-open');
    musicToggle.setAttribute('aria-expanded', 'false');
    musicToggle.setAttribute('aria-label', 'Expand world music controls');
    // The parent shell owns the Cozy Library track while chapters are framed.
    // Tell it to pause/resume whenever a Word Search category is entered/left.
    try {
      if (window !== window.parent && window.parent.forestMusicShell) {
        // Synchronous handoff within the click gesture maximizes autoplay
        // compatibility and prevents two soundtracks overlapping.
        window.parent.forestCozyMusicControl?.setWorldActive(Boolean(world));
        window.parent.postMessage({ type: 'forest:word-search-world', active: Boolean(world) }, location.origin);
      }
    } catch {}
    details.hidden = true;
    options.setAttribute('aria-expanded','false');
    if (world) { show(); start(); }
  }
  function route() {
    const found = location.hash.match(/^#\/([a-z]+)\/[1-5]$/);
    enter(found && LABELS[found[1]] ? found[1] : null);
  }
  function clickedWorld(event) {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return null;
    const href = target.closest('a[href^="#/"]')?.getAttribute('href');
    const match = href?.match(/^#\/([a-z]+)\/[1-5]$/);
    if (match && LABELS[match[1]]) return match[1];
    const button = target.closest('[data-open]');
    if (!button) return null;
    const number = Number(button.dataset.open.split(':')[0]);
    const world = window.WS_REALMS?.[number]?.id;
    return LABELS[world] ? world : null;
  }
  // Capture the category click before the hashchange event.
  document.addEventListener('click',event => {
    const world = clickedWorld(event);
    if (world && world !== realm) enter(world);
  },true);
  window.addEventListener('hashchange',route);
  function retry(event) {
    if (!realm || !ready || userPaused || !wantsMusic || !player.paused || !lists[realm].length) return;
    if (dock.contains(event.target)) return;
    start();
  }
  document.addEventListener('pointerdown',retry,{passive:true});
  document.addEventListener('keydown',retry);
  play.addEventListener('click',() => {
    if (!realm || !lists[realm].length) return;
    if (wantsMusic && (!player.paused || notice.startsWith('Loading'))) {
      wantsMusic = false;
      userPaused = true;
      ++generation;
      player.pause();
      notice = 'Paused';
      show();
    } else {
      wantsMusic = true;
      userPaused = false;
      notice = '';
      start();
    }
  });
  function advance() {
    if (!realm || !lists[realm].length) return;
    index = (index + 1) % lists[realm].length;
    wantsMusic = true;
    userPaused = false;
    notice = '';
    start();
  }
  next.addEventListener('click',advance);
  player.addEventListener('ended',advance);
  player.addEventListener('play',show);
  player.addEventListener('pause',show);
  player.addEventListener('error',() => {
    if (!realm || !player.currentSrc) return;
    notice = HOSTED ? 'This track could not load. Try Next.' : 'Could not play this file. Try another song or MP3.';
    show();
  });
  selection.addEventListener('change',() => {
    index = Number(selection.value) || 0;
    wantsMusic = true;
    userPaused = false;
    notice = '';
    start();
  });
  options.addEventListener('click',() => {
    details.hidden = !details.hidden;
    options.setAttribute('aria-expanded',String(!details.hidden));
  });
  volume.addEventListener('input',() => {
    player.volume = Number(volume.value) / 100;
    try { localStorage.setItem('rayans-wordsearch-music-volume',String(player.volume)); } catch {}
  });

  // All folder imports share the same app-wide music library, including
  // folders dropped onto the homepage or any other chapter.
  function showLibraryUpdate({message}) {
    if (message) localFeedback.textContent = message;
    ++generation;
    player.pause();
    player.removeAttribute('src');
    delete player.dataset.songId;
    clearUrls();
    refresh().then(() => {
      if (!realm || !lists[realm].length) { show(); return; }
      const firstShared = hub.worldSongs(realm)[0];
      if (firstShared) {
        const found = lists[realm].findIndex(song => song.id === firstShared.id);
        if (found >= 0) index = found;
      }
      if (!userPaused) { wantsMusic = true; start(); }
      else show();
    }).catch(error => {
      localFeedback.textContent = 'Could not refresh songs: ' + (error?.message || 'Try again.');
    });
  }
  const unsubscribeLibrary = hub?.subscribe(showLibraryUpdate);
  window.addEventListener('pagehide',() => unsubscribeLibrary?.());
  node('ws-add-folders').addEventListener('click',() => {
    if (hub?.chooseFolder) hub.chooseFolder();
    else localFeedback.textContent = 'Folder chooser unavailable. Refresh and try again.';
  });
  node('ws-add').addEventListener('click',() => fileInput.click());
  fileInput.addEventListener('change',() => {
    const files = [...(fileInput.files || [])];
    fileInput.value = '';
    if (!files.length) return;
    if (!hub) { localFeedback.textContent = 'Music importer unavailable. Refresh the page.'; return; }
    hub.importRecords(files.map(file => ({file,path:file.name})),{world:realm});
  });
    remove.addEventListener('click',async () => {
    if (!realm || !lists[realm].length || HOSTED) return;
    if (!confirm('Remove this world’s songs from the website? The music files on the laptop will not be deleted.')) return;
    try {
      const ids = lists[realm].filter(song => !song.id.startsWith('local:')).map(song => song.id);
      if (db && ids.length) await new Promise((resolve,reject) => {
        const tx = db.transaction(['audio','info'],'readwrite');
        for (const id of ids) { tx.objectStore('audio').delete(id); tx.objectStore('info').delete(id); }
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
      hub?.clearWorld(realm);
      ++generation;
      player.pause();
      player.removeAttribute('src');
      delete player.dataset.songId;
      clearUrls();
      wantsMusic = false;
      await refresh();
      notice = 'Removed from this browser only.';
      show();
    } catch { notice = 'Could not remove saved songs.'; show(); }
  });
  window.addEventListener('pagehide',() => player.pause());
  window.addEventListener('pageshow',event => {
    if (event.persisted && realm && wantsMusic && player.paused) start();
  });
  window.addEventListener('beforeunload',clearUrls);
  window.forestMusicDiagnostics = () => ({
    world:realm, trackCount:realm ? lists[realm].length : 0,
    playing:!player.paused, storageReady:ready
  });
  if (HOSTED) {
    lists = Object.fromEntries(Object.keys(LABELS).map(id => [
      id, (window.FOREST_AUDIO_MANIFEST.worlds[id] || []).map(song => ({
        id: song.id, name: song.name, key: song.key
      }))
    ]));
    ready = true;
    node('ws-add').hidden = true;
    node('ws-add-folders').hidden = true;
    remove.hidden = true;
    const help = node('ws-local-help');
    if (help) help.textContent = 'These songs are built into the Forest soundtrack library. No uploads needed.';

  }
  route();
  if (HOSTED) {
    show();
    if (realm && wantsMusic) start();
  } else openDb().then(async database => {
    db = database;
    ready = true;
    await refresh();
    if (realm && wantsMusic) start();
  }).catch(() => {
    // Browser storage is optional; laptop files still play directly.
    db = null;
    ready = true;
    refresh().catch(() => {});
    notice = 'Saved songs unavailable. Add a music folder from the laptop instead.';
    show();
  });
})();