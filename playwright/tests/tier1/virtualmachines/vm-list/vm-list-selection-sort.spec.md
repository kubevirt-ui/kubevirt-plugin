# Software Test Description (STD): VM List Selection and Sort

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — Virtual machines / List
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-21
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify that the namespaced VirtualMachines list can sort rows by the Name column and that row
selection stays bound to the selected virtual machine after that sort, rather than following the
previous row position.

### 2.2 Scope

- **In-Scope:** Name column sort (ascending and descending) on the namespaced VirtualMachines list;
  checkbox selection of one Halted VM; selection identity after Name sort reverses row order.
- **Out-of-Scope:** Pagination identity; KubevirtTable `selectable` lists (Connected VMs and similar);
  sorting other columns; bulk select-all; ACM multi-cluster lists.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project.
- **Configuration:** No special feature gates. Two Halted container-disk VMs are created via
  `createHaltedVm` with names that sort alphabetically (`aaa` vs `zzz` prefixes).
- **Initial Setup:** `beforeAll` creates one namespace (`setupTestNamespace`) and two Halted VMs.
  VMs are deleted in `afterAll` via `cleanupVmFixtures`. Each test opens the namespaced
  VirtualMachines list tab through the UI.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/virtualmachines/vm-list/vm-list-selection-sort.spec.ts`
**Describe:** `VM List Selection and Sort` — **Tags:** `@tier1`, `@adminOnly`
**Allure:** suite `VM List Selection and Sort`, feature `Tier 1`

---

### `001`: Sorting the Name column reverses VM row order

- **Objective:** Verify that toggling the Name column between ascending and descending reverses the
  order of two Halted VMs whose names sort alphabetically.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-95699
- **Pre-conditions:** Two Halted VMs exist in a dedicated test namespace (`aaa*` and `zzz*` names)
- **Tags:** `@adminOnly`

| Step | Action                                   | Expected Result                           |
| :--- | :--------------------------------------- | :---------------------------------------- |
| 1    | Open the namespaced VirtualMachines list | Both Halted VM rows are visible           |
| 2    | Sort the Name column ascending           | The `aaa*` VM appears above the `zzz*` VM |
| 3    | Sort the Name column descending          | The `zzz*` VM appears above the `aaa*` VM |

---

### `002`: Selection stays on the same VM after sorting by Name

- **Objective:** Verify that checking one VM, then reversing Name sort, leaves that VM checked and
  does not check the other VM that moved into its previous row position.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-95699
- **Pre-conditions:** Two Halted VMs exist in a dedicated test namespace (`aaa*` and `zzz*` names)
- **Tags:** `@adminOnly`

| Step | Action                                      | Expected Result                                                                 |
| :--- | :------------------------------------------ | :------------------------------------------------------------------------------ |
| 1    | Open the namespaced VirtualMachines list    | Both Halted VM rows are visible                                                 |
| 2    | Sort Name ascending and check the `aaa*` VM | The `aaa*` checkbox is checked; the `zzz*` checkbox is not                      |
| 3    | Sort Name descending                        | Row order reverses (`zzz*` then `aaa*`); `aaa*` stays checked; `zzz*` stays off |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type           | Status    |
| ----------- | ------------ | ----------------------- | --------- |
| CNV-95699   | `001`        | Feature coverage        | Automated |
| CNV-95699   | `002`        | Bugfix regression guard | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Gal Kremer
- **Approval Signature:** Gal Kremer
