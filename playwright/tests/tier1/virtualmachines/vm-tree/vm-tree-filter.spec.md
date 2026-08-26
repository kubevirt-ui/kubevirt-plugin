# Software Test Description (STD): VM Tree View Filter

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — Virtual machines / Tree view
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-08-25
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify that the VirtualMachines tree-view "Show only projects with VirtualMachines" filter stays
enabled when the cluster has VirtualMachines, and that toggling it hides and shows an empty
(non-VM) project.

### 2.2 Scope

- **In-Scope:** Filter switch enabled and checked when VirtualMachines exist; empty-project node
  hidden with the filter on; empty-project node visible with the filter off; hiding again after
  turning the filter back on.
- **Out-of-Scope:** Cluster with zero VirtualMachines (disabled switch and tooltip; covered by Jest
  unit tests). ACM / multi-cluster tree. System-namespace filtering.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project. The cluster
  already has at least one VirtualMachine from global setup.
- **Configuration:** No special feature gates required. Tests run on standalone virtualization
  (not ACM).
- **Initial Setup:** `beforeAll` creates an empty test namespace with no VirtualMachine via
  `setupTestNamespace`. Namespace cleanup is handled by the fixture resource tracker.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/virtualmachines/vm-tree/vm-tree-filter.spec.ts`
**Describe:** `VM tree view filter` — **Tags:** `@tier1`
**Allure:** suite `VM tree view filter`, feature `Tier 1`

---

### `001`: Empty project visibility follows the tree filter when VirtualMachines exist

- **Objective:** Verify that the filter switch is enabled and on when VirtualMachines exist, that an
  empty project is hidden while the filter is on, that turning the filter off shows the empty
  project, and that turning it on hides the project again.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-90652
- **Pre-conditions:** Cluster has at least one VirtualMachine; an empty test namespace exists
- **Tags:** `@adminOnly`

| Step | Action                                                                      | Expected Result                                            |
| :--- | :-------------------------------------------------------------------------- | :--------------------------------------------------------- |
| 1    | Navigate to VirtualMachines, turn the filter on, search the empty namespace | Filter is on; tree search is scoped to the empty namespace |
| 2    | Observe the filter switch and the empty project node                        | Switch is enabled and on; empty project is hidden          |
| 3    | Turn the filter off                                                         | Empty project node is visible                              |
| 4    | Turn the filter on again                                                    | Empty project node is hidden                               |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type    | Status    |
| ----------- | ------------ | ---------------- | --------- |
| CNV-90652   | `001`        | Feature coverage | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Gal Kremer
- **Approval Signature:** Gal Kremer
