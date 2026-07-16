# Test Fix Cycle

Run Playwright tests, analyze failures, fix test code issues, and re-run until stable.

## Input

```
/test-fix [scope]
```

| Scope         | What runs                                                             |
| ------------- | --------------------------------------------------------------------- |
| _(none)_      | All active projects (`./playwright-runner.sh all`)                    |
| `gating`      | Gating tests (`npx playwright test --project=Gating`)                 |
| `tier1`       | Tier 1 tests (`npx playwright test --project=Tier1`)                  |
| `tier2`       | Tier 2 tests (`npx playwright test --project=Tier2`)                  |
| `settings`    | Settings tests (`npx playwright test --project=Settings`)             |
| `<file-path>` | Specific spec file (`npx playwright test <path>`)                     |
| `<test-name>` | Specific test by name (`npx playwright test -g "<name>" --workers=1`) |

## Workflow

### Phase 0: Pre-flight

1. Verify the environment is configured:
   ```bash
   source .env 2>/dev/null
   echo "Console URL: ${WEB_CONSOLE_URL:-not set}"
   ```
2. Check for stale test namespaces (if `oc` is available):
   ```bash
   oc get ns --no-headers 2>/dev/null | grep '^pw-' | wc -l
   ```

### Phase 1: Run Tests

Use the runner script or `npx playwright test` with the appropriate project:

```bash
# Via runner script (recommended)
./playwright-runner.sh <project>

# Or directly
PLAYWRIGHT_RETRIES=0 npx playwright test --project=<Tier1|Tier2|Gating|Settings> --workers=1
```

For single-file or single-test runs:

