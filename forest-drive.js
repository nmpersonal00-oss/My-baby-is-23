/* Private Google Drive music access: read-only OAuth, no Drive downloads saved to disk.
 * The Google OAuth Web client ID is public configuration; never put API secrets here.
 * Access tokens are kept in memory only and are not stored on the website or GitHub.
 */
(() => {
  'use strict';
  try {
    if (window.parent !== window && window.parent.forestDrive) {
      window.forestDrive = window.parent.forestDrive;
      return;
    }
  } catch {}

  const clientId = String(window.FOREST_AUDIO_CONFIG?.googleDriveClientId || '').trim();
  const configured = /\.apps\.googleusercontent\.com$/.test(clientId);
  const scope = 'https://www.googleapis.com/auth/drive.readonly';
  const apiRoot = 'https://www.googleapis.com/drive/v3/files';
  let token = '';
  let expiresAt = 0;

  const hasAccess = () => Boolean(token && Date.now() < expiresAt);
  const validId = id => /^[A-Za-z0-9_-]{15,}$/.test(id || '');

  function extractId(value, kind) {
    const text = String(value || '').trim();
    if (validId(text)) return text;
    // Dragging from drive.google.com sometimes produces a URL or HTML link,
    // not a real directory. Also accept the copied folder/file link.
    const pattern = kind === 'folder'
      ? /https?:\/\/drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([A-Za-z0-9_-]+)/i
      : /https?:\/\/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/i;
    let match = text.match(pattern);
    if (!match) match = text.match(/https?:\/\/drive\.google\.com\/open\?[^\s"'<>]*?\bid=([A-Za-z0-9_-]+)/i);
    return match && validId(match[1]) ? match[1] : null;
  }

  function connect() {
    if (hasAccess()) return Promise.resolve();
    if (!configured) return Promise.reject(Error('Google Drive needs one-time setup by the gift creator. See GOOGLE-DRIVE-MUSIC.md.'));
    const oauth = window.google?.accounts?.oauth2;
    if (!oauth?.initTokenClient) return Promise.reject(Error('Google sign-in is still loading. Please try Connect again.'));
    return new Promise((resolve, reject) => {
      let finished = false;
      const finish = (error) => {
        if (finished) return;
        finished = true;
        if (error) reject(error);
        else resolve();
      };
      try {
        const client = oauth.initTokenClient({
          client_id: clientId,
          scope,
          callback: result => {
            if (result.error || !result.access_token) {
              finish(Error('Google Drive access was not granted. Try connecting again.'));
              return;
            }
            token = result.access_token;
            expiresAt = Date.now() + Math.max(0, Number(result.expires_in || 3600) - 60) * 1000;
            finish();
          },
          error_callback: error => {
            finish(Error(error?.type === 'popup_closed'
              ? 'Google sign-in was closed. Tap Connect to try again.'
              : 'Google sign-in could not open. Allow pop-ups and try again.'));
          }
        });
        // Initiated synchronously by a real button click to permit the OAuth popup.
        client.requestAccessToken({ prompt: '' });
      } catch {
        finish(Error('Google sign-in could not start. Check the website address and OAuth setup.'));
      }
    });
  }

  async function request(url) {
    if (!hasAccess()) throw Error('Connect Google Drive in music settings to play your songs.');
    let response;
    try {
      response = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
    } catch {
      throw Error('Could not reach Google Drive. Check your connection.');
    }
    if (response.status === 401) {
      token = '';
      expiresAt = 0;
      throw Error('Google Drive session expired. Connect Google Drive again.');
    }
    if (response.status === 403 || response.status === 404)
      throw Error('Google Drive access denied. Sign in with an account that can open the folder and its songs.');
    if (!response.ok) throw Error('Google Drive could not load this music (HTTP ' + response.status + ').');
    return response;
  }

  async function metadata(id) {
    const params = new URLSearchParams({ fields: 'id,name,mimeType', supportsAllDrives: 'true' });
    const response = await request(apiRoot + '/' + encodeURIComponent(id) + '?' + params);
    return response.json();
  }

  async function listFolder(folderId) {
    if (!validId(folderId)) throw Error('Please drop or paste a Google Drive folder link.');
    const root = await metadata(folderId);
    if (root.mimeType !== 'application/vnd.google-apps.folder')
      throw Error('This is not a Google Drive folder. Copy its folder link instead.');
    const queue = [{ id: folderId, path: root.name || 'Music' }];
    const tracks = [];
    let folders = 0;
    while (queue.length) {
      if (++folders > 200) throw Error('This folder has too many subfolders. Choose a smaller music folder.');
      const current = queue.shift();
      let pageToken = '';
      do {
        const params = new URLSearchParams({
          q: "'" + current.id + "' in parents and trashed = false",
          fields: 'nextPageToken,files(id,name,mimeType)',
          pageSize: '1000', supportsAllDrives: 'true', includeItemsFromAllDrives: 'true'
        });
        if (pageToken) params.set('pageToken', pageToken);
        const response = await request(apiRoot + '?' + params);
        const data = await response.json();
        for (const entry of data.files || []) {
          if (!validId(entry.id)) continue;
          if (entry.mimeType === 'application/vnd.google-apps.folder') {
            queue.push({ id: entry.id, path: current.path + '/' + entry.name });
          } else if (entry.mimeType?.startsWith('audio/') || /\.(mp3|m4a|mp4|ogg|oga|wav|aac|flac)$/i.test(entry.name || '')) {
            tracks.push({ fileId: entry.id, name: entry.name, path: current.path + '/' + entry.name });
          }
          if (tracks.length > 2000) throw Error('This folder has too many audio files. Choose a smaller music folder.');
        }
        pageToken = data.nextPageToken || '';
      } while (pageToken);
    }
    tracks.sort((a,b) => a.path.localeCompare(b.path, undefined, {numeric:true,sensitivity:'base'}));
    return { name: root.name, tracks };
  }

  async function audioBlob(fileId) {
    if (!validId(fileId)) throw Error('Invalid Google Drive audio link.');
    const response = await request(apiRoot + '/' + encodeURIComponent(fileId) + '?alt=media&supportsAllDrives=true');
    return response.blob(); // In-memory playback only; no File save or browser download prompt.
  }

  window.forestDrive = Object.freeze({
    configured, hasAccess, connect, listFolder, audioBlob, metadata,
    folderId: value => extractId(value, 'folder'),
    fileId: value => extractId(value, 'file')
  });
})();
