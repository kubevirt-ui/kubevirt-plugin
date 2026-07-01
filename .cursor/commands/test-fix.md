# Test Fix Cycle

Run Playwright tests, analyze failures, fix test code issues, and re-run until stable.

## Input

```
/test-fix [scope]
```

| Scope         | What runs                                                             |
| ------------- | --------------------------------------------------------------------- |
| _(none)_      | Scenario tests (`USE_SCENARIO_INFRA=true npm run test-playwright -- --project=scenario`) |
| `scenario`    | Scenario tests (`USE_SCENARIO_INFRA=true npm run test-playwright -- --project=scenario`) |
| `gating`      | Legacy gating tests (`npm run test-playwright -- --project=Gating`)                      |
| `<file-path>` | Specific spec file (`npm run test-playwright -- <path>`)                                 |
| `<test-name>` | Specific test by name (`npx playwright test -g "<name>" --workers=1`) |

## Workflow

### Phase 0: Pre-flight

1. Verify the cluster is reachable:
   ```bash
   source .env 2>/dev/null
   oc whoami 2>/dev/null && echo "cluster ok" || echo "cluster unreachable"
   ```
2. Check for stale test namespaces:
   ```bash
   oc get ns --no-headers | grep '^pw-' | wc -l
   ```
   If >20, clean up:
   ```bash
   oc get ns --no-headers | grep '^pw-' | awk '{print $1}' | head -20 | xargs -I{} oc delete ns {} --wait=false
   ```

### Phase 1: Run Tests

For scenario tests (default):
```bash
PLAYWRIGHT_RETRIES=0 USE_SCENARIO_INFRA=true npx playwright test --project=scenario --workers=1
```

For legacy gating tests:
```bash
PLAYWRIGHT_RETRIES=0 npx playwright test --project=setup --project=Gating --workers=4
```

For single-file runs:
```bash
PLAYWRIGHT_RETRIES=0 npx playwright test <spec-path> --workers=1
```

### Phase 2: Analyze Failures

Read the test output and classify each failure:

| Classification     | Meaning                                         | Action                       |
| ------------------ | ----------------------------------------------- | ---------------------------- |
| **test_bug**       | Selector changed, timing issue, wrong assertion | Fix the test code            |
| **product_bug**    | Real UI regression, feature broken              | Report — do not modify test  |
| **infrastructure** | Cluster timeout, node not ready, storage issue  | Investigate cluster state    |
| **flaky**          | Passes on retry, timing-sensitive               | Stabilize with waits/retries |

### Phase 3: Debug Failures

#### With Playwright MCP

```
Playwright-browser_navigate → <URL>
Playwright-browser_snapshot → accessibility tree
Playwright-browser_take_screenshot → visual state
Playwright-browser_console_messages → JS errors
Playwright-browser_network_requests → API calls
```

#### With cluster inspection

```bash
oc get vm -n <test-namespace> -o json | jq '.items[0].status'
oc get events -n <test-namespace> --sort-by=.lastTimestamp | tail -20
```

### Phase 4: Fix Test Code Issues

For `test_bug` classified failures, fix depending on which infrastructure the test uses:

#### Scenario tests (`playwright/tests/scenario/`)

- Uses `scenarioTest` fixture from `@/fixtures/scenario-fixture`
- Page objects injected via fixture — fix locators in `playwright/src/page-objects/`
- K8s setup via `KubernetesClient` flat methods: `k8sClient.setupTestNamespace()`, `k8sClient.createContainerDiskVm()`, etc.
- If a page object is missing, create it and wire into the fixture
- If `KubernetesClient` lacks a needed method, add it to `kubernetes-client.ts`

#### Legacy gating tests (`playwright/tests/gating/`)

- Uses page objects and handler-based `k8sClient`
- Fix locators inline in page object methods
- Use `k8sClient.vm.*`, `k8sClient.storageClass.*`, etc.

#### Both

- Prefer `[data-test="..."]` / `[data-test-id="..."]` selectors
- Use `getByRole('menuitem', { name, exact: true })` for kebab menu actions
- Use explicit timeouts on all assertions

### Phase 5: Re-run Fixed Tests

```bash
PLAYWRIGHT_RETRIES=0 npx playwright test <fixed-spec> --workers=1
```

Repeat Phases 3-5 until all `test_bug` failures are resolved.

### Phase 6: Final Validation

Run the full suite with default retries:

```bash
USE_SCENARIO_INFRA=true npx playwright test --project=scenario
```

Or for gating:
```bash
npx playwright test --project=setup --project=Gating --workers=4
```

Report final results:

```
Total: X | Passed: X | Failed: X | Fixed: X | Duration: Xs
Fixed tests: <list>
Remaining failures: <list with classification>
```

## Common Failure Patterns

| Symptom                        | Likely Cause              | Fix Location                    |
| ------------------------------ | ------------------------- | ------------------------------- |
| `Timeout waiting for selector` | Selector changed          | Spec file or KubernetesClient          |
| `locator.click: Target closed` | Page navigated mid-action | Add wait before action          |
| `expect.toBe: false`           | Assertion timing          | Add waitFor / retry             |
| `strict mode violation`        | Multiple matches          | Refine locator                  |
| `net::ERR_CONNECTION_REFUSED`  | Cluster down              | Environment issue               |
| `401 Unauthorized`             | Token expired             | Re-run global setup             |

## Environment Variables

| Variable                    | Purpose                            |
| --------------------------- | ---------------------------------- |
| `PLAYWRIGHT_RETRIES=0`      | Disable retries (development mode) |
| `USE_SCENARIO_INFRA=true`   | Enable scenario project + global setup/teardown |
| `DEBUG=1`                   | Headed browser + list reporter     |
| `WORKERS=N`                 | Override worker count              |

## Project Structure Reference

```
playwright/
├── tests/
│   ├── scenario/          # New scenario specs (scenarioTest fixture)
│   └── gating/            # Legacy gating specs (page objects + handlers)
├── src/
│   ├── page-objects/      # Page objects (one per UI page, injected via fixture)
│   ├── clients/
│   │   ├── kubernetes-client.ts  # Flat K8s client for scenario tests
│   │   └── kubernetes-auth.ts  # Auth helpers
│   ├── fixtures/          # scenario-fixture.ts (injects page objects + k8sClient)
│   ├── data-models/       # K8s types
│   └── utils/             # Env vars, test config, random names
├── project-dependencies/  # Global setup/teardown + rule engine
└── playwright.config.ts
```

## Rules

- **New tests use scenario infrastructure** — `scenarioTest` fixture, page objects injected via fixture, `KubernetesClient`
- **Legacy gating tests use their own infrastructure** — page objects, handler-based client
- **No inline timeout numbers** — define constants or use well-known values (30_000, 60_000)
- **Verify actions via API** — use `KubernetesClient` to check K8s state after UI actions
- **Single process only** — use `--workers=N`, never concurrent test invocations
- Report `product_bug` findings without modifying the test — the test is correct, the app is wrong
- Always run `npm run check-types:playwright` after changes
