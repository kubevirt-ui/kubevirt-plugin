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
| `--dev`       | Target the **Gating** test group (`@gating` tag) — for features developed in this repo     |

### `--dev` Flag

When `--dev` is specified, the exploration targets a **specific feature implemented by a developer** in this repo. Tests produced with `--dev`:

- Are placed in `playwright/tests/gating/` and tagged `@gating`
- Run via `./playwright-runner.sh test-gating`
- Run on every MR/PR in CI alongside the other gating tests
- Should be fast (< 2 min per test) and avoid heavy resource creation where possible
- Use the same ported fixture infrastructure (`@/fixtures/gating-fixture`, etc.)
- Import `GATING_TAG` from `@/data-models/test-tags` and include it in the `test.describe` tag array

`--dev` can be combined with `--implement`:

```
/cnv-exploration bootable-volumes --dev                # Gap report scoped to gating
/cnv-exploration bootable-volumes --dev --implement    # Report + implement as gating tests
```

Examples:

```
/cnv-exploration bootable-volumes
/cnv-exploration storage-migration --implement
/cnv-exploration checkups settings --implement
/cnv-exploration templates --dev --implement
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
2. **Verify the Virtualization view is active** — confirm the sidebar shows the "Virtualization" heading (not core OpenShift platform)
3. **Snapshot the accessibility tree** — document all interactive elements, tabs, buttons, widgets, forms, `data-test` and `data-test-id` attributes
4. **Explore sub-pages and tabs** — click through each tab, open action menus, open modals/forms
5. **Build a Feature Map** listing all discovered features, user workflows, and testable selectors

### Phase 2: Test Coverage Analysis

1. Search existing test coverage:
   - `rg "<module>" playwright/tests/ --type ts -l` to find spec files
   - `rg "@gating" playwright/tests/ --type ts -l` to find existing gating tests (when `--dev`)
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
- Recommended next steps (quick wins, new spec files, framework gaps)

When `--dev` is active, the report additionally includes:

- Which gaps are candidates for Gating (`@gating`) vs. Tier 1 only
- Estimated CI time impact for each recommended test

### Phase 5: Implementation Planning (only with `--implement`)

1. **Prioritize** — select up to 3 untested Jira tickets from the gap report
2. **Route each ticket — Expand vs. New**:
   - Search existing spec files for the feature
   - If a spec covers the area → **Expand** (add `test.step()` or new `test()`)
   - If no existing spec → **New** (create new spec file)
3. **Determine tier placement**:

   | Tier       | Criteria                                                      |
   | ---------- | ------------------------------------------------------------- |
   | **Gating** | No resource creation, < 2 min, smoke checks, parallelizable   |
   | **Tier1**  | Creates 1–2 VMs, < 6 min, CRUD workflows, isolated namespaces |
   | **Tier2**  | Multi-resource setups, < 6 min, complex dependencies          |

4. **When `--dev`**: all tests go into `playwright/tests/gating/` with `GATING_TAG` in the tag array.
5. **Present the plan** — wait for user approval before implementing
6. **Create a branch** — `<git-user>/cnv-exploration-<module>-tests`

### Phase 6: Implementation (after approval)

- **Expand-routed**: add PO methods if needed → add tests to existing spec
- **New-routed**: create new spec file in correct tier dir
- **When `--dev`**: place spec file in `playwright/tests/gating/` and ensure `test.describe` includes `GATING_TAG`:
  ```typescript
  import { GATING_TAG } from '@/data-models/test-tags';
  test.describe('Feature X', { tag: [GATING_TAG] }, () => { ... });
  ```
- Run lint and type checks on all changed files

## Rules

- Without `--implement`: **read-only** — do not modify code, create branches, or commit
- **Expand before create** — always check if an existing test can absorb the validation before creating new files
- Use MCP snapshots (not screenshots) for element discovery and locator validation
- Cross-reference every feature with existing tests before classifying as untested
- Focus on actionable tickets (Verified, ON_QA, Closed)
- When `--dev`: tests must be tagged `@gating` and should run in < 2 min each

## Gating Test Conventions

Gating tests in `playwright/tests/gating/` are critical-path smoke tests. They:

- Live in `playwright/tests/gating/`
- Run via `./playwright-runner.sh test-gating` or `npx playwright test --project="Gating"`
- Should be fast and focused on smoke-level verification of plugin features
- Use the same ported fixtures, page objects, and clients as all other tests
- Are tagged in the `test.describe` block: `{ tag: [GATING_TAG] }`

## CRUD + API-Level Coverage (Primary Directive)

For every module, exploring full CRUD operations is **mandatory**:

1. Exercise Create, Read, Update, Delete end-to-end in the UI
2. Capture the network request for each operation using Playwright MCP
3. Record the endpoint pattern and status code in the Feature Map
4. Flag any API gaps — CRUD operations with UI coverage but no matching API test
