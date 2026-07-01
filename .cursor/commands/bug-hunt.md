# Bug Hunt

Systematically explore the live KubeVirt UI, replaying user workflows mapped from existing test cases. Find visual, functional, or UX issues and cross-reference each finding with Jira.

## Input

```
/bug-hunt <module>
```

### Available Modules

| Module               | Console route (after perspective switch)                              | Test specs in                       |
| -------------------- | --------------------------------------------------------------------- | ----------------------------------- |
| `catalog`            | `/catalog`                                                            | `tests/scenario/`, `tests/gating/`  |
| `vms`                | `/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine`                   | `tests/scenario/`, `tests/gating/`  |
| `templates`          | `/k8s/all-namespaces/template.openshift.io~v1~Template`               | `tests/scenario/`, `tests/gating/`  |
| `bootable-volumes`   | `/k8s/all-namespaces/bootablevolumes`                                 | `tests/scenario/`, `tests/gating/`  |
| `instance-types`     | `/k8s/all-namespaces/instancetypes`                                   | `tests/scenario/`, `tests/gating/`  |
| `overview`           | `/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine` (landing page)    | `tests/scenario/`, `tests/gating/`  |
| `migration-policies` | `/k8s/all-namespaces/migrationpolicies`                               | `tests/scenario/`, `tests/gating/`  |
| `settings`           | `/k8s/all-namespaces/virtualization-settings`                         | `tests/scenario/`, `tests/gating/`  |

> **Note:** `/virtualization/vms` and similar `/virtualization/*` paths are **not valid on localhost**. The console uses K8s-style routes after switching to the Virtualization perspective via `overviewPage.switchToVirtualization()`.

## Workflow

### Phase 1: Build the Interaction Plan

Before opening a browser, study existing test coverage to build a map of workflows to replay.

1. **Find spec files** for the module in both directories:
   ```bash
   rg -l "<module-keyword>" playwright/tests/scenario/ --type ts
   rg -l "<module-keyword>" playwright/tests/gating/ --type ts
   ```
2. **Read each spec file** and extract every `test()` — these are the user workflows
3. **Build an Interaction Plan**:

```markdown
| #   | Source Test   | Workflow                | Key Interactions                                                    |
| --- | ------------- | ----------------------- | ------------------------------------------------------------------- |
| 1   | `spec.ts:L42` | Create VM from template | Navigate catalog → select RHEL9 → fill name → Create → wait Running |
| 2   | `spec.ts:L85` | Filter VMs by status    | Open filter → select Running → verify filtered                      |
```

### Phase 2: Replay Workflows

Using Playwright MCP:

```
Playwright-browser_resize → 1920x1080
Playwright-browser_navigate → <URL>
Playwright-browser_snapshot → inspect elements
Playwright-browser_click → interact
Playwright-browser_take_screenshot → evidence
Playwright-browser_console_messages → JS errors
Playwright-browser_network_requests → API calls
```

For each workflow in the Interaction Plan:

1. Navigate to the starting page
2. Replay interactions from the test steps
3. At each step, check for:
   - Visual issues (layout, overlaps, missing elements)
   - Functional issues (actions don't work, wrong data)
   - Console errors
   - Failed network requests
4. Capture screenshot evidence for any issue found

### Phase 3: Issue Documentation

For each issue found:

```markdown
### Issue #N: <Short Title>

**Category:** Functional / Visual / Data / Error / UX
**Severity:** Critical / Major / Minor / Cosmetic
**Found during:** Workflow #X — <workflow name>
**Page:** <URL path>

**Steps to reproduce:**

1. Navigate to ...
2. Click ...
3. Observe ...

**Expected result:** <what should happen>
**Actual result:** <what actually happens>

**Evidence:**

- Screenshot: <filename>
- Console errors: <if any>
- Network failures: <if any>
```

### Phase 4: Jira Cross-Reference

For each documented issue, search Jira for existing tickets:

```bash
rg "<keywords>" --type ts playwright/tests/
```

Classify each match:

| Match type                 | Meaning                                    |
| -------------------------- | ------------------------------------------ |
| **Exact match**            | Jira ticket describes the same issue       |
| **Related**                | Similar area but not the exact issue       |
| **Fixed but not deployed** | Merged PR exists but not on this cluster   |
| **No match**               | New finding — candidate for new bug report |

### Phase 5: Bug Hunt Report

```markdown
# Bug Hunt Report: <Module>

## Summary

- **Module explored:** <module>
- **Workflows replayed:** <count>
- **Issues found:** <count>
- **Already reported in Jira:** <count>
- **New findings:** <count>

## Issues Found

### Issue #1: <Title>

| Field      | Value                                   |
| ---------- | --------------------------------------- |
| Category   | Functional / Visual / Data / Error / UX |
| Severity   | Critical / Major / Minor / Cosmetic     |
| Workflow   | #X — <name>                             |
| Jira Match | CNV-XXXXX (Exact / Related / None)      |

## New Findings (No Existing Jira Ticket)

| #   | Title | Category | Severity | Suggested Jira Summary |
| --- | ----- | -------- | -------- | ---------------------- |

## Recommendations

1. **File new bugs:** <list>
2. **Verify fixes:** <ON_QA tickets to verify>
3. **Test gaps:** <workflows needing new tests>
```

## Rules

- **Read-only** — do not modify code, create branches, or commit
- **Match Playwright viewport** — 1920x1080
- **Evidence-first** — every issue needs screenshot + snapshot
- **Don't fix** — report issues, don't try to fix the app or tests
- **Distinguish test bugs from app bugs** — wrong assertions are test issues, not app bugs
- **Be thorough but targeted** — replay workflows from test cases, don't randomly click
