/* Set baseUrl to the public HTTPS URL of the Cloudflare R2 soundtrack bucket.
 * No secret keys belong in this file. Keep empty until audio is uploaded.
 * Example: https://music.example.com (Cloudflare R2 custom domain).
 */
window.FOREST_AUDIO_CONFIG = Object.freeze({ baseUrl: '' });
window.forestMusicUrl = function (key) {
  const config = window.FOREST_AUDIO_CONFIG || {};
  if (!/^https:\/\//i.test(config.baseUrl || '')) return null;
  // Encode each object-key component without encoding its separators.
  return config.baseUrl.replace(/\/+$/, '') + '/' +
    String(key).split('/').map(encodeURIComponent).join('/');
};
