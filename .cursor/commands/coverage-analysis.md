# Coverage Analysis

Read-only coverage assessment of the virtualization module. The **repository is the single source of truth** — features are enumerated from `src/views/` and coverage is determined by scanning `playwright/tests/**/*.spec.ts`.

## Input

```
/coverage-analysis [scope] [options]
```

| Scope                | What is analyzed                                                            |
| -------------------- | --------------------------------------------------------------------------- |
| _(none)_ / `all`     | All virtualization routes                                                   |
| `vms`                | VirtualMachines list, detail, tree, search                                  |
| `vm-detail`          | VM Detail tabs (overview, config, diagnostics, metrics, console, snapshots) |
| `vm-actions`         | VM lifecycle actions (start, stop, migrate, clone, delete)                  |
| `wizard`             | VM Creation Wizard (all steps)                                              |
| `templates`          | Templates list, detail                                                      |
| `bootable-volumes`   | Bootable Volumes list, detail, create                                       |
| `instance-types`     | Instance Types list, detail                                                 |
| `migration-policies` | Migration Policies list, detail, create                                     |
| `migrations`         | Migrations (compute + storage)                                              |
| `quotas`             | Quotas list, detail, create, edit                                           |
| `checkups`           | Checkups list, detail, forms                                                |
| `settings`           | Virtualization Settings                                                     |
| `overview`           | Overview / Landing dashboard                                                |

### Options

| Option               | Default  | Description                                                                          |
| -------------------- | -------- | ------------------------------------------------------------------------------------ |
| `--enrich`           | off      | Extend with git commit history and Jira ticket data (requires VPN for Jira)          |
| `--type=features`    | features | (Only with `--enrich`) Ticket types: `features`, `bugs`, or `all`                    |
| `--since=3months`    | 3 months | (Only with `--enrich`) Commit history lookback                                       |
| `--compare=<branch>` | off      | Compare current branch coverage against another branch (e.g. `main`, `release-4.17`) |

### Examples

```
/coverage-analysis                                     # Full module, repo-only (default)
/coverage-analysis migrations                          # Migrations sub-group only
/coverage-analysis --enrich                            # Full module + Jira/commit enrichment
/coverage-analysis vms --enrich --type=all             # VMs with bugs included
/coverage-analysis --compare=main                      # Compare current branch vs main
/coverage-analysis --compare=release-4.17              # Compare against a release branch
/coverage-analysis wizard --compare=main               # Compare wizard coverage vs main
/coverage-analysis --compare=main --enrich             # Comparison + Jira/commit enrichment
```

## Constraints

- **Read-only** — no code changes, no branch creation, no test execution, no checkout of other branches
- **Repo is the source of truth** — if a feature is in `src/views/`, it counts; if removed, it doesn't
- **No external dependencies by default** — base analysis works offline on any clone
- **Deterministic** — same checkout yields identical results
- **Playwright tests only** — Jest/unit tests do NOT count as coverage
- **Virtualization module only** — Fleet/ACM routes excluded
- **Networking excluded** — owned by a separate team, always excluded
- **Comparison is non-destructive** — `--compare` reads the other branch via `git show`/`git ls-tree`, never checks it out

## Test Grouping Structure

Tests are organized into tiers. Proposals must target the correct tier:

| Tier         | Directory   | Purpose                                       | Resource Creation |
| ------------ | ----------- | --------------------------------------------- | ----------------- |
| **Gating**   | `gating/`   | Smoke tests, page loads, filters, navigation  | None              |
| **Tier 1**   | `tier1/`    | Feature workflows requiring resource creation | Yes               |
| **Settings** | `settings/` | Serial cluster/user settings                  | Minimal (toggles) |
| **Non-Priv** | `nonpriv/`  | RBAC boundary tests                           | Uses pre-existing |
| **API**      | `api/`      | Browserless console-proxy contract tests      | Yes (via API)     |

### Tier 1 Sub-Groups

