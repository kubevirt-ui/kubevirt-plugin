# Coverage Analysis

Read-only coverage assessment of the virtualization module. Uses two complementary methods:

1. **`data-test` / `data-test` cross-reference** — matches attributes defined in `src/` against Playwright locator usage
2. **Feature-surface enumeration** — decomposes `src/views/` routes into testable capabilities and maps them to spec files

## Input

```
/coverage-analysis [scope] [options]
```

| Scope                | What is analyzed                                                            |
| -------------------- | --------------------------------------------------------------------------- |
| _(none)_ / `all`     | All virtualization routes                                                   |
| `vms`                | VirtualMachines list, detail, tree, search                                  |
| `vm-detail`          | VM Detail tabs (overview, config, diagnostics, metrics, console, snapshots) |
| `wizard`             | VM Creation Wizard (template catalog browsing)                              |
| `templates`          | Templates list, detail                                                      |
| `bootable-volumes`   | Bootable Volumes list, filters                                              |
| `instance-types`     | Instance Types list, detail                                                 |
| `migration-policies` | Migration Policies list                                                     |
| `settings`           | Virtualization Settings                                                     |
| `overview`           | Overview / Landing dashboard                                                |

### Options

| Option               | Default | Description                                                          |
| -------------------- | ------- | -------------------------------------------------------------------- |
| `--compare=<branch>` | off     | Compare current branch coverage against another branch (e.g. `main`) |

### Examples

```
/coverage-analysis                          # Full module (default)
/coverage-analysis vms                      # VMs sub-group only
/coverage-analysis --compare=main           # Compare current branch vs main
/coverage-analysis wizard --compare=main    # Compare wizard coverage vs main
```

## Test Infrastructure

| Tier         | Directory                    | Purpose                                   | Status                       |
| ------------ | ---------------------------- | ----------------------------------------- | ---------------------------- |
| **Gating**   | `playwright/tests/gating/`   | Smoke: navigation, page loads, basic CRUD | Must always pass, no retries |
| **Tier 1**   | `playwright/tests/tier1/`    | Single-resource CRUD lifecycle            | Active                       |
| **Tier 2**   | `playwright/tests/tier2/`    | Cross-module integration                  | Active                       |
| **Settings** | `playwright/tests/settings/` | Cluster-wide config (runs in isolation)   | Active                       |
| **API**      | `playwright/tests/api/`      | API contract validation                   | Active                       |

Coverage analysis scans **all** directories. Proposals for new coverage target `tier1/` or `tier2/` based on complexity.

## Constraints

- **Read-only** — no code changes, no branch creation, no test execution, no checkout of other branches
- **Repo is the source of truth** — if a feature is in `src/views/`, it counts; if removed, it doesn't
- **No external dependencies** — base analysis works offline on any clone
- **Deterministic** — same checkout yields identical results
- **Playwright tests only** — Jest/unit tests do NOT count as coverage
- **Virtualization module only** — Fleet/ACM routes excluded
- **Networking excluded** — owned by a separate team, always excluded
- **Comparison is non-destructive** — `--compare` reads the other branch via `git show`/`git ls-tree`, never checks it out

## Workflow

### Phase 1: UI Automation ID Cross-Reference

This is the primary, code-level coverage signal. It maps every `data-test` attribute and `data-test` prop in `src/` to its usage (or absence) in Playwright locators.

#### Step 1a: Extract all automation IDs from `src/`

