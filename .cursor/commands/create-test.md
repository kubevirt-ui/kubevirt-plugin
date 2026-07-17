# Create Test

Create a new Playwright E2E test from a Jira ticket or feature description.

## Input

```
/create-test [--local] <TICKET-ID or feature description>
```

- **Jira ticket**: `/create-test CNV-12345`
- **Feature description**: `/create-test "bootable volumes sort by name"`
- **Local mode**: `/create-test --local CNV-12345`

### `--local` flag

When `--local` is passed, the product code under test lives in the **local repo** (`src/`). This changes Phase 1 exploration:

- **Read the feature's source code** directly from `src/views/`, `src/utils/`, etc. to understand what the UI renders and which `data-test` / `data-test-id` attributes are available.
- **Extract selectors from the source** — search `src/` for `data-test=`, `data-test-id=`, and component names related to the feature.
- **Check PatternFly component usage** — read the React components to understand what roles, labels, and DOM structure to expect.
- **Skip remote Playwright MCP navigation** for locator discovery when the console is not running — derive locators from the source code instead.

Without `--local`, locator discovery relies on the live UI via Playwright MCP (`browser_navigate` → `browser_snapshot`).

## Architecture

### Test Tiers and Directories

| Tier     | Directory                | Fixture source                | Project name | Tags            | Scope                                                                                                    |
| -------- | ------------------------ | ----------------------------- | ------------ | --------------- | -------------------------------------------------------------------------------------------------------- |
| Gating   | `tests/gating/`          | `@/fixtures/gating-fixture`   | `Gating`     | `@gating`       | Page load verification per major route; resource creation (form + YAML) per module                       |
| Tier 1   | `tests/tier1/<feature>/` | Per-feature fixture           | `Tier1`      | `@tier1`        | Single-resource CRUD lifecycle per module; VM tab configuration; must NOT overlap gating                 |
| Tier 2   | `tests/tier2/<feature>/` | Per-feature fixture           | `Tier2`      | `@tier2`        | Cross-module integration (BV→VM wizard, snapshot→clone); VM live/storage migration; multi-step workflows |
| Settings | `tests/settings/`        | `@/fixtures/settings-fixture` | `Settings`   | `@cnv-settings` | Cluster and user settings pages                                                                          |
| API      | `tests/api/`             | `@/fixtures/api-test-fixture` | `API`        | `@api`          | API contract tests — CRUD lifecycle and endpoint validation via `RequestContextClient` (no browser UI)   |

### Where to place a new test

1. **Does it verify a page loads and shows expected content?** → **Gating** (add to existing `scenario-virtualization-pages.spec.ts`)
2. **Does it create a resource via form or YAML?** → Check if gating already has it; if not, add to gating's `scenario-resource-creation.spec.ts`. If it's a full CRUD lifecycle, add to **Tier 1**.
3. **Does it test a single resource's lifecycle (create → configure → verify → delete)?** → **Tier 1** under `tests/tier1/<feature>/`
4. **Does it test cross-module integration, multi-resource workflows, or migration?** → **Tier 2** under `tests/tier2/<feature>/`
5. **Does it test cluster or user settings?** → **Settings** under `tests/settings/`
6. **Does it validate API contracts (CRUD, list, subresources) without browser UI?** → **API** under `tests/api/`

### Current test file map

```
tests/
├── gating/
│   ├── scenario-virtualization-pages.spec.ts   # Page load + navigation verification
│   └── scenario-resource-creation.spec.ts      # VM, template, BV creation (form + YAML)
├── tier1/
│   ├── bootable-volumes/                       # BV list, create, delete
│   ├── checkups/                               # Network/storage checkup lifecycle
│   ├── create-vm/                              # VM wizard (template, custom config)
│   ├── instanceTypes/                          # Instance type CRUD
│   ├── migrationpolicies/                      # Migration policy CRUD
│   ├── templates/                              # Template creation, detail tabs, lifecycle
│   └── virtualmachines/
│       ├── vm-actions/                         # VM lifecycle actions, delete
│       └── vm-tabs/                            # Configuration, diagnostics, disks, overview
├── tier2/
│   ├── bootable-volumes/                       # BV cross-module (API → UI list → cleanup)
│   ├── create-vm/                              # Clone wizard (clone existing VM)
│   ├── migrations/                             # Live migration, storage migration
│   └── virtualmachines/                        # Snapshots (take/restore/clone), VM clone
├── settings/
│   ├── aaq-quotas.spec.ts                      # AAQ quota settings
│   ├── cluster-settings.spec.ts                # Cluster-level settings
│   └── user-settings.spec.ts                   # User preferences
└── api/                                        # API contract tests (no browser UI)
    ├── vm-vmi-lifecycle-api.spec.ts             # VM/VMI lifecycle (start/stop/restart/delete)
    ├── vm-crud-api.spec.ts                      # VM CRUD operations
    ├── bootable-volumes-crud-api.spec.ts        # BV DataVolume/DataSource CRUD
    ├── instance-types-crud-api.spec.ts          # Instance type CRUD
    ├── migration-policies-crud-api.spec.ts      # Migration policy CRUD
    ├── snapshots-crud-api.spec.ts               # Snapshot CRUD
    └── ...                                      # See tests/api/ for full list
```

