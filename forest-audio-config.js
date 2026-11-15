/* The gift uses Cozy Library globally and all 497 Word Search tracks.
 * Audio hosting must be configured once by the gift creator; recipients never upload music.
 * Leave baseUrl empty until the complete library has been hosted and verified.
 * For direct Google Drive access, set the public Google OAuth Web client ID.
 * Do not put passwords, private Drive tokens, or secret API keys here.
 */
window.FOREST_AUDIO_CONFIG = Object.freeze({baseUrl: '', googleDriveClientId: ''});
window.forestMusicUrl = function (key) {
  const base = (window.FOREST_AUDIO_CONFIG?.baseUrl || '').trim();
  if (!/^https:\/\//i.test(base)) return null;
  return base.replace(/\/+$/, '') + '/' +
    String(key).split('/').map(encodeURIComponent).join('/');
};