```bash
# Static data-test IDs: data-test="foo"
rg 'data-test="([^"]+)"' src/ --glob '*.tsx' --glob '*.ts' -o \
  | sed 's/.*data-test="//;s/"//' | sort -u > /tmp/src-ids.txt

# Dynamic prefixes: data-test={`foo-${var}`}
rg 'data-test=\{`([^$`]+)' src/ --glob '*.tsx' --glob '*.ts' -o \
  | sed 's/.*=\{`//' | sort -u > /tmp/src-ids-dynamic.txt

# Merge into single input
cat /tmp/src-ids.txt /tmp/src-ids-dynamic.txt | sort -u > /tmp/src-ids-all.txt
```

#### Step 1b: Extract all automation ID references from Playwright

```bash
# Collect all locator patterns:
# testId('id'), getByTestId('id'), [data-test="id"], [data-test-id="id"]
{
  rg "testId\(" playwright/ --glob '*.ts' --glob '*.tsx' \
    | perl -nle "print \$1 if /testId\(['\"]([^'\"]+)['\"]/"
  rg "getByTestId\(" playwright/ --glob '*.ts' --glob '*.tsx' \
    | perl -nle "print \$1 if /getByTestId\(['\"]([^'\"]+)['\"]/"
  rg '\[data-test="[^"]+"\]' playwright/ --glob '*.ts' --glob '*.tsx' -o \
    | grep -oP '(?<=\[data-test=")[^"]+'
  rg '\[data-test-id="[^"]+"\]' playwright/ --glob '*.ts' --glob '*.tsx' -o \
    | grep -oP '(?<=\[data-test-id=")[^"]+'
} | sort -u > /tmp/pw-ids.txt
```

#### Step 1c: Cross-reference

For each ID in `src/`:

- **COVERED** — exact match (or dynamic prefix match) found in Playwright refs
- **UNCOVERED** — no Playwright reference targets this element

For each ID in Playwright:

- **IN SRC** — the ID exists in our `src/` code
- **EXTERNAL** — the ID comes from Console SDK, PatternFly, or other external dependencies (not actionable)

#### Step 1d: Map uncovered IDs to source files and feature areas

```bash
# For each uncovered ID, find ALL source files containing it
rg -l '(?:data-test|data-test).*"<ID>"' src/ --glob '*.tsx' --glob '*.ts'

# Classify by location:
# - Files under src/views/<route>/ → feature area = <route>
# - Files under src/utils/components/ → report as "shared" or
#   resolve to consuming views via rg for the component name
```

### Phase 2: Feature-Surface Enumeration

Enumerate testable capabilities from `src/views/` for each route in scope:

```bash
rg --files src/views/<route> --glob '*.tsx' | wc -l
```

Decompose each route into discrete testable capabilities:

- **List page**: renders, filters, sort, column management, create button
- **Detail page**: each tab/sub-tab loads
- **Actions**: each modal (delete, migrate, clone, stop, restart, etc.)
- **Forms/Wizards**: each step renders, template catalog browsing
- **Navigation**: sidebar items, perspective switching, project switching

### Phase 3: Test Inventory (spec scanning)

Count spec files and tests per tier:

```bash
# Spec file counts per tier
for tier in gating tier1 tier2 settings api; do
  files=$(rg --files playwright/tests/$tier --glob '*.spec.ts' | wc -l)
  tests=$(rg -c 'test\(' playwright/tests/$tier --glob '*.spec.ts' \
    | awk -F: '{s+=$2}END{print s+0}')
  echo "$tier: $files specs, $tests tests"
done

# List all test names for coverage mapping
rg 'test\(' playwright/tests/ --glob '*.spec.ts' --no-heading -N
```

### Phase 4: Coverage Mapping

Merge signals from Phase 1 (automation ID cross-reference) and Phase 2 (feature enumeration):

| Status       | Criteria                                                                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TESTED**   | A Playwright spec explicitly exercises this capability (navigates to it, interacts, asserts). Automation ID cross-reference is supplemental evidence. |
| **PARTIAL**  | A spec exists for the route but doesn't exercise this specific sub-feature, or only some aspects are covered.                                         |
| **UNTESTED** | No Playwright spec touches this capability. Missing automation IDs reinforce the gap but are not the sole criterion.                                  |

### Phase 5: Scoring

Per-route:

```
tested_count = TESTED + (PARTIAL * 0.5)
total = TESTED + PARTIAL + UNTESTED
score = (tested_count / total) * 100
```

### Phase 6: Proposals

For each UNTESTED capability:

1. **Find existing spec** in the appropriate tier directory
2. **Generate proposal**: EXTEND existing spec or NEW spec file
3. Proposals use:
   - `gatingTest` fixture for gating tests
   - `scenarioTest` fixture for tier1/tier2/settings tests
   - `apiClient` (`RequestContextClient`) for K8s setup
   - UI-based navigation (never `page.goto`)

### Phase 7: Output

Render the structured report to CLI.

### Phase 8 (only with `--compare`): Branch Comparison

When `--compare=<branch>` is provided, re-run Phases 1-4 against the comparison
branch using `git show` and `git grep` (never checkout), then compute deltas.

```bash
# Verify branch exists
git rev-parse --verify <branch> 2>/dev/null

# Phase 1 on <branch>: extract automation IDs from branch src/
{
  git grep -h 'data-test="' <branch> -- 'src/**/*.tsx' 'src/**/*.ts' \
    | perl -nle 'print $1 if /data-test="([^"]+)"/'
  git grep -h 'data-test=\{`' <branch> -- 'src/**/*.tsx' 'src/**/*.ts' \
    | perl -nle 'print $1 if /data-test=\{`([^$`]+)/'
} | sort -u > /tmp/compare-src-ids.txt

# Phase 1 on <branch>: extract Playwright refs
{
  git grep -h 'testId\|getByTestId' <branch> -- 'playwright/**/*.ts' \
    | perl -nle 'print $1 if /(?:testId|getByTestId)\(['\''"]([^'\''"]+)/'
  git grep -h '\[data-test="' <branch> -- 'playwright/**/*.ts' \
    | perl -nle 'print $1 if /\[data-test="([^"]+)"/'
  git grep -h '\[data-test-id="' <branch> -- 'playwright/**/*.ts' \
    | perl -nle 'print $1 if /\[data-test-id="([^"]+)"/'
} | sort -u > /tmp/compare-pw-ids.txt

