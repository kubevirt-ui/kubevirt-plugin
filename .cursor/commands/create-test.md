# Create Test

Create a new Playwright test from a Jira ticket or feature description using the **scenario infrastructure**.

## Input

```
/create-test <TICKET-ID or feature description>
```

- **Jira ticket**: `/create-test CNV-12345`
- **Feature description**: `/create-test "bootable volumes sort by name"`

## Architecture: Two Test Infrastructures

This project has two test infrastructures. **New tests MUST use the scenario infrastructure.**

| Aspect | Legacy (gating) | Scenario (new) |
|---|---|---|
| Directory | `playwright/tests/gating/` | `playwright/tests/scenario/` |
| Fixture | `gatingTest` from `scenario-test-fixture.ts` | `scenarioTest` from `@/fixtures/scenario-fixture` |
| K8s client | `k8sClient.vm.*`, `k8sClient.namespace.*` (handler pattern) | `k8sClient.setupTestNamespace()`, `k8sClient.createContainerDiskVm()` (flat API) |
| UI layer | Page objects instantiated manually | **Page objects injected via fixture** |
| Project | `gating` (always active) | `scenario` (enabled via `USE_SCENARIO_INFRA=true`) |
| Run command | `npm run test-playwright -- --project=Gating` | `USE_SCENARIO_INFRA=true npm run test-playwright -- --project=scenario` |

## Workflow

### Phase 1: Exploration & Scenario Design

1. **If Jira ticket provided** — fetch ticket details via MCP or search:
   ```bash
   rg "CNV-XXXXX" playwright/tests/
   ```
2. **Check existing coverage** — determine if the feature is already tested:
   ```bash
   rg "<feature-keyword>" playwright/tests/scenario/ --type ts -l
   rg "<feature-keyword>" playwright/tests/gating/ --type ts -l
   ```
3. **Design test scenarios** — map steps to existing page object methods and `KubernetesClient` methods; identify what's missing.

**Decision**:

- If an existing scenario spec covers this area → **expand** it (add a new `test()` block)
- If no existing scenario spec → **create** a new spec file in `playwright/tests/scenario/`
- **Never add new tests to `playwright/tests/gating/`** — those are legacy

### Phase 2: Framework Gap Analysis

1. **Check existing page objects** — does one already cover the page under test?
   ```bash
   rg "class " playwright/src/page-objects/ --type ts
   ```
2. **Check KubernetesClient** — does it have the K8s methods needed?
   ```bash
   rg "async " playwright/src/clients/kubernetes-client.ts
   ```
3. **If a page object is missing** — create it in `playwright/src/page-objects/` and wire it into the fixture
4. **If KubernetesClient lacks a method** — add it directly to `kubernetes-client.ts`
5. **Validate locators via Playwright MCP** — navigate to relevant pages and inspect elements:
   ```
   Playwright-browser_navigate → <page-URL>
   Playwright-browser_snapshot → find data-test attributes
   ```

### Phase 3: Implementation

#### Page objects (core pattern)

Page objects are **injected via the `scenarioTest` fixture**. Tests destructure them — they never instantiate page objects directly.

**Creating a page object** in `playwright/src/page-objects/<name>-page.ts`:

```typescript
import type { Locator, Page } from '@playwright/test';

export class BootableVolumesPage {
  readonly heading: Locator;
  readonly createBtn: Locator;
  readonly nameFilter: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: /bootablevolumes/i }).first();
    this.createBtn = page.locator('[data-test="item-create"]');
    this.nameFilter = page.locator('[data-test="name-filter-input"]');
  }

  async waitForLoaded(timeout = 30_000): Promise<void> {
    await this.heading.waitFor({ state: 'visible', timeout });
  }

  async filterByName(name: string): Promise<void> {
    await this.nameFilter.fill(name);
    await this.nameFilter.press('Enter');
  }
}
```

Key rules:
- Constructor takes `Page` and sets up `Locator` properties
- Expose key locators as `readonly` properties for assertion in tests
- **No `navigate()` methods with direct URLs** — page objects don't navigate via `page.goto('/virtualization/...')` because those routes aren't available until the Virtualization perspective is active. Use `overviewPage.switchToVirtualization()` to activate the perspective first, then interact with the target page
- Interaction methods are `async`
- No base class inheritance — each page object is a standalone class
- Use `data-test` attributes, `getByRole()`, and `getByText()` for locators

**Wiring into the fixture** in `playwright/src/fixtures/scenario-fixture.ts`:

```typescript
import { BootableVolumesPage } from '@/page-objects/bootable-volumes-page';

// Add to the ScenarioFixtures interface:
interface ScenarioFixtures {
  // ...existing fixtures...
  bootableVolumesPage: BootableVolumesPage;
}

// Add to the fixture extension:
bootableVolumesPage: async ({ page }, use) => {
  await use(new BootableVolumesPage(page));
},
```

#### Extending KubernetesClient (if needed)

Add methods directly to `playwright/src/clients/kubernetes-client.ts`:

```typescript
async patchConfigMap(name: string, namespace: string, data: Record<string, string>): Promise<void> {
  await this.coreApi.patchNamespacedConfigMap({
    name,
    namespace,
    body: { data },
    contentType: 'application/merge-patch+json',
  });
}
```

#### Creating the spec file

- Place in `playwright/tests/scenario/`
- Name: `<feature-name>.spec.ts` (kebab-case)
- Import from `@/fixtures/scenario-fixture`
- Destructure page objects from fixture — **never use raw `page`**