| Sub-Group          | Directory                                     | Runner Command          |
| ------------------ | --------------------------------------------- | ----------------------- |
| Wizard             | `tier1/create-vm/`                            | `t1-wizard`             |
| VM List            | `tier1/virtualmachines/vm-list/`              | `t1-vm-list`            |
| VM Tabs            | `tier1/virtualmachines/vm-tabs/`              | `t1-vm-tabs`            |
| VM Actions         | `tier1/virtualmachines/vm-actions/`           | `t1-vm-actions`         |
| VM Overview        | `tier1/virtualmachines/vm-overview-redesign/` | `t1-vm-overview`        |
| Migrations         | `tier1/virtualmachines/migrations/`           | `t1-migrations`         |
| Templates          | `tier1/templates/`                            | `t1-templates`          |
| Bootable Volumes   | `tier1/bootable-volumes/`                     | `t1-bootable-volumes`   |
| Instance Types     | `tier1/instanceTypes/`                        | `t1-instance-types`     |
| Migration Policies | `tier1/migrationpolicies/`                    | `t1-migration-policies` |
| Overview           | `tier1/overview/`                             | `t1-overview`           |
| Checkups           | `tier1/checkups/`                             | `t1-checkups`           |

## Workflow

### Phase 1: Feature Inventory (source enumeration)

Enumerate testable capabilities from `src/views/` for each route in scope:

```bash
# List sub-features per route
find src/views/<route> -maxdepth 3 -type d | sort

# Count source complexity
find src/views/<route> -name '*.tsx' -o -name '*.ts' | wc -l
```

Decompose each route into discrete testable capabilities:

- **List page**: renders, filters, sort, column management, bulk actions, create button, CSV export
- **Detail page**: each tab/sub-tab loads, inline edits, action menus
- **Actions**: each modal (delete, migrate, clone, stop, restart, etc.)
- **Forms/Wizards**: each step renders, validation, submission, review
- **CRUD**: create via YAML, create via form, edit, delete

### Phase 2: Test Inventory (spec scanning)

For each route, scan all relevant test directories (gating + tier1 sub-group + settings + nonpriv + api):

```bash
# Count test cases per route test directory
rg -c "test\('" playwright/tests/<test-path>/ --type ts

# List test names for feature matching
rg "test\('" playwright/tests/<test-path>/ --type ts --no-heading -N
```

### Phase 3: Coverage Mapping

For each capability from Phase 1, determine coverage status by matching against Phase 2 test names:

| Status       | Criteria                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------- |
| **TESTED**   | A Playwright test explicitly exercises this capability (navigates to it, interacts, asserts) |
| **PARTIAL**  | A spec file exists for the route but doesn't exercise this specific sub-feature              |
| **UNTESTED** | No Playwright test touches this capability                                                   |

### Phase 4: Scoring

Per-route:

```
tested_count = TESTED + (PARTIAL * 0.5)
total = TESTED + PARTIAL + UNTESTED
score = (tested_count / total) * 100
```

### Phase 5: Proposals

For each UNTESTED capability:

1. **Determine target tier** based on resource requirements:
   - No resource creation → Gating (`gating/`)
   - Creates resources → Tier 1 (appropriate sub-group from table above)
   - Serial cluster-wide → Settings (`settings/`)
2. **Find existing spec** in the target directory
3. **Generate proposal**: EXTEND existing spec or NEW spec file

### Phase 6: Output

Render the structured report to CLI.

### Phase 7 (only with `--compare`): Branch Comparison

When `--compare=<branch>` is provided, run Phases 1-4 against the comparison branch
using git tree inspection (without checking it out), then compute deltas.

#### 7a. Comparison-branch inventory (read-only via git)

```bash
# Verify the comparison branch exists
git rev-parse --verify <branch> 2>/dev/null

# Feature inventory on comparison branch
git ls-tree -r --name-only <branch> -- src/views/ | sort

# Test inventory on comparison branch
git ls-tree -r --name-only <branch> -- playwright/tests/ | sort

# Read a specific file from the comparison branch (when needed for test-name matching)
git show <branch>:playwright/tests/<path>
```

#### 7b. Diff computation

For each route in scope, compute:

- **Features added**: source paths present on current branch but absent on `<branch>`
- **Features removed**: source paths present on `<branch>` but absent on current branch
- **Tests added**: spec files or test cases present on current branch but absent on `<branch>`
- **Tests removed**: spec files or test cases present on `<branch>` but absent on current branch
- **Coverage delta**: `current_score - comparison_score` per route
- **New gaps**: features added on current branch that have no corresponding test
- **Gaps closed**: features that were UNTESTED on `<branch>` but are now TESTED

#### 7c. Per-file diff detail

```bash
# Files changed between branches (scoped to views + tests)
git diff --name-status <branch>...HEAD -- src/views/ playwright/tests/

# Detailed stat for test files
git diff --stat <branch>...HEAD -- playwright/tests/
```

### Phase 8 (only with `--enrich`): Addendum

When `--enrich` is provided, append a supplementary section:

