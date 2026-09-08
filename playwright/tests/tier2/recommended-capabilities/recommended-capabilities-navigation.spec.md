# Software Test Description (STD): Recommended capabilities — Navigation

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier2 — Recommended capabilities
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-08
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

Verify that cluster admins can open the Recommended capabilities Settings tab from the sidebar
and from Settings search, that installed autopilot rows stay view-only, and that non-privileged
users do not see admin-only Settings tabs.

### 2.2 Scope

- **In-Scope:** Sidebar navigation, Settings search, page heading and capability cards, installed
  row kebab absence, non-privileged tab visibility.
- **Out-of-Scope:** Capability install, Software Catalog navigation, review recommendation modal. See
  the colocated actions, tables, and install STDs.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator; Playwright `Tier2` project.
- **Configuration:** Admin specs require cluster-admin. The non-privileged spec requires `NON_PRIV=1`.
- **Initial Setup:** None. No operators are installed or removed.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier2/recommended-capabilities/recommended-capabilities-navigation.spec.ts`
**Describe:** `Recommended capabilities navigation` / `Recommended capabilities is hidden from non-privileged users` — **Tags:** `@tier2`, `@tier2-recommended-capabilities`, `@adminOnly`, `@nonpriv`
**Allure:** suite `Recommended capabilities`, feature `Tier 2`

---

### `001`: Sidebar Settings tab shows heading and both capability cards

- **Objective:** Verify the Recommended capabilities tab loads with the page heading and both cards.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133
- **Pre-conditions:** Cluster-admin user.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                                        | Expected Result                                               |
| :--- | :-------------------------------------------- | :------------------------------------------------------------ |
| 1    | Open Settings from the Virtualization sidebar | Settings page loads                                           |
| 2    | Click the Recommended capabilities tab        | Tab content is visible                                        |
| 3    | Assert heading and both card titles           | Manage Virtualization capabilities; auto and additional cards |

---

### `002`: Settings search for Recommended capabilities opens the tab

- **Objective:** Verify Settings search navigates to the Recommended capabilities tab.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133
- **Pre-conditions:** Cluster-admin user.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                                                          | Expected Result                                      |
| :--- | :-------------------------------------------------------------- | :--------------------------------------------------- |
| 1    | Open Settings from the sidebar                                  | Settings page loads                                  |
| 2    | Search for "Recommended capabilities" and select the suggestion | Tab content is visible                               |
| 3    | Assert the URL                                                  | Path includes `/virtualization-settings/recommended` |

---

### `003`: Installed auto-table capability has no kebab and still expands operators

- **Objective:** Verify an installed autopilot capability is view-only at the capability row and still expands.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-85806
- **Pre-conditions:** At least one autopilot capability is Installed; skipped otherwise.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                                         | Expected Result                  |
| :--- | :--------------------------------------------- | :------------------------------- |
| 1    | Find an Installed capability in the auto table | A matching row is visible        |
| 2    | Assert kebab count on that row                 | No kebab is rendered             |
| 3    | Expand the row                                 | Operator rows are visible        |
| 4    | Open the operator kebab                        | View operator details is present |

---

### `004`: Non-privileged user does not see admin-only Settings tabs

- **Objective:** Verify non-privileged users do not see Recommended capabilities, Cluster, or Preview features.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133
- **Pre-conditions:** `NON_PRIV=1`.
- **Tags:** `@tier2`, `@nonpriv`, `@tier2-recommended-capabilities`

| Step | Action                               | Expected Result                                                        |
| :--- | :----------------------------------- | :--------------------------------------------------------------------- |
| 1    | Open Settings from the sidebar       | Settings page loads                                                    |
| 2    | Collect visible `settings-tab-*` IDs | `recommended`, `cluster`, and `features` are absent; `user` is present |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type    | Status |
| ----------- | ------------ | ---------------- | ------ |
| CNV-87133   | `001`        | Feature coverage | Draft  |
| CNV-87133   | `002`        | Feature coverage | Draft  |
| CNV-85806   | `003`        | Feature coverage | Draft  |
| CNV-87133   | `004`        | Feature coverage | Draft  |

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** **\*\***\_\_\_\_**\*\***
- **Approval Signature:** **\*\***\_\_\_\_**\*\***
