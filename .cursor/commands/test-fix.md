# Test Fix Cycle

Run ported Playwright tests, analyze failures, fix test code issues, and re-run until stable. This is the iterative fix cycle for the ported kubevirt-ui E2E suite.

## Input

```
/test-fix [scope]
```

| Scope                   | What runs                                                                       |
| ----------------------- | ------------------------------------------------------------------------------- |
| _(none)_                | All ported tests (`./playwright-runner.sh test`)                                |
| `gating`                | Ported gating only (`./playwright-runner.sh test-gating`)                       |
| `tier1`                 | Tier 1 — all sub-groups (`./playwright-runner.sh test-tier1`)                   |
| `t1-wizard`             | Tier 1: VM creation wizard (`./playwright-runner.sh t1-wizard`)                 |
| `t1-vm-list`            | Tier 1: VM list page (`./playwright-runner.sh t1-vm-list`)                      |
| `t1-vm-config`          | Tier 1: VM configuration tabs (`./playwright-runner.sh t1-vm-config`)           |
| `t1-vm-scenarios`       | Tier 1: VM scenarios and diagnostics (`./playwright-runner.sh t1-vm-scenarios`) |
| `t1-vm-actions`         | Tier 1: VM lifecycle actions (`./playwright-runner.sh t1-vm-actions`)           |
| `t1-vm-overview`        | Tier 1: VM overview page (`./playwright-runner.sh t1-vm-overview`)              |
| `t1-templates`          | Tier 1: Template management (`./playwright-runner.sh t1-templates`)             |
| `t1-bootable-volumes`   | Tier 1: Bootable volumes (`./playwright-runner.sh t1-bootable-volumes`)         |
| `t1-instance-types`     | Tier 1: Instance types (`./playwright-runner.sh t1-instance-types`)             |
| `t1-migration-policies` | Tier 1: Migration policies (`./playwright-runner.sh t1-migration-policies`)     |
| `t1-overview`           | Tier 1: Cluster overview (`./playwright-runner.sh t1-overview`)                 |
| `t1-checkups`           | Tier 1: Health checkups (`./playwright-runner.sh t1-checkups`)                  |
| `api`                   | API tests only (`./playwright-runner.sh test-api`)                              |
| `settings`              | CNV settings only (`./playwright-runner.sh test-settings`)                      |
| `migrations`            | Migration tests only (`./playwright-runner.sh test-migrations`)                 |
| `<file-path>`           | Specific spec file (`./playwright-runner.sh test-file <path>`)                  |
| `<test-name>`           | Specific test by name (`npx playwright test -g "<name>" --workers=1`)           |

## Workflow

### Phase 0: Pre-flight

1. Verify the cluster is reachable:
   ```bash
   source .env 2>/dev/null
   oc whoami 2>/dev/null && echo "cluster ok" || echo "cluster unreachable"
   ```
2. Check for stale test namespaces:
   ```bash
   oc get ns -l 'kubernetes.io/metadata.name' --no-headers | grep '^pw-' | wc -l
   ```
   If >20, clean up namespaces older than 4 hours:
   ```bash
   oc get ns --no-headers | grep '^pw-' | awk '{print $1}' | head -20 | xargs -I{} oc delete ns {} --wait=false
   ```

### Phase 1: Run Tests

Run with retries disabled for fast feedback:

```bash
PLAYWRIGHT_RETRIES=0 ./playwright-runner.sh <scope> --workers=4
```

For single-file runs:

```bash
PLAYWRIGHT_RETRIES=0 npx playwright test --config=playwright.config.ts <spec-path> --workers=1
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

#### Check tool availability

```bash
playwright-cli --version 2>/dev/null && echo "cli" || echo "no-cli"
```

#### With playwright-cli (preferred)

```bash
playwright-cli state-load playwright/mcp-validations/.auth/openshift-state.json
playwright-cli resize 1920 1080
playwright-cli goto <failing-page-URL>
playwright-cli snapshot                          # find correct selectors
playwright-cli screenshot debug-state.png        # visual state
playwright-cli console error                     # JS errors
playwright-cli requests                          # failed API calls
playwright-cli generate-locator <ref> --raw      # get locator for element
```

#### With Playwright MCP (fallback)

```
Playwright-browser_navigate → <URL>
Playwright-browser_snapshot → accessibility tree
Playwright-browser_take_screenshot → visual state
Playwright-browser_console_messages → JS errors
Playwright-browser_network_requests → API calls
```

#### Without tools (raw agent)

```bash
oc get vm -n <test-namespace> -o json | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.stringify(JSON.parse(d).items[0].status,null,2)))"
oc get events -n <test-namespace> --sort-by=.lastTimestamp | tail -20
rg 'data-test.*<selector>' playwright/src/page-objects/
```

### Phase 4: Fix Test Code Issues

For `test_bug` classified failures:

1. Read the failing test + its page object
2. Fix following project patterns:
   - Selectors live in page objects, not specs
   - Use `robustClick` / wait helpers for timing issues
   - Use `TestTimeouts.*` for all timeouts
   - Prefer `[data-test="..."]` selectors
3. Run lint and type checks:
   ```bash
   npx eslint --fix <modified-files>
   npm run check-types:playwright
   ```

### Phase 5: Re-run Fixed Tests

```bash
PLAYWRIGHT_RETRIES=0 npx playwright test --config=playwright.config.ts <fixed-specs> --workers=1
```

Repeat Phases 3-5 until all `test_bug` failures are resolved.

### Phase 6: Final Validation

Run with default retries to confirm stability:

```bash
./playwright-runner.sh <original-scope> --workers=4
```

Report final results:

```
Total: X | Passed: X | Failed: X | Fixed: X | Duration: Xs
Fixed tests: <list>
Remaining failures: <list with classification>
```

## Common Failure Patterns

| Symptom                        | Likely Cause              | Fix Location           |
| ------------------------------ | ------------------------- | ---------------------- |
| `Timeout waiting for selector` | Selector changed          | Page object            |
| `locator.click: Target closed` | Page navigated mid-action | Add wait before action |
| `expect.toBe: false`           | Assertion timing          | Add waitFor / retry    |
| `strict mode violation`        | Multiple matches          | Refine locator         |
| `net::ERR_CONNECTION_REFUSED`  | Cluster down              | Environment issue      |
| `401 Unauthorized`             | Token expired             | Re-run global setup    |

## Environment Variables

| Variable                    | Purpose                            |
| --------------------------- | ---------------------------------- |
| `PLAYWRIGHT_RETRIES=0`      | Disable retries (development mode) |
| `SKIP_GLOBAL_SETUP=true`    | Skip setup (already done)          |
| `SKIP_GLOBAL_TEARDOWN=true` | Skip teardown (keep auth)          |
| `DEBUG=1`                   | Headed browser + list reporter     |
| `WORKERS=N`                 | Override worker count              |

## Rules

- **Never modify spec files outside the ported suite** (i.e., files in `tests/gating/` or `tests/features/` are off-limits)
- **Single process only** — use `--workers=N`, never concurrent `npx playwright test` invocations
- Follow `coding-standards.mdc` and `testing.mdc` for all code changes
- Report `product_bug` findings without modifying the test — the test is correct, the app is wrong
