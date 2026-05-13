# Jira Task: End-to-End Test Implementation

Orchestrate the full test implementation workflow for one or more Jira tasks — from exploration through implementation — stopping before commit and PR creation. All work is done on a new branch.

## Input

The user provides one or more Jira task IDs after the `/create-test` command.

- **Single ticket**: `/create-test TICKET-12345`
- **Multiple tickets** (comma-separated): `/create-test TICKET-12345, TICKET-67890`
- **Multiple tickets** (space-separated): `/create-test TICKET-12345 TICKET-67890`

All Jira keys provided are parsed and processed together in a single workflow.

## Workflow

Execute these phases sequentially, operating as each agent role per the orchestrator rules.

---

### Phase 1: Business Analyst — Exploration & Scenario Design

Follow `business-analyst.mdc` rules.

**For each Jira ticket** provided in the input:

1. **Fetch the Jira ticket** via the Atlassian MCP (MANDATORY — never skip, never rely on cached summaries).
2. **Extract key fields**: summary, type, status, labels, components, description, parent, subtasks. Fetch each subtask too.
3. **Explore linked PRs** — find implementation PRs via remote links, read their changed files to identify new `data-test` / `data-test-id` selectors, routes, and components.
4. **Search for existing Playwright tests**:
   ```bash
   rg "TICKET-XXXXX" playwright/tests/
   rg "<feature-keyword>" playwright/tests/ --type ts -l
   ```
5. **Design test scenarios** — map steps to existing page-object methods; determine tier placement (gating / tier1 / tier2).

**Output**: A consolidated scenario document with proposed test cases, steps, assertions, tags, and cleanup — grouped by ticket.

---

### Phase 1.5: Routing Decision — Expand vs. New

Before proceeding to Phase 2, classify each proposed test case from Phase 1:

1. **Query existing coverage**:
   ```bash
   rg "TICKET-XXXXX" playwright/tests/ playwright/docs/
   rg "<feature-keyword>" playwright/tests/ --type ts -l
   ```
   - **Decision tree** (apply in order):
     1. If existing tests reference the ticket ID → use the returned spec files as expansion targets → **Expand**
     2. If existing tests cover the feature area → use those spec files as expansion targets → **Expand**
     3. If no existing tests cover the feature area → **New**
2. **For each proposed test case**, determine:

| Condition                                                                                            | Action                                                                                                                      |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| An existing `test()` in the same spec file covers the same feature and can absorb the new validation | **Expand** — follow the `/expand-tests` workflow: add `test.step()` blocks to the existing test, append to the existing STD |
| An existing spec file covers the same feature area but no single test fits                           | **Expand** — add a new `test()` inside the existing `test.describe`, append to the existing STD                             |
| No existing spec file or test covers this feature area                                               | **New** — create a new spec file and a new STD document (Phase 2 + Phase 3 below)                                           |

3. **For test cases routed to Expand**: follow the `/expand-tests` workflow (Phases 2–6 of `expand-tests.md`) — add validations to existing tests, update existing STDs, validate with MCP, run and verify.
4. **For test cases routed to New**: continue to Phase 2 below.
5. **Mixed scenarios are expected** — some test cases from a ticket may expand existing tests while others require new spec files. Both paths can run in the same workflow.

---

### Phase 2: QA Architect — Framework Gap Analysis

Follow `qa-architect.mdc` rules. This phase applies only to test cases routed as **New** in Phase 1.5 (expand-routed cases are handled by the expand-tests workflow).

1. **Evaluate each scenario** from Phase 1 against existing framework components
2. **Identify reusable components**: existing StepDriver methods, PageObject methods, data factories
3. **Identify gaps**: missing page object methods (with suggested locators), missing step driver wrappers, missing data factories
4. **Validate locators via MCP** (Playwright browser) when possible — navigate to the relevant pages and inspect element structure
5. **Confirm tier placement** based on technical constraints (duration, parallelism, CI budget)
6. **Output**: Framework gap report with reusable components, missing components, and new component designs

---

### Phase 3: Automation Implementer — Implementation

Follow `automation-implementer.mdc` rules. This phase applies only to test cases routed as **New** in Phase 1.5.

