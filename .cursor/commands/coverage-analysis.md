# Coverage Analysis

Read-only coverage assessment of the virtualization module. The **repository is the single source of truth** — features are enumerated from `src/views/` and coverage is determined by scanning both `playwright/tests/scenario/*.spec.ts` (new) and `playwright/tests/gating/*.spec.ts` (legacy).

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

## Test Infrastructure Note

This project has two test infrastructures:

| Infrastructure      | Directory                    | Fixture                                           | Status                      |
| ------------------- | ---------------------------- | ------------------------------------------------- | --------------------------- |
| **Scenario** (new)  | `playwright/tests/scenario/` | `scenarioTest` from `@/fixtures/scenario-fixture` | Active — new tests go here  |
| **Gating** (legacy) | `playwright/tests/gating/`   | `gatingTest` from `scenario-test-fixture`         | Frozen — no new tests added |

Coverage analysis scans **both** directories. Proposals for new coverage always target `playwright/tests/scenario/`.

## Constraints

- **Read-only** — no code changes, no branch creation, no test execution, no checkout of other branches
- **Repo is the source of truth** — if a feature is in `src/views/`, it counts; if removed, it doesn't
- **No external dependencies** — base analysis works offline on any clone
- **Deterministic** — same checkout yields identical results
- **Playwright tests only** — Jest/unit tests do NOT count as coverage
- **Virtualization module only** — Fleet/ACM routes excluded
- **Networking excluded** — owned by a separate team, always excluded
- **Comparison is non-destructive** — `--compare` reads the other branch via `git show`/`git ls-tree`, never checks it out

## Test Structure

Tests are organized across two directories:

| Directory                    | Purpose                                 |
| ---------------------------- | --------------------------------------- |
| `playwright/tests/scenario/` | New scenario tests (POC infrastructure) |
| `playwright/tests/gating/`   | Legacy gating tests                     |

## Workflow

### Phase 1: Feature Inventory (source enumeration)

Enumerate testable capabilities from `src/views/` for each route in scope:

```bash
find src/views/<route> -maxdepth 3 -type d | sort
find src/views/<route> -name '*.tsx' -o -name '*.ts' | wc -l
```

Decompose each route into discrete testable capabilities:

- **List page**: renders, filters, sort, column management, create button
- **Detail page**: each tab/sub-tab loads
- **Actions**: each modal (delete, migrate, clone, stop, restart, etc.)
- **Forms/Wizards**: each step renders, template catalog browsing
- **Navigation**: sidebar items, perspective switching, project switching

### Phase 2: Test Inventory (spec scanning)

Scan **both** test directories:

```bash
rg -c "test\('" playwright/tests/scenario/ --type ts
rg -c "test\('" playwright/tests/gating/ --type ts
rg "test\('" playwright/tests/scenario/ playwright/tests/gating/ --type ts --no-heading -N
```

### Phase 3: Coverage Mapping

For each capability from Phase 1, determine coverage status:

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

1. **Find existing spec** in `playwright/tests/scenario/`
2. **Generate proposal**: EXTEND existing scenario spec or NEW scenario spec file
3. All proposals target `playwright/tests/scenario/` (never legacy gating)
4. Proposals use the `scenarioTest` fixture with page objects injected via fixture and `apiClient` (`RequestContextClient`) for K8s setup

### Phase 6: Output

Render the structured report to CLI.

### Phase 7 (only with `--compare`): Branch Comparison

When `--compare=<branch>` is provided, run Phases 1-4 against the comparison branch
using git tree inspection (without checking it out), then compute deltas.

```bash
git rev-parse --verify <branch> 2>/dev/null
git ls-tree -r --name-only <branch> -- src/views/ | sort
git ls-tree -r --name-only <branch> -- playwright/tests/ | sort
git show <branch>:playwright/tests/<path>
```

## Output Template

```markdown
## Coverage Analysis: Virtualization Module

**Source of truth:** Repository (current branch)
**Scope:** <scope> | **Method:** Feature-surface enumeration from src/views/
**Overall coverage:** XX% (YY/ZZ testable capabilities covered by Playwright tests)

### Per-Route Breakdown

| Route           | Implemented Features | Tested | Partial | Untested | Coverage |
| --------------- | -------------------- | ------ | ------- | -------- | -------- |
| VMs (list/tree) | 12                   | 6      | 1       | 5        | 54%      |
| Wizard          | 14                   | 8      | 1       | 5        | 61%      |
| ...             | ...                  | ...    | ...     | ...      | ...      |

### Priority Gaps (ordered by impact)

| #   | Route     | Untested Feature | Source Evidence      | Proposal                             |
| --- | --------- | ---------------- | -------------------- | ------------------------------------ |
| 1   | Settings  | Live migration   | src/views/settings/  | EXTEND: scenario/settings.spec.ts    |
| 2   | Templates | Clone action     | src/views/templates/ | NEW: scenario/template-clone.spec.ts |

### Summary Statistics

| Metric                      | Value |
| --------------------------- | ----- |
| Routes analyzed             | 9     |
| Total testable capabilities | ZZ    |
| Capabilities tested         | YY    |
| Gaps identified             | NN    |
| Proposals generated         | PP    |
| Scenario spec files         | N     |
| Legacy gating spec files    | N     |
```

## Rules

- **NEVER modify code** — this command is purely analytical
- **NEVER create branches or commits**
- **NEVER run tests** — only scan spec files
- **NEVER checkout another branch** — `--compare` uses `git ls-tree` and `git show`
- Use `rg` for fast spec file scanning (not `grep`)
- Proposals target `playwright/tests/scenario/` only (never legacy gating)
- Report results even if partial data is available
