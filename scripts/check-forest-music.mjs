#!/usr/bin/env node
// After deployment: MUSIC_BASE_URL=https://music.example.com node scripts/check-forest-music.mjs
// Verifies that every manifest track is accessible, without downloading the MP3 data.
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const baseUrl = process.env.MUSIC_BASE_URL?.trim().replace(/\/+$/, '');
if (!baseUrl || !/^https:\/\//i.test(baseUrl)) {
  console.error('Set MUSIC_BASE_URL to the public HTTPS origin of the R2 bucket.');
  process.exit(2);
}
const sandbox = { window: {} };
runInNewContext(readFileSync('forest-audio-manifest.js', 'utf8'), sandbox);
const manifest = sandbox.window.FOREST_AUDIO_MANIFEST;
const all = [manifest.cozy, ...Object.values(manifest.worlds).flat()];
const results = { ok: 0, failed: [] };
let index = 0;
const workers = Array.from({ length: 8 }, async () => {
  while (index < all.length) {
    const song = all[index++];
    const url = baseUrl + '/' + song.key.split('/').map(encodeURIComponent).join('/');
    try {
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw Error('HTTP ' + response.status);
      const mime = response.headers.get('content-type') || '';
      if (/text\/html/i.test(mime)) throw Error('HTML returned instead of audio');
      results.ok++;
    } catch (error) {
      results.failed.push(song.key + ': ' + error.message);
    }
  }
});
await Promise.all(workers);
console.log('Validated', all.length, 'soundtrack objects:', results.ok, 'available,', results.failed.length, 'missing or blocked.');
for (const failure of results.failed.slice(0, 30)) console.error(failure);
if (results.failed.length > 30) console.error('…plus', results.failed.length - 30, 'additional failures.');
if (results.failed.length) process.exitCode = 1;
