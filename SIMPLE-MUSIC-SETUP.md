# The complete Forest music library

**Goal:** Your husband opens the app, taps **Enter the Forest** if his browser requires it, and music plays. He is never asked to import or upload songs.

- **Everywhere outside a Word Search category:** the supplied **Cozy Library** recording plays as the shared background music.
- **Each Word Search category:** the matching **complete album playlist** takes over and Cozy Library pauses, so two songs do not play at once.
- **Dark Souls:** 77 recordings (Dark Souls I and Dark Souls II).
- **Lies of P:** 70 recordings.
- **Bloodborne:** 30 recordings.
- **Star Wars:** 109 recordings (Mandalorian and Jedi: Survivor).
- **Terraria:** 85 recordings.
- **Princess:** 46 recordings (Kawaii Lofi).
- **Hollow Knight:** 80 recordings (Hollow Knight and Silksong).

All **497 Word Search tracks** are listed in `forest-audio-manifest.js`. The Cozy Library recording is a separate, 498th file.

**Current status:** The full playlists are present in the website's code, but the audio bytes are **not hosted yet**. Google Drive folders are private, so the public website cannot simply fetch them. Until the tracks are hosted, the existing local-import controls may still be visible. The recipient-free gift experience is **not finished**.

**Important:** An eight-song ZIP pack mentioned in an earlier conversation was an incorrect simplification and **must not be uploaded**. All files should be uploaded in one preparation process by the gift creator/administrator, not by the recipient. The earlier GitHub-only instructions are superseded.

To finish, upload the approved recordings to suitable browser-streaming audio storage (or a sustainable static-media host), preserve the object paths in the manifest, then add the read-only HTTPS base URL to `forest-audio-config.js`. See `FOREST-AUDIO-DEPLOY.md` for the full album-to-folder mappings and one-time synchronization script. This hosting step has **not** been completed.

Browser autoplay with sound often requires a first user interaction, such as tapping Enter the Forest. There is no way to guarantee audible sound on the initial page load on all devices.
