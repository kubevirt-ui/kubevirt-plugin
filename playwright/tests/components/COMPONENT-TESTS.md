# Component scene tests (story gallery)

Canonical guide for Playwright **`component-scenes`**: isolated UI tests that mount production React views in a local story gallery, without OpenShift or scenario global setup.

**Related:** [Playwright README](../../README.md) — E2E setup, projects, route layout.

---

## Dependency chain (top → bottom)

Tests drive shared page objects; the fixture mounts the gallery story; scenes render production UI with stubs.

```text
playwright/tests/components/scenes/<area>/*.spec.ts
        │
        ▼
component-dependencies/fixtures/*-scene-fixture.ts  (mount story, scoped PO, pageerror)
        │
        ▼
playwright/src/components/<area>/*  (page objects, BaseComponent + optional root)
        │
        ▼
Playwright mount fixture  →  browser #root
        │
        ▼
playwright/component-dependencies/gallery/  (window.mount / window.unmount, story catalog)
        │
        ├── bundle/gallery-resolve.ts  +  stubs/*  (SDK, console host, cluster hooks)
        │
        ▼
playwright/component-dependencies/scenes/**/*.scene.tsx
        │
        ├── stories/  (i18n, gallery-scene-data, virt-page-fixtures, watch registry)
        │
        ▼
src/views/...  (production React for the view under test)
```

**Story id:** `scenes/<path>/<SceneFile>/<ExportName>` — define default ids in `component-dependencies/stories/*-scene-constants.ts` (or equivalent) per area.

### Chain layers — role, build, patterns

#### 1. Spec (`tests/components/scenes/<area>/*.spec.ts`)

|                  |                                                                                                                                                                                                                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Role**         | Entry point: expresses user-visible behavior and assertions; sits above everything else in the chain.                                                                                                                                                                                        |
| **What it does** | Runs under the `component-scenes` project, receives area fixtures (scoped page object + story id) and Playwright `mount`, drives UI through page objects, asserts with `expect`.                                                                                                             |
| **How to build** | One folder per feature area under `scenes/<area>/`. Import `test` / `expect` from that area’s `@component-deps/fixtures/*-scene-fixture` (or a shared base once multiple areas exist). No scenario fixtures, no `page.goto` to the real console, no ad-hoc locators when a PO method exists. |
| **Patterns**     | Web-first assertions; `test.describe.configure({ mode: 'serial' })` when tests share gallery state; optional story-id fixture override per test file or test.                                                                                                                                |

#### 2. Scene fixture (`component-dependencies/fixtures/`)

|                  |                                                                                                                                                                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Role**         | Connects specs to a mounted story and a **scoped page object** for that area; owns mount/unmount hygiene and mount-time failure detection.                                                                                                          |
| **What it does** | Calls `window.unmount()`, mounts a default or configured **story id**, constructs `SomePageObject(page, root)`, fails on `pageerror`, unmounts after each test.                                                                                     |
| **How to build** | One fixture module per scene family (or a shared helper + thin per-area `test.extend`). Fixtures typically expose: **`sceneStory`** (or `<area>Story`) as a Playwright option, and a **scoped PO** fixture. Keep all mount logic here—not in specs. |
| **Patterns**     | Playwright `test.extend`; default story constants next to scene data under `stories/`; gallery-safe lifecycle (unmount before mount). _Today:_ VM wizard uses `scene-component-fixture.ts` (`vmWizard` / `vmWizardStory`).                          |

#### 3. Page objects (`playwright/src/components/*`)

|                  |                                                                                                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Role**         | Shared selector and interaction layer used by **both** component scenes and scenario E2E.                                                                                  |
| **What it does** | Encapsulates `data-test` and roles; when constructed with `root`, scopes queries to `#root` and uses `interactClick` / `interactFill` for gallery mounts.                  |
| **How to build** | Extend `BaseComponent(page, root?)`. Add gallery-friendly helpers on the same class as E2E methods (flow steps, expectations)—do not fork locators into spec-side helpers. |
| **Patterns**     | Page Object Model; optional mount root; production `data-test` only; scene test data referenced via parameters or constants aligned with `stories/` fixtures.              |