### Fixture Pattern

Every fixture extends `baseTest` from `scenario-test-fixture.ts`:

```typescript
import { withSafeActions } from '@/page-objects/base-page';
import SomePage from '@/page-objects/some/some-page';
import { baseTest, expect } from './scenario-test-fixture';

interface MyFixtures {
  somePage: SomePage;
}

const test = baseTest.extend<MyFixtures>({
  somePage: async ({ page }, use) => {
    await use(withSafeActions(new SomePage(page)));
  },
});

export { expect, test };
```

Key points:

- `baseTest` provides `apiClient`, `utils`, `testConfig`, `page`, `cleanup`, and auto-fixtures
- Page objects are wrapped with `withSafeActions()` in the fixture
- Page objects extend `BasePage` or `PageCommons` (not standalone classes)
- Components live in `playwright/src/components/` and compose into page objects in `playwright/src/page-objects/`

### Spec File Pattern

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

## Workflow

### Phase 1: Exploration & Scenario Design

1. **If Jira ticket provided** — fetch ticket details via MCP:
   - Use `kubevirt-ui-mcp-get_ticket` or `kubevirt-ui-mcp-find_tests_by_jira`
2. **Check existing coverage**:
   - Use `kubevirt-ui-mcp-get_coverage_for_feature` for the feature area
   - Search specs: `rg "<keyword>" playwright/tests/ --type ts -l`
3. **Design test scenarios** — map steps to existing page object and component methods; identify gaps.

#### `--local` mode: Source-driven locator discovery

When the `--local` flag is set, derive locators and UI structure from the local source code instead of a live browser:

1. **Find the feature's view** — search `src/views/` for the relevant component:
   ```bash
   rg "<keyword>" src/views/ --type tsx -l
   ```
2. **Extract `data-test` attributes** — these are the preferred selectors:
   ```bash
   rg "data-test[=-]" src/views/<feature>/ --type tsx
   rg "data-test[=-]" src/utils/components/ --type tsx
   ```
3. **Identify PatternFly components and roles** — read the JSX to understand which PF components are used (Button, Modal, Dropdown, Table) and what accessible names/roles they produce.
4. **Check for existing constants** — look for selector constants or test-id enums:
   ```bash
   rg "data-test" src/views/<feature>/ --type ts
   ```
5. **Build the page object/component from source** — create locators based on what the source code renders, verified against PatternFly's DOM output patterns.

This avoids requiring a running console for test creation and ensures locators match the actual codebase.

**Decision**:

- If an existing spec covers this area → **expand it** (add a new `test()` block)
- If no existing spec → **create** a new spec file in the appropriate tier directory
- Determine which tier using the placement guide above

### Phase 2: Framework Gap Analysis

1. **Check existing page objects and components**:
   ```bash
   rg "class " playwright/src/page-objects/ --type ts
   rg "class " playwright/src/components/ --type ts
   ```
2. **Check existing fixtures** — does a fixture for this feature area exist?
   ```bash
   ls playwright/src/fixtures/
   ```
3. **Check RequestContextClient and proxy handlers** — does it have the needed API methods?
   - Use `kubevirt-ui-mcp-get_class_surface` with `RequestContextClient`
   - Use `kubevirt-ui-mcp-search_methods` to find relevant methods
   - Check proxy handlers in `playwright/src/clients/proxy-handlers/` for domain-specific methods