1. **Implement framework gaps** identified in Phase 2:
   - New page object methods (inline locators for single-use, class properties for 2+ use)
   - New step driver wrappers (context-aware params, auto-store on create)
   - New data factories (if needed)
   - When creating new files, copy from existing files as boilerplate — then customize.
2. **Create new STD documents** (only for test cases that don't fit any existing STD):
   - Copy the STD template from `playwright/docs/STD-TEMPLATE.md`
   - Gating tests → `playwright/docs/gating/<feature>.md`
   - Tier 1 tests → `playwright/docs/tier1/<feature>.md`
   - Update `playwright/docs/README.md` index when new documents are created
3. **Implement test spec files**:
   - Follow naming conventions: `ID(TICKET-XXXXX) Descriptive name`
   - Use `withAllure({ suite: '...', feature: 'Gating'|'Tier 1', tags: [...] })`
   - Consolidate related validations into a single `test()` with `test.step()` blocks
   - Register cleanup with appropriate teardown hooks
   - Add `test.skip()` guards for optional prerequisites
4. **Run lint and type checks**:
   ```bash
   npx eslint --fix <new-files>
   npx tsc --project playwright/tsconfig.json --noEmit
   ```
5. **Run the new tests** to verify they pass:
   ```bash
   PLAYWRIGHT_RETRIES=0 npm run test-playwright -- --grep "TICKET-XXXXX" --workers=1
   ```
6. **Fix any failures** — iterate until tests pass or document functional blockers
7. **Post-implementation verification**:
   ```bash
   rg "ID(TICKET-XXXXX)" playwright/tests/ --type ts
   ```
   Verify each ticket's `ID()` annotation is present in the test files.

---

### Phase 4: Code Reviewer — Final Review

Follow `code-reviewer.mdc` rules.

1. **Review all changes** for compliance with architectural rules:
   - Page encapsulation (no `page` in specs or step drivers)
   - UI-first navigation (no direct URLs in specs)
   - Context-aware step driver params
   - Proper cleanup tracking
   - Locator strategy (inline vs class property)
2. **Verify STD documents** match the implemented tests
3. **Report any issues** and fix them

---

### Phase 5: Summary

Output a final summary table (one row per Jira ticket when multiple are provided):

| Item                  | Details                                                                               |
| --------------------- | ------------------------------------------------------------------------------------- |
| **Jira Key(s)**       | TICKET-XXXXX, TICKET-YYYYY                                                            |
| **Branch**            | `<git-user>/ticket-xxxxx-test` or `<git-user>/test-automation-ticket-xxxxx`           |
| **Tests Expanded**    | Count and list — existing tests that received new `test.step()` blocks or validations |
| **Tests Created**     | Count and list — new tests in new or existing spec files                              |
| **Tier**              | Gating / Tier1 / Tier2                                                                |
| **STD Updated**       | File paths (existing STDs that were appended to)                                      |
| **STD Created**       | File paths (new STDs, only when no existing STD fit)                                  |
| **Framework Changes** | New PO methods, SD methods, factories                                                 |
| **Test Results**      | Pass / Fail / Skipped                                                                 |
| **Known Issues**      | Any blockers or TODOs                                                                 |

Inform the user that all changes are ready on the branch and they can review, commit, and create a PR when satisfied.

---

## Important Rules

- **ALWAYS fetch ticket data from the Jira REST API** — never rely on user-provided summaries, cached descriptions, or assumptions about ticket content. The API call is mandatory for every ticket.
- **DO NOT commit or push** — the user will handle git operations separately
- **DO NOT create a PR** — stop after implementation and review
- Always check existing implementations before creating new components
- Use MCP (Playwright browser) for locator validation when dealing with UI elements
- If the Jira ticket has subtasks, only implement tests for subtasks that are marked as done or in progress
- If a test cannot be implemented due to missing cluster features, create the STD entry and mark it as `TODO`
- When multiple tickets are provided, process all tickets in a single branch and workflow — consolidate tests into existing spec files where possible
- **Expand before create** — always check if an existing test or STD can absorb the new validation before creating new spec files or STD documents. When existing coverage fits, fall back to the `/expand-tests` workflow (add `test.step()` blocks, append to existing STDs). Only create new files when no existing test or STD covers the feature area.
