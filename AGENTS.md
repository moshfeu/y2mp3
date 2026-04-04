# AGENTS.md — y2mp3 Engineering Standards

This file is read by AI coding agents (GitHub Copilot CLI, Claude Code, etc.) and applies to **all** work on this codebase. Follow these principles on every task.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| App shell | Electron 28 (electron-vite) | Main + preload + renderer processes |
| UI framework | React 18 + TypeScript | Hooks only, no class components |
| Styling | Tailwind CSS + Shadcn/ui | Utility-first; Shadcn primitives in `src/components/ui/` |
| Build | Vite (renderer) + esbuild (main/preload) | `fnm use 20` required — Node 24 + Yarn 1 = EBADF crash |
| Download backend | yt-dlp | Spawned subprocess; PATH extended manually in `EXEC_ENV` |
| Settings | electron-store v8 (ESM-only) | Dynamic import required: `const { default: Store } = await import('electron-store')` |
| Package manager | Yarn 1 (classic) | VPN required for `yarn install` (Wix Artifactory). Sanitize lockfile before push. |

See `docs/architecture.md` for full technical details, IPC channels, and known quirks.

---

## Agent Mindset

### Plan before implementing
- **Never start coding without a plan.** For any non-trivial task, outline the approach first — affected files, key decisions, edge cases — and surface it to the user before writing code.
- Think ahead: consider what could break, what depends on what, and what future work the decision enables or forecloses.
- For UX changes, spec and wireframes come before code. Refer to `docs/ux-spec.md`.

### Document everything
- Update `docs/architecture.md` when you change a significant pattern (IPC channel, settings schema, download flow).
- Update `docs/ux-spec.md` and wireframes when UI behaviour changes.
- Keep `docs/plan.md` current as tasks complete and scope evolves.
- Leave code comments that explain *why*, not *what*.

### Never commit without user approval
- Present changes and a summary of what will be committed.
- Wait for explicit user confirmation ("yes", "go ahead", "commit it") before running `git commit`.
- Never push to remote without user instruction.

---

## Non-Negotiables

### DRY — Don't Repeat Yourself
- Extract repeated logic into a named function or hook before it appears a third time.
- Shared types live in `src/types/index.ts`. Never duplicate a type inline.
- IPC channel name strings belong in a constants file — never duplicated across `main.ts`, `preload.ts`, and the renderer.

### SOC — Separation of Concerns
- **Main process** (`electron/`): OS, IPC, file system, subprocess management. No UI logic.
- **Renderer** (`src/`): React components, state, UI events. No direct Node/Electron APIs.
- **Preload** (`electron/preload.ts`): The only bridge. Keep it thin — expose methods, don't implement logic here.
- **Components**: One responsibility per component. If a component manages both download state and settings, split it.

### Clean Code
- Functions do one thing. If the name needs "and", it does too much.
- Name things for what they are: `playlistEntries`, not `data`.
- No magic numbers or strings — use named constants.
- Delete dead code — don't comment it out.
- Keep files under ~300 lines. Split at logical seams.

### Error Handling
- All IPC `invoke` calls must have a `try/catch` in the renderer.
- User-visible errors must show in the UI (inline in the relevant row or component), never only in the console.
- Distinguish between user errors (bad URL) and system errors (yt-dlp not found) — message accordingly.

---

## React Conventions

- **Hooks for state and side effects** — no class components.
- **Prop types** are TypeScript interfaces, co-located with the component or in `src/types/index.ts` if shared.
- **No prop drilling past 2 levels** — lift to a shared parent or use context.
- **State resets must be intentional** — components that must survive tab switches should be kept mounted (CSS `display:none`) or their state lifted to `App.tsx`.

---

## Testing (TDD)

- Write the test before (or alongside) the implementation — not after.
- Unit test pure functions in `electron/download.ts` (URL parsing, path building, output parsing).
- Integration tests cover the IPC layer: mock `ipcRenderer`/`ipcMain` — never spawn real yt-dlp in tests.
- A feature is not done until its happy path and at least one error path are tested.

