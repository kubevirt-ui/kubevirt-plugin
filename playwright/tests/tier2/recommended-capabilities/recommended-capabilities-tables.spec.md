# Software Test Description (STD): Recommended capabilities — Tables

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier2 — Recommended capabilities
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-08
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

Verify the Recommended capabilities auto and additional tables: capability names, operator
children, search, status filter, Install selected enablement, and Software Catalog links.

### 2.2 Scope

- **In-Scope:** Auto table names, Load balancing operators, search, status filter, Install selected
  disabled/enabled, additional table names, High availability operators, Software Catalog name link.
- **Out-of-Scope:** Creating OLM Subscriptions, review recommendation Apply. See the install and
  actions STDs.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator; Playwright `Tier2` project.
- **Configuration:** Cluster-admin user.
- **Initial Setup:** None. The Install selected enablement test skips if every autopilot capability
  is already installed.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier2/recommended-capabilities/recommended-capabilities-tables.spec.ts`
**Describe:** `Recommended capabilities tables` — **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`
**Allure:** suite `Recommended capabilities`, feature `Tier 2`

---

### `001`: Auto table lists Load balancing, Migrate VMs, and Virtualization dashboards

- **Objective:** Verify the autopilot table lists the three automatic capabilities.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133, CNV-85806
- **Pre-conditions:** Cluster-admin user.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                        | Expected Result                                        |
| :--- | :---------------------------- | :----------------------------------------------------- |
| 1    | Open Recommended capabilities | Auto table is visible                                  |
| 2    | Assert capability titles      | Load balancing, Migrate VMs, Virtualization dashboards |

---

### `002`: Expanding Load balancing shows Descheduler and MetalLB

- **Objective:** Verify Load balancing expands to its Autopilot operators.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-85806
- **Pre-conditions:** Cluster-admin user.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                | Expected Result                    |
| :--- | :-------------------- | :--------------------------------- |
| 1    | Expand Load balancing | Operator rows are shown            |
| 2    | Assert operator names | Descheduler and MetalLB are listed |

---

### `003`: Searching Migrate filters the auto table and clearing restores rows

- **Objective:** Verify capability search filters and restore.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133
- **Pre-conditions:** Cluster-admin user.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action               | Expected Result                            |
| :--- | :------------------- | :----------------------------------------- |
| 1    | Search for "Migrate" | Migrate VMs visible; Load balancing hidden |
| 2    | Clear search         | Load balancing is visible again            |

---

### `004`: Status filter updates the capabilities count text

- **Objective:** Verify the Status filter changes the "X out of Y …" count.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133
- **Pre-conditions:** Cluster-admin user.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                      | Expected Result                     |
| :--- | :-------------------------- | :---------------------------------- |
| 1    | Read the default count text | Text matches "out of"               |
| 2    | Filter by Not installed     | Count text includes "not installed" |

---

### `005`: Install selected stays disabled until a not-installed capability is checked

- **Objective:** Verify Install selected stays disabled with the expected tooltip until a not-installed row is selected.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133
- **Pre-conditions:** Skips the enablement assertion if no not-installed autopilot capability exists.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                                        | Expected Result                             |
| :--- | :-------------------------------------------- | :------------------------------------------ |
| 1    | Assert Install selected with no selection     | `aria-disabled="true"`                      |
| 2    | Hover the button                              | Tooltip "Select capabilities to install"    |
| 3    | Check a Not installed capability (if present) | Install selected is no longer aria-disabled |

---

### `006`: Additional table lists the eight manual capabilities

- **Objective:** Verify the additional (manual setup) table lists all eight capabilities.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133
- **Pre-conditions:** Cluster-admin user.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                        | Expected Result                                        |
| :--- | :---------------------------- | :----------------------------------------------------- |
| 1    | Open Recommended capabilities | Additional table is visible                            |
| 2    | Assert all eight titles       | Backup, NFD, HA, NMState, Kata, hub, NUMA, local disks |

---

### `007`: Expanding High availability shows health, fence, and maintenance operators

- **Objective:** Verify High availability expands to its three operators.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133
- **Pre-conditions:** Cluster-admin user.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                   | Expected Result                                               |
| :--- | :----------------------- | :------------------------------------------------------------ |
| 1    | Expand High availability | Operator rows are shown                                       |
| 2    | Assert operator names    | Node health check, Fence agents remediation, Node maintenance |

---

### `008`: Operator name link opens Software Catalog

- **Objective:** Verify an additional-table operator name navigates to Software Catalog.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133
- **Pre-conditions:** Cluster-admin user; Node health check package is resolvable in Software Catalog.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                           | Expected Result                                                     |
| :--- | :------------------------------- | :------------------------------------------------------------------ |
| 1    | Expand High availability         | Operator rows are shown                                             |
| 2    | Click the Node health check name | URL includes `/catalog/` and `selectedId=node-healthcheck-operator` |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type    | Status |
| ----------- | ------------ | ---------------- | ------ |
| CNV-87133   | `001`        | Feature coverage | Draft  |
| CNV-85806   | `001`        | Feature coverage | Draft  |
| CNV-85806   | `002`        | Feature coverage | Draft  |
| CNV-87133   | `003`        | Feature coverage | Draft  |
| CNV-87133   | `004`        | Feature coverage | Draft  |
| CNV-87133   | `005`        | Feature coverage | Draft  |
| CNV-87133   | `006`        | Feature coverage | Draft  |
| CNV-87133   | `007`        | Feature coverage | Draft  |
| CNV-87133   | `008`        | Feature coverage | Draft  |

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** **\*\***\_\_\_\_**\*\***
- **Approval Signature:** **\*\***\_\_\_\_**\*\***
