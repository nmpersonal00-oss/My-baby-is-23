/* Gift mode — use music files from this same website, at /audio/.
 * Works on GitHub Pages and alternate static-site hosts, without R2 or any
 * payment information. The gift creator uploads 8 MP3s to the audio folder.
 */
(() => {
  const file = document.currentScript?.src;
  const origin = file || location.href;
  const baseUrl = new URL('audio/', origin).href.replace(/\/+$/, '');
  window.FOREST_AUDIO_CONFIG = Object.freeze({ baseUrl });
  window.forestMusicUrl = key => baseUrl + '/' +
    String(key).split('/').map(encodeURIComponent).join('/');
})();
