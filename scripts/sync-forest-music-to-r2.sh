#!/usr/bin/env bash
# One-time administrator deployment; the recipient does NOT run this.
# Copy owner-approved Google Drive soundtracks to Cloudflare R2.
# Prerequisites: rclone configured with remotes 'forest-drive' (Google Drive)
# and 'forest-r2' (Cloudflare R2). Both login/key flows remain local to rclone.
set -euo pipefail
DRIVE_REMOTE="${DRIVE_REMOTE:-forest-drive}"
R2_REMOTE="${R2_REMOTE:-forest-r2}"
R2_BUCKET="${R2_BUCKET:-rayans-forest-soundtracks}"
COZY_FILE="${COZY_FILE:-}"
command -v rclone >/dev/null || { echo "Install rclone first: https://rclone.org/downloads/" >&2; exit 1; }
rclone listremotes | grep -qx "${DRIVE_REMOTE}:" || { echo "Configure Google Drive remote: ${DRIVE_REMOTE}" >&2; exit 1; }
rclone listremotes | grep -qx "${R2_REMOTE}:" || { echo "Configure Cloudflare R2 remote: ${R2_REMOTE}" >&2; exit 1; }
echo "Copying 10 soundtrack albums to Cloudflare R2 bucket: ${R2_BUCKET}"
copy_album() {
  local world="$1" album="$2" drive_id="$3"
  echo "Uploading ${world}/${album}…"
  # rclone's backend override targets a specific Drive folder ID;
  # no Drive URL needs to be made publicly accessible.
  rclone copy "${DRIVE_REMOTE},root_folder_id=${drive_id}:"     "${R2_REMOTE}:${R2_BUCKET}/${world}/${album}"     --include "*.mp3" --include "*.m4a" --include "*.mp4"     --include "*.ogg" --include "*.wav" --transfers 4 --progress
}
copy_album souls dark-souls-1 17lQLfBUWAMITXcOv9LXST50_oN5KA1JJ
copy_album souls dark-souls-2 1EL40uxl9ZEjKA1Zh8bHWaIlxWTwqUfGq
copy_album lies lies-of-p 1vufn3n6qk7eVAi0xbiTeioEI5ptnQBiO
copy_album blood bloodborne 1FfVP6nmqG3g72lMKO4MIG56NvoLCCGaT
copy_album stars mandalorian 1bd-DElKmz10eUewagyrT8-w5wW8MTxOT
copy_album stars jedi-survivor 1fMMfqzcy90MOwOSvXJH2BRcuk4gLgMiJ
copy_album terraria terraria 1yz7ekvmvINQEpMdNIynIFvu5AIy3dIOK
copy_album princess kawaii-lofi 13MCVjqlRbap-3hhNz8kIsE3UhTK2b4zl
copy_album hollow hollow-knight 1sSXqhfyeiIyT1Az0fJ6NS7r35zruwNXt
copy_album hollow silksong 1EqLTy8BvCu4dQNBiIXN1YARb-iIxNgFH
if [[ -z "$COZY_FILE" || ! -f "$COZY_FILE" ]]; then
  echo "Cozy Library MP3 not provided: provide COZY_FILE=/path/to/file.mp3 and rerun to upload it" >&2
else
  echo "Uploading Cozy Library recording…"
  rclone copyto "$COZY_FILE" "${R2_REMOTE}:${R2_BUCKET}/cozy/cozy-library.mp3" --progress
fi
echo "Finished one-time transfer. Check object counts in R2 and test playback."
echo "Next, set the public HTTPS base URL in forest-audio-config.js."