- Git commit scan (`git log --since="3 months ago" -- src/views/`)
- Jira REST API queries for ticket context
- Untracked commits (no CNV-XXXXX reference)
- This section adds context but does NOT change coverage percentages

## Output Template

```markdown
## Coverage Analysis: Virtualization Module

**Source of truth:** Repository (current branch)
**Scope:** <scope> | **Method:** Feature-surface enumeration from src/views/
**Overall coverage:** XX% (YY/ZZ testable capabilities covered by Playwright tests)
**Comparison:** <comparison-branch> (only when --compare is used)

### Per-Route Breakdown

| Route           | Implemented Features | Tested | Partial | Untested | Coverage |
| --------------- | -------------------- | ------ | ------- | -------- | -------- |
| VMs (list/tree) | 12                   | 10     | 1       | 1        | 88%      |
| Wizard          | 14                   | 12     | 1       | 1        | 89%      |
| Quotas          | 5                    | 1      | 0       | 4        | 20%      |
| ...             | ...                  | ...    | ...     | ...      | ...      |

### Feature-Level Detail (per route)

| Feature        | Status   | Test Evidence                                 |
| -------------- | -------- | --------------------------------------------- |
| List renders   | TESTED   | scenario-virtualization-pages                 |
| Bulk selection | UNTESTED | src/views/.../VirtualMachineSelection/ exists |

### Priority Gaps (ordered by impact)

| #   | Route      | Untested Feature  | Source Evidence              | Proposal                                       |
| --- | ---------- | ----------------- | ---------------------------- | ---------------------------------------------- |
| 1   | Quotas     | List, create form | src/views/quotas/ (48 files) | NEW: tier1/quotas/quotas-crud.spec.ts          |
| 2   | VM Actions | Pause/Unpause     | actions/components/          | EXTEND: tier1/.../vm-lifecycle-actions.spec.ts |

### Coverage Extension Proposals (ordered by priority)

1. **NEW** `tests/tier1/quotas/quotas-crud.spec.ts`

   - Cover: list page, create form, detail tabs, delete
   - Target sub-group: t1-quotas (new)
   - Estimated effort: new spec + page object

2. **EXTEND** `tests/tier1/virtualmachines/vm-actions/vm-lifecycle-actions.spec.ts`
   - Add: pause/unpause, multi-VM bulk actions
   - Target sub-group: t1-vm-actions
   - Estimated effort: 2-3 test cases (~60 lines)

### Route Health Map

EXCELLENT (90-100%): Settings, Bootable Volumes, Wizard, VM List
GOOD (70-89%): VM Detail, Instance Types, Migrations
FAIR (50-69%): VM Actions, Templates, Checkups, Overview
CRITICAL (< 50%): Quotas

### Summary Statistics

| Metric                      | Value |
| --------------------------- | ----- |
| Routes analyzed             | 13    |
| Total testable capabilities | ZZ    |
| Capabilities tested         | YY    |
| Gaps identified             | NN    |
| Proposals generated         | PP    |
| Source files scanned        | XXXX  |
| Playwright spec files       | FF    |
| Playwright test cases       | TT    |
```

### Branch Comparison (only with `--compare`)

When `--compare` is used, insert this section before the Enrichment Addendum:

