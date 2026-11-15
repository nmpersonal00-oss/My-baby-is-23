/* Rayan's Dark Forest — shared Cozy Library soundtrack.
 * Runs on every page. Category music inside Word Search remains separate.
 * Personal audio is stored in this browser, never published to GitHub.
 */
(() => {
  'use strict';

  // The homepage is the persistent music host. Framed chapter pages do not
  // create a second Cozy Library player; the host owns that single audio element.
  try {
    if (window !== window.parent && window.parent.forestMusicShell) return;
  } catch {}

  const STORAGE = 'rayans-forest-cozy-music-v1';
  const AUDIO_KEY = 'cozy-library';
  const DRIVE_KEY = 'rayans-forest-cozy-drive-song-v1';
  const SETTINGS_KEY = 'rayans-forest-cozy-settings-v1';
  const POSITION_KEY = 'rayans-forest-cozy-position-v1';
  const WORD_SEARCH = /\/chapters\/word-search\.html$/i.test(location.pathname);
  const REMOTE_URL = typeof window.forestMusicUrl === 'function'
    ? window.forestMusicUrl('cozy/cozy-library.mp3') : null;
  const WORLD_HASH = /^#\/(souls|lies|blood|stars|terraria|princess|hollow)\/[1-5]$/;

  function getSetting() {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') || {}; }
    catch { return {}; }
  }
  const settings = getSetting();
  let userPaused = settings.paused === true;
  let db = null;
  let objectUrl = null;
  let savedFile = null;
  let ready = false;
  let message = '';
  let loading = false;
  let retryAfterPending = false;
  let externalWorldActive = false;
  let disabledForWorld = WORD_SEARCH && WORLD_HASH.test(location.hash);
  let lastPositionSave = 0;

  const audio = document.createElement('audio');
  audio.preload = 'auto';
  audio.loop = true;
  audio.volume = typeof settings.volume === 'number' && settings.volume >= 0 && settings.volume <= 1
    ? settings.volume : 0.55;
  audio.setAttribute('aria-label', 'Cozy Library background music');
  document.body.appendChild(audio);

  const dock = document.createElement('aside');
  dock.id = 'forest-cozy-music';
  dock.setAttribute('aria-label', 'Forest background music player');
  dock.hidden = disabledForWorld;
  dock.innerHTML = [
    '<button type="button" class="forest-music-toggle" id="forest-music-toggle" aria-label="Expand music controls" aria-expanded="false" aria-controls="forest-music-body" title="Music controls">✦</button>',
    '<div class="forest-music-body" id="forest-music-body" hidden>',
    '<div class="forest-music-toolbar">',
    '<span class="forest-music-mark" aria-hidden="true">♫</span>',
    '<span class="forest-music-name">Cozy Library</span>',
    '<button type="button" id="forest-cozy-play" aria-label="Play background music">▶ Play</button>',
    '<button type="button" id="forest-cozy-settings" aria-label="Music settings" aria-expanded="false" aria-controls="forest-cozy-menu">⚙</button>',
    '</div>',
    '<p class="forest-music-status" id="forest-cozy-status" aria-live="polite">Loading your soundtrack…</p>',
    '<div class="forest-music-menu" id="forest-cozy-menu" hidden>',
    '<label for="forest-cozy-volume">Music volume</label>',
    '<input id="forest-cozy-volume" type="range" min="0" max="100" value="55" aria-label="Music volume">',
    '<p>Add your “Cozy Library” MP3 once, and it will be available on the front page, in every game, and in the Word Search menu. Your Word Search categories still use their own songs.</p>',
    '<div class="forest-cozy-drive-area" id="forest-cozy-drive-area">',
    '<strong>Cozy Library from Google Drive</strong>',
    '<p>Connect once, then drop or paste a Drive folder or song link. No music downloads required.</p>',
    '<button type="button" id="forest-cozy-drive-connect">Connect Google Drive</button>',
    '<label for="forest-cozy-drive-link">Google Drive folder or song link</label>',
    '<div class="forest-cozy-drop" id="forest-cozy-drop">',
    '<span>Drop a Google Drive link here</span>',
    '<input id="forest-cozy-drive-link" type="url" inputmode="url" placeholder="Or paste the Drive link" autocomplete="off">',
    '</div>',
    '<button type="button" id="forest-cozy-drive-add">Use Google Drive music</button>',
    '<select id="forest-cozy-drive-select" aria-label="Select Cozy Library song" hidden></select>',
    '<button type="button" id="forest-cozy-drive-pick" hidden>Play selected song</button>',
    '<p class="forest-cozy-drive-feedback" id="forest-cozy-drive-feedback" role="status" aria-live="polite"></p>',
    '</div>',
    '<button type="button" id="forest-cozy-import">Or choose a local Cozy Library MP3</button>',
    '<input id="forest-cozy-file" type="file" accept=".mp3,.m4a,.mp4,.ogg,.wav,audio/*" hidden>',
    '<button type="button" id="forest-cozy-delete">Remove saved Cozy Library music</button>',
    '<p class="forest-music-note">Music is stored only in this browser. Clearing site data or switching devices means importing it again.</p>',
    '</div>',
    '</div>'
  ].join('');
  document.body.appendChild(dock);

  const find = id => dock.querySelector('#' + id);
  const musicToggle = find('forest-music-toggle');
  const musicBody = find('forest-music-body');
  musicToggle.addEventListener('click', () => {
    musicBody.hidden = !musicBody.hidden;
    const open = !musicBody.hidden;
    dock.classList.toggle('is-open', open);
    musicToggle.setAttribute('aria-expanded', String(open));
    musicToggle.setAttribute('aria-label', open ? 'Minimize music controls' : 'Expand music controls');
  });
  const playButton = find('forest-cozy-play');
  const settingsButton = find('forest-cozy-settings');
  const menu = find('forest-cozy-menu');
  const status = find('forest-cozy-status');
  const volumeSlider = find('forest-cozy-volume');
  const fileInput = find('forest-cozy-file');
  const deleteButton = find('forest-cozy-delete');
  const driveArea = find('forest-cozy-drive-area'), driveConnect = find('forest-cozy-drive-connect');
  const driveInput = find('forest-cozy-drive-link'), driveDrop = find('forest-cozy-drop');
  const driveAdd = find('forest-cozy-drive-add'), driveSelect = find('forest-cozy-drive-select');
  const drivePick = find('forest-cozy-drive-pick'), driveFeedback = find('forest-cozy-drive-feedback');
  let driveChoices = [];
  volumeSlider.value = String(Math.round(audio.volume * 100));

  function rememberSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify({ paused: userPaused, volume: audio.volume })); } catch {}
  }
  function rememberPosition(force = false) {
    if (!audio.duration || !Number.isFinite(audio.currentTime)) return;
    if (!force && Date.now() - lastPositionSave < 5000) return;
    lastPositionSave = Date.now();
    try { localStorage.setItem(POSITION_KEY, String(audio.currentTime)); } catch {}
  }
  function restorePosition() {
    let position = 0;
    try { position = Number(localStorage.getItem(POSITION_KEY)) || 0; } catch {}
    if (Number.isFinite(position) && position > 0 && Number.isFinite(audio.duration) && position < audio.duration - 1) {
      try { audio.currentTime = position; } catch {}
    }
  }
  function update() {
    const playing = !audio.paused && !disabledForWorld;
    playButton.disabled = !ready || !savedFile;
    playButton.textContent = playing ? '❚❚ Pause' : '▶ Play';
    playButton.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
    deleteButton.disabled = !ready || !savedFile;
    status.textContent = message || (!ready ? 'Preparing music…'
      : !savedFile ? 'Add your Cozy Library music using ⚙'
      : savedFile.driveId && !window.forestDrive?.hasAccess() ? 'Connect Google Drive in ⚙ to play your music'
      : userPaused ? 'Paused'
      : playing ? '♫ Your Cozy Library music is playing'
      : 'Tap Play if your browser blocked autoplay');
  }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) { reject(Error('Browser audio storage unavailable')); return; }
      const request = indexedDB.open(STORAGE, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('files')) {
          request.result.createObjectStore('files', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || Error('Unable to open music storage'));
      request.onblocked = () => reject(Error('Close other open app tabs and try again'));
    });
  }
  function getFile() {
    return new Promise((resolve, reject) => {
      const req = db.transaction('files', 'readonly').objectStore('files').get(AUDIO_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }
  function saveFile(file) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('files', 'readwrite');
      transaction.objectStore('files').put({ id: AUDIO_KEY, blob: file, name: file.name });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || Error('Cannot save the audio file'));
      transaction.onabort = () => reject(transaction.error || Error('Cannot save the audio file'));
    });
  }
  function removeFile() {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('files', 'readwrite');
      transaction.objectStore('files').delete(AUDIO_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }
  function installFile(file) {
    audio.pause();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = file ? URL.createObjectURL(file) : null;
    savedFile = file;
    if (objectUrl) {
      audio.src = objectUrl;
      audio.load();
    } else {
      audio.removeAttribute('src');
      audio.load();
    }
    update();
  }

  async function loadDriveAudio() {
    if (!savedFile?.driveId) return;
    if (!window.forestDrive?.hasAccess()) throw Error('Connect Google Drive in ⚙ settings.');
    const id = savedFile.driveId;
    const blob = await window.forestDrive.audioBlob(id);
    if (savedFile?.driveId !== id) return;
    const url = URL.createObjectURL(blob);
    audio.pause();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = url;
    audio.src = url;
    audio.load();
  }

  async function tryPlay() {
    if (!ready || !savedFile || userPaused || disabledForWorld) { update(); return; }
    if (savedFile.driveId && !window.forestDrive?.hasAccess()) {
      message = 'Connect Google Drive in ⚙ settings to play Cozy Library.';
      update();
      return;
    }
    if (loading) { retryAfterPending = true; update(); return; }
    loading = true;
    message = '';
    try {
      if (savedFile.driveId && !objectUrl) await loadDriveAudio();
      const promise = audio.play();
      if (promise && typeof promise.then === 'function') await promise;
      message = '';
    } catch (error) {
      if (error?.name === 'NotAllowedError') {
        message = 'Tap Play to allow music in this browser.';
      } else if (error?.name !== 'AbortError') {
        message = savedFile?.driveId ? (error?.message || 'Could not play Google Drive audio. Reconnect and try again.')
          : REMOTE_URL ? 'The forest soundtrack could not load. Please check the music server.' : 'This file could not play. Try choosing an MP3 again.';
      }
    } finally {
      loading = false;
      update();
      // Resume after a previous play() promise was canceled by rapid tab
      // navigation. Only retry a single pending request, never on autoplay denial.
      if (retryAfterPending) {
        retryAfterPending = false;
        if (!userPaused && !disabledForWorld && audio.paused) tryPlay();
      }
    }
  }

  function switchWorld() {
    const insideWorld = externalWorldActive || (WORD_SEARCH && WORLD_HASH.test(location.hash));
    if (insideWorld === disabledForWorld) return;
    disabledForWorld = insideWorld;
    dock.hidden = insideWorld;
    if (insideWorld) {
      rememberPosition(true);
      audio.pause();
    } else if (!userPaused && savedFile) {
      tryPlay();
    }
  }

  // The homepage shell stays mounted while chapters change inside a frame.
  // It pauses the single Cozy audio element only inside a Word Search world.
  window.forestCozyMusicControl = {
    setWorldActive(active) {
      externalWorldActive = Boolean(active);
      switchWorld();
    },
    getAudio() { return audio; },
    retry() { if (audio.paused && !userPaused && !disabledForWorld) tryPlay(); }
  };

  // If a word-search world is clicked, stop Cozy Library immediately, before
  // the chapter's own soundtrack starts. This avoids double playback.
  if (WORD_SEARCH) {
    document.addEventListener('click', event => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      const hash = target.closest('a[href^="#/"]')?.getAttribute('href');
      const world = hash && WORLD_HASH.test(hash);
      const button = target.closest('[data-open]');
      if (world || button) {
        if (!disabledForWorld) {
          disabledForWorld = true;
          dock.hidden = true;
          rememberPosition(true);
          audio.pause();
        }
      } else if (target.closest('a[href="#library"]')) {
        disabledForWorld = false;
        dock.hidden = false;
        if (!userPaused) tryPlay();
      }
    }, true);
    window.addEventListener('hashchange', switchWorld);
  }

  playButton.addEventListener('click', () => {
    if (!ready || !savedFile) { menu.hidden = false; settingsButton.setAttribute('aria-expanded', 'true'); return; }
    if (!audio.paused || loading) {
      userPaused = true;
      audio.pause();
      rememberPosition(true);
      message = 'Paused';
      rememberSettings();
      update();
    } else {
      userPaused = false;
      message = '';
      rememberSettings();
      tryPlay();
    }
  });
  settingsButton.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    settingsButton.setAttribute('aria-expanded', String(!menu.hidden));
  });
  volumeSlider.addEventListener('input', () => {
    audio.volume = Number(volumeSlider.value) / 100;
    rememberSettings();
  });
  function saveDriveChoice(choice) {
    try { localStorage.setItem(DRIVE_KEY,JSON.stringify(choice)); }
    catch { driveFeedback.textContent = 'Your browser may not remember this song on your next visit.'; }
  }
  async function installDriveChoice(choice) {
    savedFile = { driveId:choice.fileId, name:choice.name };
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    saveDriveChoice(choice);
    try { localStorage.removeItem(POSITION_KEY); } catch {}
    userPaused = false;
    rememberSettings();
    message = '';
    update();
    driveFeedback.textContent = 'Linked ' + choice.name + ' from Google Drive. No download is saved.';
    await tryPlay();
  }
  async function connectDrive() {
    if (!window.forestDrive) throw Error('Google Drive integration did not load. Refresh the page.');
    await window.forestDrive.connect();
    driveConnect.textContent = 'Google Drive connected';
    driveFeedback.textContent = 'Connected. Paste or drop a Google Drive music link.';
  }
  driveConnect.addEventListener('click',() => {
    connectDrive().then(() => {
      if (savedFile?.driveId && !userPaused) tryPlay();
    }).catch(error => { driveFeedback.textContent = error.message; });
  });
  async function chooseDriveLink() {
    const drive = window.forestDrive;
    if (!drive) throw Error('Google Drive integration did not load. Refresh the page.');
    const fileId = drive.fileId(driveInput.value);
    const folderId = drive.folderId(driveInput.value);
    if (!fileId && !folderId) throw Error('Paste a Google Drive folder or audio file link.');
    if (!drive.hasAccess()) await drive.connect();
    let choices = [];
    if (fileId && !/\\/folders\\//.test(driveInput.value)) {
      const song = await drive.metadata(fileId);
      if (!song.mimeType?.startsWith('audio/') && !/\\.(mp3|m4a|mp4|ogg|oga|wav|aac|flac)$/i.test(song.name || ''))
        throw Error('That Drive link is not an audio file.');
      choices = [{fileId:song.id,name:song.name}];
    } else {
      driveFeedback.textContent = 'Finding music in your Google Drive folder…';
      const folder = await drive.listFolder(folderId);
      choices = folder.tracks.map(({fileId,name}) => ({fileId,name}));
    }
    if (!choices.length) throw Error('No audio files found in that Google Drive folder.');
    const cozy = choices.find(song => /cozy[\\s_-]*library/i.test(song.name));
    if (cozy || choices.length === 1) {
      driveSelect.hidden = drivePick.hidden = true;
      await installDriveChoice(cozy || choices[0]);
    } else {
      driveChoices = choices;
      driveSelect.replaceChildren(...choices.map((song,index) => new Option(song.name,String(index))));
      driveSelect.hidden = drivePick.hidden = false;
      driveFeedback.textContent = 'Choose your Cozy Library song below, then tap Play selected song.';
    }
  }
  driveAdd.addEventListener('click',() => {
    driveAdd.disabled = true;
    chooseDriveLink().catch(error => { driveFeedback.textContent = error.message; })
      .finally(() => { driveAdd.disabled = false; });
  });
  drivePick.addEventListener('click',() => {
    const selected = driveChoices[Number(driveSelect.value)];
    if (selected) installDriveChoice(selected)
      .catch(error => { driveFeedback.textContent = error.message; });
  });
  driveDrop.addEventListener('dragover',event => { event.preventDefault(); driveDrop.classList.add('is-dragging'); });
  driveDrop.addEventListener('dragleave',() => driveDrop.classList.remove('is-dragging'));
  driveDrop.addEventListener('drop',event => {
    event.preventDefault();
    driveDrop.classList.remove('is-dragging');
    const transfer = event.dataTransfer;
    const text = transfer?.getData('text/uri-list') || transfer?.getData('text/plain') ||
      transfer?.getData('text/html') || '';
    const match = text.match(/https?:\\/\\/drive\\.google\\.com\\/[^\\s"'<>]+/i);
    if (match && (window.forestDrive?.folderId(match[0]) || window.forestDrive?.fileId(match[0]))) {
      driveInput.value = match[0];
      driveFeedback.textContent = 'Drive link received. Click “Use Google Drive music”.';
    } else {
      driveFeedback.textContent = 'Drive did not share a link. In Google Drive choose Copy link, then paste it here.';
    }
  });
  if (!window.forestDrive?.configured) {
    driveFeedback.textContent = 'Google Drive requires one-time setup by the gift creator.';
    driveConnect.disabled = true;
  } else if (window.forestDrive.hasAccess()) {
    driveConnect.textContent = 'Google Drive connected';
  }

  find('forest-cozy-import').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    fileInput.value = '';
    if (!file) return;
    if (!(/\.(mp3|m4a|mp4|ogg|oga|wav|aac)$/i.test(file.name) || /^audio\//.test(file.type))) {
      message = 'Please choose an MP3 or another audio file.';
      update();
      return;
    }
    message = 'Saving your music on this device…';
    update();
    try {
      await saveFile(file);
      try { localStorage.removeItem(DRIVE_KEY); } catch {}
      installFile(file);
      try { localStorage.removeItem(POSITION_KEY); } catch {}
      userPaused = false;
      rememberSettings();
      message = 'Saved ' + file.name + ' in this browser.';
      update();
      await tryPlay();
    } catch {
      message = 'Could not store the file. Try a smaller MP3 or free browser storage.';
      update();
    }
  });
  deleteButton.addEventListener('click', async () => {
    if (!ready || !savedFile) return;
    if (!confirm('Forget Cozy Library in this browser? Nothing is deleted from Google Drive or your files.')) return;
    try {
      if (db) await removeFile();
      try { localStorage.removeItem(DRIVE_KEY); } catch {}
      installFile(null);
      try { localStorage.removeItem(POSITION_KEY); } catch {}
      message = 'Removed from this browser only.';
      update();
    } catch {
      message = 'Could not remove the saved file.';
      update();
    }
  });

  // If the browser blocks autoplay after page navigation, one ordinary
  // interaction can retry. An explicit Pause is always respected.
  function tryAfterGesture(event) {
    if (disabledForWorld || userPaused || !ready || !savedFile || !audio.paused) return;
    if (dock.contains(event.target)) return;
    tryPlay();
  }
  document.addEventListener('pointerdown', tryAfterGesture, { passive: true });
  document.addEventListener('keydown', tryAfterGesture);

  audio.addEventListener('loadedmetadata', restorePosition);
  audio.addEventListener('timeupdate', () => rememberPosition());
  audio.addEventListener('play', update);
  audio.addEventListener('pause', update);
  audio.addEventListener('error', () => {
    if (!savedFile) return;
    message = REMOTE_URL ? 'The forest soundtrack is not available yet. Please check the music server.' : 'The selected audio could not play; choose an MP3 in settings.';
    update();
  });
  window.addEventListener('pagehide', () => { rememberPosition(true); audio.pause(); });
  window.addEventListener('beforeunload', () => {
    rememberPosition(true);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted && ready && !userPaused && !disabledForWorld) tryPlay();
  });
  window.forestCozyMusicDiagnostics = () => ({
    page: location.pathname,
    categorySoundtrackActive: disabledForWorld,
    imported: Boolean(savedFile),
    playing: !audio.paused,
    pausedByUser: userPaused,
    ready
  });

  if (REMOTE_URL) {
    // The gift recipient never has to import music. When the R2 URL is configured,
    // the recording streams directly; IndexedDB is not required.
    ready = true;
    savedFile = { name: 'Cozy Library' };
    audio.src = REMOTE_URL;
    audio.load();
    find('forest-cozy-import').hidden = true;
    driveArea.hidden = true;
    deleteButton.hidden = true;
    const localOnlyNote = menu.querySelector('.forest-music-note');
    if (localOnlyNote) localOnlyNote.hidden = true;
    const instructions = menu.querySelector('p');
    if (instructions) instructions.textContent = 'Cozy Library is part of your forest. No music uploads are needed.';
  }
  update();

  if (REMOTE_URL && document.body.classList.contains('home') && !userPaused) {
    // A single tap to enter provides the user gesture required for audible
    // playback on iOS Safari, Chrome and similar browsers.
    let entered = false;
    try { entered = sessionStorage.getItem('forest-entry-unlocked-v1') === 'yes'; } catch {}
    if (!entered) {
      const entrance = document.createElement('div');
      entrance.id = 'forest-music-entrance';
      entrance.innerHTML = '<div class="forest-entrance-card">' +
        '<p class="forest-entrance-eyebrow">A world made just for you</p>' +
        '<h2>Rayan’s Dark Forest</h2>' +
        '<p>Follow the lanterns, my love. The music will travel with you.</p>' +
        '<button type="button" id="forest-entrance-button">♫ Enter the Forest</button>' +
        '<p class="forest-entrance-hint">Tap to enter with music</p>' +
        '</div>';
      document.body.appendChild(entrance);
      const enter = entrance.querySelector('#forest-entrance-button');
      enter.addEventListener('click', () => {
        try { sessionStorage.setItem('forest-entry-unlocked-v1', 'yes'); } catch {}
        userPaused = false;
        message = '';
        rememberSettings();
        entrance.remove();
        // The play() call is synchronous inside this real click event.
        // Do not await IndexedDB or network before attempting it.
        try {
          const attempt = audio.play();
          if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(() => {
              message = 'Tap Play to enable sound in this browser.';
              update();
            });
          }
        } catch {
          message = 'Tap Play to enable sound in this browser.';
        }
        update();
      });
    }
  }

  if (REMOTE_URL) {
    if (!userPaused && !disabledForWorld) tryPlay();
  } else openDatabase().then(async database => {
    db = database;
    const saved = await getFile();
    ready = true;
    let driveChoice = null;
    try { driveChoice = JSON.parse(localStorage.getItem(DRIVE_KEY) || 'null'); } catch {}
    if (driveChoice?.fileId && /^[A-Za-z0-9_-]{15,}$/.test(driveChoice.fileId)) {
      savedFile = {name: driveChoice.name || 'Cozy Library',driveId:driveChoice.fileId};
      update();
    } else if (saved?.blob) installFile(saved.blob);
    else { message = 'Add your Cozy Library music using ⚙'; update(); }
    if (!userPaused && !disabledForWorld) await tryPlay();
  }).catch(() => {
    // Google Drive playback also works if IndexedDB local file storage is blocked.
    db = null;
    ready = true;
    let driveChoice = null;
    try { driveChoice = JSON.parse(localStorage.getItem(DRIVE_KEY) || 'null'); } catch {}
    if (driveChoice?.fileId && /^[A-Za-z0-9_-]{15,}$/.test(driveChoice.fileId)) {
      savedFile = {name:driveChoice.name || 'Cozy Library',driveId:driveChoice.fileId};
      message = 'Connect Google Drive in ⚙ to play your music.';
    } else {
      message = 'Local music storage is unavailable. You can still use Google Drive.';
    }
    update();
  });
})();