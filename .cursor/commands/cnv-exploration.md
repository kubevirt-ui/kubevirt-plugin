# CNV Exploration: UI Coverage Discovery

Explore a UI module on the live cluster via Playwright MCP, identify untested features, and cross-reference Jira tickets for test coverage gaps.

## Input

The user provides one or more module names after the `/cnv-exploration` command:

- **Single module**: `/cnv-exploration bootable-volumes`
- **Multiple modules**: `/cnv-exploration bootable-volumes checkups`

### Options

| Option        | Effect                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------ |
| _(none)_      | **Read-only** — produce a gap report without modifying any code                            |
| `--implement` | After the gap report, implement tests for the highest-priority untested Jira tickets found |

### Examples

```
/cnv-exploration bootable-volumes
/cnv-exploration storage-migration --implement
/cnv-exploration checkups settings --implement
```

### Available Modules

| Module               | UI area                                                                            |
| -------------------- | ---------------------------------------------------------------------------------- |
| `virtualmachines`    | VM list, tree view, overview tab, filters, bulk actions                            |
| `vm-detail`          | VM detail page tabs (overview, config, events, console, snapshots, disks, network) |
| `catalog`            | Template and instance-type VM creation wizard                                      |
| `templates`          | Template list, detail, boot source management                                      |
| `bootable-volumes`   | Bootable volume list, upload, clone, detail                                        |
| `instance-types`     | Cluster/user instance types, YAML, detail                                          |
| `networking`         | Virtual machine networks, NADs, UDNs, policies, services, routes                   |
| `migration-policies` | Migration policy list, create form, detail                                         |
| `checkups`           | Network latency, storage, self-validation checkups                                 |
| `settings`           | Virtualization settings, cluster config                                            |
| `overview`           | Virtualization overview dashboard, widgets, health, top consumers                  |
| `storage-migration`  | Storage migration plans list, migration wizard                                     |

## Workflow

### Phase 1: UI Discovery (Playwright MCP)

For each requested module:

1. **Navigate to the module page** using Playwright MCP browser tools
2. **Verify the Virtualization view is active** — confirm the sidebar shows the "Virtualization" heading
3. **Snapshot the accessibility tree** — document all interactive elements, tabs, buttons, widgets, forms, `data-test` and `data-test-id` attributes
4. **Explore sub-pages and tabs** — click through each tab, open action menus, open modals/forms
5. **Build a Feature Map** listing all discovered features, user workflows, and testable selectors

### Phase 2: Test Coverage Analysis

1. Search existing test coverage in both directories:
   - `rg "<module>" playwright/tests/scenario/ --type ts -l`
   - `rg "<module>" playwright/tests/gating/ --type ts -l`
2. Read relevant spec files to understand current coverage depth
3. Build a Coverage Map — mark each discovered feature as Tested / Partial / Untested

### Phase 3: Jira Cross-Reference

1. Query Jira for matching CNV UI tickets using the search API
2. Run two queries: actionable tickets (Verified/ON_QA/Closed) and in-flight (In Progress/Code Review)
3. Cross-reference each ticket against existing test coverage
4. Classify as: Untested / Partially tested / Covered / In-flight / Not testable via UI

### Phase 4: Gap Report

Produce a consolidated report with:

- Executive summary (features discovered, coverage %, gaps found)
- Untested features table
- Jira tickets needing test coverage table
- Recommended next steps (quick wins, new spec files, API client gaps)

### Phase 5: Implementation Planning (only with `--implement`)

1. **Prioritize** — select up to 3 untested Jira tickets from the gap report
2. **Route each ticket**:
   - Search existing scenario spec files for the feature
   - If a spec covers the area → **Expand** (add new `test()` block)
   - If no existing spec → **New** (create new spec in `playwright/tests/scenario/`)
3. **Check API client gaps** — does the test need K8s methods not yet in `RequestContextClient`?
4. **Present the plan** — wait for user approval before implementing

### Phase 6: Implementation (after approval)

All new tests use the **scenario infrastructure** with page objects injected via fixture:

```typescript
import { scenarioTest as test, expect } from '@/fixtures/scenario-fixture';
import { generateRandomName } from '@/utils/random-data-generator';

const NS = generateRandomName('feature');

test.describe('Feature', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ apiClient }) => {
    await apiClient.setupTestNamespace(NS);
  });

  test.afterAll(async ({ apiClient }) => {
    await apiClient.cleanupTestNamespace(NS).catch(() => {});
  });

  test('Virtualization perspective loads', async ({ overviewPage }) => {
    await overviewPage.switchToVirtualization();
    await expect(overviewPage.heading).toBeVisible({ timeout: 30_000 });
  });
});
```

- Page objects are injected via the `scenarioTest` fixture — never use raw `page` in specs
- Create new page objects in `playwright/src/page-objects/` and wire into `scenario-fixture.ts`
- Extend `RequestContextClient` if K8s methods are needed (add to `proxy-handlers/`)
- Run lint and type checks on all changed files

## Rules

- Without `--implement`: **read-only** — do not modify code, create branches, or commit
- **New tests always use scenario infrastructure** — `scenarioTest` fixture with page objects injected, `apiClient` (`RequestContextClient`)
- **No raw `page` in specs** — destructure page objects from the fixture
- **Never add tests to `playwright/tests/gating/`** — that directory is legacy/frozen
- Use MCP snapshots (not screenshots) for element discovery and locator validation
- Cross-reference every feature with existing tests before classifying as untested

## CRUD + API-Level Coverage (Primary Directive)

For every module, exploring full CRUD operations is **mandatory**:

1. Exercise Create, Read, Update, Delete end-to-end in the UI
2. Capture the network request for each operation using Playwright MCP
3. Record the endpoint pattern and status code in the Feature Map
4. Flag any API gaps — CRUD operations with UI coverage but no matching test