#### 4. Playwright `mount` → `#root`

|                  |                                                                                                                                                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Role**         | Browser bridge: renders the chosen story into the gallery page DOM.                                                                                                                                                   |
| **What it does** | Provided by `@playwright/test` for `component-scenes`; navigates to gallery `baseURL`, evaluates `window.mount({ story })`, returns a `Locator` for `#root`.                                                          |
| **How to build** | Configured in `playwright.config.ts` (`webServer` → gallery Rspack, `baseURL` port 3100). Prefer area fixtures over calling `mount` in specs; advanced cases may use `mount(storyId)` + `new PageObject(page, root)`. |
| **Patterns**     | Built-in Playwright component testing style without `@playwright/experimental-ct-react`; story id string matches gallery catalog.                                                                                     |

#### 5. Gallery host (`component-dependencies/gallery/`)

|                  |                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Role**         | Dev server entry and runtime that resolves story ids to React trees.                                                                                  |
| **What it does** | Exposes `window.mount` / `window.unmount`; `import.meta.glob` on `scenes/**/*.scene.tsx`; serves `index.html` and story catalog for manual debugging. |
| **How to build** | Rspack via `rspack.gallery.config.mts`; entry `gallery/main.tsx`. Do not import OpenShift console host here—only scenes + resolve aliases.            |
| **Patterns**     | Single-page gallery app; story id grammar `scenes/<path>/<File>/<Export>`; catalog for discoverability.                                               |

#### 6. Bundle resolve + stubs (`bundle/gallery-resolve.ts`, `stubs/*`)

|                  |                                                                                                                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Role**         | Side branch: makes production imports compile and run without a cluster or full console SDK.                                                                                       |
| **What it does** | `getGalleryResolveAlias` and `resolveGalleryRequest` redirect modules to `-gallery.ts` stubs or shims; stubs return static data matching `stories/` presets.                       |
| **How to build** | On gallery build/runtime failure, add or extend a stub and wire it in `gallery-resolve.ts`. Keep stubs minimal; mirror hook signatures from `src/`. Prune when scenes are removed. |
| **Patterns**     | Alias map + suffix-based redirect; `use*-gallery.ts` naming; no network in stubs.                                                                                                  |

#### 7. Scene shell (`component-dependencies/scenes/**/*.scene.tsx`)

|                  |                                                                                                                                                                                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Role**         | Thin adapter between gallery and production UI—defines _what_ is mounted for a story id.                                                                                                                                                                                                                                                         |
| **What it does** | Wraps a real view from `src/` in `VirtSceneScaffold` (router, i18n, form provider, data initializer) and optional `data-test` harness nodes.                                                                                                                                                                                                     |
| **How to build** | One `*.scene.tsx` per mountable surface; export `Default` (or named exports). Import production views via the same path aliases the app uses (e.g. `@virtualmachines/...`, `@settings/...`). Set `initialEntries` and `initialPreset` to match the flow. Keep scenes short; split non-scene layout to sibling TSX without `.scene.` in the name. |
| **Patterns**     | Scene file convention; `VirtSceneScaffold`; `story-surface` for debugging; relaxed ESLint for `*.scene.tsx`.                                                                                                                                                                                                                                     |

#### 8. Stories / fixtures (`component-dependencies/stories/`)

|                  |                                                                                                                                                                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Role**         | Feeds deterministic cluster-like data into stubbed watches and documents scene constants.                                                                                                                                                            |
| **What it does** | Scene data presets, K8s/template fixtures, watch registry, i18n init, per-area constants (story ids, step ids, test entity names).                                                                                                                   |
| **How to build** | When a scene needs list/watch data on first paint, set `initialPreset` on `VirtSceneScaffold` and align fixture `data-test` ids with page objects. Add `*-scene-constants.ts` (or similar) per area. Specs import via `@component-deps/stories/...`. |
| **Patterns**     | Preset registry; shared K8s/template JSON fixtures; constants colocated with gallery data—not in `src/`.                                                                                                                                             |

#### 9. Production UI (`src/views/...`)

