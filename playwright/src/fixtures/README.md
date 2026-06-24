# Fixtures

Playwright fixture layer providing dependency injection for test context, Page Objects, clients, configuration, and utilities.

## Architecture

The fixture system uses a **per-folder** pattern: each test subfolder has a dedicated fixture file that injects exactly the Page Objects and clients that group of specs needs.

```
scenario-test-fixture.ts   ← base: exports baseTest, testConfig, k8sClient, cleanup, category fixtures
        ↓
gating-fixture.ts          ← extends baseTest, adds POs for gating specs
        ↓
*.spec.ts                  ← imports { test, expect } from the gating fixture
```

## Category Fixtures

Utilities are injected through focused **category fixtures**:

| Fixture       | Type                  | What it provides                                                         |
| ------------- | --------------------- | ------------------------------------------------------------------------ |
| `generators`  | Object (functions)    | `generateRandomVmName`, `createPwPrefixedName`, `buildYamlVm`, etc.      |
| `timeouts`    | `TestTimeouts` object | All timeout constants (`DEFAULT`, `TEST_EXTENDED`, `VM_BOOT`, etc.)      |
| `waitHelpers` | Object (functions)    | `waitForVirtualMachineReady`, `waitForVmSnapshot`, `waitForK8sResource`  |
| `navigation`  | Object (functions)    | `navigateToVmDetailAndConfigurationSubTab`, `setupPwTestNamespace`, etc. |

Category fixture source modules live in `playwright/src/fixtures/category-fixtures/`.

## Fixture Files

| File                       | Purpose                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| `scenario-test-fixture.ts` | Base fixture — exports `baseTest`, `testConfig`, `k8sClient`, `cleanup`, category fixtures |
| `gating-fixture.ts`        | `tests/gating/` — provides all gating page objects                                         |
| `category-fixtures/`       | Category fixture modules: `generators`, `wait-helpers`, `navigation`                       |
| `cleanup-fixture.ts`       | Shared cleanup fixture (used internally)                                                   |
| `fixture-helpers.ts`       | Shared helper functions for fixture setup                                                  |

## Fixture Scopes

| Fixture       | Scope  | What it provides                                                               |
| ------------- | ------ | ------------------------------------------------------------------------------ |
| `testConfig`  | Worker | Shared config from `.test-config.json` (cluster URL, namespace, token)         |
| `k8sClient`   | Worker | Single `KubernetesClient` instance per worker                                  |
| `cleanup`     | Test   | `ScenarioContextManager` drain — runs `drainTrackedResources()` in `afterEach` |
| `generators`  | Test   | Random name generation, YAML VM builders, data factories                       |
| `timeouts`    | Test   | `TestTimeouts` — all timeout constants                                         |
| `waitHelpers` | Test   | Wait functions — `waitForVirtualMachineReady`, `waitForVmSnapshot`, etc.       |
| `navigation`  | Test   | Navigation and setup orchestration functions                                   |

## Usage

```typescript
import { GATING_TAG } from '@/data-models/test-tags';
import { expect, test } from '@/fixtures/gating-fixture';

test.describe('Feature (gating)', { tag: [GATING_TAG] }, () => {
  test('Page loads correctly', async ({ vmListPage, pageCommons }) => {
    await vmListPage.navigateToVirtualMachinesViaUI();
    expect.soft(await pageCommons.verifyTextVisible('VirtualMachines')).toBe(true);
  });
});
```

## Key Rules

- **Import from the per-folder fixture**, not directly from `scenario-test-fixture`.
- **`cleanup.track*()`** in spec files is the correct way to register resources for teardown.
- **Never instantiate `KubernetesClient` directly** in tests — use the worker-scoped `k8sClient` fixture.
