# Test and Record

Validate a CNV feature ticket by replaying its test steps in a live browser session, recording segmented video evidence with chapters at each setup and validation point. Requires Playwright MCP.

## Input

```
/test-and-record <CNV-XXXXX>
/test-and-record <PR-URL>
/test-and-record <PR-NUMBER>
/test-and-record CNV-12345 CNV-67890
```

Accepts one or more items (space or comma-separated). Each item can be:

- **Jira ticket ID**: `CNV-XXXXX` — validates the feature described by the ticket
- **PR URL**: `https://github.com/kubevirt-ui/kubevirt-plugin/pull/1234` — extracts the CNV ticket from the PR title/body, then validates
- **PR number**: `#1234` or `1234` — shorthand for the kubevirt-plugin repo PR

## Prerequisites

- Auth state saved at `playwright/mcp-validations/.auth/openshift-state.json`
- Cluster accessible via `.env` (`WEB_CONSOLE_URL`)

---

## Workflow

### Phase 0: Environment Check and Auth

Check for saved auth state. If missing, authenticate using `.env` credentials via Playwright MCP:

1. Navigate to `$WEB_CONSOLE_URL` — redirects to OAuth login page
2. Wait for the login form
3. Fill `OPENSHIFT_USERNAME` and `OPENSHIFT_PASSWORD` from `.env`
4. Click "Log in" button
5. Wait for redirect to the console dashboard

If the saved state exists, load it and verify the session is valid.

---

### Phase 0.5: Input Resolution

Resolve the input to a CNV ticket ID and optional PR context.

#### If input is a PR URL or number:

1. **Fetch PR metadata** using `gh`:
   ```bash
   gh pr view <PR-NUMBER> --repo kubevirt-ui/kubevirt-plugin --json title,body,files,labels,headRefName
   ```
2. **Extract CNV ticket** from PR title or branch name
3. **Collect PR context**: changed files, new `data-test` attributes in the diff

#### If input is a CNV ticket ID:

Proceed directly to Phase 1.

---

### Phase 1: Ticket Resolution and Validation Plan

1. **Search for existing test coverage**:

   ```bash
   rg "CNV-XXXXX" playwright/tests/gating/
   rg "<feature-keyword>" playwright/tests/gating/ --type ts -l
   ```

2. **Read existing tests** that cover the same feature area to understand expected behavior

3. **Build the Validation Plan** from the ticket description and existing tests:

   ```markdown
   | Chapter | Type     | Action                            | Expected Result        |
   | ------- | -------- | --------------------------------- | ---------------------- |
   | 1       | Setup    | Create namespace + VM via API     | VM exists in namespace |
   | 2       | Navigate | Open VM list → select VM          | VM detail page visible |
   | 3       | Validate | Check Configuration → Storage tab | Disk rows present      |
   | 4       | Teardown | Delete namespace                  | Resources cleaned up   |
   ```

---

### Phase 2: Recording Session

Using Playwright MCP tools:

```
Playwright-browser_navigate → <URL>
Playwright-browser_snapshot → inspect elements
Playwright-browser_click → interact
Playwright-browser_take_screenshot → evidence per chapter
Playwright-browser_console_messages → JS errors
Playwright-browser_network_requests → API calls
```

For each chapter in the plan:

1. **Execute the action** (navigate, click, fill, etc.)
2. **Capture evidence** (screenshot + snapshot)
3. **Record the outcome** (pass/fail/blocked)

Save screenshots to `playwright/mcp-validations/<TICKET>/recording/`

---

### Phase 3: Results Report

Write to `playwright/mcp-validations/<TICKET>/recording/validation-report.md`:

```markdown
# Validation Report: <TICKET>

**Summary:** <ticket summary>
**Date:** <timestamp>
**Cluster:** <WEB_CONSOLE_URL>
**PR:** <PR URL or "N/A — direct ticket validation">

## Results

| Chapter | Type     | Action          | Expected       | Actual         | Status  |
| ------- | -------- | --------------- | -------------- | -------------- | ------- |
| 1       | Setup    | Create VM       | VM exists      | VM exists      | ✅ PASS |
| 2       | Navigate | Open VM detail  | Detail visible | Detail visible | ✅ PASS |
| 3       | Validate | Check disk size | Shows "30 GiB" | Shows "—"      | ❌ FAIL |

## Artifacts

- Screenshots: `chapter-1.png`, `chapter-2.png`, `chapter-3-failure.png`

## Findings

### ❌ Chapter 3: <Issue description>

- **Expected:** ...
- **Actual:** ...
- **Console errors:** ...

## Recommendations

- [ ] File bug if behavior is incorrect
- [ ] Add test coverage for this validation
```

---

## Output Structure

```
playwright/mcp-validations/<TICKET>/recording/
├── validation-report.md     # Results summary
├── chapter-1.png            # Screenshot per chapter
├── chapter-2.png
└── chapter-3-failure.png    # Extra screenshots for failures
```

## Rules

- **Always search for existing gating tests** before deriving steps manually
- **Capture screenshots at every validation point** regardless of pass/fail
- **Clean up all resources** created during the session
- **Never modify test code** — this command is read-only observation and recording
- The `playwright/mcp-validations/` directory is gitignored — recordings are local artifacts only
