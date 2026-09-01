# Software Test Description (STD): [Feature/Component Name]

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** [e.g., Gating — VM management, Tier1 — Bootable volumes]
- **Latest version:** [Most recent CNV release this document was validated against, e.g., CNV 5.0.0]
- **Latest update:** [YYYY-MM-DD of the most recent edit to this document]
- **Document Status:** [Draft / In Review / Approved — if the tests described are included in the PR and have been verified locally, mark as Approved]

CNV versions must be three-part `CNV <major>.<minor>.<patch>` (e.g. `CNV 5.0.0`). Do not use `CNV 5.0` or `CNV 5.00`. Apply the same format to every **Target version** below.

## 2. Introduction

### 2.1 Purpose

[Clearly describe what functionality is being verified. Reference the feature area and test tier.]

### 2.2 Scope

- **In-Scope:** [Components, UI elements, workflows, or APIs being tested]
- **Out-of-Scope:** [Areas explicitly excluded — reference other STDs where applicable]

## 3. Test Environment & Prerequisites

- **Environment:** [Required cluster setup, e.g., OpenShift with CNV operator]
- **Configuration:** [Specific configurations, feature gates, or env vars needed]
- **Initial Setup:** [Any beforeAll resource creation; cleanup mechanism used]

---

## 4. Test Case Definitions

**Spec file:** `tests/<tier>/<feature>/<file>.spec.ts`
**Describe:** `[describe block title]` — **Tags:** `@<tier>`
**Allure:** suite `[suite constant]`, feature `[tier constant]`

---

### `001`: [Functional title — describes what the system does; no Jira ticket IDs in title]

- **Objective:** [What behavior is verified in one sentence]
  <<<<<<< HEAD
- **Target version:** [CNV release this scenario was written for / first covers, e.g., CNV 5.0.0]
  > > > > > > > c8ff20e69 (NV-76355: Add relevant tests)
- **Jira References:** [CNV-XXXXX, CNV-YYYYY — tickets whose feature/bugfix this scenario covers; omit if none]
- **Pre-conditions:** [Any test.skip() conditions or required cluster state]
- **Tags:** [e.g., `@gating`, `@nonpriv`]

| Step | Action                                | Expected Result    |
| :--- | :------------------------------------ | :----------------- |
| 1    | [Navigate to / click / fill / assert] | [Expected outcome] |
| 2    | [Next action]                         | [Expected outcome] |

---

### `002`: [Functional title]

- **Objective:** [What behavior is verified]
- **Target version:** [CNV release this scenario was written for / first covers, e.g., CNV 5.0.0]
- **Jira References:** [CNV-XXXXX — or omit if functional smoke with no specific ticket]
- **Pre-conditions:** [e.g., VM must be in Running state]

| Step | Action   | Expected Result |
| :--- | :------- | :-------------- |
| 1    | [action] | [expected]      |

---

## 5. Requirements Traceability Matrix

Maps Jira tickets to the test cases that provide coverage. Tickets without a specific test case indicate
a planned coverage gap (status: Pending).

| Jira Ticket | Test Case ID | Coverage Type           | Status    |
| ----------- | ------------ | ----------------------- | --------- |
| CNV-XXXXX   | `001`        | Feature coverage        | Automated |
| CNV-YYYYY   | `001`        | Bugfix regression guard | Automated |
| CNV-ZZZZZ   | `002`        | Feature coverage        | Draft     |
| —           | `003`        | Functional smoke        | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** **\*\*\*\***\_\_**\*\*\*\***
- **Approval Signature:** **\*\*\*\***\_\_**\*\*\*\***