|                  |                                                                                                                                                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Role**         | Bottom of the chain: the real product code under test.                                                                                                                                                                |
| **What it does** | Renders the same components users see in the OpenShift plugin; behavior depends on stubs for hooks and on scene data for watches.                                                                                     |
| **How to build** | No gallery-specific code in `src/`. Add or maintain `data-test` in product for stable POs. Hook changes on `main` may require stub updates in `component-dependencies`, not changes to production solely for gallery. |
| **Patterns**     | Normal plugin views; i18n via `useKubevirtTranslation`; cluster access only through hooks that gallery stubs replace.                                                                                                 |

---

## Quick reference

### Commands

| Command                              | Purpose                                                |
| ------------------------------------ | ------------------------------------------------------ |
| `npm run gallery:dev`                | Gallery at `http://localhost:3100/playwright/gallery/` |
| `npm run test-playwright-components` | `component-scenes` project                             |

### Example mapping (VM creation wizard — first area)

| Piece            | Path                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| Specs            | `scenes/vm-wizard/*.spec.ts`                                              |
| Fixture          | `fixtures/scene-component-fixture.ts` → `vmWizard`, `vmWizardStory`       |
| Page object      | `src/components/vm-wizard/vm-wizard-navigation-component.ts`              |
| Scene            | `component-dependencies/scenes/vm-wizard/VmCreationWizardShell.scene.tsx` |
| Constants / data | `stories/wizard-scene-constants.ts`, `gallery-scene-data.ts`              |
| Stubs / resolve  | `stubs/*`, `bundle/gallery-resolve.ts`                                    |

New areas follow the same table: `<area>` specs, fixture, PO folder, `scenes/<area>/*.scene.tsx`, `stories/*`, plus any new stubs in `gallery-resolve.ts`.

Use scoped page objects from `playwright/src/components` (same as E2E). Do not duplicate `data-test` in specs except gallery harness (`story-surface`, mount lifecycle).

---

## Overall approach

Component scene tests answer: **“Does this multi-step UI behave correctly when the user interacts with it?”** — without paying the cost of a full console + cluster run.

1. **Import real UI** from `src/` inside a `*.scene.tsx` file.
2. **Run it in a gallery** — Rspack app on port 3100 with `window.mount` / `window.unmount`.
3. **Stub** console host, dynamic plugin SDK, and hooks that would call the cluster.
4. **Drive and assert** via an area **scene fixture** that injects a scoped page object — same PO classes as scenario E2E with `BaseComponent(page, root)`.

Specs import `test` / `expect` from the fixture module for that area. They do **not** use scenario fixtures (`apiClient`, feature fixtures, global setup).

---

## Directory roles

| Path                                                                               | Purpose                                                               |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [`../../component-dependencies/gallery/`](../../component-dependencies/gallery/)   | HTML shell, `window.mount` / `window.unmount`                         |
| [`../../component-dependencies/scenes/`](../../component-dependencies/scenes/)     | `*.scene.tsx` — thin wrappers around production views                 |
| [`../../component-dependencies/stories/`](../../component-dependencies/stories/)   | i18n, watch registry, scene data presets, K8s/template fixtures       |
| [`../../component-dependencies/stubs/`](../../component-dependencies/stubs/)       | Console/SDK/multicluster and `-gallery` hook shims                    |
| [`../../component-dependencies/bundle/`](../../component-dependencies/bundle/)     | Rspack aliases and `resolveGalleryRequest`                            |
| [`../../component-dependencies/fixtures/`](../../component-dependencies/fixtures/) | Per-area `test.extend` — mount story, scoped PO, `pageerror` on mount |
| [`scenes/`](scenes/)                                                               | Component scene specs (`**/scenes/**/*.spec.ts`)                      |
| [`../../src/components/`](../../src/components/)                                   | **Shared** page objects and locators (E2E + component)                |
| [`../../rspack.gallery.config.mts`](../../rspack.gallery.config.mts)               | Gallery dev server / bundle entry                                     |

---

## Reusable code vs component-only code

### Shared with scenario E2E

