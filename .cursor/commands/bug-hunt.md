# Bug Hunt

Systematically explore the live KubeVirt UI, replaying user workflows mapped from existing test cases. Find visual, functional, or UX issues and cross-reference each finding with Jira.

## Input

```
/bug-hunt <module>
```

### Available Modules

| Module               | Starting URL path                   | Test specs in                                    |
| -------------------- | ----------------------------------- | ------------------------------------------------ |
| `catalog`            | `/catalog`                          | `tests/gating/`, `tests/tier1/catalog/`          |
| `vms`                | `/virtualization/vms`               | `tests/tier1/virtualmachines/`, `tests/gating/`  |
| `templates`          | `/virtualization/templates`         | `tests/tier1/templates/`, `tests/gating/`        |
| `bootable-volumes`   | `/virtualization/bootablevolumes`   | `tests/tier1/bootable-volumes/`, `tests/gating/` |
| `instance-types`     | `/virtualization/instancetypes`     | `tests/tier1/instanceTypes/`                     |
| `overview`           | `/virtualization`                   | `tests/tier1/overview/`                          |
| `migration-policies` | `/virtualization/migrationpolicies` | `tests/tier1/migrationpolicies/`                 |
| `checkups`           | `/virtualization/checkups`          | `tests/tier1/checkups/`                          |
| `settings`           | `/virtualization/settings`          | `tests/settings/`, `tests/gating/`               |
| `migrations`         | `/virtualization/migrations`        | `tests/migrations/`                              |

## Workflow

### Phase 1: Build the Interaction Plan

Before opening a browser, study existing test coverage to build a map of workflows to replay.

1. **Find spec files** for the module:
   ```bash
   rg -l "<module-keyword>" playwright/tests/ --type ts
   ```
2. **Read each spec file** and extract every `test()` and `test.step()` — these are the user workflows
3. **Read the corresponding STD** in `playwright/docs/` for high-level descriptions
4. **Scan page objects** used by the tests to understand interactions:
   ```bash
   rg "class.*Page" playwright/src/page-objects/ --type ts -l
   ```
5. **Build an Interaction Plan**:

```markdown
| #   | Source Test                 | Workflow                | Key Interactions                                                    |
| --- | --------------------------- | ----------------------- | ------------------------------------------------------------------- |
| 1   | `spec.ts:L42` ID(CNV-XXXXX) | Create VM from template | Navigate catalog → select RHEL9 → fill name → Create → wait Running |
| 2   | `spec.ts:L85` ID(CNV-YYYYY) | Filter VMs by status    | Open filter → select Running → verify filtered                      |
```

### Phase 2: Replay Workflows

#### Check tool availability

```bash
playwright-cli --version 2>/dev/null && echo "cli" || echo "no-cli"
```

#### With playwright-cli (preferred)

```bash
# Session setup
playwright-cli state-load playwright/mcp-validations/.auth/openshift-state.json
playwright-cli resize 1920 1080
playwright-cli tracing-start
```

For each workflow in the Interaction Plan:

```bash
# Navigate
playwright-cli goto <URL>
playwright-cli snapshot

# Replay interactions
playwright-cli click <ref>
playwright-cli fill <ref> <text>
playwright-cli snapshot     # verify after each action

# Check for issues at each step
playwright-cli console error     # JS errors
playwright-cli requests          # failed API calls
playwright-cli screenshot <issue>.png   # visual evidence
```

CRUD operations are a **primary directive** — exercise Create/Read/Update/Delete and capture network requests:

```bash
playwright-cli requests            # after each mutation
playwright-cli request <n>         # inspect the relevant request
```

Session teardown:

```bash
playwright-cli tracing-stop <output-dir>/session-trace.zip
playwright-cli close
```

#### With Playwright MCP (fallback)

```
Playwright-browser_resize → 1920x1080
Playwright-browser_navigate → <URL>
Playwright-browser_snapshot → inspect elements
Playwright-browser_click → interact
Playwright-browser_take_screenshot → evidence
Playwright-browser_console_messages → JS errors
Playwright-browser_network_requests → API calls
```

Note: no tracing/video, no state save/load, no locator generation with MCP fallback.

#### Without tools (raw agent)

If neither playwright-cli nor MCP is available:

- Read spec files and STDs to understand expected behavior
- Use `oc` commands to verify cluster-side state matches expectations
- Check for known issues via Jira search
- Document observations based on code analysis only (cannot verify UI visually)

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

For each documented issue, search Jira:

```bash
JQL='project = CNV AND component IN ("CNV User Interface", "CNV User Experience") AND type IN (Bug, Story) AND text ~ "<keywords>" ORDER BY updated DESC'

curl -s "https://redhat.atlassian.net/rest/api/3/search/jql?jql=$(node -e "process.stdout.write(encodeURIComponent('$JQL'))")&fields=key,summary,status,issuetype,fixVersions&maxResults=10" | node -e "
let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
  for(const issue of (JSON.parse(d).issues||[])){
    const f=issue.fields;
    const fv=(f.fixVersions||[]).map(v=>v.name).join(', ')||'None';
    console.log(issue.key+': ['+f.status.name+'] ['+fv+'] '+f.summary.slice(0,120));
  }
})"
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

| Field        | Value                                   |
| ------------ | --------------------------------------- |
| Category     | Functional / Visual / Data / Error / UX |
| Severity     | Critical / Major / Minor / Cosmetic     |
| Workflow     | #X — <name>                             |
| Jira Match   | CNV-XXXXX (Exact / Related / None)      |
| Fix Deployed | Yes / No / Unknown                      |

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
- **Artifact cleanup** — delete intermediate screenshots and logs after producing the final report