4. **Validate locators**:
   - **`--local` mode**: Search the product source (`src/`) for `data-test` attributes and component structure. Cross-reference with PatternFly component docs for expected roles/names.
   - **Default mode**: Navigate to relevant pages via Playwright MCP and inspect:
     ```
     Playwright-browser_navigate → <page-URL>
     Playwright-browser_snapshot → find data-test attributes
     ```

### Phase 3: Implementation

#### 1. Create or extend a fixture (if needed)

If no fixture exists for the feature area, create one in `playwright/src/fixtures/<feature>-fixture.ts`:

```typescript
import { withSafeActions } from '@/page-objects/base-page';
import FeaturePage from '@/page-objects/feature/feature-page';
import PageCommons from '@/page-objects/page-commons';
import { baseTest, expect } from './scenario-test-fixture';

interface FeatureFixtures {
  featurePage: FeaturePage;
  pageCommons: PageCommons;
}

const test = baseTest.extend<FeatureFixtures>({
  featurePage: async ({ page }, use) => {
    await use(withSafeActions(new FeaturePage(page)));
  },
  pageCommons: async ({ page }, use) => {
    await use(withSafeActions(new PageCommons(page)));
  },
});

export { expect, test };
```

#### 2. Create or extend page objects / components (if needed)

**Components** (`playwright/src/components/<area>/<name>-component.ts`):

- Extend `BaseComponent`
- Contain locators and interaction methods for a UI section
- Used internally by page objects

**Page objects** (`playwright/src/page-objects/<area>/<name>-page.ts`):

- Extend `BasePage` or `PageCommons`
- Compose components
- Expose high-level methods to specs

```typescript
import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class FeatureComponent extends BaseComponent {
  private readonly _createBtn = this.locator('[data-test="item-create"]');
  private readonly _nameFilter = this.locator('[data-test="name-filter-input"]');

  constructor(page: Page) {
    super(page);
  }

  async filterByName(name: string): Promise<void> {
    await this._nameFilter.fill(name);
    await this._nameFilter.press('Enter');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }
}
```

#### 3. Create the spec file

- Place in the correct tier directory: `playwright/tests/<tier>/<feature>/`
- Import `test` and `expect` from the feature fixture
- Import allure constants from `@/data-models/allure-constants`
- Define `const SUITE = '...'` at module scope
- Tag `test.describe` with tier tag + feature-area tag
- Every `test()` must call `utils.withAllure(...)` first
- Use descriptive assertion messages on every `expect`
- **Never put `ID(CNV-XXXXX)` in test names or step names** — use only in allure tags

#### 4. Allure metadata

Every test must register with Allure:

```typescript
await utils.withAllure({
  suite: SUITE,
  feature: T1,          // or T2, GATING — from allure-constants
  tags: [T1_TAG, ...],  // tier tag + feature tags
});
```

#### 5. API setup in tests

Use `apiClient` (`RequestContextClient`) for Kubernetes operations. All API calls go through the console proxy with the authenticated user's permissions:

```typescript
import { setupTestNamespace } from '@/utils/test-setup-helpers';

// In beforeAll or test body:
const ns = await setupTestNamespace(apiClient, 'my-feature');
```

Track created resources for cleanup:

```typescript
apiClient.trackResource('VirtualMachine', vmName, namespace);
```

#### 6. Navigation

**All navigation must go through the UI** — never use `page.goto()` or `goTo()` in specs:

- The `_autoVirtNavigation` auto-fixture handles initial console load and perspective switching
- Use sidebar navigation methods: `clickNavBootableVolumes()`, `clickNavMigrationPolicies()`, etc.
- Use tree view for VMs: `navigateToVmViaTreeView(vmName)`, `navigateToProjectViaTreeView(ns)`
- Use page object navigation methods: `navigateToNamespaceBootableVolumesViaUI(ns)`, etc.

### Phase 4: Validation

1. **Type check**: `npm run check-types:playwright`
2. **Lint**: `npx eslint --fix --no-warn-ignored <changed-files>`
3. **List tests**: `npx playwright test --list --project=<Tier>`
4. **Run**: `npx playwright test --project=<Tier> --workers=1` or `./playwright-runner.sh <Tier>`
5. **Fix failures** — iterate until passing

### Phase 5: Summary

