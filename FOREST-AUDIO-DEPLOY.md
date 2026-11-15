# Deploying the Forest Soundtrack Library (gift preparation only)

These steps are **for the gift creator/administrator**, not for her husband. The app will stream audio; visitors do not import any songs.

## Prepared automatically

- `forest-audio-manifest.js`: index of the **497 audio recordings** across ten approved Drive subfolders, assigned to seven Word Search worlds.
- `forest-audio-config.js`: single publicly accessible URL setting, deliberately blank until the recordings are actually live.
- `scripts/sync-forest-music-to-r2.sh`: one-time batch upload script copying music from the existing private Google Drive folders into Cloudflare R2. It does not delete or change the Drive originals.
- The homepage / other app pages use `cozy/cozy-library.mp3`. The Word Search library menu uses the same Cozy soundtrack; inside a world, its own songs take over.

## Administrator-only steps to finish

1. Create an R2 bucket named `rayans-forest-soundtracks` under [Cloudflare R2](https://dash.cloudflare.com/?to=/:account/r2/overview). Choose **Standard** storage; the collection is about 3.1 GB. R2 free allowance and operation charges can change.
2. Install [rclone](https://rclone.org/downloads/) and configure `forest-drive` (Google Drive, authorize the Drive account that already contains the albums) and `forest-r2` (Cloudflare R2 S3 endpoint and an R2 API token). **Never commit access keys or Google OAuth tokens to GitHub.** [Cloudflare's rclone guide](https://developers.cloudflare.com/r2/examples/rclone/).
3. Run `COZY_FILE="/path/to/Cozy_Library_for_Forest.mp3" bash scripts/sync-forest-music-to-r2.sh`. That is one batch transfer of all 10 albums plus the shared Cozy soundtrack; no recipient upload needed. The MP3 was supplied by the gift creator separately.
4. Configure public **read-only** delivery using a custom domain connected to the R2 bucket (production-preferred), or an `r2.dev` URL for a limited test. Do not make the Google Drive folders public. [R2 public bucket guide](https://developers.cloudflare.com/r2/buckets/public-buckets/).
5. In `forest-audio-config.js`, set `baseUrl` to that verified public HTTPS origin, WITHOUT a trailing slash. Example: `https://music.example.com`.
6. Verify that `<baseUrl>/cozy/cozy-library.mp3` and a song in each world return audio (not HTML/403/404); check mobile and desktop playback. Confirm Pause, track change, and no double playback. Do this before giving the app to the recipient.
7. Browsers often require an initial gesture to permit **audible** autoplay. The homepage shows a single **Enter the Forest** button when hosted audio is configured; other pages try playback and offer a Play control when blocked.

## Security and operational notes

- The GitHub repo and its playlist index are public; the private Drive MP3 file IDs and Cloudflare credentials are not used for client authentication.
- Public R2 read URLs mean anyone with the app can obtain the hosted audio. Confirm the music permissions cover that delivery model.
- The R2 development URL is rate-limited; custom domains are recommended for a gift shared beyond a test audience.
- R2 free allowances and charges depend on use; monitor Cloudflare billing. Audio file transfer and bucket configuration have **not** been performed by merely merging the app code.