# Phase 2-3 on <branch>: feature and test inventory
git ls-tree -r --name-only <branch> -- src/views/ | sort
git ls-tree -r --name-only <branch> -- playwright/tests/ | sort
# Read individual spec files as needed:
git show <branch>:playwright/tests/<path>

# Compute deltas between current branch and <branch> results
# Report: new coverage, removed coverage, changed scores
```

## Output Template

```markdown
## Coverage Analysis: Virtualization Module

**Source of truth:** Repository (current branch)
**Scope:** <scope> | **Method:** automation ID cross-reference + feature-surface enumeration
**Overall coverage:** XX% (YY/ZZ testable capabilities covered by Playwright tests)

### Automation ID Cross-Reference Summary

| Metric                                           | Count     |
| ------------------------------------------------ | --------- |
| data-test IDs defined in src/                    | NNN       |
| data-test values defined in src/                 | NNN       |
| IDs referenced in Playwright                     | NNN       |
| src/ IDs covered by tests                        | NNN (XX%) |
| src/ IDs uncovered                               | NNN (XX%) |
| Playwright refs from external (Console SDK / PF) | NNN       |

### Uncovered Elements by Feature Area

| Feature Area      | Uncovered IDs | Element Types          | Impact                 |
| ----------------- | ------------- | ---------------------- | ---------------------- |
| migrationpolicies | 9             | List columns           | HIGH — page loads only |
| storagemigrations | 5             | List cells             | HIGH — no spec files   |
| clusteroverview   | 7             | Migrations table cells | MEDIUM                 |
| ...               | ...           | ...                    | ...                    |

> **Note:** vmnetworks is excluded (owned by a separate team).

### Per-Route Breakdown

| Route           | Implemented Features | Tested | Partial | Untested | Coverage |
| --------------- | -------------------- | ------ | ------- | -------- | -------- |
| VMs (list/tree) | 12                   | 6      | 1       | 5        | 54%      |
| Wizard          | 14                   | 8      | 1       | 5        | 61%      |
| ...             | ...                  | ...    | ...     | ...      | ...      |

### Priority Gaps (ordered by impact)

| #   | Route      | Untested Feature | Uncovered IDs           | Proposal                          |
| --- | ---------- | ---------------- | ----------------------- | --------------------------------- |
| 1   | migpol     | List cell values | migration-policy-name…  | EXTEND: tier1/migrationpolicies/… |
| 2   | storagemig | All list cells   | storage-migration-name… | NEW: tier2/storagemigrations/…    |

### Summary Statistics

| Metric                      | Value |
| --------------------------- | ----- |
| Routes analyzed             | N     |
| Total testable capabilities | ZZ    |
| Capabilities tested         | YY    |
| Automation ID coverage      | XX%   |
| Gaps identified             | NN    |
| Proposals generated         | PP    |
| Spec files (gating)         | N     |
| Spec files (tier1)          | N     |
| Spec files (tier2)          | N     |
| Spec files (settings)       | N     |
```

## UI Automation ID Convention

This project uses a **hybrid approach** for UI automation identifiers:

- **`data-test` prop** — used on data-test-compliant PatternFly components (Button, Card, TextInput, Switch, Modal, Toolbar, Checkbox, Radio, Title, DropdownItem, Table, Tr, Menu, Alert, Select). PF renders `data-test` and `data-data-test-component-type` automatically.
- **`data-test` attribute** — used on plain HTML elements (span, div, a) and non-data-test PF/custom components (MenuToggle, EmptyState, SelectOption, DescriptionItem, etc.).

In Playwright:

- `this.testId('id')` → matches `data-test` attributes (via `testIdAttribute: 'data-test'` in config)
- `this.page.getByTestId('id')` → matches `data-test` attributes
- `[data-test="id"]` / `[data-test-id="id"]` → CSS attribute selectors

## Rules

- **NEVER modify code** — this command is purely analytical
- **NEVER create branches or commits**
- **NEVER run tests** — only scan spec files
- **NEVER checkout another branch** — `--compare` uses `git ls-tree` and `git show`
- Use `rg` for fast spec file scanning (not `grep`)
- Report results even if partial data is available
- Automation ID cross-reference is the primary coverage signal — always include it
- External IDs (Console SDK, PatternFly) are reported but not counted as gaps
