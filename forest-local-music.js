/* Shared laptop music library. Read local folders without sending files to a server.
 * The homepage owns this store while chapter pages run inside its iframe.
 */
(() => {
  'use strict';
  let hub;
  try { if (window !== window.parent) hub = window.parent.forestLocalMusic; } catch {}
  if (!hub) {
    const names = {
      souls: /dark[\s_-]*souls|\bds[12]\b/i,
      lies: /lies[\s_-]*of[\s_-]*p/i,
      blood: /bloodborne/i,
      stars: /star[\s_-]*wars|mandalorian|jedi[\s:._-]*survivor/i,
      terraria: /terraria/i,
      princess: /kawaii|lo[\s_-]*fi|princess/i,
      hollow: /hollow[\s_-]*knight|silksong/i
    };
    const music = new Map();
    const listeners = new Set();
    let cozy = null, lastResult = '';
    const isAudio = file => /\.(mp3|m4a|mp4|ogg|oga|wav|aac|flac|opus)$/i.test(file.name) ||
      /^audio\//i.test(file.type || '');
    function worldFor(path) {
      for (const [world,pattern] of Object.entries(names)) if (pattern.test(path)) return world;
      return null;
    }
    function snapshot() {
      return {cozy,tracks:[...music.values()],message:lastResult};
    }
    function notify() {
      for (const fn of [...listeners]) try { fn(snapshot()); } catch (err) { console.error('Music update',err); }
    }
    function importRecords(input,opts = {}) {
      const records = [...input].map(row => row.file ? row : ({file:row,path:row.webkitRelativePath || row.name}));
      const audio = records.filter(row => row.file && isAudio(row.file));
      if (!audio.length) {
        lastResult = records.some(row => /\.zip$/i.test(row.file?.name || ''))
          ? 'This folder is still zipped. Extract the ZIP first, then choose the music folder.'
          : 'No music found. Choose an extracted folder containing MP3 or other audio files.';
        notify(); return snapshot();
      }
      let added = 0, unrecognized = 0, cozyFound = false;
      const taggedWorld = audio.some(row => worldFor(row.path || row.file.name));
      for (const {file,path} of audio) {
        const full = String(path || file.name);
        if (/cozy[\s_.-]*library/i.test(full) || (opts.preferCozy && audio.length === 1)) {
          cozy = file; cozyFound = true; added++; continue;
        }
        const world = worldFor(full) || (!taggedWorld ? opts.world : null);
        if (!world) { unrecognized++; continue; }
        const id = 'local:' + world + ':' + full + ':' + file.size + ':' + file.lastModified;
        music.set(id,{id,world,name:file.name,path:full,file});
        added++;
      }
      if (!added && audio.length === 1 && !opts.world && !taggedWorld) {
        cozy = audio[0].file;
        added = 1; cozyFound = true; unrecognized = 0;
      }
      lastResult = added
        ? 'Ready! ' + added + ' music file' + (added === 1 ? '' : 's') +
          ' added from the laptop. No upload needed.' +
          (cozyFound ? ' Cozy Library is ready.' : '') +
          (unrecognized ? ' ' + unrecognized + ' file(s) had unknown album names; choose their game world to add them.' : '')
        : 'The files were found, but their album names are not recognized. Open the matching Word Search world and try the folder again.';
      notify();
      return snapshot();
    }
    async function readDirectory(handle,prefix = '') {
      const path = prefix + handle.name + '/';
      const records = [];
      for await (const child of handle.values()) {
        if (child.kind === 'file') {
          const file = await child.getFile();
          records.push({file,path:path + file.name});
        } else if (child.kind === 'directory') {
          records.push(...await readDirectory(child,path));
        }
      }
      return records;
    }
    const entryFile = entry => new Promise((resolve,reject) => entry.file(resolve,reject));
    const readEntries = reader => new Promise((resolve,reject) => reader.readEntries(resolve,reject));
    async function readEntry(entry,prefix = '') {
      if (entry.isFile) {
        const file = await entryFile(entry);
        return [{file,path:prefix + file.name}];
      }
      if (!entry.isDirectory) return [];
      const records = [], reader = entry.createReader();
      while (true) {
        const children = await readEntries(reader);
        if (!children.length) break;
        for (const child of children) records.push(...await readEntry(child,prefix + entry.name + '/'));
      }
      return records;
    }
    async function readTransfer(transfer) {
      const items = [...(transfer?.items || [])].filter(item => item.kind === 'file');
      const entries = items.map(item => item.webkitGetAsEntry?.()).filter(Boolean);
      if (entries.length) {
        const records = [];
        for (const entry of entries) records.push(...await readEntry(entry));
        return records;
      }
      return [...(transfer?.files || [])].map(file => ({file,path:file.webkitRelativePath || file.name}));
    }
    function worldSongs(world) {
      return [...music.values()].filter(song => song.world === world);
    }
    hub = {
      importRecords,readDirectory,readTransfer,worldSongs,
      getCozy:()=>cozy,getFile:id=>music.get(id)?.file,
      getResult:()=>lastResult,
      subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
      clearWorld(world) { for (const [id,song] of music) if (song.world === world) music.delete(id); notify(); },
      clearCozy() { cozy = null; notify(); }
    };
  }
  window.forestLocalMusic = hub;

  // Show controls only in the parent shell. Dropping onto any chapter is
  // handled by this same per-document listener and stored in the parent hub.
  const controls = document.createElement('section');
  controls.className = 'forest-local-music-ui';
  controls.setAttribute('aria-label','Music folder import');
  const isFrame = (() => { try { return window !== window.parent && !!window.parent.forestMusicShell; } catch { return false; } })();
  if (!isFrame) {
    controls.innerHTML = '<button type="button" class="forest-local-folder-button">♫ Add music folder</button>' +
      '<button type="button" class="forest-local-folder-basic">Use standard folder chooser</button>' +
      '<p class="forest-local-folder-status" role="status" aria-live="polite">Or drag an extracted music folder anywhere onto this page.</p>';
    document.body.appendChild(controls);
  }
  const overlay = document.createElement('div');
  overlay.className = 'forest-local-drop-overlay';
  overlay.setAttribute('aria-hidden','true');
  overlay.textContent = 'Drop your music folder here';
  overlay.hidden = true;
  document.body.appendChild(overlay);
  const status = controls.querySelector('.forest-local-folder-status');
  function feedback(message) {
    if (status) status.textContent = message;
    if (!isFrame) overlay.hidden = true;
    try {
      if (isFrame) window.parent.document.querySelector('.forest-local-folder-status').textContent = message;
    } catch {}
  }
  hub.subscribe(({message}) => { if (message) feedback(message); });

  function currentWorld() {
    const match = location.hash.match(/^#\/(souls|lies|blood|stars|terraria|princess|hollow)\//);
    return match ? match[1] : null;
  }
  function accept(records) {
    const result = hub.importRecords(records,{world:currentWorld()});
    feedback(result.message);
  }

  async function openFolder() {
    if (typeof window.showDirectoryPicker === 'function') {
      try {
        // This must be invoked from the user's real click, before any await.
        const handle = await window.showDirectoryPicker({mode:'read'});
        feedback('Reading your folder and its album subfolders…');
        accept(await hub.readDirectory(handle));
        return;
      } catch (error) {
        if (error?.name === 'AbortError') { feedback('Folder selection canceled.'); return; }
        feedback('That folder chooser was blocked. Click Use standard folder chooser instead.');
        return;
      }
    }
    // Opera GX and other desktop browsers can use webkitdirectory.
    openStandardFolder();
  }
  const folderInput = document.createElement('input');
  function openStandardFolder() {
    folderInput.value = '';
    folderInput.click();
  }
  folderInput.type='file';
  folderInput.setAttribute('webkitdirectory','');
  folderInput.setAttribute('directory','');
  folderInput.multiple=true;
  folderInput.hidden=true;
  document.body.appendChild(folderInput);
  folderInput.addEventListener('change',() => {
    const records = [...(folderInput.files || [])].map(file => ({file,path:file.webkitRelativePath || file.name}));
    folderInput.value='';
    if (!records.length) { feedback('No music files were received. Select the extracted folder, not a ZIP.'); return; }
    accept(records);
  });
  controls.querySelector('.forest-local-folder-button')?.addEventListener('click',openFolder);
  controls.querySelector('.forest-local-folder-basic')?.addEventListener('click',openStandardFolder);
  if (!isFrame) hub.chooseFolder = openFolder;

  let dragDepth = 0;
  const filesPresent = transfer => [...(transfer?.types || [])].includes('Files') ||
    [...(transfer?.items || [])].some(item => item.kind === 'file');
  document.addEventListener('dragenter',event => {
    if (!filesPresent(event.dataTransfer)) return;
    event.preventDefault();
    dragDepth++;
    overlay.hidden=false;
  },true);
  document.addEventListener('dragover',event => {
    if (!filesPresent(event.dataTransfer)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect='copy';
    overlay.hidden=false;
  },true);
  document.addEventListener('dragleave',event => {
    if (!filesPresent(event.dataTransfer)) return;
    dragDepth=Math.max(0,dragDepth-1);
    if (!dragDepth) overlay.hidden=true;
  },true);
  document.addEventListener('drop',event => {
    if (!filesPresent(event.dataTransfer)) return;
    event.preventDefault();
    event.stopPropagation();
    dragDepth=0;
    overlay.hidden=true;
    feedback('Reading the dropped folder and its music files…');
    // Capture the transfer's file entries before the drag event ends.
    const promise = hub.readTransfer(event.dataTransfer);
    promise.then(accept).catch(error => feedback('Could not read that folder: ' + (error?.message || 'Try the Add music folder button.')));
  },true);
})();