```bash
PLAYWRIGHT_RETRIES=0 npx playwright test <spec-path> --workers=1
PLAYWRIGHT_RETRIES=0 npx playwright test -g "<test name>" --workers=1
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

#### With cluster inspection (if `oc` is available)

```bash
oc get vm -n <test-namespace> -o json | jq '.items[0].status'
oc get events -n <test-namespace> --sort-by=.lastTimestamp | tail -20
```

### Phase 4: Fix Test Code Issues

For `test_bug` classified failures:

#### Where to fix

| Layer       | Location                                           | When to touch                                          |
| ----------- | -------------------------------------------------- | ------------------------------------------------------ |
| Spec file   | `playwright/tests/<tier>/<feature>/`               | Wrong assertions, missing waits, wrong test logic      |
| Fixture     | `playwright/src/fixtures/<feature>-fixture.ts`     | Missing page object in fixture, fixture setup issues   |
| Page object | `playwright/src/page-objects/<area>/`              | High-level method broken, incorrect delegation         |
| Component   | `playwright/src/components/<area>/`                | Locator broken, interaction method failing             |
| API client  | `playwright/src/clients/request-context-client.ts` | API setup/teardown issue                               |
| Handlers    | `playwright/src/clients/proxy-handlers/`           | Domain-specific API methods (vm, core, infra, project) |
| Utilities   | `playwright/src/utils/`                            | Helper functions, data generators, timeout constants   |

#### Architecture constraints

- All fixtures extend `baseTest` from `scenario-test-fixture.ts`
- Page objects are wrapped with `withSafeActions()` in fixtures
- Page objects extend `BasePage` or `PageCommons`
- Components extend `BaseComponent` and are composed by page objects
- Specs import `test` and `expect` from their feature fixture — never from `@playwright/test`
- Use `TestTimeouts.*` constants from `@/utils/test-config` — never inline timeout numbers
- Every `test()` must call `utils.withAllure(...)` with suite, feature, and tags
- Use allure constants from `@/data-models/allure-constants`

#### Locator strategy

1. Prefer `[data-test="..."]` and `[data-test-id="..."]` attributes
2. Fall back to `getByRole()` with accessible names
3. Fall back to `getByText()` for user-visible content
4. Use `getByRole('menuitem', { name, exact: true })` for kebab menu actions
5. Use explicit timeouts on all assertions

#### Common fixes

- **Stale locator**: Update the selector in the component or page object, not in the spec
- **Timing issue**: Add `waitFor()` in the page object method or use `expect.poll()`
- **Setup failure masking tests**: Remove `setupError` + `test.skip` patterns — let setup failures fail the suite
- **Missing cleanup**: Add `apiClient.trackResource()` after resource creation
- **`withSafeActions` silent skip**: If a test appears skipped but should fail, check if `withSafeActions` is swallowing a timeout — the fix belongs in the page object method

### Phase 5: Re-run Fixed Tests

```bash
PLAYWRIGHT_RETRIES=0 npx playwright test <fixed-spec> --workers=1
```

Repeat Phases 3-5 until all `test_bug` failures are resolved.

### Phase 6: Final Validation

1. **Type check**: `npm run check-types:playwright`
2. **Lint**: `npx eslint --fix --no-warn-ignored <changed-files>`
3. **Run the full project suite**:
   ```bash
   ./playwright-runner.sh <project>
   ```

Report final results:

```
Total: X | Passed: X | Failed: X | Fixed: X | Duration: Xs
Fixed tests: <list>
Remaining failures: <list with classification>
```

## Common Failure Patterns

| Symptom                        | Likely Cause                       | Fix Location                      |
| ------------------------------ | ---------------------------------- | --------------------------------- |
| `Timeout waiting for selector` | Selector changed                   | Component or page object          |
| `locator.click: Target closed` | Page navigated mid-action          | Add wait in page object method    |
| `expect.toBe: false`           | Assertion timing                   | Use `waitFor()` / `expect.poll()` |
| `strict mode violation`        | Multiple matches                   | Refine locator in component       |
| `net::ERR_CONNECTION_REFUSED`  | Cluster down                       | Environment issue                 |
| `401 Unauthorized`             | Token expired                      | Re-run global setup               |
| `test.skip` but should fail    | `withSafeActions` swallowing error | Fix timeout in page object        |
| `setupError` skip cascade      | Catch-and-skip in beforeAll        | Remove pattern, let it fail       |

## Environment Variables

| Variable               | Purpose                            |
| ---------------------- | ---------------------------------- |
| `PLAYWRIGHT_RETRIES=0` | Disable retries (development mode) |
| `DEBUG=1`              | Headed browser + list reporter     |
| `WORKERS=N`            | Override worker count              |
| `HC_E2E=1`             | Hot cluster mode (namespace reuse) |
| `IS_LOCAL=true`        | Local development mode             |

## Project Structure Reference

```
playwright/
├── tests/
│   ├── gating/                    # Gating specs (gating-fixture)
│   ├── tier1/<feature>/           # Tier 1 specs (per-feature fixtures)
│   ├── tier2/<feature>/           # Tier 2 specs (per-feature fixtures)
│   └── settings/                  # Settings specs (settings-fixture)
├── src/
│   ├── components/                # UI components (extend BaseComponent)
│   ├── page-objects/              # Page objects (extend BasePage/PageCommons)
│   ├── fixtures/                  # Per-feature fixtures (extend baseTest)
│   │   └── scenario-test-fixture.ts  # Base fixture — apiClient, utils, auto-fixtures
│   ├── clients/                   # RequestContextClient + proxy-handlers + kind-resolver
│   ├── data-models/               # Constants, types, allure metadata
│   ├── data-factories/            # Test data generators
│   └── utils/                     # Env vars, test config, random names
├── project-dependencies/          # Global setup/teardown + rule engine
├── playwright.config.ts           # Projects: Gating, Tier1, Tier2, Settings
├── playwright-runner.sh           # Local runner script
└── playwright-runner-hc-e2e.sh    # CI/hot-cluster runner script
```

## Rules

- **Fix locators in components/page objects** — not in spec files
- **Specs import from feature fixtures** — never from `@playwright/test` directly
- **Page objects extend `BasePage` / `PageCommons`** — use `withSafeActions()` in fixtures
- **Use `TestTimeouts.*` constants** — never inline timeout numbers
- **Use allure constants** from `@/data-models/allure-constants` — never raw strings
- **Verify via API** — use `apiClient` (`RequestContextClient`) to check K8s state after UI actions
- **All API calls go through the console proxy** — `RequestContextClient` routes all requests through the console proxy with the authenticated user's permissions. No `oc` CLI or `@kubernetes/client-node` is used.
- **Single process only** — use `--workers=N`, never concurrent test invocations
- Report `product_bug` findings without modifying the test — the test is correct, the app is wrong
- Always run `npm run check-types:playwright` after changes
- **DO NOT commit or push** — the user handles git operations
