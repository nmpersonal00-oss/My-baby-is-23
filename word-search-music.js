/* Word Search soundtrack player. Music stays in the user's browser, not public GitHub. */
(() => {
  'use strict';
  const LABELS = {
    souls:'Dark Souls I & II', lies:'Lies of P', blood:'Bloodborne',
    stars:'Star Wars', terraria:'Terraria', princess:'Princess World',
    hollow:'Hollow Knight & Silksong'
  };
  const FOLDERS = {
    souls:[['Dark Souls I','17lQLfBUWAMITXcOv9LXST50_oN5KA1JJ'],['Dark Souls II','1EL40uxl9ZEjKA1Zh8bHWaIlxWTwqUfGq']],
    lies:[['Lies of P','1vufn3n6qk7eVAi0xbiTeioEI5ptnQBiO']],
    blood:[['Bloodborne','1FfVP6nmqG3g72lMKO4MIG56NvoLCCGaT']],
    stars:[['The Mandalorian','1bd-DElKmz10eUewagyrT8-w5wW8MTxOT'],['Jedi: Survivor','1fMMfqzcy90MOwOSvXJH2BRcuk4gLgMiJ']],
    terraria:[['Terraria','1yz7ekvmvINQEpMdNIynIFvu5AIy3dIOK']],
    princess:[['Kawaii Lofi','13MCVjqlRbap-3hhNz8kIsE3UhTK2b4zl']],
    hollow:[['Hollow Knight','1sSXqhfyeiIyT1Az0fJ6NS7r35zruwNXt'],['Silksong','1EqLTy8BvCu4dQNBiIXN1YARb-iIxNgFH']]
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
    '<div class="ws-music-main">',
    '<button type="button" id="ws-play" aria-label="Play music">▶ Play</button>',
    '<button type="button" id="ws-next" aria-label="Next song" title="Next song">⇥</button>',
    '<button type="button" id="ws-options" aria-controls="ws-details" aria-expanded="false" aria-label="Music settings">♫</button>',
    '</div><p class="ws-now-playing" id="ws-status" aria-live="polite">Preparing music…</p>',
    '<div class="ws-music-details" id="ws-details" hidden>',
    '<strong id="ws-category"></strong>',
    '<label for="ws-select">Song</label><select id="ws-select"></select>',
    '<label for="ws-volume">Volume</label><input id="ws-volume" type="range" min="0" max="100" value="55">',
    '<p>Your songs stay on this device in this browser, never in the public GitHub repository.</p>',
    '<button type="button" id="ws-add">Add songs to this world</button>',
    '<button type="button" id="ws-add-folders">Import downloaded album folders</button>',
    '<input id="ws-file-input" type="file" accept="audio/*,.mp3,.m4a,.mp4,.ogg,.wav" multiple hidden>',
    '<input id="ws-folder-input" type="file" webkitdirectory directory multiple hidden>',
    '<p>Download the songs from <a href="https://drive.google.com/drive/folders/1S38pJPgosGG6fcqvf70Gvw7U2NmgZ0s5" target="_blank" rel="noopener noreferrer">your Google Drive music folder</a> first.</p>',
    '<div class="ws-source-folders" id="ws-sources"></div>',
    '<button type="button" id="ws-delete">Remove this world’s saved songs</button>',
    '</div>'
  ].join('');
  document.body.appendChild(dock);
  const node = id => dock.querySelector('#' + id);
  const play = node('ws-play'), next = node('ws-next'), options = node('ws-options');
  const details = node('ws-details'), status = node('ws-status');
  const selection = node('ws-select'), category = node('ws-category');
  const volume = node('ws-volume'), sources = node('ws-sources');
  const fileInput = node('ws-file-input'), folderInput = node('ws-folder-input');
  const remove = node('ws-delete');
  const groups = () => Object.fromEntries(Object.keys(LABELS).map(id => [id,[]]));
  let lists = groups(), db = null, ready = false, realm = null, index = 0;
  let wantsMusic = false, userPaused = false, generation = 0, notice = '';
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
    const saved = await get('audio',song.id);
    if (!saved?.file) throw Error('Missing music file');
    const url = URL.createObjectURL(saved.file);
    objectUrls.set(song.id,url);
    return url;
  }
  async function refresh() {
    const oldId = realm ? lists[realm][index]?.id : null;
    lists = groups();
    for (const row of await get('info')) if (lists[row.realm]) lists[row.realm].push(row);
    for (const songs of Object.values(lists)) songs.sort((a,b) => a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:'base'}));
    if (realm) index = Math.max(0,lists[realm].findIndex(s => s.id === oldId));
    show();
    // Preload the first song per category, so category clicks can start sound
    // during the user gesture instead of waiting for an IndexedDB callback.
    await Promise.all(Object.values(lists).filter(songs => songs.length)
      .map(songs => songUrl(songs[0]).catch(() => null)));
  }
  function show() {
    if (!realm) return;
    const songs = lists[realm], current = songs[index];
    category.textContent = LABELS[realm] + ' soundtrack';
    play.disabled = !ready || !songs.length;
    next.disabled = !ready || songs.length < 2;
    remove.disabled = !ready || !songs.length;
    const isPlaying = !player.paused && wantsMusic;
    play.textContent = isPlaying ? '❚❚ Pause' : '▶ Play';
    play.setAttribute('aria-label',isPlaying ? 'Pause music' : 'Play music');
    selection.replaceChildren(...songs.map((song,n) => new Option(song.name,String(n))));
    selection.disabled = !songs.length;
    selection.value = String(index);
    sources.replaceChildren(...(FOLDERS[realm] || []).map(([name,id]) => {
      const a = document.createElement('a');
      a.href = 'https://drive.google.com/drive/folders/' + id;
      a.textContent = name + ' files in Drive';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      return a;
    }));
    status.textContent = notice || (!ready ? 'Loading your music library…'
      : !current ? 'No songs yet — open ♫ to add music.'
      : (isPlaying ? '♫ ' : '') + current.name);
  }
  async function start() {
    if (!realm || !ready || !wantsMusic) { show(); return; }
    const world = realm, song = lists[realm][index];
    if (!song) { notice = 'Add songs through ♫ to start your soundtrack.'; show(); return; }
    const token = ++generation;
    notice = 'Loading ' + song.name + '…';
    show();
    try {
      const url = objectUrls.get(song.id) || await songUrl(song);
      if (token !== generation || world !== realm || !wantsMusic) return;
      if (player.dataset.songId !== song.id) {
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
    index = 0;
    notice = '';
    userPaused = false;
    wantsMusic = Boolean(world);
    dock.hidden = !world;
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
    notice = 'Could not play this file. Try another song or MP3.';
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

  function recognize(path) {
    const name = path.toLowerCase();
    if (name.includes('dark souls')) return 'souls';
    if (name.includes('lies of p')) return 'lies';
    if (name.includes('bloodborne')) return 'blood';
    if (name.includes('star wars') || name.includes('mandalorian') || name.includes('jedi survivor') || name.includes('jedi- survivor')) return 'stars';
    if (name.includes('terraria')) return 'terraria';
    if (name.includes('kawaii') || name.includes('lofi')) return 'princess';
    if (name.includes('hollow knight') || name.includes('silksong')) return 'hollow';
    return null;
  }
  const audioFile = file => /\.(mp3|m4a|mp4|ogg|oga|wav|aac)$/i.test(file.name) || /^audio\//.test(file.type);
  async function importSongs(files,wholeFolder) {
    if (!db) return;
    const usable = [...files].filter(audioFile);
    let added = 0, unrecognized = 0, failed = false;
    for (const file of usable) {
      const target = wholeFolder ? recognize(file.webkitRelativePath || file.name) : realm;
      if (!target) { unrecognized++; continue; }
      const id = [target,file.webkitRelativePath || '',file.name,file.size,file.lastModified].join('::');
      notice = 'Importing songs ' + (added + 1) + ' of ' + usable.length + '…';
      show();
      try { await storeFile(id,target,file); added++; } catch { failed = true; break; }
    }
    ++generation;
    player.pause();
    player.removeAttribute('src');
    delete player.dataset.songId;
    clearUrls();
    await refresh();
    notice = added ? 'Saved ' + added + ' song(s) on this device.' : 'No recognized music files found.';
    if (unrecognized) notice += ' ' + unrecognized + ' file(s) did not match any world.';
    if (failed) notice += ' Storage is full or unavailable.';
    show();
    if (added && realm && !userPaused) { wantsMusic = true; start(); }
  }
  node('ws-add').addEventListener('click',() => fileInput.click());
  node('ws-add-folders').addEventListener('click',() => folderInput.click());
  fileInput.addEventListener('change',() => {
    const files = [...fileInput.files]; fileInput.value = '';
    importSongs(files,false).catch(() => { notice = 'Import failed. Try fewer files.'; show(); });
  });
  folderInput.addEventListener('change',() => {
    const files = [...folderInput.files]; folderInput.value = '';
    importSongs(files,true).catch(() => { notice = 'Import failed. Try fewer files.'; show(); });
  });
  remove.addEventListener('click',async () => {
    if (!db || !realm || !lists[realm].length) return;
    if (!confirm('Remove this world’s imported songs from this browser? Nothing is deleted from Google Drive.')) return;
    try {
      const ids = lists[realm].map(song => song.id);
      await new Promise((resolve,reject) => {
        const tx = db.transaction(['audio','info'],'readwrite');
        for (const id of ids) { tx.objectStore('audio').delete(id); tx.objectStore('info').delete(id); }
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
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
  route();
  openDb().then(async database => {
    db = database;
    ready = true;
    await refresh();
    if (realm && wantsMusic) start();
  }).catch(() => {
    ready = false;
    notice = 'Music storage unavailable. Try a normal browser window, not private mode.';
    show();
  });
})();