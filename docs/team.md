# Team Workflows

This document defines how the agents on this project collaborate. Each agent has a distinct role and operates in its own context to prevent bias.

---

## Agents

| Agent | Role | Persona file |
|---|---|---|
| **UX / Product** | Defines user-visible behavior: wireframes, specs, acceptance criteria | `.github/agents/ux-product-designer/ux-product-designer.agent.md` |
| **Dev** | Implements features, fixes bugs, writes tests from specs | `AGENTS.md` |
| **Critic** | Reviews plans and implementations for correctness, blind spots, edge cases | Built-in critic agent |

---

## Workflows

### Feature development

```
UX writes spec → Dev plans → Critic reviews plan → Dev implements → Tests pass → User approves → Commit
```

1. **UX agent** writes or updates `docs/ux-spec.md` + wireframes with user-visible behavior
2. **Dev agent** reads spec, plans implementation (updates `docs/plan.md`)
3. **Critic agent** reviews the plan for blind spots **before** any code is written
4. **Dev agent** implements the feature
5. **Dev agent** runs `yarn build && yarn test` — all tests must pass
6. **User** reviews and approves before any commit

### Writing test specs + implementing tests

This is a two-phase process to keep UX and dev perspectives independent:

**Phase 1 — Spec (UX agent, separate context)**
- UX agent writes behavioral specs in Gherkin-style (Given/When/Then)
- Specs describe only user-visible behavior — no code, no implementation hints
- Output: `docs/test-specs.md`

**Phase 2 — Implementation (Dev agent)**
- Dev agent reads `docs/test-specs.md`
- Implements tests using Vitest + React Testing Library
- Tests live in `src/**/*.test.tsx` (component tests) and `src/store/**/*.test.ts` (store logic)
- Must not modify the spec to make tests easier to pass

### Bug fixes

```
Bug reported → Dev reproduces → Dev writes failing test → Fix → Test passes → User approves → Commit
```

- Always write the failing test **before** the fix (TDD)
- The test name should describe the bug: `it('should not show Show in Finder for failed history entries')`

### Reviewing changes

- **Critic agent** is invoked for any non-trivial change (multi-file edits, architectural decisions)
- Critic is called **after planning but before implementing** for maximum leverage
- Feedback is evaluated by the dev agent — not all findings need to be adopted

---

## Conventions

### Commits
- Never commit without explicit user approval (`"ship it"`, `"commit"`, `"looks good"`)
- Always include `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>` trailer
- Squash to a clean commit per feature before merging

### Branch strategy
- Feature branches off `main`: `feat/description`
- Sanitize lockfile before every push: `sed -i '' 's|https://repo.dev.wixpress.com/...|https://registry.yarnpkg.com/|g' yarn.lock`

### Build validation
- Always run `fnm use 20 && yarn build` after changes (Node 20 required — Node 24 + Yarn 1 crashes)
- `yarn test` must pass before any commit

### File organization
```
docs/
  plan.md          # current implementation plan
  ux-spec.md       # UX behavioral specification + wireframes
  architecture.md  # technical reference
  team.md          # this file — team workflows
  test-specs.md    # behavioral test specs (UX-authored)
  wireframes/      # SVG wireframes
src/
  test/
    setup.ts       # global test setup (mocks window.electronAPI)
    utils.ts       # shared test helpers: api(), makeItem(), etc.
  **/*.test.tsx    # component tests
  store/**/*.test.ts  # store unit tests
```

### TypeScript cross-project boundaries

The codebase has two TS projects: `tsconfig.node.json` (electron/) and `tsconfig.web.json` (src/).

- **Do not import from `electron/` in `src/`** — this would violate the web tsconfig file list boundary
- Shared types that both the renderer and preload need (e.g. `ElectronAPI`) live in `src/types/shared.ts`
- `electron/preload.ts` imports types from `../src/types/shared` and uses `satisfies ElectronAPI` on the contextBridge object to guarantee it stays in sync

### Setup files need explicit vitest imports

`src/test/setup.ts` runs before Vitest injects globals. Always import explicitly:

```ts
import { vi, beforeEach } from 'vitest'
```

### Avoid variable shadowing in catch blocks

When a `catch` parameter and an inner callback both use `e`, TypeScript reports the wrong type. Rename the catch parameter:

```ts
// ✗ — `e` in the map callback refers to the PlaylistEntry, not the error
} catch (e: any) {
  set(state => ({ entries: state.entries.map(e => ...) }))
}

// ✓
} catch (err: any) {
  set(state => ({ entries: state.entries.map(e => ...) }))
}
```

### Shared test utilities

Helpers used by more than one test file belong in `src/test/utils.ts`, not in individual spec files.

Current exports:
- `api()` — typed accessor for the mocked `window.electronAPI`
- `makeItem(overrides?)` — factory for `DownloadItem` fixtures
