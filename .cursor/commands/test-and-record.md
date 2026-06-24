# Test and Record

Validate a CNV feature ticket by replaying its test steps in a live browser session, recording segmented video evidence with chapters at each setup and validation point. Requires `playwright-cli`.

## Input

```
/test-and-record <CNV-XXXXX>
/test-and-record <PR-URL>
/test-and-record <PR-NUMBER>
/test-and-record CNV-12345 CNV-67890
/test-and-record CNV-12345, #1234, https://github.com/kubevirt-ui/kubevirt-plugin/pull/5678
```

Accepts one or more items (space or comma-separated). Each item can be:

- **Jira ticket ID**: `CNV-XXXXX` — validates the feature described by the ticket
- **PR URL**: `https://github.com/kubevirt-ui/kubevirt-plugin/pull/1234` — extracts the CNV ticket from the PR title/body, then validates
- **PR number**: `#1234` or `1234` — shorthand for the kubevirt-plugin repo PR

When multiple items are provided, each is processed sequentially on the same cluster with a **separate video recording** per item. The browser session and auth state persist across items (no re-login between recordings).

## Prerequisites

- `playwright-cli` must be installed (`npm install -g @playwright/cli`)
- Auth state saved at `playwright/mcp-validations/.auth/openshift-state.json`
- Cluster accessible via `.env` (`WEB_CONSOLE_URL`)

If `playwright-cli` is not available, **stop immediately** and instruct the user to install it. This command has no fallback — video recording requires the CLI.

---

## Workflow

### Batch Execution

When multiple items are provided:

1. Run **Phase 0** (environment check) once at the start
2. Load auth state once — the session persists across all items
3. For each item sequentially:
   - Run **Phase 0.5** (input resolution) to get the CNV ticket + PR context
   - Run **Phase 1** (ticket and STD resolution)
   - Run **Phase 2** (recording session) — produces a separate video per item
   - Run **Phase 3** (results report) — produces a separate report per item
4. Run **Phase 4** (STD inclusion) once at the end for all items that lacked STD coverage
5. Print a **Batch Summary** table at the end

Resources created in one item's teardown chapter are cleaned before the next item starts. If a teardown fails, log a warning and continue to the next item.

---

### Phase 0: Environment Check and Auth

```bash
playwright-cli --version 2>/dev/null || { echo "ERROR: playwright-cli not installed. Run: npm install -g @playwright/cli"; exit 1; }
```

#### Auth state resolution

Check for saved auth state. If missing, authenticate automatically using `.env` credentials:

```bash
if [ ! -f playwright/mcp-validations/.auth/openshift-state.json ]; then
  # Auto-login using .env credentials
  mkdir -p playwright/mcp-validations/.auth
fi
```

**Auto-login flow** (when no saved state exists):

1. Navigate to `$WEB_CONSOLE_URL` — redirects to OAuth login page
2. Wait for the login form (textbox "Username" + textbox "Password")
3. Fill `OPENSHIFT_USERNAME` and `OPENSHIFT_PASSWORD` from `.env`
4. Click "Log in" button
5. Wait for redirect to the console dashboard (URL contains `/dashboards` or page title contains "OpenShift")
6. Save browser storage state:
   ```javascript
   await page
     .context()
     .storageState({ path: 'playwright/mcp-validations/.auth/openshift-state.json' });
   ```

If the saved state exists, load it directly:

```bash
playwright-cli state-load playwright/mcp-validations/.auth/openshift-state.json
```

Verify the session is valid by navigating to a known page and checking for the login redirect. If redirected back to login, the saved state is expired — re-run the auto-login flow above and overwrite the state file.

---

### Phase 0.5: Input Resolution

Resolve the input to a CNV ticket ID and optional PR context.

#### If input is a PR URL or number:

1. **Fetch PR metadata** using `gh`:

   ```bash
   gh pr view <PR-NUMBER> --repo kubevirt-ui/kubevirt-plugin --json title,body,files,labels,headRefName
   ```

2. **Extract CNV ticket** from PR title or branch name:

   ```bash
   # From title (e.g. "CNV-89789: Add boot source filtering")
   echo "$PR_TITLE" | grep -oP 'CNV-\d+'
   # From branch name (e.g. "bmaio/CNV-89789-boot-source")
   echo "$BRANCH" | grep -oP 'CNV-\d+'
   ```

   If no ticket ID found in title or branch, search the PR body.
   If still not found, ask the user to provide the CNV ticket manually.