```typescript
import { scenarioTest as test, expect } from '@/fixtures/scenario-fixture';
import { generateRandomName } from '@/utils/random-data-generator';

const NS = generateRandomName('feature-name');
const VM_NAME = generateRandomName('my-vm');

test.describe('Feature Name', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ k8sClient }) => {
    await k8sClient.setupTestNamespace(NS);
    await k8sClient.createContainerDiskVm(VM_NAME, NS);
    await k8sClient.waitForVmRunning(VM_NAME, NS, 5 * 60_000);
  });

  test.afterAll(async ({ k8sClient }) => {
    await k8sClient.cleanupTestNamespace(NS).catch(() => {});
  });

  test('Virtualization perspective loads', async ({ overviewPage }) => {
    await overviewPage.switchToVirtualization();
    await expect(overviewPage.heading).toBeVisible({ timeout: 30_000 });
  });

  test('VM list shows created VM', async ({ virtualMachinesPage }) => {
    await virtualMachinesPage.waitForLoaded();
    await expect(virtualMachinesPage.getVmRow(VM_NAME)).toBeVisible({ timeout: 30_000 });
  });
});
```

#### Resource isolation & parallel safety

1. **Each test file gets its own namespace** — use `generateRandomName('prefix')` at module scope
2. **Tests that share state belong in the same file** — use `test.describe.configure({ mode: 'serial' })`
3. **Name test resources with `generateRandomName()`** — avoids collisions

#### Assertions

- Use `expect()` against page object locators with explicit timeouts
- Use `expect.poll()` for waiting on async state changes
- Page object properties are `Locator` instances — pass them directly to `expect()`

```typescript
// Assert against page object locators
await expect(overviewPage.heading).toBeVisible({ timeout: 30_000 });
await expect(virtualMachinesPage.createBtn).toBeEnabled({ timeout: 10_000 });

// Poll-based assertion
await expect.poll(
  async () => (await virtualMachinesPage.getVmRow(VM_NAME).count()) > 0,
  { message: 'VM should appear in list', timeout: 60_000 },
).toBe(true);
```

#### Cleanup & lifecycle

- Use `k8sClient.setupTestNamespace(NS)` in `test.beforeAll`
- Use `k8sClient.cleanupTestNamespace(NS).catch(() => {})` in `test.afterAll`
- Always `.catch(() => {})` on cleanup calls — teardown must not throw

### Phase 4: Validation

1. **Type check**:
   ```bash
   npm run check-types:playwright
   ```
2. **Lint**:
   ```bash
   npx eslint --fix --no-warn-ignored playwright/tests/scenario/<spec>.spec.ts playwright/src/page-objects/<page>.ts
   ```
3. **List tests** to verify project membership:
   ```bash
   USE_SCENARIO_INFRA=true npx playwright test --list --project=scenario
   ```
4. **Run the test**:
   ```bash
   USE_SCENARIO_INFRA=true npm run test-playwright -- --project=scenario --workers=1
   ```
5. **Fix failures** — iterate until passing or document blockers.

### Phase 5: Summary

| Item | Details |
|---|---|
| **Feature** | Description |
| **Spec file** | Path to new/modified spec |
| **Tests added** | Count and names |
| **Page objects** | New or modified page objects |
| **KubernetesClient changes** | New methods added (if any) |
| **Fixture changes** | New page objects wired in |
| **Test results** | Pass / Fail / Blocked |

## Project Structure

```
playwright/tests/scenario/              # Scenario spec files go here
playwright/tests/gating/                # Legacy gating specs (do not add new tests)
playwright/src/page-objects/            # Page objects (one per UI page)
playwright/src/fixtures/scenario-fixture.ts  # Fixture — injects page objects + k8sClient
playwright/src/clients/kubernetes-client.ts  # Flat K8s client (extend when needed)
playwright/src/clients/kubernetes-auth.ts    # OAuth/kubeconfig auth helpers
playwright/src/utils/                   # Env vars, test config, random names, file utils
playwright/src/data-models/             # K8s type definitions
playwright/project-dependencies/        # Global setup/teardown + rule engine
```

## Key Fixtures (from scenario-fixture.ts)

| Fixture | Provides |
|---|---|
| `k8sClient` | `KubernetesClient` instance — flat K8s API |
| `overviewPage` | `OverviewPage` — virtualization dashboard |
| `virtualMachinesPage` | `VirtualMachinesPage` — VM list page |

New page objects are added to the fixture as the test suite grows.

## Rules

- **Page objects are injected via fixture** — never instantiate page objects in tests
- **No raw `page` in specs** — destructure page objects from the fixture instead
- **New tests go in `playwright/tests/scenario/`** — never in `playwright/tests/gating/`
- **Use `scenarioTest` fixture** — never the legacy `gatingTest`
- **Page objects are standalone classes** — no base class hierarchy, constructor takes `Page`
- **Expose locators as `readonly` properties** — tests assert against them with `expect()`
- **Extend `KubernetesClient` for K8s gaps** — add methods directly to the class
- **Each file owns its namespace** — use `generateRandomName()`, never hardcode
- **Never hardcode `openshift-cnv`** — use `EnvVariables.cnvNamespace`
- **Always check existing coverage first** — expand existing specs when possible
- **DO NOT commit or push** — the user handles git operations
