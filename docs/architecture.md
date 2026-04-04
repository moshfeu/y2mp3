# y2mp3 — Architecture & Technical Design

> Tech reference for contributors and AI coding agents working on this codebase.

---

## Stack

| Layer | Technology |
|---|---|
| App shell | Electron 28 (electron-vite) |
| UI framework | React 18 + TypeScript |
| Styling | Tailwind CSS + Shadcn/ui |
| Build | Vite (renderer) + esbuild (main/preload) |
| Download backend | yt-dlp (spawned subprocess) |
| Settings persistence | electron-store v8 |
| Package manager | Yarn 1 (classic) |

---

## Project Structure

```
electron/           # Main process + preload (Node/Electron context)
  main.ts           # IPC handlers, app lifecycle, window creation
  preload.ts        # Exposes typed window.electron API to renderer
  download.ts       # yt-dlp wrapper: getVideoInfo, downloadAudio, abortDownload

src/                # Renderer process (React/Vite context)
  components/       # UI components
    DownloadForm.tsx # Core download flow (URL input, fetch, rows, progress)
    SettingsPanel.tsx
    ui/             # Shadcn/ui primitives (Button, Input, etc.)
  types/
    index.ts        # Shared types: PlaylistEntry, DownloadOptions, AppSettings, ElectronAPI
  App.tsx           # Root — tab routing (Download / Settings)
  main.tsx          # React entry

docs/
  plan.md           # Development plan and feature backlog
  ux-spec.md        # UX specification (source of truth for UI decisions)
  wireframes/       # Lo-fi SVG wireframes for each app state

resources/          # Static assets (icons)
```

---

## IPC Architecture

Communication between the renderer and main process follows a strict boundary:

```
Renderer (React)
    │  window.electron.<method>()
    ▼
preload.ts          ← contextBridge — typed surface only
    │  ipcRenderer.invoke / ipcRenderer.on
    ▼
main.ts             ← ipcMain.handle / BrowserWindow.webContents.send
    │
    ▼
download.ts         ← yt-dlp subprocess management
```

**Rules:**
- The renderer **never** directly calls Node APIs — only `window.electron.*`
- `preload.ts` is the single authoritative API surface — all methods must be typed in `src/types/index.ts` under `ElectronAPI`
- IPC channel names are plain strings — keep them kebab-case and documented here

### IPC Channels

| Channel | Direction | Purpose |
|---|---|---|
| `get-video-info` | invoke | Fetch metadata for a URL (single or playlist) |
| `download-audio` | invoke | Start a download; streams progress events |
| `cancel-download` | invoke | Abort the active yt-dlp child process |
| `get-settings` | invoke | Read persisted settings from electron-store |
| `save-settings` | invoke | Write settings to electron-store |
| `download-progress` | main→renderer | Emitted during download (percent, speed) |
| `item-error` | main→renderer | Per-row error during playlist download |

---

## Download Flow

```
getVideoInfo(url)
  └─ isPlaylistUrl(url)?
       ├─ yes → yt-dlp --flat-playlist --print → N entries with id/title/thumbnail/duration
       └─ no  → yt-dlp --print → single entry

downloadAudio(url, options)
  └─ spawns yt-dlp child process → currentDownloadChild
       ├─ stdout → parse progress → emit download-progress IPC event
       ├─ stderr → parse errors → emit item-error IPC event
       └─ close(code)
            ├─ code 0   → resolve(outputPath)
            ├─ code null → reject("Download cancelled")
            └─ other    → reject(stderr)

abortDownload()
  └─ currentDownloadChild?.kill('SIGTERM')
```

**Key details:**
- `isPlaylistUrl`: matches any URL containing `list=` — mixed URLs (both `v=` and `list=`) are detected as playlists at the backend. The frontend decides whether to present as single or playlist (see UX spec §1).
- `EXEC_ENV`: adds `/opt/homebrew/bin`, `/usr/local/bin` etc. to `PATH` — Electron does not inherit the shell PATH on macOS.
- `chunkSize = 6` in `getPlaylistInfo` — yt-dlp `--print` emits one line per field per entry (id, title, thumbnail, duration, webpage_url, playlist_index).

---

## Settings

Stored via `electron-store` (ESM-only, v8 — must use dynamic import):

```ts
const { default: Store } = await import('electron-store')
```

Schema (defined in `main.ts`):

| Key | Type | Default |
|---|---|---|
| `outputPath` | string | `~/Downloads` |
| `format` | `'mp3' \| 'aac' \| 'm4a'` | `'mp3'` |
| `quality` | `'best' \| '128k' \| '192k' \| '256k' \| '320k'` | `'best'` |
| `playlistSubfolder` | boolean | `false` |
| `theme` | `'system' \| 'light' \| 'dark'` | `'system'` |

---

## Environment & Tooling

```bash
# Always use Node 20 — Node 24 + Yarn 1 = EBADF crash
fnm use 20

yarn dev        # Dev server (Electron + Vite HMR)
yarn build      # Production build → out/
yarn dist:mac   # Package → .dmg
```

**Before every push to GitHub** — sanitize the lockfile (Wix Artifactory URLs must not leak):
```bash
sed -i '' 's|https://repo.dev.wixpress.com/artifactory/api/npm/npm-repos/|https://registry.yarnpkg.com/|g' yarn.lock
```

---

## Key Constraints & Known Quirks

| Issue | Detail |
|---|---|
| CSP blocks YouTube thumbnails | `i.ytimg.com` must be allowlisted in Electron's `Content-Security-Policy` |
| Electron doesn't inherit shell PATH | `EXEC_ENV` in `download.ts` adds Homebrew + nvm paths manually |
| `electron-store` v8 is ESM-only | Dynamic import required in `main.ts` |
| State resets on Settings tab switch | `DownloadForm` unmounts — fix: lift state to `App.tsx` or keep mounted |
| Mixed URLs (v= + list=) | Backend treats any `list=` as playlist; frontend shows video first and offers "Fetch playlist →" |