3. **Collect PR context** for validation plan enrichment:

   - Changed files (identify affected UI areas)
   - PR description (often contains test instructions or screenshots)
   - New `data-test` / `data-test-id` attributes in the diff:
     ```bash
     gh pr diff <PR-NUMBER> --repo kubevirt-ui/kubevirt-plugin | grep -oP 'data-test(?:-id)?="[^"]+"' | sort -u
     ```

4. **Store PR context** for use in Phase 1:
   - `PR_NUMBER`, `PR_TITLE`, `PR_FILES`, `PR_NEW_SELECTORS`
   - This enriches the validation plan with selector targets specific to the PR's changes

#### If input is a CNV ticket ID:

Proceed directly to Phase 1 (no PR context).

---

### Phase 1: Ticket and STD Resolution

1. **Fetch the Jira ticket** (mandatory):

   ```bash
   curl -s "https://redhat.atlassian.net/rest/api/3/issue/{TICKET_KEY}" | node -e "
   let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
     const {key,fields:f}=JSON.parse(d);
     console.log('Key:', key);
     console.log('Summary:', f.summary);
     console.log('Type:', f.issuetype?.name);
     console.log('Status:', f.status?.name);
     console.log('Description:', (JSON.stringify(f.description)||'N/A').slice(0,500));
   })"
   ```

2. **Search for existing test coverage**:

   ```bash
   rg "CNV-XXXXX" playwright/tests/ playwright/docs/ --type-add 'md:*.md' --type md --type ts
   ```

3. **Resolve the STD document**:

   - If a matching STD exists (ticket ID found in `playwright/docs/`), extract the step table for the test case
   - If no STD exists, present the finding to the user:

   > No STD document covers CNV-XXXXX. After this recording session, I can scaffold an STD entry for future automation. Proceed with manual validation flow based on the ticket description?

   If the user confirms, derive validation steps from the ticket description and linked PRs.

4. **Build the Validation Plan** from the STD step table (or ticket description):

   When PR context is available (input was a PR), enrich the plan with:

   - Specific pages to visit based on changed files
   - New selectors to verify are present in the DOM (`PR_NEW_SELECTORS`)
   - Regression checks on adjacent UI that the PR may have affected

   ```markdown
   | Chapter | Type     | Action                            | Expected Result            |
   | ------- | -------- | --------------------------------- | -------------------------- |
   | 1       | Setup    | Create namespace + VM via API     | VM exists in namespace     |
   | 2       | Navigate | Open VM list → select VM          | VM detail page visible     |
   | 3       | Validate | Check Configuration → Storage tab | Disk rows present          |
   | 4       | Validate | Verify disk size matches PVC      | Size column shows "30 GiB" |
   | 5       | Teardown | Delete namespace                  | Resources cleaned up       |
   ```

---

### Phase 2: Recording Session

#### Session setup

```bash
mkdir -p playwright/mcp-validations/<TICKET>/recording
playwright-cli state-load playwright/mcp-validations/.auth/openshift-state.json
playwright-cli resize 1920 1080
playwright-cli video-start playwright/mcp-validations/<TICKET>/recording/validation.webm
playwright-cli tracing-start
```

#### Execute validation plan

For each chapter in the plan:

1. **Mark the chapter** in the video:

   ```bash
   playwright-cli video-chapter "<Chapter N>: <Type> — <Action summary>"
   ```

2. **Execute the action**:

   - **Setup** chapters: use `oc` / `kubectl` commands for resource creation, then navigate to verify
   - **Navigate** chapters: use `playwright-cli goto` / `click` / `fill`
   - **Validate** chapters: use `playwright-cli snapshot` to inspect DOM, take screenshots

3. **Capture evidence**:

   ```bash
   playwright-cli snapshot
   playwright-cli screenshot playwright/mcp-validations/<TICKET>/recording/chapter-<N>.png
   ```

4. **Record the outcome** (pass/fail/blocked):

   - If the expected result matches: chapter PASSES
   - If it doesn't match: chapter FAILS — capture extra screenshots and console errors:
     ```bash
     playwright-cli console error
     playwright-cli screenshot playwright/mcp-validations/<TICKET>/recording/chapter-<N>-failure.png
     ```

