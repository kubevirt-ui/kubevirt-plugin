# Playwright E2E Tests

End-to-end test suite for the KubeVirt Plugin, covering VM lifecycle management, resource CRUD operations, and cluster settings validation.

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

# Run gating tests against a remote cluster
./playwright-runner-hc-e2e.sh Gating --workers=4

# Run against local dev console in headed mode
IS_LOCAL=1 ./playwright-runner-hc-e2e.sh Gating --workers=4 --headed
```

---

## Execution Modes

### Projects

Tests are organized into projects. Each project maps to a tier with its own scope and test directory.

| Project    | Directory                | Scope                                                         | Tags            |
| ---------- | ------------------------ | ------------------------------------------------------------- | --------------- |
| `Gating`   | `tests/gating/`          | Page loads, basic navigation, resource creation (form + YAML) | `@gating`       |
| `Tier1`    | `tests/tier1/<feature>/` | Single-resource CRUD lifecycle per module                     | `@tier1`        |
| `Tier2`    | `tests/tier2/<feature>/` | Cross-module integration, migrations, multi-step workflows    | `@tier2`        |
| `Settings` | `tests/settings/`        | Cluster and user settings (runs in isolation)                 | `@cnv-settings` |
| `API`      | `tests/api/`             | API contract tests via `RequestContextClient` (no browser UI) | `@api`          |

### Running Tests

Use the runner scripts from the project root. They handle `.env` loading, URL derivation, and project selection.

```bash
# ── Via runner scripts (recommended) ──────────────────────────────────────

# Remote cluster
./playwright-runner-hc-e2e.sh Gating --workers=4
./playwright-runner-hc-e2e.sh Tier1 --workers=2
./playwright-runner-hc-e2e.sh Tier2
./playwright-runner-hc-e2e.sh Settings
./playwright-runner-hc-e2e.sh API
./playwright-runner-hc-e2e.sh suite               # Gating + Tier1 + Tier2
./playwright-runner-hc-e2e.sh all                 # All projects

# Local dev console (localhost:9000)
IS_LOCAL=1 ./playwright-runner-hc-e2e.sh Gating --workers=4 --headed

# Non-HC runner (standard auth, no SA-token flow)
./playwright-runner.sh Gating --workers=4

# ── Direct npx (useful for single files/tests) ───────────────────────────

# Specific spec file
npx playwright test playwright/tests/tier1/bootable-volumes/bootable-volumes.spec.ts --workers=1

# Specific test by name
npx playwright test -g "creates a bootable volume" --workers=1

# Development mode (no retries, headed browser)
HEADED=1 npx playwright test --project=Tier1 --workers=1

# List tests without running
npx playwright test --list --project=Tier1
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
│   ├── gating/                    # Gating specs (gating-fixture)
│   ├── tier1/<feature>/           # Tier 1 specs (per-feature fixtures)
│   ├── tier2/<feature>/           # Tier 2 specs (per-feature fixtures)
│   ├── settings/                  # Settings specs (settings-fixture)
│   └── api/                       # API contract specs (api-test-fixture)
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
│   │   └── allure-constants.ts    # Suite/feature/tag constants
│   ├── data-factories/            # Test data generators (SSH keys, VM specs)
│   └── utils/                     # Env vars, test config, random names, helpers
├── project-dependencies/          # Global setup/teardown + rule engine
└── playwright.config.ts           # Project definitions
```

---

## Implementation Rules

### Spec Files

1. **Import `test` and `expect` from the feature fixture** — never from `@playwright/test` directly.
2. **Define `const SUITE`** at module scope for Allure reporting.
3. **Tag `test.describe`** with the tier tag + feature-area tag (from `allure-constants.ts`).
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

| File type                    | Max lines |
| ---------------------------- | --------- |
| Spec file (`.spec.ts`)       | 300       |
| Page object (`*-page.ts`)    | 500       |
| Component (`*-component.ts`) | 400       |
| Fixture (`*-fixture.ts`)     | 150       |
| Utility module               | 400       |

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
import { expect, test } from '@/fixtures/<feature>-fixture';

const SUITE = 'Feature Name';

test.describe(SUITE, { tag: [T1_TAG, '@tier1-feature-area'] }, () => {
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