- **Page objects** under `playwright/src/components/<area>/`.
- **`BaseComponent`** — optional `root?: Locator`; `ui`, `locator()`, `testId()` scope to the mount root when set.
- **`interactClick` / `interactFill`** — gallery-safe when `root` is set; E2E uses `robustClick` / `fill` when `root` is omitted.
- **Selectors** — production `data-test`; `testIdAttribute: 'data-test'`.
- **Constants** — production types/selectors only; scene story ids and gallery data live under `@component-deps/stories/...`.

### Component-only

- Everything under `playwright/component-dependencies/` except importing fixtures from specs.
- Gallery **stubs**, **Rspack** resolve, Playwright **`mount`** + per-area **scene fixtures**.
- Project **`component-scenes`** in [`playwright.config.ts`](../../../playwright.config.ts).

Compose flows on **page object** methods; avoid spec-side locator helpers.

---

## Component scenes vs scenario E2E

| Dimension              | Component scenes                            | Scenario E2E                                             |
| ---------------------- | ------------------------------------------- | -------------------------------------------------------- |
| **Playwright project** | `component-scenes`                          | Gating, Tier1/2, Settings, API                           |
| **Entry**              | `npm run test-playwright-components`        | `./playwright-runner-hc-e2e.sh` / `playwright-runner.sh` |
| **Base URL**           | `http://localhost:3100/playwright/gallery/` | OpenShift Console URL                                    |
| **Cluster**            | Not required                                | Required                                                 |
| **Global setup**       | Skipped (`SKIP_GLOBAL_SETUP`)               | Auth, namespaces, rules                                  |
| **Fixtures**           | `@component-deps/fixtures/*-scene-fixture`  | Feature fixtures, `apiClient`                            |
| **Best for**           | Multi-step views, validation, gating UI     | RBAC, CRUD, migrations, console nav                      |

---

## Execution commands

From **repository root**:

```bash
npm install
npx playwright install chromium

npm run gallery:dev
# http://localhost:3100/playwright/gallery/

npm run test-playwright-components

npx playwright test playwright/tests/components/scenes/vm-wizard/vm-wizard-flows.spec.ts \
  --project=component-scenes

HEADED=1 npm run test-playwright-components
npm run check-types:playwright
```

| Variable                                     | Effect                                             |
| -------------------------------------------- | -------------------------------------------------- |
| `SKIP_GLOBAL_SETUP` / `SKIP_GLOBAL_TEARDOWN` | Set by `test-playwright-components`                |
| `CI`                                         | Gallery `webServer` does not reuse existing server |
| `HEADED` / `HEADLESS=false`                  | Headed browser                                     |

---

## When to use which

**Component scenes:** dense UI flows, validation, step gating, fast PR feedback (scene fixture `pageerror` on mount).

**Scenario E2E:** RBAC, console navigation, real cluster operations, `RequestContextClient`, multi-cluster.

---

## Advantages and limitations

**Wins:** speed, no cluster, shared page objects, deterministic gallery data, `gallery:dev` for manual review.

**Limits:** stub drift, no full console shell, mount interaction quirks (`interactClick` / `interactFill`), `workers: 1`, Rspack maintenance.

**Guardrails:** extend page objects; minimal stubs; re-run `npm run test-playwright-components` when production hooks change; no `apiClient` in component specs.

---

## Adding a new scene area

1. `component-dependencies/scenes/<area>/<Name>.scene.tsx` + `VirtSceneScaffold` (routes, preset, production import).
2. `stories/` — constants (story id), fixtures, presets if watches/lists are needed.
3. `bundle/gallery-resolve.ts` + `stubs/` — only what the build/runtime requires.
4. `component-dependencies/fixtures/<area>-scene-fixture.ts` — `test.extend` with story id option + scoped page object fixture.
5. `playwright/src/components/<area>/` — page objects (shared with E2E where applicable).
6. `tests/components/scenes/<area>/*.spec.ts` — import that area’s fixture; compose flows via POs.
7. `npm run gallery:dev` (verify story) → `npm run test-playwright-components`.

---

## Configuration

- **Project:** `component-scenes` — `testDir: ./playwright/tests/components`, `testMatch: **/scenes/**/*.spec.ts`, gallery `webServer`, port 3100.
- **TS paths:** [`playwright/tsconfig.json`](../../tsconfig.json) — `@/*`, `@component-deps/*`, `@virtualmachines/*`.