| Item                          | Details                      |
| ----------------------------- | ---------------------------- |
| **Feature**                   | Description                  |
| **Spec file**                 | Path to new/modified spec    |
| **Tests added**               | Count and names              |
| **Fixture**                   | New or existing fixture used |
| **Page objects / Components** | New or modified              |
| **API client changes**        | New methods added (if any)   |
| **Test results**              | Pass / Fail / Blocked        |

## Project Structure

```
playwright/
├── tests/
│   ├── gating/                    # Gating specs (gating-fixture)
│   ├── tier1/<feature>/           # Tier 1 specs (per-feature fixtures)
│   ├── tier2/<feature>/           # Tier 2 specs (per-feature fixtures)
│   ├── settings/                  # Settings specs (settings-fixture)
│   └── api/                       # API contract specs (api-test-fixture)
├── src/
│   ├── components/                # UI components (extend BaseComponent)
│   │   ├── shared/                # Base classes (base-component, navigation-component)
│   │   ├── overview/              # Overview area components
│   │   ├── vm/                    # VM detail components
│   │   ├── vm-wizard/             # VM creation wizard components
│   │   └── create-vm/             # Catalog/template components
│   ├── page-objects/              # Page objects (extend BasePage/PageCommons, compose components)
│   │   ├── vm/                    # VM pages
│   │   ├── overview/              # Overview pages
│   │   ├── settings/              # Settings pages
│   │   ├── cluster/               # Cluster-level pages (checkups, migration policies, quotas)
│   │   ├── create-vm/             # Create VM pages
│   │   └── vm-wizard/             # VM wizard pages
│   ├── fixtures/                  # Per-feature test fixtures (extend baseTest)
│   │   ├── scenario-test-fixture.ts  # Base fixture — provides apiClient, utils, auto-fixtures
│   │   ├── gating-fixture.ts
│   │   ├── checkups-fixture.ts
│   │   ├── vm-tabs-fixture.ts
│   │   ├── settings-fixture.ts
│   │   └── ...
│   ├── clients/                   # API clients
│   │   ├── request-context-client.ts  # RequestContextClient — HTTP via console proxy
│   │   ├── proxy-handlers/            # Domain-specific handlers (vm, core, infra, project)
│   │   ├── kind-resolver.ts           # Maps resource kinds to GVR tuples
│   │   └── rcc-singleton.ts           # Singleton management for RequestContextClient
│   ├── data-models/               # Constants, types, allure metadata
│   │   └── allure-constants.ts    # Suite/feature/tag constants
│   ├── data-factories/            # Test data generators (SSH keys, VM specs)
│   └── utils/                     # Env vars, test config, random names, helpers
├── project-dependencies/          # Global setup/teardown + rule engine
└── playwright.config.ts           # Projects: Gating, Tier1, Tier2, Settings, API
```

## Rules

- **Every fixture extends `baseTest`** from `scenario-test-fixture.ts`
- **Page objects are wrapped with `withSafeActions()`** in fixtures
- **Page objects extend `BasePage` or `PageCommons`** — not standalone classes
- **Components extend `BaseComponent`** and are composed by page objects
- **Use allure constants** from `@/data-models/allure-constants` — never raw strings for tier/feature labels
- **Every test calls `utils.withAllure(...)`** with suite, feature, and tags
- **Use `TestTimeouts.*`** constants — never inline timeout numbers
- **Tag `test.describe`** with the tier tag and a feature-area tag
- **Use descriptive messages** on every `expect()` / `expect.soft()`
- **Specs import `test` and `expect` from the feature fixture** — never from `@playwright/test` directly
- **Each test file owns its namespace** — use `generateRandomName()`, never hardcode
- **Never hardcode `openshift-cnv`** — use `EnvVariables.cnvNamespace` or `utils.EnvVariables.cnvNamespace`
- **Always check existing coverage first** — expand existing specs when possible
- **All API calls go through the console proxy** — `RequestContextClient` routes all requests through the console proxy with the authenticated user's permissions. Never use `oc` CLI, `@kubernetes/client-node`, or direct cluster access.
- **No direct URL navigation** — never use `page.goto()` or `goTo()` in specs; always navigate through the Virtualization perspective switcher and sidebar
- **Never put `ID(CNV-XXXXX)` in test names or step names** — use only in allure tags
- **DO NOT commit, push, or create PRs** — never run `git commit`, `git push`, `gh pr create`, or any git write operation. The user handles all git operations manually. Only use git read commands (`git status`, `git diff`, `git log`) when needed for context.
