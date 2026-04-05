# y2mp3 v4.0.0 — Development Plan

## Project
Full rewrite of [y2mp3](https://github.com/moshfeu/y2mp3) — replacing the old
Webpack/React 16/MobX/ytdl-core stack with Electron-Vite + React 18 + Tailwind CSS +
Shadcn/ui + yt-dlp.

**Branch:** `feat/electron-vite-rewrite`  
**Working folder:** `/Users/moshef/Documents/projects/y2mp3`  
**Node version:** Must use Node v20 (`fnm use 20`). Node v24 + Yarn v1 has an EBADF bug.  
**Registry:** `~/.yarnrc` points to Wix Artifactory — **VPN required for `yarn install`**.
Before pushing to GitHub, sanitize yarn.lock:
```bash
sed -i '' 's|https://npm.dev.wixpress.com/api/npm/npm-repos/|https://registry.yarnpkg.com/|g' yarn.lock
```

## Run / Build
```bash
fnm use 20
yarn dev       # Electron + Vite dev server
yarn build     # Production build (outputs to out/)
yarn dist:mac  # Package as .dmg
```

## Current Status

**Branch:** `feat/playlist-ux-redesign` (uncommitted implementation changes, ready to implement remaining todos)

### Done
- ✅ Electron-Vite + React 18 + TypeScript scaffold
- ✅ Tailwind CSS + Shadcn/ui components
- ✅ yt-dlp backend (isPlaylistUrl, getPlaylistInfo, downloadAudio, abortDownload)
- ✅ Playlist UI rewrite: inline fetch button, row layout, cancel, partial success summary, Start over
- ✅ Settings panel: save location + playlist subfolder toggle
- ✅ IPC: cancel-download, item-error, mixed URL routing
- ✅ UX spec fully updated (`docs/ux-spec.md`) with all design decisions
- ✅ Full wireframe set in `docs/wireframes/` (idle, fetching, fetch-error, fetch-success, mixed-url, playlist-rows, downloading, done, settings, autopaste)
- ✅ `docs/architecture.md` — tech reference
- ✅ `AGENTS.md` — engineering standards + agent mindset
- ✅ `PLAN.md` + `PLAYLIST_UX_SPEC.md` moved to `docs/`

### Next: Implementation (Phase A → B → C)

**Phase A — Bug fixes**
1. `bug-state-reset-on-nav` — lift download state to App.tsx
2. `ux-hide-controls-before-fetch` + `ux-fetch-states` — spinner/error/success fetch states
3. `bug-dot-before-download` — hide status column until download starts
4. `bug-error-in-row` — inline error per row, suppress global alert
5. `bug-thumbnail-csp` — allowlist i.ytimg.com in CSP
6. `bug-subfolder-not-saved` — read settings at download time

**Phase B — New UX features**
7. `ux-mixed-url` — video + "Fetch playlist →" banner
8. `feat-per-row-download` — per-row ⬇ Download button
9. `feat-show-in-folder` — 📂 Show file per row + single video done state
10. `feat-settings-shortcut` — ⌘, opens Settings
11. `feat-autopaste-clipboard` — clipboard auto-paste on focus + toast
12. `bug-history-show-in-folder-failed` — hide Show in folder for failed history entries

**Phase C — Polish & ship**
- `feat-validate-output-path` → `qa-test` → squash-merge → push PR #150

---

## Key Technical Notes

### Electron-Vite + `"type": "module"`
`package.json` has `"type": "module"` → preload builds to `out/preload/index.mjs`.
`electron/main.ts` references `index.mjs` (not `.js`).

### yt-dlp PATH in Electron
Electron's `exec()` doesn't inherit the shell PATH on macOS. `EXEC_ENV` in
`electron/download.ts` adds explicit paths: `/opt/homebrew/bin`, `/usr/local/bin`,
`~/.pyenv/shims`, `~/.local/bin`.

### electron-store v8 (ESM-only)
Main process uses dynamic import: `const { default: Store } = await import('electron-store')`

### yt-dlp info fetch
Uses `--print` with specific fields (NOT `-j`) to avoid maxBuffer overflow:
```
yt-dlp --print "%(id)s\n%(title)s\n%(uploader)s\n%(duration)s\n%(thumbnail)s" --no-playlist URL
```

### Playlist detection
`isPlaylistUrl(url)` returns true for `youtube.com/playlist?list=...`.
`watch?v=...&list=...` is currently treated as single video (user chose a specific video).

---

## Phase 11: Playlist Support UI (remaining work)

Backend is fully implemented in `electron/download.ts` and `electron/main.ts`.
All that remains is updating `src/components/DownloadForm.tsx`.

### IPC events already wired up (backend → renderer)
- `download-item-start` → `{ index, title }`
- `download-item-done` → `{ index, filepath, filename, filesize }`
- `download-item-error` → `{ index, title, error }`

Preload (`electron/preload.ts`) already exposes:
- `window.electronAPI.onItemStart(cb)`
- `window.electronAPI.onItemDone(cb)`

### 11.1 Detect playlist URL (`playlist-detection`)
In `DownloadForm.tsx`: when `getVideoInfo` returns `result.playlist`, switch UI to
playlist mode instead of showing single-video card.

### 11.2 Playlist preview card (`playlist-preview-ui`)
- Show playlist title and total count
- Scrollable list of first 10 entries (index + title); "...and N more" if > 10
- Download button label: `"Download Playlist (N videos)"`

### 11.3 Playlist download progress UX (`playlist-download-ux`)
- Header: `"Downloading 3 / 42 — Song Title"`
- Compact entry list with status icons:
  - `·` pending, `⟳` active, `✓` done, `✗` failed
- Per-item progress bar under the currently active entry
- Subscribe to `onItemStart` / `onItemDone` events

### 11.4 Mixed URL handling (`playlist-mixed-url`)
When URL has both `?v=` and `&list=`, offer a choice:
- "Download this video only"
- "Download full playlist"

---

## Remaining Tasks

| # | Task | Status |
|---|------|--------|
| 1 | Detect playlist URL in DownloadForm | 🔲 pending |
| 2 | Build playlist preview card UI | 🔲 pending (depends on 1) |
| 3 | Playlist download progress UX | 🔲 pending (depends on 2) |
| 4 | Handle `watch?v=...&list=...` URLs | 🔲 pending |
| 5 | QA — test all flows | 🔲 pending |
| 6 | Package for distribution (dmg/exe/AppImage) | 🔲 pending |

---

## File Map

| File | Purpose |
|------|---------|
| `electron/main.ts` | IPC handlers, store management |
| `electron/download.ts` | yt-dlp wrapper (all download/info logic) |
| `electron/preload.ts` | contextBridge — ElectronAPI exposed to renderer |
| `src/types/index.ts` | All shared types (PlaylistInfo, DownloadProgress, etc.) |
| `src/App.tsx` | Tab nav, settings/history loading, theme |
| `src/components/DownloadForm.tsx` | Main download UI — **primary file for playlist UI work** |
| `src/components/DownloadHistory.tsx` | History list with search |
| `src/components/SettingsPanel.tsx` | Settings form |
| `src/components/ui/` | Shadcn components |
