# Software Test Description (STD): Recommended capabilities — Actions

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier2 — Recommended capabilities
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-08
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

Verify kebab actions on the Recommended capabilities tab: Install all operators is offered for
not-installed capabilities (and is not clicked), View operator details opens Software Catalog and
browser back returns to the tab, Autopilot configuration status (Recommended / Manual), Use
recommended configuration kebab, and the review recommendation modal shows both YAML panes and
closes on Cancel.

### 2.2 Scope

- **In-Scope:** Not-installed capability kebab, View operator details, Autopilot configuration
  status, Use recommended configuration kebab, review recommendation modal Cancel.
- **Out-of-Scope:** Clicking Install all operators, clicking Apply or Use recommended configuration
  (mutating YAML), creating Subscriptions. See the install STD.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator; Playwright `Tier2` project.
- **Configuration:** Cluster-admin user.
- **Initial Setup:** None. Tests skip when the cluster has no not-installed autopilot capability,
  no Recommended/Manual Autopilot configuration, or no Manual operator for the kebab assertion.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier2/recommended-capabilities/recommended-capabilities-actions.spec.ts`
**Describe:** `Recommended capabilities actions` — **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`
**Allure:** suite `Recommended capabilities`, feature `Tier 2`

---

### `001`: Not-installed capability kebab shows Install all operators

- **Objective:** Verify a not-installed autopilot capability kebab offers Install all operators without installing.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133
- **Pre-conditions:** At least one autopilot capability is Not installed; skipped otherwise.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                            | Expected Result       |
| :--- | :-------------------------------- | :-------------------- |
| 1    | Open kebab on a Not installed row | Menu is visible       |
| 2    | Assert Install all operators      | Menu item is visible  |
| 3    | Dismiss the menu                  | No install is started |

---

### `002`: View operator details opens Software Catalog and back returns to the tab

- **Objective:** Verify View operator details navigates to Software Catalog and browser back returns to the tab.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-85806
- **Pre-conditions:** Cluster-admin user.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                                                     | Expected Result                                           |
| :--- | :--------------------------------------------------------- | :-------------------------------------------------------- |
| 1    | Expand Load balancing and open the Descheduler kebab       | Menu is visible                                           |
| 2    | Click View operator details                                | URL includes `/catalog/` and the Descheduler `selectedId` |
| 3    | Browser back (catalog may add a `&version=` history entry) | Recommended capabilities tab is visible                   |

---

### `003`: Installed Autopilot operator shows Recommended or Manual configuration

- **Objective:** Verify an installed Autopilot operator shows Recommended or Manual in the configuration column.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-85806
- **Pre-conditions:** At least one Autopilot operator is Recommended or Manual; skipped otherwise.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                                  | Expected Result                                  |
| :--- | :-------------------------------------- | :----------------------------------------------- |
| 1    | Expand auto capabilities                | Operator rows are shown                          |
| 2    | Find a Recommended or Manual operator   | Configuration cell text matches that status      |
| 3    | If Manual, assert Review recommendation | Review recommendation link is visible in the row |

---

### `004`: Manual operator kebab shows Use recommended configuration

- **Objective:** Verify a Manual Autopilot operator kebab offers Use recommended configuration without applying it.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-85806
- **Pre-conditions:** At least one Autopilot operator is Manual; skipped otherwise.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                               | Expected Result         |
| :--- | :----------------------------------- | :---------------------- |
| 1    | Expand auto capabilities             | Operator rows are shown |
| 2    | Open kebab on a Manual operator      | Menu is visible         |
| 3    | Assert Use recommended configuration | Menu item is visible    |
| 4    | Dismiss the menu                     | YAML is not applied     |

---

### `005`: Review recommendation modal shows both YAML panes and Cancel closes it

- **Objective:** Verify the review recommendation modal content and that Cancel does not apply YAML.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-85806
- **Pre-conditions:** At least one Autopilot operator is in Manual configuration; skipped otherwise.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                                                  | Expected Result                             |
| :--- | :------------------------------------------------------ | :------------------------------------------ |
| 1    | Expand auto capabilities and open Review recommendation | Modal title and both YAML panes are visible |
| 2    | Assert Apply and Cancel                                 | Both footer buttons are visible             |
| 3    | Click Cancel                                            | Modal closes; Apply is not clicked          |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type    | Status |
| ----------- | ------------ | ---------------- | ------ |
| CNV-87133   | `001`        | Feature coverage | Draft  |
| CNV-85806   | `002`        | Feature coverage | Draft  |
| CNV-85806   | `003`        | Feature coverage | Draft  |
| CNV-85806   | `004`        | Feature coverage | Draft  |
| CNV-85806   | `005`        | Feature coverage | Draft  |

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** **\*\***\_\_\_\_**\*\***
- **Approval Signature:** **\*\***\_\_\_\_**\*\***
