# Software Test Description (STD): VM List Column Management

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — Virtual machines / List
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-06
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify that the all-projects VirtualMachines list **Manage columns** action can reduce the table
to a chosen set of resource columns and that only those column headers remain visible.

### 2.2 Scope

- **In-Scope:** Column management on the all-projects VM list; enabling **Namespace**, **vCPU**,
  **Memory**, **Memory Utilization**, and **CPU Utilization** while turning off default columns
  such as Status and Conditions; exact header set after Save; **Name** stays required in the modal.
- **Out-of-Scope:** Drag-and-drop column reorder; column order persistence across sessions;
  namespaced-only lists (no Namespace column); max-column limit edge cases; **Restore default columns**.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project.
- **Configuration:** No special feature gates.
- **Initial Setup:** `beforeAll` creates one namespace and one Halted VM. `afterAll` deletes the VM.
  Each test opens the all-projects VirtualMachines list tab and filters to that VM by name.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/virtualmachines/vm-list/vm-list-column-management.spec.ts`
**Describe:** `VM List Column Management` — **Tags:** `@tier1`, `@adminOnly`
**Allure:** suite `VM List Column Management`, feature `Tier 1`

---

### `001`: Only selected resource columns appear after Manage columns

- **Objective:** Verify that after choosing **Name**, **Namespace**, **vCPU**, **Memory**, **Memory
  Utilization**, and **CPU Utilization** in Manage columns, the table headers match that set exactly
  and no other labeled columns remain.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-97374
- **Pre-conditions:** One Halted VM exists in a dedicated test namespace
- **Tags:** `@adminOnly`

| Step | Action                                                                | Expected Result                                                                     |
| :--- | :-------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| 1    | Open the all-projects VirtualMachines list and locate the test VM     | The Halted VM row is visible                                                        |
| 2    | Open Manage columns, disable default columns, enable resource columns | **Name** checkbox is checked and disabled                                           |
| 3    | Click Save                                                            | Modal closes                                                                        |
| 4    | Observe table headers                                                 | Headers are only Name, Namespace, vCPU, Memory, Memory Utilization, CPU Utilization |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type    | Status    |
| ----------- | ------------ | ---------------- | --------- |
| CNV-97374   | `001`        | Feature coverage | Automated |

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Ido Ben Bassat
- **Approval Signature:** Ido Ben Bassat
