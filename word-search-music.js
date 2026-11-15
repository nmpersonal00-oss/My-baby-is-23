/* Word Search soundtrack player: streamed albums when hosting is connected, with local import fallback. */
(() => {
  'use strict';
  const HOSTED = Boolean(window.FOREST_AUDIO_CONFIG?.baseUrl && window.FOREST_AUDIO_MANIFEST?.worlds);
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
    '<div class="ws-drive-area" id="ws-drive-area">',
    '<strong>Play songs from Google Drive</strong>',
    '<p>No album downloads or uploads. Connect your Google account, then drop or paste a folder link.</p>',
    '<button type="button" id="ws-drive-connect">Connect Google Drive</button>',
    '<label for="ws-drive-link">Google Drive music folder</label>',
    '<div class="ws-drive-drop" id="ws-drive-drop">',
    '<span>Drop a Google Drive folder link here</span>',
    '<input id="ws-drive-link" type="url" inputmode="url" value="https://drive.google.com/drive/folders/1S38pJPgosGG6fcqvf70Gvw7U2NmgZ0s5" placeholder="Or paste the folder link" autocomplete="off">',
    '</div>',
    '<button type="button" id="ws-drive-add">Use this Drive folder</button>',
    '<p class="ws-drive-feedback" id="ws-drive-feedback" role="status" aria-live="polite"></p>',
    '</div>',
    '<div class="ws-local-area" id="ws-local-area">',
    '<strong>Music already on this laptop</strong>',
    '<p id="ws-local-help">Choose the downloaded music folder or drag it here. Songs play directly from the selected folder—no upload or browser storage required.</p>',
    '<button type="button" id="ws-add-folders">Choose music folder</button>',
    '<button type="button" id="ws-add-folders-fallback" hidden>Use regular folder chooser</button>',
    '<button type="button" id="ws-add">Or choose audio files</button>',
    '<div id="ws-local-drop" class="ws-local-drop" aria-label="Drop a local music folder or audio files">Drop a downloaded folder or audio files here</div>',
    '<label class="ws-remember-label" for="ws-remember"><input id="ws-remember" type="checkbox"> Remember songs in this browser (optional; needs free storage)</label>',
    '<p class="ws-local-feedback" id="ws-local-feedback" role="status" aria-live="polite">Select a folder to get started. The songs stay on your laptop.</p>',
    '</div>',
    '<input id="ws-file-input" type="file" accept="audio/*,.mp3,.m4a,.mp4,.ogg,.wav,.aac,.flac" multiple hidden>',
    '<input id="ws-folder-input" type="file" webkitdirectory directory multiple hidden>',
    '<p id="ws-local-download-note">Only if you prefer local import: download songs from <a href="https://drive.google.com/drive/folders/1S38pJPgosGG6fcqvf70Gvw7U2NmgZ0s5" target="_blank" rel="noopener noreferrer">your Google Drive music folder</a>. The Drive option above needs no download.</p>',
    '<div class="ws-source-folders" id="ws-sources"></div>',
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
  const volume = node('ws-volume'), sources = node('ws-sources');
  const fileInput = node('ws-file-input'), folderInput = node('ws-folder-input');
  const fallbackFolderButton = node('ws-add-folders-fallback');
  const localDrop = node('ws-local-drop'), localFeedback = node('ws-local-feedback');
  const rememberLocal = node('ws-remember');
  const remove = node('ws-delete');
  const driveArea = node('ws-drive-area'), driveConnect = node('ws-drive-connect');
  const driveInput = node('ws-drive-link'), driveDrop = node('ws-drive-drop');
  const driveAdd = node('ws-drive-add'), driveFeedback = node('ws-drive-feedback');
  const DRIVE_STORAGE = 'rayans-wordsearch-drive-folders-v1';
  const groups = () => Object.fromEntries(Object.keys(LABELS).map(id => [id,[]]));
  function readDriveSongs() {
    try {
      const saved = JSON.parse(localStorage.getItem(DRIVE_STORAGE) || '{}');
      const result = groups();
      for (const world of Object.keys(result)) {
        result[world] = (Array.isArray(saved[world]) ? saved[world] : [])
          .filter(s => /^[\w-]{15,}$/.test(s.driveId || '') && typeof s.name === 'string')
          .map(s => ({ id:'drive:' + s.driveId, driveId:s.driveId, name:s.name }));
      }
      return result;
    } catch { return groups(); }
  }
  let driveSongs = readDriveSongs();
  function rememberDriveSongs() {
    try { localStorage.setItem(DRIVE_STORAGE,JSON.stringify(driveSongs)); }
    catch { driveFeedback.textContent = 'Your browser cannot remember the folder. It will work for this visit.'; }
  }
  let lists = groups(), db = null, ready = false, realm = null, index = 0;
  let wantsMusic = false, userPaused = false, generation = 0, notice = '';
  // File objects are references to selected laptop files, not uploaded copies.
  // Avoid IndexedDB quota failures for the full ~3 GB music collection.
  const sessionFiles = new Map();
  const sessionSongs = new Map();
  const objectUrls = new Map();
  let importingLocal = false;
  let activeDriveUrl = null;
  function revokeDriveUrl() {
    if (activeDriveUrl) URL.revokeObjectURL(activeDriveUrl);
    activeDriveUrl = null;
  }
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
    revokeDriveUrl();
  }
  async function songUrl(song) {
    if (song.driveId) {
      if (!window.forestDrive?.hasAccess()) throw Error('Connect Google Drive in ♫ settings to play this music.');
      const blob = await window.forestDrive.audioBlob(song.driveId);
      return URL.createObjectURL(blob);
    }
    if (objectUrls.has(song.id)) return objectUrls.get(song.id);
    if (sessionFiles.has(song.id)) {
      const url = URL.createObjectURL(sessionFiles.get(song.id));
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
    for (const song of sessionSongs.values()) {
      if (!lists[song.realm]) continue;
      const previous = lists[song.realm].findIndex(row => row.id === song.id);
      if (previous < 0) lists[song.realm].push(song);
      else lists[song.realm][previous] = song;
    }
    for (const world of Object.keys(driveSongs)) lists[world].push(...driveSongs[world]);
    for (const songs of Object.values(lists)) songs.sort((a,b) => a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:'base'}));
    if (realm) {
      index = Math.max(0,lists[realm].findIndex(s => s.id === oldId));
      player.loop = lists[realm].length === 1;
    }
    show();
    // Preload the first song per category, so category clicks can start sound
    // during the user gesture instead of waiting for an IndexedDB callback.
    await Promise.all(Object.values(lists).map(songs => songs.find(s => !s.driveId))
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
    sources.replaceChildren(...(FOLDERS[realm] || []).map(([name,id]) => {
      const a = document.createElement('a');
      a.href = 'https://drive.google.com/drive/folders/' + id;
      a.textContent = name + ' files in Drive';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      return a;
    }));
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
        if (token !== generation || world !== realm || !wantsMusic) {
          if (song.driveId) URL.revokeObjectURL(url);
          return;
        }
        player.pause();
        player.src = url;
        player.dataset.songId = song.id;
        const oldDriveUrl = activeDriveUrl;
        activeDriveUrl = song.driveId ? url : null;
        player.load();
        if (oldDriveUrl) URL.revokeObjectURL(oldDriveUrl);
      }
      const attempt = player.play();
      if (attempt && typeof attempt.then === 'function') await attempt;
      if (token !== generation || !wantsMusic) return;
      notice = '';
    } catch (err) {
      if (token !== generation) return;
      notice = err?.name === 'NotAllowedError'
        ? 'Tap Play to enable sound in this browser.'
        : song.driveId ? (err?.message || 'Could not play this Google Drive song. Check your access.')
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
    revokeDriveUrl();
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

  function recognize(path) {
    const name = path.toLowerCase();
    if (name.includes('dark souls')) return 'souls';
    if (name.includes('lies of p')) return 'lies';
    if (name.includes('bloodborne')) return 'blood';
    if (name.includes('star wars') || name.includes('mandalorian') || /jedi[\s:\-]*survivor/.test(name)) return 'stars';
    if (name.includes('terraria')) return 'terraria';
    if (name.includes('kawaii') || name.includes('lofi')) return 'princess';
    if (name.includes('hollow knight') || name.includes('silksong')) return 'hollow';
    return null;
  }
  const audioFile = file => /\.(mp3|m4a|mp4|ogg|oga|wav|aac|flac)$/i.test(file.name) || /^audio\//.test(file.type);
  const localPath = entry => String(entry.path || entry.file.webkitRelativePath || entry.file.name || '');
  function setLocalFeedback(text) {
    localFeedback.textContent = text;
    if (realm) {
      notice = text;
      show();
    }
  }
  async function importSongs(items, wholeFolder) {
    if (importingLocal) {
      setLocalFeedback('A folder is already being added. Finish that selection first.');
      return;
    }
    importingLocal = true;
    node('ws-add').disabled = true;
    node('ws-add-folders').disabled = true;
    try {
      const records = [...items].map(item => item.file ? item : {file:item,path:item.webkitRelativePath || item.name});
      const usable = records.filter(item => audioFile(item.file));
      if (!usable.length) {
        setLocalFeedback(records.some(item => /\.zip$/i.test(item.file.name))
          ? 'This is a ZIP archive. Extract it on the laptop first, then choose the extracted music folder.'
          : 'No playable audio found. Choose a folder containing MP3, M4A, WAV, OGG, AAC or FLAC files.');
        return;
      }
      // A recognized album folder routes to its world automatically. If a
      // downloaded folder has an unfamiliar name, use the currently open world.
      const recognized = usable.map(item => recognize(localPath(item)));
      const hasNamedWorlds = recognized.some(Boolean);
      if (!realm && !hasNamedWorlds) {
        setLocalFeedback('Open a Word Search world first, then choose its album folder.');
        return;
      }
      let added = 0, skipped = 0;
      const newlyAdded = [];
      for (let i = 0; i < usable.length; i++) {
        const item = usable[i], file = item.file;
        const target = wholeFolder
          ? recognized[i] || (hasNamedWorlds ? null : realm) : realm;
        if (!target) { skipped++; continue; }
        const path = localPath(item);
        const id = [target,path,file.size,file.lastModified].join('::');
        const song = {id,realm:target,name:file.name,size:file.size};
        sessionFiles.set(id,file);
        sessionSongs.set(id,song);
        newlyAdded.push({song,file});
        added++;
      }
      if (!added) {
        setLocalFeedback('No songs matched this world. Open the matching world and choose its folder.');
        return;
      }
      // Make songs playable immediately, without saving gigs of audio to
      // IndexedDB or waiting for a long, potentially failing import.
      ++generation;
      player.pause();
      player.removeAttribute('src');
      delete player.dataset.songId;
      clearUrls();
      await refresh();
      const firstForWorld = newlyAdded.find(({song}) => song.realm === realm);
      if (firstForWorld && realm) {
        const selectedIndex = lists[realm].findIndex(song => song.id === firstForWorld.song.id);
        if (selectedIndex >= 0) index = selectedIndex;
        show();
      }
      const summary = 'Ready: ' + added + ' song' + (added === 1 ? '' : 's') +
        ' from the selected folder. No upload needed; play them during this visit.' +
        (skipped ? ' ' + skipped + ' did not match a named world.' : '');
      setLocalFeedback(summary);
      if (realm && !userPaused && lists[realm].length) {
        wantsMusic = true;
        start();
      }
      if (rememberLocal.checked) {
        if (!db) {
          setLocalFeedback(summary + ' Browser storage is unavailable, so select the folder again next visit.');
        } else {
          let saved = 0;
          let failure = null;
          for (const {song,file} of newlyAdded) {
            try {
              await storeFile(song.id,song.realm,file);
              saved++;
              if (saved % 10 === 0) {
                localFeedback.textContent = 'Music is ready. Saving ' + saved + ' of ' + newlyAdded.length + ' for next time…';
              }
            } catch (error) {
              failure = error;
              break;
            }
          }
          if (failure) {
            setLocalFeedback(summary + ' Saved ' + saved + ' for next time. Browser storage is full or blocked; the other songs still play this visit.');
          } else {
            setLocalFeedback(summary + ' Saved all ' + saved + ' songs in this browser for next time.');
          }
        }
      }
    } catch (error) {
      setLocalFeedback('Could not read that folder: ' + (error?.message || 'try selecting a smaller folder.'));
    } finally {
      importingLocal = false;
      node('ws-add').disabled = HOSTED;
      node('ws-add-folders').disabled = HOSTED;
      fallbackFolderButton.disabled = HOSTED;
    }
  }

  // The File System Access picker avoids the browser's misleading "Upload
  // these files?" confirmation. It grants only read access to the chosen folder.
  async function readChosenDirectory(handle, prefix = '') {
    const path = prefix + handle.name + '/';
    const records = [];
    for await (const child of handle.values()) {
      if (child.kind === 'file') {
        const file = await child.getFile();
        records.push({file,path:path + file.name});
      } else if (child.kind === 'directory') {
        records.push(...await readChosenDirectory(child,path));
      }
    }
    return records;
  }
  function entryFile(entry) {
    return new Promise((resolve,reject) => entry.file(resolve,reject));
  }
  function readEntries(reader) {
    return new Promise((resolve,reject) => reader.readEntries(resolve,reject));
  }
  async function walkDroppedEntry(entry,prefix) {
    if (entry.isFile) {
      const file = await entryFile(entry);
      return [{file,path:prefix + file.name}];
    }
    if (!entry.isDirectory) return [];
    const result = [], reader = entry.createReader();
    // DirectoryReader can return only the first 100 entries per call.
    while (true) {
      const children = await readEntries(reader);
      if (!children.length) break;
      for (const child of children) {
        result.push(...await walkDroppedEntry(child,prefix + entry.name + '/'));
      }
    }
    return result;
  }
  async function droppedFiles(transfer) {
    const items = [...(transfer.items || [])].filter(item => item.kind === 'file');
    const entries = items.map(item => item.webkitGetAsEntry?.()).filter(Boolean);
    if (entries.length) {
      const all = [];
      for (const entry of entries) all.push(...await walkDroppedEntry(entry,''));
      return all;
    }
    return [...transfer.files].map(file => ({file,path:file.webkitRelativePath || file.name}));
  }
  async function connectGoogleDrive() {
    const drive = window.forestDrive;
    if (!drive) throw Error('Google Drive integration could not load. Refresh this page.');
    await drive.connect();
    driveConnect.textContent = 'Google Drive connected';
    driveFeedback.textContent = 'Connected. Drop or paste your music folder link below.';
  }
  driveConnect.addEventListener('click',() => {
    if (!window.forestDrive?.configured) {
      // A working, no-download fallback until the gift creator sets up OAuth.
      // The user can play music in Google Drive; do not claim it is connected in-app.
      window.open('https://drive.google.com/drive/folders/1S38pJPgosGG6fcqvf70Gvw7U2NmgZ0s5', '_blank', 'noopener,noreferrer');
      return;
    }
    // Begin Google's popup directly from the click event.
    connectGoogleDrive().then(() => {
      if (realm && lists[realm].length && wantsMusic) start();
    }).catch(error => { driveFeedback.textContent = error.message; });
  });

  async function addDriveFolder() {
    const drive = window.forestDrive;
    if (!drive) throw Error('Google Drive integration could not load. Refresh the page.');
    if (!drive.configured) throw Error('In-app music needs Google Drive setup first. Use Open music in Google Drive instead; no download is needed.');
    const folderId = drive.folderId(driveInput.value);
    if (!folderId) throw Error('Copy a Google Drive folder link, then paste it here.');
    if (!drive.hasAccess()) await drive.connect();
    driveFeedback.textContent = 'Reading the music folder from Google Drive…';
    const {tracks} = await drive.listFolder(folderId);
    if (!tracks.length) throw Error('No audio files found in this folder or its subfolders.');
    let added = 0, matched = 0;
    for (const track of tracks) {
      const world = recognize(track.path) || realm;
      if (!world) continue;
      matched++;
      const songs = driveSongs[world];
      const entry = { id:'drive:' + track.fileId, driveId:track.fileId, name:track.name };
      const old = songs.findIndex(s => s.id === entry.id);
      if (old < 0) { songs.push(entry); added++; }
      else songs[old] = entry;
    }
    if (!matched) throw Error('The folder has songs, but none match a music world. Open a world and try again.');
    rememberDriveSongs();
    await refresh();
    driveFeedback.textContent = added
      ? added + ' songs linked from Drive. Nothing was downloaded to this device.'
      : 'This Drive folder is already linked. Your songs are ready.';
    notice = '';
    show();
    if (realm && !userPaused) { wantsMusic = true; start(); }
  }
  driveAdd.addEventListener('click',() => {
    driveAdd.disabled = true;
    addDriveFolder().catch(error => { driveFeedback.textContent = error.message; })
      .finally(() => { driveAdd.disabled = false; });
  });
  driveDrop.addEventListener('dragover',event => { event.preventDefault(); driveDrop.classList.add('is-dragging'); });
  driveDrop.addEventListener('dragleave',() => driveDrop.classList.remove('is-dragging'));
  driveDrop.addEventListener('drop',event => {
    event.preventDefault();
    driveDrop.classList.remove('is-dragging');
    const transfer = event.dataTransfer;
    const text = transfer?.getData('text/uri-list') || transfer?.getData('text/plain') ||
      transfer?.getData('text/html') || '';
    const match = text.match(/https?:\/\/drive\.google\.com\/[^\s"'<>]+/i);
    if (match && window.forestDrive?.folderId(match[0])) {
      driveInput.value = match[0];
      // Do not open an OAuth popup outside a direct button click.
      driveFeedback.textContent = 'Folder link received. Click “Use this Drive folder”.';
    } else {
      driveFeedback.textContent = 'Drive did not share a folder link. In Google Drive, choose Copy link and paste it here.';
    }
  });
  if (!window.forestDrive?.configured) {
    // Never display an inert "Connect" button when no OAuth client ID exists.
    driveConnect.textContent = 'Open music in Google Drive';
    driveFeedback.textContent = 'In-app Google Drive playback needs one-time setup. Meanwhile, tap the button above to play in Google Drive without downloading albums.';
    const help = document.createElement('a');
    help.href = 'https://github.com/nmpersonal00-oss/My-baby-is-23/blob/main/GOOGLE-DRIVE-MUSIC.md';
    help.target = '_blank';
    help.rel = 'noopener noreferrer';
    help.textContent = 'How to enable in-app Google Drive music';
    driveFeedback.append(document.createTextNode(' '), help);
  } else if (window.forestDrive.hasAccess()) {
    driveConnect.textContent = 'Google Drive connected';
  }

  node('ws-add').addEventListener('click',() => {
    setLocalFeedback('Choose audio files in the laptop file window.');
    fileInput.click();
  });
  node('ws-add-folders').addEventListener('click',() => {
    setLocalFeedback('Choose the extracted music folder on the laptop.');
    if (typeof window.showDirectoryPicker !== 'function') {
      folderInput.click();
      return;
    }
    // Must call the picker directly from the click event.
    window.showDirectoryPicker({mode:'read'})
      .then(handle => {
        setLocalFeedback('Reading the chosen music folder…');
        return readChosenDirectory(handle);
      })
      .then(files => importSongs(files,true))
      .catch(error => {
        if (error?.name === 'AbortError') {
          setLocalFeedback('Folder selection canceled. Click Choose music folder to try again.');
        } else {
          fallbackFolderButton.hidden = false;
          setLocalFeedback('The folder picker could not read that folder. Click Use regular folder chooser below. ' + (error?.message || ''));
        }
      });
  });
  fallbackFolderButton.addEventListener('click',() => {
    setLocalFeedback('Choose the folder and confirm access if your browser asks.');
    folderInput.click();
  });
  fileInput.addEventListener('change',() => {
    const files = [...fileInput.files]; fileInput.value = '';
    if (!files.length) { setLocalFeedback('No files selected. Try again.'); return; }
    importSongs(files,false);
  });
  folderInput.addEventListener('change',() => {
    const files = [...folderInput.files]; folderInput.value = '';
    if (!files.length) {
      setLocalFeedback('No files were returned from that folder. Check that it is extracted and contains music, then try Chrome or Edge.');
      return;
    }
    importSongs(files,true);
  });
  localDrop.addEventListener('dragover',event => {
    event.preventDefault();
    event.stopPropagation();
    localDrop.classList.add('is-dragging');
  });
  localDrop.addEventListener('dragleave',() => localDrop.classList.remove('is-dragging'));
  localDrop.addEventListener('drop',event => {
    event.preventDefault();
    event.stopPropagation();
    localDrop.classList.remove('is-dragging');
    setLocalFeedback('Reading music from the dropped folder…');
    // Capture drop entries synchronously while DataTransfer is still valid.
    const reading = droppedFiles(event.dataTransfer);
    reading.then(records => importSongs(records,true))
      .catch(error => setLocalFeedback('Could not read the dropped folder. Use Choose music folder instead. ' + (error?.message || '')));
  });
  remove.addEventListener('click',async () => {
    if (!realm || !lists[realm].length || HOSTED) return;
    if (!confirm('Forget this world’s linked Drive songs and imported local songs? Nothing is deleted from Google Drive.')) return;
    try {
      const ids = lists[realm].filter(song => !song.driveId).map(song => song.id);
      if (db && ids.length) await new Promise((resolve,reject) => {
        const tx = db.transaction(['audio','info'],'readwrite');
        for (const id of ids) { tx.objectStore('audio').delete(id); tx.objectStore('info').delete(id); }
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
      driveSongs[realm] = [];
      rememberDriveSongs();
      for (const song of sessionSongs.values()) {
        if (song.realm === realm) {
          sessionSongs.delete(song.id);
          sessionFiles.delete(song.id);
        }
      }
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
    sources.hidden = true;
    driveArea.hidden = true;
    const help = node('ws-local-help');
    if (help) help.textContent = 'These songs are built into the Forest soundtrack library. No uploads needed.';
    node('ws-local-download-note').hidden = true;
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
    // Browser storage is optional for Drive streaming; the song links still work.
    db = null;
    ready = true;
    refresh().catch(() => {});
    notice = 'Browser storage unavailable. You can still choose a local folder for this visit.';
    show();
  });
})();