5. **Teardown** chapters: clean up resources created during setup:
   ```bash
   oc delete namespace <test-ns> --wait=false
   ```

#### Session teardown

```bash
playwright-cli tracing-stop playwright/mcp-validations/<TICKET>/recording/trace.zip
playwright-cli video-stop
playwright-cli close
```

---

### Phase 3: Results Report

Write the report to `playwright/mcp-validations/<TICKET>/recording/validation-report.md`:

```markdown
# Validation Report: <TICKET>

**Summary:** <ticket summary>
**Date:** <timestamp>
**Cluster:** <WEB_CONSOLE_URL>
**PR:** <PR URL or "N/A — direct ticket validation">
**STD Reference:** <path to STD or "None — manual flow">

## Results

| Chapter | Type     | Action                | Expected            | Actual         | Status  |
| ------- | -------- | --------------------- | ------------------- | -------------- | ------- |
| 1       | Setup    | Create namespace + VM | VM exists           | VM exists      | ✅ PASS |
| 2       | Navigate | Open VM detail        | Detail page visible | Detail visible | ✅ PASS |
| 3       | Validate | Check disk size       | Shows "30 GiB"      | Shows "—"      | ❌ FAIL |

## Artifacts

- Video: `validation.webm`
- Trace: `trace.zip`
- Screenshots: `chapter-1.png`, `chapter-2.png`, `chapter-3-failure.png`

## Findings

### ❌ Chapter 3: Disk size not displayed

- **Expected:** Size column shows "30 GiB"
- **Actual:** Size column shows "—"
- **Console errors:** None
- **Possible cause:** PVC not yet bound / DataVolume still provisioning

## Recommendations

- [ ] File bug if behavior is incorrect
- [ ] Update STD if behavior is intentionally changed
```

---

### Phase 4: STD Inclusion (if no STD existed)

If no STD was found in Phase 1, offer to create one:

> The validation flow for CNV-XXXXX is not documented in any STD. Would you like me to:
>
> 1. Add it to an existing STD (specify which)
> 2. Create a new STD document for this feature
> 3. Skip STD creation for now

If the user chooses 1 or 2:

- Generate the STD entry using the validation plan from Phase 1 as the step table
- Add the Jira ticket reference to the Requirements Traceability Matrix
- Place the STD in the appropriate tier directory (`gating/`, `tier1/`, etc.)

---

## Output Structure

Each item gets its own directory under `playwright/mcp-validations/`:

```
playwright/mcp-validations/<TICKET>/recording/
├── validation.webm          # Full video with chapter markers
├── trace.zip                # Playwright trace (frame-by-frame)
├── validation-report.md     # Results summary
├── chapter-1.png            # Screenshot per chapter
├── chapter-2.png
├── chapter-3.png
└── chapter-3-failure.png    # Extra screenshots for failures
```

When input was a PR, the directory uses the resolved ticket: `playwright/mcp-validations/CNV-XXXXX/recording/`

---

## Batch Summary

When multiple items are processed, print a summary table at the end:

```markdown
## Batch Validation Summary

| #   | Input     | Ticket    | PR    | Chapters | Passed | Failed | Video                               |
| --- | --------- | --------- | ----- | -------- | ------ | ------ | ----------------------------------- |
| 1   | CNV-12345 | CNV-12345 | —     | 5        | 5      | 0      | CNV-12345/recording/validation.webm |
| 2   | #1234     | CNV-67890 | #1234 | 4        | 3      | 1      | CNV-67890/recording/validation.webm |
| 3   | CNV-11111 | CNV-11111 | —     | 3        | 3      | 0      | CNV-11111/recording/validation.webm |
```

---

## Important Rules

- **Hard requirement on `playwright-cli`** — no fallback to Playwright MCP or raw commands
- **Always fetch the Jira ticket** from the REST API — never rely on user summaries
- **Always check for an existing STD** before deriving steps manually
- **Every chapter gets a video marker** — this segments the recording for reviewability
- **Capture screenshots at every validation point** regardless of pass/fail
- **Clean up all resources** created during the session (use `oc delete` in teardown chapters)
- **Never modify test code** — this command is read-only observation and recording
- The `playwright/mcp-validations/` directory is gitignored — recordings are local artifacts only
