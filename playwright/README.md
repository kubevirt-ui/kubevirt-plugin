# Playwright Tests

Test suite for the KubeVirt plugin:

- **Scenario E2E** — real OpenShift Console against a cluster (Gating, Tier1/2, Settings, API).
- **Component scenes** — isolated UI flows via a local **story gallery** (no cluster, no global setup). See [Component tests (story gallery)](#component-tests-story-gallery).

---

## Setup

### Prerequisites

- Node.js >= 22.0.0, npm >= 10.9.0
- `oc` CLI logged into an OpenShift cluster with KubeVirt installed
- Playwright browsers installed (`npx playwright install`)

### Environment Configuration (`.env`)

Both runner scripts automatically source a `.env` file from the project root if present. Create one to configure your target environment.

#### Running against a remote cluster

```bash
# .env
WEB_CONSOLE_URL=https://console-openshift-console.apps.mycluster.example.com
OPENSHIFT_USERNAME=kubeadmin
OPENSHIFT_PASSWORD=your-password
```

The `CLUSTER_URL` (Kubernetes API) is derived automatically from `WEB_CONSOLE_URL`. You can also set it explicitly:

```bash
CLUSTER_URL=https://api.mycluster.example.com:6443
```

Alternatively, if your cluster follows the standard naming convention:

```bash
# .env
CLUSTER_NAME=mycluster
CLUSTER_DOMAIN=example.com
OPENSHIFT_PASSWORD=your-password
```

The runner scripts will derive `WEB_CONSOLE_URL` and `CLUSTER_URL` from these.

#### Running against a local dev console

When developing locally with `npm run start-console` (port 9000) and `npm run dev` (port 9001), use the `IS_LOCAL=1` flag. This automatically sets `WEB_CONSOLE_URL=http://localhost:9000`:

```bash
IS_LOCAL=1 ./playwright-runner-hc-e2e.sh Gating --workers=4
```

Hot-cluster **CI** uses `ci-scripts/hot-cluster/ts/src/scripts/run-gating-tests.ts` — not for local runs.

Your `.env` still needs credentials for the backing cluster:

```bash
# .env (local development)
OPENSHIFT_PASSWORD=your-password
CLUSTER_URL=https://api.mycluster.example.com:6443
```

### Environment Variables Reference

| Variable              | Required                                                                        | Description                                                       |
| --------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `WEB_CONSOLE_URL`     | Yes (or `BASE_URL` / `BRIDGE_BASE_ADDRESS`, or `CLUSTER_NAME`+`CLUSTER_DOMAIN`) | OpenShift Console URL                                             |
| `OPENSHIFT_USERNAME`  | No                                                                              | Login username (default: `kubeadmin`)                             |
| `OPENSHIFT_PASSWORD`  | Yes                                                                             | Login password                                                    |
| `CLUSTER_URL`         | No                                                                              | Kubernetes API URL (auto-derived from console URL)                |
| `BRIDGE_BASE_ADDRESS` | No                                                                              | Alias for `WEB_CONSOLE_URL` (used by bridge/console environments) |
| `IS_LOCAL`            | No                                                                              | Set to `1` to target `localhost:9000`                             |
| `HC_E2E`              | No                                                                              | Set to `true` for hot cluster mode (CI, RBAC-limited)             |
| `DEBUG`               | No                                                                              | Set to `1` to enable debug logging (`EnvVariables.isDebugMode`)   |
| `DEBUG_MODE`          | No                                                                              | Set to any value for headed browser (disables headless in config) |
| `HEADED`              | No                                                                              | Set to any value for headed browser (alternative to `DEBUG_MODE`) |
| `HEADLESS`            | No                                                                              | Set to `false` to run headed (overrides global `use.headless`)    |
| `WORKERS`             | No                                                                              | Override worker count                                             |
| `PLAYWRIGHT_RETRIES`  | No                                                                              | Override retry count via `EnvVariables.retries` (default: `0`)    |

### Quick Start

```bash
# Install dependencies (from repo root)
npm install
npx playwright install

# Run gating tests (from repo root; use nvm for Node)
./playwright-runner-hc-e2e.sh Gating --workers=4

# Local dev console (localhost:9000) in headed mode
IS_LOCAL=1 ./playwright-runner-hc-e2e.sh Gating --workers=4 --headed
```

---

## Execution Modes

### Projects

Specs live under **route folders** (console pages). **Playwright projects** select the CI cycle by tag (`grep`), not by directory.

| Project            | Tag filter (`grep`) | Scope                                                         | Example folders / match                            |
| ------------------ | ------------------- | ------------------------------------------------------------- | -------------------------------------------------- |
| `Gating`           | `@gating`           | Page loads, resource creation, VM search/tree filters         | scope-named specs (e.g. `vm-list-page-load.spec.ts`) |
| `Tier1`            | `@tier1`            | Single-resource CRUD lifecycle per module                     | `bootable-volumes/`, `virtual-machines/detail/`, … |
| `Tier2`            | `@tier2`            | Cross-module integration, migrations, multi-step workflows    | `virtual-machines/migrations/`, `vm-wizard/`, …    |
| `Settings`         | `@cnv-settings`     | Cluster and user settings (runs in isolation)                 | `virtualization-settings/`, `quotas/`              |
| `API`              | _(directory only)_  | API contract tests via `RequestContextClient` (no browser UI) | `api/`                                             |
| `component-scenes` | _(directory only)_  | Gallery-mounted React scenes (VM wizard example today)        | `tests/components/scenes/**/*.spec.ts`             |

**Route tags** (orthogonal to tier): every spec also carries `@route-<folder-path>` (hyphens instead of `/`), e.g. `@route-vm-wizard`, `@route-virtual-machines-list`. Constants are in `playwright/src/data-models/route-tags.ts`. Combine with a project or `auto`:

```bash
./playwright-runner-hc-e2e.sh Tier1 -g @route-bootable-volumes
./playwright-runner-hc-e2e.sh auto -g @route-virtual-machines-list
```

Gating excludes specs that also carry `@cnv-settings` (e.g. role aggregation runs under **Settings** only).

**Layout vs CI cycles:** Folders follow **console routes** (`playwright/tests/<route>/`). **Tier** (`@gating`, `@tier1`, `@tier2`) and **route** (`@route-*`) tags on `test.describe` select what runs — there are no `tier1/`, `tier2/`, or `gating/` directories anymore.

### Route map (`playwright/tests/`)

| Route folder                                                                  | Console area                                      |
| ----------------------------------------------------------------------------- | ------------------------------------------------- |
| `virtualization-landing/`                                                     | Virtualization home / welcome                     |
| `virtual-machines/list/`                                                      | VM list, search, tree, YAML create                |
| `virtual-machines/detail/`                                                    | VM detail tabs (navigation)                       |
| `virtual-machines/detail/{overview,configuration,disks,network,diagnostics}/` | VM detail sub-routes                              |
| `virtual-machines/actions/`                                                   | List/detail lifecycle, delete                     |
| `virtual-machines/migrations/`                                                | Live / storage migration                          |
| `vm-wizard/`                                                                  | VM creation wizard                                |
| `vm-templates/`                                                               | Templates catalog & detail                        |
| `bootable-volumes/`                                                           | Bootable volumes                                  |
| `instance-types/`                                                             | Instance types                                    |
| `migration-policies/`                                                         | Migration policies                                |
| `checkups/`                                                                   | Checkups                                          |
| `virtualization-settings/`                                                    | Cluster & user settings, recommended capabilities |
| `quotas/`                                                                     | AAQ quotas (`@cnv-settings`)                      |
| `api/`                                                                        | API contract tests (no UI)                        |

Nested routes get nested `@route-*` tags (e.g. `@route-virtual-machines-detail-disks`). Import constants from `playwright/src/data-models/route-tags.ts`.

### Running Tests

Use the runner scripts from the project root. They handle `.env` loading, URL derivation, and project selection.

```bash
# ── Via runner script (local; recommended) ─────────────────────────────────

./playwright-runner-hc-e2e.sh Gating --workers=4
./playwright-runner-hc-e2e.sh Tier1 --workers=2
./playwright-runner-hc-e2e.sh Tier2
./playwright-runner-hc-e2e.sh Settings
./playwright-runner-hc-e2e.sh API
./playwright-runner-hc-e2e.sh suite               # Gating + Tier1 + Tier2
./playwright-runner-hc-e2e.sh all                 # All projects
./playwright-runner-hc-e2e.sh auto -g @route-bootable-volumes

# Local dev console (localhost:9000)
IS_LOCAL=1 ./playwright-runner-hc-e2e.sh Gating --workers=4 --headed

# Non-HC runner (standard auth, no SA-token flow)
./playwright-runner.sh Gating --workers=4

# ── Direct npx (useful for single files/tests) ───────────────────────────

# Specific spec file
npx playwright test playwright/tests/bootable-volumes/bootable-volumes.spec.ts --workers=1

# Specific test by name
npx playwright test -g "creates a bootable volume" --workers=1

# Development mode (no retries, headed browser)
HEADED=1 npx playwright test --project=Tier1 --workers=1

# List tests without running
npx playwright test --list --project=Tier1

# Component scenes (starts gallery on port 3100; no cluster auth)
npm run test-playwright-components
```

### Type Checking

```bash
# From the repo root
npm run check-types:playwright
```

### Single-Process Rule

Never run two concurrent `npx playwright test` commands. Global setup creates shared auth files. Use `--workers=N` for parallelism within a single process.

---

## Architecture

```text
Spec (.spec.ts) → imports { test, expect } from feature fixture
  ↓
Feature fixture → extends baseTest, provides page objects
  ↓
Page objects (page-objects/) → extend BasePage/PageCommons, compose components
  ↓
Components (components/) → extend BaseComponent, contain locators + interactions
  ↓
RequestContextClient (clients/request-context-client.ts) → console proxy → K8s API
```

### Folder Structure

```text
playwright/
├── tests/
│   ├── virtualization-landing/  # Onboarding / welcome modal
│   ├── virtual-machines/        # List, detail/*, actions, migrations
│   ├── vm-wizard/               # /vm-wizard creation flows
│   ├── vm-templates/            # VM templates catalog
│   ├── bootable-volumes/
│   ├── instance-types/
│   ├── migration-policies/
│   ├── checkups/
│   ├── quotas/
│   ├── virtualization-settings/ # Settings + recommended capabilities
│   └── api/                     # API contract specs (api-test-fixture)
├── src/
│   ├── components/                # UI components (extend BaseComponent)
│   │   ├── shared/                # Base classes (base-component, navigation)
│   │   ├── overview/              # Overview area
│   │   ├── vm/                    # VM detail area
│   │   ├── vm-wizard/             # VM creation wizard
│   │   └── create-vm/            # Catalog / template components
│   ├── page-objects/              # Page objects (extend BasePage/PageCommons)
│   │   ├── vm/                    # VM pages
│   │   ├── overview/              # Overview pages
│   │   ├── settings/              # Settings pages
│   │   ├── cluster/               # Cluster-level pages
│   │   ├── create-vm/            # Create VM pages
│   │   └── vm-wizard/            # VM wizard pages
│   ├── fixtures/                  # Per-feature test fixtures (extend baseTest)
│   │   ├── scenario-test-fixture.ts  # Base fixture — apiClient, utils, auto-fixtures
│   │   ├── gating-fixture.ts
│   │   ├── api-test-fixture.ts
│   │   ├── vm-tabs-fixture.ts
│   │   ├── settings-fixture.ts
│   │   └── ...
│   ├── clients/                   # API clients
│   │   ├── request-context-client.ts  # HTTP via console proxy (admin perms)
│   │   ├── proxy-handlers/            # Domain-specific handlers (vm, core, infra, project)
│   │   └── kind-resolver.ts           # Maps resource kinds to GVR tuples
│   ├── data-models/               # Constants, types, allure metadata
│   │   ├── allure-constants.ts    # Suite/feature/tier tags
│   │   └── route-tags.ts          # @route-* tag constants per tests/ folder
│   ├── data-factories/            # Test data generators (SSH keys, VM specs)
│   └── utils/                     # Env vars, test config, random names, helpers
├── project-dependencies/          # Global setup/teardown + rule engine
├── gallery/                       # Gallery host page (`window.mount` / `window.unmount`)
├── scenes/                        # `*.scene.tsx` — production UI wrapped for the gallery
├── stories/                       # Gallery fixtures, i18n, watch registry, scene data presets
├── stubs/                         # Console/SDK/multicluster shims for gallery bundling
├── gallery-deps/                  # Rspack resolve aliases + import manifest sync
├── rspack.gallery.config.mts      # Gallery dev server / bundle config
└── playwright.config.ts           # Project definitions
```

Each route folder that contains `*.spec.ts` also has one **route STD** markdown file beside the specs: path under `tests/` with `/` → `-`, plus `.md` (e.g. `bootable-volumes/bootable-volumes.md`, `virtual-machines/list/virtual-machines-list.md`). Structure follows `playwright/docs/STD-TEMPLATE.md`. Update the relevant module under `## 4. Test Case Definitions` when adding or changing tests.

---

## Component tests (story gallery)

### Goals

| Goal                        | Detail                                                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Fast, local UI checks**   | Exercise multi-step React flows (wizard tabs, drawers, tables) without logging into a cluster or running scenario global setup.                        |
| **Stable selectors**        | Assert on `data-test` and roles the same way tier E2E does, but scoped to `#root` after `mount(storyId)`.                                              |
| **Living documentation**    | Each scene is a runnable story you can open in the browser at `http://localhost:3100/playwright/gallery/`.                                             |
| **Thin production surface** | Scenes import real `src/` views; gallery **stubs** replace Console host, OpenShift SDK, and selected hooks so the bundle runs in a plain browser page. |

**Non-goals:** Component scenes do not replace scenario E2E for RBAC, multi-cluster, CDI uploads, or full console navigation. They do not use feature fixtures, `apiClient`, or `RequestContextClient`.

**Current coverage:** VM creation wizard (`VmCreationWizardShell`) — deployment step chrome and a template flow through review. More scenes can follow the same pattern.

### Setup required

| Requirement                      | Notes                                                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js / npm                    | Same as repo root (`npm install`).                                                                                                          |
| Playwright browsers              | `npx playwright install` (Chromium is enough).                                                                                              |
| **No** OpenShift login           | `component-scenes` sets `SKIP_GLOBAL_SETUP=true` / `SKIP_GLOBAL_TEARDOWN=true` via `npm run test-playwright-components`.                    |
| **No** plugin dev server on 9001 | Gallery is self-contained on **port 3100**.                                                                                                 |
| Port 3100 free                   | Playwright starts `npm run gallery:dev` when you run the `component-scenes` project (reuses an existing server locally unless `CI` is set). |

**Environment variables** (optional):

| Variable                      | Effect                                                                 |
| ----------------------------- | ---------------------------------------------------------------------- |
| `SKIP_GLOBAL_SETUP=true`      | Skip cluster auth (set automatically by `test-playwright-components`). |
| `SKIP_GLOBAL_TEARDOWN=true`   | Skip cluster teardown (set automatically).                             |
| `HEADLESS=false` / `HEADED=1` | Run component tests headed.                                            |
| `CI`                          | Gallery web server is always started fresh (no `reuseExistingServer`). |

**Manual gallery (debugging):**

```bash
npm run gallery:dev
# Open http://localhost:3100/playwright/gallery/
# In devtools: await window.mount({ story: 'scenes/vm-wizard/VmCreationWizardShell/Default' })
```

### How it works

```text
Spec (*.spec.ts in tests/components/scenes/)
  → import { test, expect } from '@playwright/test'   # not scenario fixtures
  → mount('scenes/.../Default')  # Playwright built-in fixture; baseURL = gallery
  → gallery main.tsx resolves story via import.meta.glob on playwright/scenes/**/*.scene.tsx
  → VirtSceneScaffold (router, i18n, form provider, GalleryDataInitializer)
  → Production component (e.g. VMCreationWizard) + gallery stubs / watch registry data
```

**Story id format:** `scenes/<path>/<SceneFile>/<ExportName>` — e.g. `scenes/vm-wizard/VmCreationWizardShell/Default` for export `Default` in `VmCreationWizardShell.scene.tsx`.

**Mount lifecycle:** `expectGalleryStoryReflectsState` calls `window.unmount()` before each mount so stories do not leak state. The project uses `workers: 1` and `reuseContext: true` for speed; avoid relying on order across files.

**Data:** `GalleryDataInitializer` calls `applyGallerySceneDataPreset('populated' | 'empty')` so `useKubevirtWatchResource` stubs read from `playwright/stories/gallery-watch-registry.ts`. The wizard scene starts on **`populated`** (templates, bootable volumes, clone source VM, instance types).

### Folder map (component-specific)

| Path                                                | Role                                                                |
| --------------------------------------------------- | ------------------------------------------------------------------- |
| `playwright/gallery/`                               | HTML shell, `window.mount` / `window.unmount`, story catalog        |
| `playwright/scenes/**/*.scene.tsx`                  | Scene components (export `Default` or named exports)                |
| `playwright/scenes/shared/VirtSceneScaffold.tsx`    | `MemoryRouter`, i18n, `StoryFormProvider`, `GalleryDataInitializer` |
| `playwright/stories/gallery-scene-data.ts`          | Presets + registry updates for watch stubs                          |
| `playwright/stories/virt-page-fixtures.ts`          | Minimal K8s/template fixtures referenced by wizard tests            |
| `playwright/stubs/`                                 | SDK/console/multicluster and hook stubs                             |
| `playwright/gallery-deps/gallery-resolve.ts`        | Rspack aliases + `resolveGalleryRequest` redirect rules             |
| `playwright/tests/components/gallery-assertions.ts` | `expectGalleryStoryReflectsState`, story state helpers              |
| `playwright/tests/components/scenes/**/`            | Specs and flow helpers (e.g. `wizard-flow-helpers.ts`)              |

### Implementation guidelines

**Specs**

1. Import `test` and `expect` from **`@playwright/test`** — not from scenario feature fixtures.
2. Place specs under `playwright/tests/components/scenes/<area>/`.
3. Prefer **`expectGalleryStoryReflectsState(mount, page, storyId, expectations)`** on first mount to catch React runtime errors and baseline `data-test` visibility.
4. Scope interactions to the locator returned by `mount` (usually `#root`): `root.getByTestId('wizard-next-button').click()`.
5. Use **`data-test`** values aligned with production (`testIdAttribute: 'data-test'` in config). Add `data-test="story-surface"` on scenes for accessibility/debug.
6. Extract multi-step flows into `*-helpers.ts` next to the spec; keep specs readable.
7. No `page.goto()` to the real console — the gallery `baseURL` is `http://localhost:3100/playwright/gallery/`.

**Scenes (`*.scene.tsx`)**

1. One primary export per file (`Default` is the convention).
2. Wrap content in **`VirtSceneScaffold`** with `initialEntries` matching the route the view expects (wizard: `['/vm-wizard']`).
3. Set **`initialPreset="populated"`** when the flow needs list/watch data on first paint; use `empty` only if you test empty-state transitions.
4. Keep scenes under **150 lines** where possible; split layout-only pieces into sibling TSX files without `.scene.` in the name if needed.
5. Scene files use relaxed ESLint overrides (`*.scene.tsx` in `eslint.config.mjs`) — still use `useKubevirtTranslation` / `t()` for any user-visible copy you add in the scene shell.

**Stubs and resolve**

1. Do not import Console host or live SDK in the gallery — use existing stubs under `playwright/stubs/`.
2. When a wizard hook hits the real cluster (watch, features, templates), add or extend a **`-gallery.ts`** stub and wire it in `gallery-resolve.ts` (`getGalleryResolveAlias` and/or `resolveGalleryRequest` suffix rules).
3. Keep stubs **minimal**: return static data matching `virt-page-fixtures` / `gallery-scene-data` presets.
4. Prune unused stubs when removing scenes; verify with `npm run test-playwright-components`.
5. Path aliases `@kubevirt-utils`, `@virtualmachines`, `@settings`, `@search`, `@multicluster` point at `src/`; only stub what cannot run in the gallery.

**Assertions**

- Use Playwright web-first assertions (`toBeVisible`, `toBeEnabled`, …).
- For dialogs that portal outside `#root`, helpers may scope to `page` when a dialog is open (`gallery-assertions.ts`).
- Listen for `pageerror` on initial mount via `expectGalleryStoryReflectsState`; extend with `page.on('pageerror')` in longer flows if debugging.

**Example (abbreviated)**

```typescript
import { test } from '@playwright/test';

import { expectGalleryStoryReflectsState } from '../../gallery-assertions';
import { WIZARD_STORY, expectWizardStepActive, clickWizardNext } from './wizard-flow-helpers';
import { WizardSceneStep } from '../../../../stories/wizard-scene-constants';

test('deployment step — creation methods visible', async ({ mount, page }) => {
  const root = await expectGalleryStoryReflectsState(mount, page, WIZARD_STORY, [
    { id: 'scene-vm-creation-wizard', type: 'visibleTestId' },
    { id: 'creation-method-template', type: 'visibleTestId' },
  ]);
  await expectWizardStepActive(root, WizardSceneStep.DEPLOYMENT_DETAILS);
});
```

### Adding a new component scene

1. Add `playwright/scenes/<area>/<Name>.scene.tsx` with `VirtSceneScaffold` + production view.
2. Confirm the story appears: `npm run gallery:dev` → index or `window.mount({ story: 'scenes/.../Default' })`.
3. Add `playwright/tests/components/scenes/<area>/<name>.spec.ts` using `mount` and gallery assertions.
4. Add stub/alias entries in `gallery-resolve.ts` when the gallery build reports missing modules or live watches.
5. Run `npm run test-playwright-components` and `npm run lint`.

Shorter cheat sheet: `playwright/tests/components/COMPONENT-TEST-STRATEGY.md`.

### Component test troubleshooting

| Symptom                           | Likely cause                              | What to do                                                                                     |
| --------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `Unknown story: scenes/...`       | Scene failed to compile or wrong story id | Check terminal running `gallery:dev` for Rspack errors; verify export name and path.           |
| `EADDRINUSE :3100`                | Stale gallery process                     | `fuser -k 3100/tcp` and re-run tests.                                                          |
| `Runtime errors: ...` on mount    | Missing stub or bad fixture data          | Fix stub or `gallery-scene-data` / `virt-page-fixtures`; check browser console in headed mode. |
| `Module not found: @settings/...` | Missing path alias                        | Ensure `@settings` / `@search` remain in `getGalleryResolveAlias()`.                           |
| Flaky visibility after mount      | Async data or animation                   | Use `expect(...).toBeVisible()` (auto-retry); avoid fixed `waitForTimeout`.                    |
| Global setup runs unexpectedly    | Wrong project                             | Use `npm run test-playwright-components` or `--project=component-scenes`.                      |

---

## Implementation Rules

These rules apply to **scenario E2E** (Gating, Tier1/2, Settings, API). **Component scene** specs intentionally use `@playwright/test` and the gallery — see [Component tests (story gallery)](#component-tests-story-gallery).

### Spec Files

1. **Import `test` and `expect` from the feature fixture** — never from `@playwright/test` directly (except component scenes).
2. **Define `const SUITE`** at module scope for Allure reporting.
3. **Tag `test.describe`** with the **route** constant first (`ROUTE_*_TAG` from `route-tags.ts`), then tier tag + feature-area tag (`allure-constants.ts`).
4. **Every `test()` calls `utils.withAllure(...)`** first, with `suite`, `feature`, and `tags`.
5. **Every `expect()` has a descriptive message string.**
6. **Use `TestTimeouts.*` constants** — never inline timeout numbers.
7. **All UI interactions through page objects** — no raw `page` usage in specs.
8. **Track created resources**: `apiClient.trackResource(kind, name, namespace)`.
9. **Each test file owns its namespace** — use `generateRandomName()`, never hardcode.
10. **Never hardcode `openshift-cnv`** — use `EnvVariables.cnvNamespace`.
11. **Prefer keeping `ID(CNV-XXXXX)` in Allure tags** rather than test names, but it's acceptable in test names when useful for traceability.

### Navigation

- **No direct URL navigation** — never use `page.goto()` or `goTo()` in specs.
- The `_autoVirtNavigation` auto-fixture handles initial console load and perspective switching.
- Use sidebar methods: `clickNavBootableVolumes()`, `clickNavMigrationPolicies()`, etc.
- Use tree view for VMs: `navigateToVmViaTreeView(vmName)`, `navigateToProjectViaTreeView(ns)`.

### Fixtures

- Every fixture extends `baseTest` from `scenario-test-fixture.ts`.
- `baseTest` provides `apiClient`, `utils`, `testConfig`, `page`, `cleanup`, and auto-fixtures.

```typescript
import FeaturePage from '@/page-objects/feature/feature-page';
import { baseTest, expect } from './scenario-test-fixture';

interface FeatureFixtures {
  featurePage: FeaturePage;
}

const test = baseTest.extend<FeatureFixtures>({
  featurePage: async ({ page }, use) => {
    await use(new FeaturePage(page));
  },
});

export { expect, test };
```

### Page Objects and Components

| Layer        | Location            | Responsibility                                                                         |
| ------------ | ------------------- | -------------------------------------------------------------------------------------- |
| Components   | `src/components/`   | Extend `BaseComponent`. Low-level, per-section UI interactions and locators.           |
| Page Objects | `src/page-objects/` | Extend `BasePage` or `PageCommons`. High-level, per-page methods composing components. |

Page objects delegate to components via composition, not inheritance.

### Selectors

Priority order:

1. `[data-test="..."]` and `[data-test-id="..."]` attributes
2. `getByRole()` with accessible names
3. `getByText()` for user-visible content

In code:

- `this.testId('id')` — matches `data-test` attributes (via `testIdAttribute` config)
- `this.page.getByTestId('id')` — same as above
- CSS selectors: `[data-test="id"]`, `[data-test-id="id"]`

### API Client

All Kubernetes operations go through `RequestContextClient` (aliased as `apiClient` in fixtures). It routes requests through the console proxy with the authenticated user's permissions. Never use `oc` CLI, `@kubernetes/client-node`, or direct cluster access in test code.

```typescript
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const ns = await setupTestNamespace(apiClient, 'my-feature');
apiClient.trackResource('VirtualMachine', vmName, ns);
```

### Assertions

- Use `expect()` with page object return values and locators.
- Use `expect.poll()` for async state changes.
- Use `expect.soft()` for non-critical checks that shouldn't abort the test.
- Always include descriptive message strings.

### File Size Limits

| File type                    | Max lines | Notes                                                                                                                                                                           |
| ---------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec file (`.spec.ts`)       | 300       | Co-locate specs in the same route folder when combined length ≤ 300; use multiple `test.describe` blocks (e.g. `templates-gating.spec.ts` for `@gating` beside `@tier1` specs). |
| Page object (`*-page.ts`)    | 500       |                                                                                                                                                                                 |
| Component (`*-component.ts`) | 400       |                                                                                                                                                                                 |
| Fixture (`*-fixture.ts`)     | 150       |                                                                                                                                                                                 |
| Utility module               | 400       |                                                                                                                                                                                 |

---

## Cursor Commands

The following commands are available in this workspace for working with Playwright tests. Invoke them from the Cursor chat.

### `/create-test`

Create a new Playwright E2E test from a Jira ticket or feature description.

```text
/create-test CNV-12345
/create-test "bootable volumes sort by name"
/create-test --local CNV-12345
```

- Fetches ticket context, checks existing coverage, designs scenarios.
- Determines the correct tier (Gating, Tier 1, Tier 2, Settings, API).
- Scaffolds spec file, fixture, page objects, and components as needed.
- The `--local` flag derives locators from `src/` source code instead of a live browser.

### `/test-fix`

Run tests, analyze failures, fix test code issues, and re-run until stable.

```text
/test-fix                  # All projects
/test-fix gating           # Gating only
/test-fix tier1            # Tier 1 only
/test-fix <file-path>      # Specific spec file
/test-fix <test-name>      # Specific test by name
```

- Classifies failures: `test_bug`, `product_bug`, `infrastructure`, `flaky`.
- Fixes locators, timing, and assertion issues in components/page objects.
- Iterates until all `test_bug` failures are resolved.

### `/coverage-analysis`

Read-only assessment of Playwright E2E test coverage.

```text
/coverage-analysis               # Full module
/coverage-analysis vms           # VMs sub-group
/coverage-analysis --compare=main  # Compare against main branch
```

- Cross-references `data-test` attributes in `src/` against Playwright locator usage.
- Enumerates testable capabilities per route and maps them to spec files.
- Generates proposals for new coverage (EXTEND existing or NEW spec file).

### `/test-and-record`

Validate a feature ticket by replaying steps in a live browser, capturing screenshot evidence.

```text
/test-and-record CNV-12345
/test-and-record https://github.com/kubevirt-ui/kubevirt-plugin/pull/1234
```

- Builds a validation plan from the ticket and existing tests.
- Replays each step via Playwright MCP with screenshots per chapter.
- Produces a validation report in `playwright/mcp-validations/<TICKET>/`.

### `/bug-hunt`

Explore live UI workflows to find visual, functional, or UX issues.

```text
/bug-hunt vms
/bug-hunt catalog
/bug-hunt templates
```

- Replays user workflows from existing test cases via Playwright MCP.
- Documents issues with screenshots and console/network evidence.
- Cross-references findings with Jira for duplicates.

---

## Common Failure Patterns

| Symptom                        | Likely Cause                      | Fix Location                      |
| ------------------------------ | --------------------------------- | --------------------------------- |
| `Timeout waiting for selector` | Selector changed in product       | Component or page object          |
| `locator.click: Target closed` | Page navigated mid-action         | Add wait in page object method    |
| `expect.toBe: false`           | Assertion timing                  | Use `waitFor()` / `expect.poll()` |
| `strict mode violation`        | Multiple matches                  | Refine locator in component       |
| `net::ERR_CONNECTION_REFUSED`  | Cluster unreachable               | Environment issue                 |
| `401 Unauthorized`             | Token expired                     | Re-run global setup               |
| Test silently skipped          | Soft assertion or swallowed error | Fix timeout / error handling      |

---

## Spec File Template

```typescript
import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_BOOTABLE_VOLUMES_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/<feature>-fixture';

const SUITE = 'Feature Name';

test.describe(SUITE, { tag: [ROUTE_BOOTABLE_VOLUMES_TAG, T1_TAG, '@tier1-feature-area'] }, () => {
  test.beforeEach(async ({ somePage }) => {
    await somePage.navigateToFeatureViaUI();
  });

  test('does something expected', async ({ somePage, apiClient, utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, ADMIN_ONLY_TAG],
    });

    const result = await somePage.doSomething();
    expect(result, 'descriptive assertion message').toBe(true);
  });
});
```
