# y2mp3 — Download Flow UX Spec
> React + Electron · Reference for implementation, design review, and QA

---

## Wireframes

| idle | playlist rows |
|---|---|
| ![idle](docs/wireframes/state-idle.svg) | ![playlist rows](docs/wireframes/state-playlist-rows.svg) |

| downloading | done (partial success) |
|---|---|
| ![downloading](docs/wireframes/state-downloading.svg) | ![done](docs/wireframes/state-done.svg) |

| settings screen | |
|---|---|
| ![settings](docs/wireframes/settings-screen.svg) | |

---

## 1. Entry Points & URL Handling

| URL Type | Detection | Behaviour |
|---|---|---|
| `youtube.com/playlist?list=...` | `list=` present, no `v=` | Fetch → playlist row layout |
| `youtube.com/watch?v=xxx&list=yyy` | both `v=` and `list=` | Fetch → playlist row layout (no choice card — user picks per row or Download All) |
| `youtu.be/xxx` or plain watch URL | no `list=` | Fetch → single video card |

**No mixed-URL choice modal.** A URL with `list=` always resolves to the playlist row layout. Cherry-picking a single video is done via the per-row `↓ Save` button.

---

## 2. States & Transitions

```
idle
  │  user types/pastes URL
  │  clicks inline [→] Fetch button
  ▼
fetching
  │  getVideoInfo() IPC call
  ├─ playlist response ──▶ playlist rows
  └─ single response  ──▶ single video card

playlist rows
  │  user reviews entries (thumbnail, title, meta)
  │  clicks ↓ Save on individual row  ──▶  downloading (single item)
  │  clicks Download All              ──▶  downloading (sequential)
  ▼
downloading
  │  active row: progress bar visible, ⟳ N% button, ✕ cancel link
  │  done row:   green tint, ✓ Show file button
  │  failed row: red tint, error reason, ↺ Retry button
  │  top bar:    Downloading N / total + Cancel All button
  ├─ all items resolved ──▶ done
  └─ Cancel All          ──▶ done (partial)

done
  │  summary: "Downloaded X of Y · N failed"
  │  user clicks Start over ──▶ idle
```

---

## 3. What the User Sees at Each State

### 3.1 `idle`
- URL input with inline `[→]` Fetch button (right side of field, icon button).
- Fetch button disabled until URL is a valid YouTube URL.
- Format + Quality selects at defaults.
- Filename input (single video mode only — hidden in playlist mode).
- Download button disabled ("⬇️ Download Audio").

### 3.2 `fetching`
- Fetch button becomes a spinner (disabled).
- URL field disabled.
- No other changes visible.

### 3.3 `playlist rows`
- List of entry rows (see §4 for row anatomy).
- Rows are scrollable; no cap on entries shown (all entries rendered).
- `Download All (N videos)` — full-width primary button at bottom.
- Format + Quality selects visible above rows.

### 3.4 `single video card`
- Card: thumbnail, title, author, duration.
- Filename input visible (pre-filled with title).
- `⬇️ Download Audio` button.

### 3.5 `downloading`
- Active row has visible border, progress bar below meta, `⟳ N%` button, `✕ cancel` link.
- Done rows: green tint, `✓ Show file` button.
- Failed rows: red tint, inline error reason, `↺ Retry` button.
- Header: `Downloading N / total...` + `✕ Cancel All` button (replaces Download All).
- Other controls (format, quality) disabled.

### 3.6 `done`
- Summary alert: `"Downloaded 23 of 24 · 1 failed"` (or `"Downloaded 24 of 24"` on full success).
- Failed rows remain visible with error + Retry option.
- `Start over` button resets form to idle (replaces 6s auto-reset).

---

## 4. Playlist Entry Row Anatomy

```
┌──────────────────────────────────────────────────────────┐
│ [thumb]  Title of the Video                    [action]  │
│          Author · duration                               │
│          [progress bar — visible during download only]   │
└──────────────────────────────────────────────────────────┘
```

| Element | Detail |
|---|---|
| Thumbnail | 64×40px, rounded corners, greyed placeholder before load |
| Title | Bold, truncated to 1 line |
| Author + duration | Muted, 1 line below title |
| File size | Shown after download completes (in done state) |
| Action button | See states below |
| Progress bar | Full row width below meta, visible only when `status === 'downloading'` |
| Error reason | Replaces author/duration line when `status === 'failed'` |

**Action button states:**

| Entry status | Button label | Style |
|---|---|---|
| pending | `↓ Save` | Outline, grey |
| downloading | `⟳ N%` | Filled dark + `✕ cancel` link below |
| done | `✓ Show file` | Outline, green |
| failed | `↺ Retry` | Outline, red |

---

## 5. Settings Screen — Output Section

Settings gains an **Output** section (save location moves here from main form):

| Setting | Type | Detail |
|---|---|---|
| Save location | Path input + Browse button | Replaces the field on the download form |
| Playlist subfolder | Toggle | When ON: creates `<save location>/<playlist title>/` before downloading; tracks saved there |

**Playlist subfolder behaviour:**
- Folder name is sanitized (strip `:/?*"<>|`, truncate at 80 chars).
- If folder already exists, reuse silently (no error).
- Live path preview shown below toggle when ON: `Saving to: ~/Downloads/My Playlist/`

**Main form simplification:** with save location removed, the form shows only URL input, Format, Quality, and (in single video mode) Filename.

---

## 6. Inline Fetch Button

- Rendered as an icon button (`→` or magnifier) **inside** the right edge of the URL input field.
- Accessible: `aria-label="Fetch video info"`, keyboard-focusable, Enter triggers it.
- States: idle (enabled when URL is valid YouTube URL) → loading (spinner, disabled) → done (check, re-enables on URL change).
- Replaces all `onBlur` auto-fetch logic.

---

## 7. Known Bug — Mixed URL Downloads Only One Video

> **Status: fix in progress** (tracked as `bug-mixed-url-playlist`)

### Root cause
`isPlaylistUrl(url)` in `electron/download.ts` returns `false` for any URL containing `v=`, even if `list=` is also present. `downloadAudio` uses this to choose `--no-playlist`, so only the single video downloads.

### Fix
Add `isPlaylist?: boolean` to `DownloadOptions`. Set it explicitly in `DownloadForm` based on detected URL type (not re-inferred from URL string). `downloadAudio` uses `options.isPlaylist` to choose `--yes-playlist` vs `--no-playlist`.

With the new row layout, mixed URLs are treated as playlists by default — this bug becomes less likely to surface but the backend fix is still required.

---

## 8. Resolved UX Gaps

| Gap | Resolution |
|---|---|
| No cancel | Per-row `✕` cancel + `Cancel All` button |
| No error detail | Inline error reason on failed row + `↺ Retry` |
| Hidden entries (>50 cap) | All entries rendered (no cap) |
| Generic success on partial failure | `"Downloaded X of Y · N failed"` summary |
| 6s auto-reset too fast | Replaced with explicit `Start over` button |
| Blur-triggered fetch | Replaced with inline `[→]` Fetch button |
| Mixed URL choice modal | Eliminated — replaced by per-row actions |
| Save location on every form | Moved to Settings |
| No playlist subfolder | Settings toggle with live path preview |
