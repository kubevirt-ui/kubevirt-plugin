# Software Test Description (STD): [Route name]

One route-named markdown file per folder under `playwright/tests/` (e.g. `tests/bootable-volumes/bootable-volumes.md`; nested routes use hyphenated paths such as `virtual-machines-list.md`). Each Playwright spec in that folder is a **module** under section 4.

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/<route>/`
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

### Module: `<file>.spec.ts`

**Spec file:** `tests/<route>/<file>.spec.ts`
**Describe:** `[describe block title]` — **Tags:** `@<tier>`
**Allure:** suite `[suite constant]`, feature `[tier constant]`

---

### `001`: [Functional title — describes what the system does; no Jira ticket IDs in title]

- **Objective:** [What behavior is verified in one sentence]
- **Target version:** [CNV release this scenario was written for / first covers, e.g., CNV 5.0.0]
- **Jira References:** [CNV-XXXXX, CNV-YYYYY — tickets whose feature/bugfix this scenario covers; omit if none]
- **Pre-conditions:** [Any test.skip() conditions or required cluster state]
- **Tags:** [e.g., `@gating`, `@nonpriv`]

| Step | Action                                | Expected Result    |
| :--- | :------------------------------------ | :----------------- |
| 1    | [Navigate to / click / fill / assert] | [Expected outcome] |
| 2    | [Next action]                         | [Expected outcome] |

Do not use `|` inside table cells (including inside backticks); use `/`, `,`, or wording instead so Markdown parsers keep three columns.

---

### `002`: [Functional title]

- **Objective:** [What behavior is verified]
- **Target version:** [CNV release this scenario was written for / first covers, e.g., CNV 5.0.0]
- **Jira References:** [CNV-XXXXX — or omit if functional smoke with no specific ticket]
- **Pre-conditions:** [e.g., VM must be in Running state]

| Step | Action   | Expected Result |
| :--- | :------- | :-------------- |
| 1    | [action] | [expected]      |
