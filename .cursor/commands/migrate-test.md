# Migrate Tests

Migrate existing legacy gating tests from `playwright/tests/gating/` to the new scenario infrastructure in `playwright/tests/scenario/`.

## Input

```
/migrate-test <spec-file or keyword>
```

- **Specific file**: `/migrate-test vm-actions-confirm.spec.ts`
- **Keyword**: `/migrate-test templates` (migrates all specs matching the keyword)
- **All**: `/migrate-test all` (migrates all legacy gating specs)

## Architecture Differences

The migration transforms tests from the legacy architecture to the new scenario infrastructure:

| Aspect | Legacy (from) | Scenario (to) |
|---|---|---|
| **Directory** | `playwright/tests/gating/` | `playwright/tests/scenario/` |
| **Fixture import** | `gatingTest` from `scenario-test-fixture` | `scenarioTest` from `@/fixtures/scenario-fixture` |
| **K8s client** | `k8sClient.namespace.setupTestNamespace()` | `k8sClient.setupTestNamespace()` |
| **K8s client** | `k8sClient.vm.createContainerDiskVm()` | `k8sClient.createContainerDiskVm()` |
| **K8s client** | `k8sClient.vm.waitForVmRunning()` | `k8sClient.waitForVmRunning()` |
| **K8s client** | `k8sClient.storageClass.*` | `k8sClient.<method>()` (extend KubernetesClient) |
| **UI interactions** | Page objects via complex class hierarchy | **Page objects injected via fixture** |
| **UI interactions** | `vmDetailPage.navigateToVm()` (fixture-injected legacy PO) | `overviewPage.switchToVirtualization()` (fixture-injected new PO) |
| **Page object design** | Extends `PageCommons` → `BasePage` | Standalone class, constructor takes `Page` |
| **Run command** | `npm run test-playwright -- --project=Gating` | `USE_SCENARIO_INFRA=true npm run test-playwright -- --project=scenario` |

## Workflow

### Phase 1: Inventory

1. **Identify specs to migrate** based on input:
   ```bash
   ls playwright/tests/gating/<spec>.spec.ts
   rg -l "<keyword>" playwright/tests/gating/ --type ts
   ```

2. **For each spec, inventory its dependencies**:
   ```bash
   rg "^import" playwright/tests/gating/<spec>.spec.ts
   rg "Page\b" playwright/tests/gating/<spec>.spec.ts
   rg "k8sClient\." playwright/tests/gating/<spec>.spec.ts
   ```

3. **Present the migration plan** — list each spec with its page object dependencies and required `KubernetesClient` extensions.

### Phase 2: Page Object Migration

Legacy page objects (extending `PageCommons` → `BasePage`) must be **rewritten as standalone classes** for the scenario infrastructure.

**Migration pattern**:

1. Read the legacy page object to extract its locators and methods
2. Create a new page object in `playwright/src/page-objects/`
3. Wire it into `scenario-fixture.ts`

Legacy:
```typescript
// Old: extends BasePage, uses this.locator(), this.robustClick()
class VmDetailPage extends PageCommons {
  async navigateToVmViaUrl(ns: string, name: string) {
    await this.goTo(`/k8s/ns/${ns}/kubevirt.io~v1~VirtualMachine/${name}`);
  }
  async verifyVmStatus(status: string) {
    const el = this.locator('[data-test="vm-status"]');
    await el.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    return (await el.textContent())?.includes(status);
  }
}
```

Scenario:
```typescript
// New: standalone class, constructor takes Page, locators as properties
// No navigate() with direct URLs — use overviewPage.switchToVirtualization() first
import type { Locator, Page } from '@playwright/test';

export class VmDetailPage {
  readonly status: Locator;

  constructor(private readonly page: Page) {
    this.status = page.locator('[data-test="vm-status"]');
  }

  async waitForLoaded(timeout = 30_000): Promise<void> {
    await this.status.waitFor({ state: 'visible', timeout });
  }
}
```

