/* Rayan's Dark Forest: keep the homepage music player alive while chapters change.
 * The main document is never unloaded for in-app links; content opens in a
 * same-origin chapter frame. Word Search worlds notify the parent when their
 * own soundtrack should take over. No audio files are embedded in this script.
 */
(() => {
  'use strict';
  if (!document.body.classList.contains('home')) return;
  const fileUrl = document.currentScript?.src || location.href;
  const appRoot = new URL('./', fileUrl);
  const homeUrl = location.href;
  const homePath = new URL('index.html', appRoot).pathname;
  const chapterPrefix = new URL('chapters/', appRoot).pathname;
  const frame = document.createElement('iframe');
  frame.id = 'forest-adventure-frame';
  frame.className = 'forest-adventure-frame';
  frame.title = "Forest adventure";
  frame.setAttribute('allow', 'autoplay');
  frame.hidden = true;
  document.body.appendChild(frame);

  function isHome(url) {
    return url.origin === location.origin &&
      (url.pathname === homePath || url.pathname === appRoot.pathname);
  }
  function isChapter(url) {
    return url.origin === location.origin &&
      url.pathname.startsWith(chapterPrefix) && /\.html$/i.test(url.pathname);
  }
  function syncMusic(active) {
    window.forestCozyMusicControl?.setWorldActive(Boolean(active));
  }
  function showChapter(target, record = true) {
    const url = target instanceof URL ? target : new URL(target, appRoot);
    if (!isChapter(url)) return false;
    syncMusic(false);
    frame.hidden = false;
    document.body.classList.add('forest-shell-in-chapter');
    // Keep Cozy Library's <audio> in this parent page alive during navigation.
    if (frame.src !== url.href) frame.src = url.href;
    if (record) history.pushState({ forestChapter: url.href }, '', url.href);
    return true;
  }
  function showHome(record = true) {
    syncMusic(false);
    frame.hidden = true;
    frame.removeAttribute('src');
    document.body.classList.remove('forest-shell-in-chapter');
    if (record) history.pushState({ forestHome: true }, '', homeUrl);
  }
  function go(url, record = true) {
    if (isHome(url)) { showHome(record); return true; }
    return showChapter(url, record);
  }
  function followLinks(event) {
    if (event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const element = event.target instanceof Element ? event.target : null;
    const anchor = element?.closest('a[href]');
    if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;
    const href = anchor.getAttribute('href');
    if (!href || href[0] === '#' || /^javascript:/i.test(href)) return;
    let url;
    try { url = new URL(href, anchor.ownerDocument.baseURI); } catch { return; }
    if (!isHome(url) && !isChapter(url)) return;
    event.preventDefault();
    go(url);
  }
  function onChapterLoad() {
    try {
      const url = new URL(frame.contentWindow.location.href);
      const inWorld = /\/word-search\.html$/i.test(url.pathname) &&
        /^#\/(souls|lies|blood|stars|terraria|princess|hollow)\/[1-5]$/.test(url.hash);
      syncMusic(inWorld);
      // Bubble phase respects custom game click handlers that call
      // preventDefault (e.g. first-tap flying Love Notes).
      frame.contentDocument?.addEventListener('click', followLinks, false);
      // If autoplay was blocked after a route change, an ordinary interaction
      // on a chapter may retry the main track, unless a world is active.
      frame.contentDocument?.addEventListener('pointerdown', () => {
        window.forestCozyMusicControl?.retry();
      }, { passive: true });
    } catch {
      // Only same-origin HTML pages are managed by this shell.
      syncMusic(false);
    }
  }
  frame.addEventListener('load', onChapterLoad);
  document.addEventListener('click', followLinks, false);
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
    if (event.data?.type === 'forest:word-search-world') syncMusic(event.data.active);
  });
  window.addEventListener('popstate', () => {
    const url = new URL(location.href);
    if (isHome(url) || isChapter(url)) go(url, false);
  });
  window.forestMusicShell = { frame, showChapter, showHome };
})();