---

## Commit & Branch Hygiene

- Branch: `feat/playlist-ux-redesign` → squash-merge into `feat/electron-vite-rewrite`
- Commit messages: imperative, present tense (`fix: inline error per row`, not `fixed error`)
- Before every push, sanitize `yarn.lock`:
  ```bash
  sed -i '' 's|https://repo.dev.wixpress.com/artifactory/api/npm/npm-repos/|https://registry.yarnpkg.com/|g' yarn.lock
  ```

---

## AI Agent Roster

| Agent | File | When to use |
|---|---|---|
| **Avishag** (UX/Product) | `.github/agents/ux-product-designer/` | UX review, wireframes, spec updates, design decisions |
| *(this file)* | `AGENTS.md` | Always active — engineering standards, planning, documentation |


### DRY — Don't Repeat Yourself
- Extract repeated logic into a named function or hook before it appears a third time.
- Shared types live in `src/types/index.ts`. Never duplicate a type inline.
- Shared IPC channel name strings belong in a constants file — never duplicated across `main.ts`, `preload.ts`, and the renderer.

### SOC — Separation of Concerns
- **Main process** (`electron/`): OS, IPC, file system, subprocess management. No UI logic.
- **Renderer** (`src/`): React components, state, UI events. No direct Node/Electron APIs.
- **Preload** (`electron/preload.ts`): The only bridge. Thin — expose methods, don't implement logic here.
- **Components**: One responsibility per component. If a component manages both download state and settings, split it.

### Clean Code
- Functions do one thing. If a function name needs "and", it does too much.
- Name things for what they are, not what they do: `playlistEntries`, not `data`.
- No magic numbers or strings — use named constants.
- Delete dead code — don't comment it out.
- Keep files under ~300 lines. Split at logical seams.

### Error Handling
- All IPC `invoke` calls must have a `try/catch` in the renderer.
- User-visible errors must show in the UI (inline in the relevant row or component), never only in the console.
- Distinguish between user errors (bad URL) and system errors (yt-dlp not found) — message accordingly.

---

## React Conventions

- **Hooks for state and side effects** — no class components.
- **Prop types** are TypeScript types, co-located with the component or in `src/types/index.ts` if shared.
- **No prop drilling past 2 levels** — lift to a shared parent or use context.
- **State resets must be intentional** — components that must survive tab switches should be kept mounted (CSS `display:none`) or their state lifted to `App.tsx`.

---

## Testing (TDD)

- Write the test before (or alongside) the implementation — not after.
- Unit test pure functions in `electron/download.ts` (URL parsing, path building, output parsing).
- Integration tests cover the IPC layer: mock `ipcRenderer`/`ipcMain` — never spawn real yt-dlp in tests.
- A feature is not done until its happy path and at least one error path are tested.

---

## Documentation

- **Architecture decisions** go in `docs/architecture.md`. If you change a significant pattern (IPC channel, settings schema, download flow), update the doc.
- **UX decisions** go in `docs/ux-spec.md` and the wireframes in `docs/wireframes/`. Spec first, code second.
- **Code comments**: explain *why*, not *what*. Obvious code needs no comment.
- Keep `docs/plan.md` updated as work progresses.

---

## Commit & Branch Hygiene

- Branch: `feat/playlist-ux-redesign` → squash-merge into `feat/electron-vite-rewrite`
- Commit messages: imperative, present tense (`fix: inline error per row`, not `fixed error`)
- Before every push, sanitize `yarn.lock` (see `docs/architecture.md`)

---

## AI Agent Roster

| Agent | File | When to use |
|---|---|---|
| **Avishag** (UX/Product) | `.github/agents/ux-product-designer/` | UX review, wireframes, spec updates, design decisions |
| *(engineer agent — this file)* | `AGENTS.md` | Always active — coding standards |