**Wire into fixture**:
```typescript
vmDetailPage: async ({ page }, use) => {
  await use(new VmDetailPage(page));
},
```

### Phase 3: KubernetesClient Gap Analysis

For each K8s operation used by the legacy tests, check if `KubernetesClient` supports it:

```bash
rg "async " playwright/src/clients/kubernetes-client.ts
```

When adding methods, follow these patterns:

```typescript
// Core resources → this.coreApi
async listStorageClasses(): Promise<k8s.V1StorageClass[]> {
  const result = await this.coreApi.listStorageClass();
  return result.items ?? [];
}

// Custom resources → this.coApi
async getVm(name: string, namespace: string): Promise<Record<string, unknown>> {
  return await this.coApi.getNamespacedCustomObject({
    group: 'kubevirt.io', version: 'v1', namespace,
    plural: 'virtualmachines', name,
  }) as Record<string, unknown>;
}
```

### Phase 4: Write the Migrated Spec

Create the new file in `playwright/tests/scenario/`. Tests destructure page objects from the fixture:

```typescript
import { scenarioTest as test, expect } from '@/fixtures/scenario-fixture';
import { generateRandomName } from '@/utils/random-data-generator';

const NS = generateRandomName('feature-name');

test.describe('Feature Name', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ k8sClient }) => {
    await k8sClient.setupTestNamespace(NS);
  });

  test.afterAll(async ({ k8sClient }) => {
    await k8sClient.cleanupTestNamespace(NS).catch(() => {});
  });

  test('Virtualization perspective loads', async ({ overviewPage }) => {
    await overviewPage.switchToVirtualization();
    await expect(overviewPage.heading).toBeVisible({ timeout: 30_000 });
  });
});
```

### Phase 5: Handle the Legacy Spec

After successful migration:

1. **Do NOT delete the legacy spec yet** — it remains in `playwright/tests/gating/` until CI is fully switched
2. **Add a comment** at the top of the legacy spec noting it has been migrated:
   ```typescript
   // MIGRATED: This test has been migrated to playwright/tests/scenario/<new-spec>.spec.ts
   ```

### Phase 6: Validation

1. **Type check**: `npm run check-types:playwright`
2. **Lint**: `npx eslint --fix --no-warn-ignored playwright/tests/scenario/<new-spec>.spec.ts playwright/src/page-objects/<page>.ts`
3. **List tests**: `USE_SCENARIO_INFRA=true npx playwright test --list --project=scenario`
4. **Run the migrated test**: `USE_SCENARIO_INFRA=true npm run test-playwright -- --project=scenario --workers=1`
5. **Run the legacy test**: `npm run test-playwright -- gating/<old-spec>.spec.ts --workers=1`

### Phase 7: Summary

| Item | Details |
|---|---|
| **Migrated specs** | List of files migrated |
| **New scenario specs** | Paths to new files |
| **New page objects** | Page objects created |
| **Fixture changes** | Page objects wired in |
| **KubernetesClient extensions** | New methods added |
| **Test results** | Pass / Fail for both old and new |

## Batch Migration Strategy

When migrating multiple specs (`/migrate-test all`):

1. **Order by page object reuse** — migrate specs that share the same page first
2. **Group by KubernetesClient needs** — migrate specs that share K8s methods together
3. **One spec at a time** — migrate, validate, then move to the next

## Rules

- **Page objects are injected via fixture** — never instantiate in tests
- **No raw `page` in specs** — destructure page objects from the fixture
- **Page objects are standalone classes** — no base class hierarchy
- **New specs go in `playwright/tests/scenario/`** — never modify legacy `gating/` tests (except adding migration comment)
- **Extend `KubernetesClient` for K8s gaps** — add methods directly to `kubernetes-client.ts`
- **Wire new page objects into the fixture** — tests consume them by destructuring
- **Validate both old and new** — the legacy test must still pass after migration
- **Do NOT delete legacy specs** — annotate them as migrated instead
- **DO NOT commit or push** — the user handles git operations