```markdown
---

## Branch Comparison: <current-branch> vs <comparison-branch>

**Base branch:** <comparison-branch> (commit <short-sha>)
**Head branch:** <current-branch> (commit <short-sha>)

### Coverage Delta

| Route           | <comparison-branch> | <current-branch> | Delta   | Direction |
| --------------- | ------------------- | ---------------- | ------- | --------- |
| VMs (list/tree) | 75%                 | 88%              | +13%    | ▲         |
| Wizard          | 89%                 | 89%              | 0%      | ─         |
| Quotas          | 0%                  | 20%              | +20%    | ▲         |
| Templates       | 70%                 | 65%              | -5%     | ▼         |
| ...             | ...                 | ...              | ...     | ...       |
| **Overall**     | **62%**             | **71%**          | **+9%** | **▲**     |

### New Features (in <current-branch>, absent from <comparison-branch>)

| Route  | Feature                | Source Path                         | Test Status |
| ------ | ---------------------- | ----------------------------------- | ----------- |
| Quotas | Quota create form      | src/views/quotas/form/              | UNTESTED    |
| Wizard | Storage migration step | src/views/.../StorageMigrationStep/ | TESTED      |

### Removed Features (in <comparison-branch>, absent from <current-branch>)

| Route     | Feature              | Source Path (on <comparison-branch>) |
| --------- | -------------------- | ------------------------------------ |
| Templates | Legacy template edit | src/views/templates/LegacyEdit/      |

### New Tests (in <current-branch>, absent from <comparison-branch>)

| Spec File                                            | Test Cases Added | Routes Covered  |
| ---------------------------------------------------- | ---------------- | --------------- |
| tier1/quotas/quotas-crud.spec.ts                     | 4                | Quotas          |
| tier1/virtualmachines/vm-list/vm-list-search.spec.ts | 6                | VMs (list/tree) |

### Removed Tests (in <comparison-branch>, absent from <current-branch>)

| Spec File                                | Test Cases Removed | Routes Affected |
| ---------------------------------------- | ------------------ | --------------- |
| tier1/templates/templates-legacy.spec.ts | 3                  | Templates       |

### Gaps Closed (UNTESTED on <comparison-branch> → TESTED on <current-branch>)

| Route | Feature           | Closed By                                   |
| ----- | ----------------- | ------------------------------------------- |
| VMs   | Column management | tier1/.../vm-list-column-management.spec.ts |
| VMs   | Bulk actions      | tier1/.../vm-list-bulk-actions.spec.ts      |

### New Gaps (features added without test coverage)

| Route  | Feature           | Source Evidence               | Priority |
| ------ | ----------------- | ----------------------------- | -------- |
| Quotas | Quota edit form   | src/views/quotas/EditForm/    | HIGH     |
| Quotas | Quota detail page | src/views/quotas/QuotaDetail/ | HIGH     |

### Change Summary

| Metric                      | <comparison-branch> | <current-branch> | Delta |
| --------------------------- | ------------------- | ---------------- | ----- |
| Total testable capabilities | 95                  | 102              | +7    |
| Capabilities tested         | 59                  | 72               | +13   |
| Capabilities untested       | 36                  | 30               | -6    |
| Spec files                  | 28                  | 31               | +3    |
| Test cases                  | 142                 | 168              | +26   |
| Source files (src/views/)   | 480                 | 512              | +32   |
```

### Enrichment Addendum (only with `--enrich`)

When `--enrich` is used, append after the base report:

```markdown
---

## Enrichment Addendum (commit history + Jira)

### Ticket Coverage (Jira cross-reference)

| Ticket    | Type  | Summary | Route    | Status   |
| --------- | ----- | ------- | -------- | -------- |
| CNV-XXXXX | Story | ...     | Wizard   | COVERED  |
| CNV-YYYYY | Epic  | ...     | Settings | UNTESTED |

### Untracked Commits (no Jira reference)

| Commit | Message                     | Files touched                  |
| ------ | --------------------------- | ------------------------------ |
| abc123 | Refactor wizard step layout | src/views/.../creation-wizard/ |
```

## Integration with `/create-test`

After running `/coverage-analysis`, use `/create-test --from-coverage` to implement the proposals:

```
/create-test --from-coverage                          # Implement all proposals on a single branch
/create-test --from-coverage --limit=3                # Top 3 only
/create-test --from-coverage --type=extend            # Annotation additions only
/create-test --from-coverage --scope=templates        # Re-run analysis scoped to templates, then implement
```

The proposals section output is designed to be consumed directly by `/create-test --from-coverage`. Each proposal includes the action (EXTEND/NEW), target file, ticket IDs, and effort estimate needed for the batch workflow.

## Rules

- **NEVER modify code** — this command is purely analytical
- **NEVER create branches or commits**
- **NEVER run tests** — only scan spec files for annotations
- **NEVER use MCP tools** — this command uses only `rg`, `find`, `git`, and `curl`
- **NEVER checkout another branch** — `--compare` uses `git ls-tree` and `git show` to read the comparison branch without switching
- Use `rg` for fast spec file scanning (not `grep`)
- Base analysis is always repo-only; `--enrich` adds Jira/git context as addendum
- Query Jira directly via `curl` only when `--enrich` is set
- If Jira is unreachable with `--enrich`, fall back to commit history only
- Proposals must target the correct tier and sub-group per the grouping table
- Migrations tests (compute + storage) always go to `tier1/virtualmachines/migrations/`
- Report results even if partial data is available
- `--compare` requires the branch to exist locally or as a remote ref; if the branch is not found, abort with a clear error message
- When `--compare` is combined with `--enrich`, the enrichment addendum covers only the current branch (not the comparison branch)
- Coverage deltas use the same scoring formula as Phase 4; direction indicators: ▲ (improved), ▼ (regressed), ─ (unchanged)
