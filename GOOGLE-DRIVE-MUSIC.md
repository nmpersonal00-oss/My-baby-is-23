# Google Drive music: no album downloads

This is an **optional** way to play the private music in Rayan's Dark Forest directly from Google Drive. The music is not copied to GitHub or permanently saved as local audio files. The player requests one song at a time over the network and plays it in memory.

**Important:** Browsers do not hand an entire Google Drive folder to another website when you drag it out of the Drive website. This feature accepts a **Google Drive folder link** dropped into the settings area, or the same link pasted there. If dragging does not produce a link, use **Copy link** in Google Drive. The person playing must have permission to view the folder and sign in to Google. This is different from dropping a downloaded folder.

## One-time setup by the gift creator (not your husband)

Google's Drive API requires an OAuth application before a website may read private folders. No password, API secret, or Drive token belongs in the repository.

1. Open [Google Cloud Console](https://console.cloud.google.com/), select or create a Google Cloud project, and enable **Google Drive API** under APIs & Services.
2. Configure **Google Auth Platform / OAuth consent screen**. Add the **Drive read-only** scope `https://www.googleapis.com/auth/drive.readonly`. The app requests read access only and does not edit or upload any Drive files. Google may require OAuth verification to publish broadly; for a private test, add the accounts that will use the app as **test users**.
3. Create an **OAuth 2.0 Client ID** of type **Web application**. Add the actual hosted website's origin to **Authorized JavaScript origins** (for example, `https://nmpersonal00-oss.github.io` if that's the site's GitHub Pages origin, or your custom HTTPS domain). Do not include a path such as `/My-baby-is-23/`; the value must be the site origin.
4. Copy the resulting **Client ID** (ending in `.apps.googleusercontent.com`) into `forest-audio-config.js`:
   ```js
   window.FOREST_AUDIO_CONFIG = Object.freeze({
     baseUrl: '',
     googleDriveClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com'
   });
   ```
   This client ID is designed to appear in browser code. Do **not** add a client secret, API key, access token, or password.
5. Make sure your husband can open the album folder in Google Drive using the Google account he will sign in with. You can use Drive's normal **Share** option to give his account Viewer access; you **do not** have to make the folder public.
6. Publish the website on HTTPS (such as GitHub Pages). OAuth cannot be tested by opening `index.html` from a local `file://` address. Check the console's authorized origin matches the live site.

## What your husband does in the gift

### Word Search albums

1. Open a Word Search category, tap the small **✦** music star, then **♫** settings.
2. Tap **Connect Google Drive** and choose the Google account that can access the music.
3. From the Google Drive tab, **copy the music folder's link**. Drag that link into the dashed box if Google Drive provides it, or paste it into the input.
4. Tap **Use this Drive folder**. The app scans its subfolders, detects the seven categories from their folder names, and remembers the song list in that browser.
5. Tap **Play** (occasionally required by browser autoplay rules). Switching to another Word Search world selects that world's music.

The full folder may contain many tracks. The app reads their names first and then fetches only the selected audio track. No full library download is required. If the page is reloaded or Google access expires, tap **Connect Google Drive** again; the remembered song list remains.

### Cozy Library background track

1. Open the small **✦** music star on the home screen, then settings **⚙**.
2. Tap **Connect Google Drive**.
3. Paste or drop the Drive **folder link** or an individual **audio file link**, then tap **Use Google Drive music**.
4. If the folder has a file named like **Cozy Library**, it will be selected automatically. Otherwise, choose the desired track from the song selector.
5. Tap **Play** if needed.

The existing local MP3 selection remains available as a fallback.

## Limits and troubleshooting

- Google sign-in is required; giving someone the folder URL alone does not grant access to a private Drive folder.
- No OAuth credentials or audio files are uploaded to the website by this feature. The OAuth access token is held only in memory, and the browser stores only Drive file references for later use.
- No offline playback: the Google account must be connected and the selected audio must still be available in Drive.
- Audio is fetched into browser memory to play, so a large individual track may take time to begin. It is not added to your laptop's Downloads folder.
- If Google Drive does not include a URL when dragging a folder, use **Copy link**. Folder drag-and-drop from the Drive website is inherently browser-dependent.
- If you see **Google Drive requires one-time setup**, the Google Cloud Client ID above is still missing.
- If Google shows **Access blocked** or **app not verified**, check OAuth consent settings, authorized origins, scope, and test-user accounts. The `drive.readonly` scope may require Google's app verification for public use.
- If you see **Access denied**, share the folder with the signed-in Google account and try again.
- If you want the gift to play automatically with **no Google sign-in at all**, use the separate hosting setup in [FOREST-AUDIO-DEPLOY.md](FOREST-AUDIO-DEPLOY.md). That approach does not use private Drive OAuth, and its hosting/permission setup is still required.

Google Drive API: https://developers.google.com/workspace/drive/api/reference/rest/v3/files/list

Google Identity Services: https://developers.google.com/identity/oauth2/web/guides/use-token-model
