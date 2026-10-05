# Software Test Description (STD): Virtual Machines — Actions

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtual-machines/actions/`
- **Feature Area:** Tier1 — VM actions
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-09
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

Automated E2E coverage for console routes under `tests/virtual-machines/actions/`.

### 2.2 Scope

- **In-Scope:**
  - All scenarios in specs under `tests/virtual-machines/actions/`.
- **Out-of-Scope:**
  - Scenarios documented in other route STD files.

## 3. Test Environment & Prerequisites

### vm-delete

### vm-lifecycle-actions

### vm-move-to-folder-modal

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project.
- **Configuration:** Groups in the VM tree view preview feature must be enabled for folder labels to
  apply.
- **Initial Setup:** `beforeAll` creates one namespace and Halted VMs with optional
  `vm.kubevirt.io/folder` labels; Namespace and VirtualMachine resources are tracked via
  `apiClient.trackResource(...)`. Tests share that namespace (`test.describe.serial`).

### vm-lifecycle

---

## 4. Test Case Definitions

### Module: `vm-delete.spec.ts`

**Spec file:** `tests/virtual-machines/actions/vm-delete.spec.ts`
**Describe:** `Tier1 VM Single Delete` — **Tags:** @tier1-vm-actions
**Allure:** suite `VM Single Delete`, feature `Tier 1`

---

### `001`: Delete a single VM via list kebab action removes it from the list and cluster

- **Objective:** Delete a single VM via list kebab action removes it from the list and cluster
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-97104
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-vm-actions

| Step | Action                                                                                             | Expected Result                   |
| :--- | :------------------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Delete a single VM via list kebab action removes it from the list and cluster | All expectations in the spec pass |

---

---

### Module: `vm-lifecycle-actions.spec.ts`

**Spec file:** `tests/virtual-machines/actions/vm-lifecycle-actions.spec.ts`
**Describe:** `Tier1 VM Bulk Actions Tests` — **Tags:** @tier1-bulk-ops
**Allure:** suite `VM Bulk Actions`, feature `Tier 1`

---

### `001`: Bulk delete selected VMs removes them from the list

- **Objective:** Bulk delete selected VMs removes them from the list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-bulk-ops

| Step | Action                                                                   | Expected Result                   |
| :--- | :----------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Bulk delete selected VMs removes them from the list | All expectations in the spec pass |

---

---

### Module: `vm-lifecycle.spec.ts`

**Spec file:** `tests/virtual-machines/actions/vm-lifecycle.spec.ts`
**Describe:** `Tier1 VM Start/Stop/Restart Lifecycle` — **Tags:** @tier1-vm-actions
**Allure:** suite `VM Lifecycle`, feature `Tier 1`

---

### `001`: Start, stop, and restart a VM from the detail page actions dropdown

- **Objective:** Start, stop, and restart a VM from the detail page actions dropdown
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-vm-actions

| Step | Action                                                                                   | Expected Result                   |
| :--- | :--------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Start, stop, and restart a VM from the detail page actions dropdown | All expectations in the spec pass |

---

---

### Module: `vm-move-to-folder-modal.spec.ts`

**Spec file:** `tests/virtual-machines/actions/vm-move-to-folder-modal.spec.ts`
**Describe:** `Tier1 Move to group modal` — **Tags:** `@tier1`, `@tier1-vm-actions`, `@CNV-96512`
**Allure:** suite `Move to group modal`, feature `Tier 1`

---

### `001`: Preselects current group and disables Save until destination changes

- **Objective:** Verify that opening Move to group on a VM in an existing group preselects that
  group, keeps Save disabled, and enables Save only after a different destination is chosen.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96512
- **Pre-conditions:** A Halted VM exists in namespace with folder label `group-alpha`.
- **Tags:** `@adminOnly`

| Step | Action                                    | Expected Result                                                             |
| :--- | :---------------------------------------- | :-------------------------------------------------------------------------- |
| 1    | Navigate to the VM via VM details         | VM details are shown                                                        |
| 2    | Open Move to group from VM actions        | Modal opens; search shows `group-alpha`; summary mentions the current group |
| 3    | Observe Save without changing destination | Save is disabled                                                            |
| 4    | Select `group-beta` as destination        | Summary shows from/to group copy; Save is enabled                           |
| 5    | Cancel                                    | Modal closes                                                                |

---

### `002`: Creates a new group with Enter and persists the move

- **Objective:** Verify that typing a valid new group name and pressing Enter selects it, enables
  Save, and persists the folder label on the VM after save.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96512
- **Pre-conditions:** A Halted VM exists in the shared namespace.
- **Tags:** `@adminOnly`

| Step | Action                                      | Expected Result                                   |
| :--- | :------------------------------------------ | :------------------------------------------------ |
| 1    | Open Move to group on the VM                | Modal opens                                       |
| 2    | Type a new valid group name and press Enter | Search shows the new name; Save is enabled        |
| 3    | Click Save                                  | Modal closes                                      |
| 4    | Read the VM resource from the API           | `vm.kubevirt.io/folder` equals the new group name |

---

### `003`: Enables Save when moving to project root

- **Objective:** Verify that selecting Project root as destination enables Save and removes the
  folder label after save for a VM currently in a named group.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96512
- **Pre-conditions:** A Halted VM exists with folder label `group-beta`.
- **Tags:** `@adminOnly`

| Step | Action                                       | Expected Result                                        |
| :--- | :------------------------------------------- | :----------------------------------------------------- |
| 1    | Open Move to group on the VM in `group-beta` | Current group is preselected; Save is disabled         |
| 2    | Select Project root from the dropdown        | Summary mentions project root; Save is enabled         |
| 3    | Click Save                                   | Modal closes                                           |
| 4    | Read the VM resource from the API            | VM has no `vm.kubevirt.io/folder` label (project root) |

---

### `004`: Closes the dropdown on Escape without closing the modal

- **Objective:** Verify that pressing Escape while the FolderSelect dropdown is open closes only
  the dropdown and leaves the Move to group modal open.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96512
- **Pre-conditions:** A Halted VM exists in the shared namespace.
- **Tags:** `@adminOnly`

| Step | Action                         | Expected Result                   |
| :--- | :----------------------------- | :-------------------------------- |
| 1    | Open Move to group             | Modal opens                       |
| 2    | Open the folder dropdown       | Dropdown is visible               |
| 3    | Press Escape in the search box | Dropdown closes; modal stays open |
| 4    | Cancel                         | Modal closes                      |

---

### `005`: Lists existing groups alphabetically and blocks oversize names

- **Objective:** Verify that existing namespace groups appear sorted alphabetically in the
  dropdown, oversize typed names show validation, and invalid search input does not replace a
  previously selected destination.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96512
- **Pre-conditions:** Halted VMs exist in folders `folder-a-sort`, `folder-m-sort`, and
  `folder-z-sort`.
- **Tags:** `@adminOnly`

| Step | Action                            | Expected Result                                                         |
| :--- | :-------------------------------- | :---------------------------------------------------------------------- |
| 1    | Open Move to group                | Modal opens                                                             |
| 2    | Open the folder dropdown          | Visible options are sorted alphabetically and include the sort fixtures |
| 3    | Select `folder-z-sort`            | Destination is selected; Save is enabled                                |
| 4    | Type a 64-character oversize name | Validation error mentions 63 bytes or fewer                             |
| 5    | Observe summary and Save          | Summary still targets `folder-z-sort`; Save remains enabled             |
| 6    | Cancel                            | Modal closes                                                            |

---

### `006`: Bulk modal preselects shared group and shows it in the summary

- **Objective:** Verify that bulk Move to group for VMs sharing the same folder preselects that
  group, shows VM count and namespace in the summary, and keeps Save disabled until the destination
  changes.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96512
- **Pre-conditions:** Two Halted VMs exist in the same namespace with folder label `group-alpha`.
- **Tags:** `@adminOnly`

| Step | Action                                   | Expected Result                                                            |
| :--- | :--------------------------------------- | :------------------------------------------------------------------------- |
| 1    | Open the namespaced VirtualMachines list | Both VM rows are visible                                                   |
| 2    | Select both VMs and open Move to group   | Modal opens                                                                |
| 3    | Observe summary and folder picker        | Summary shows namespace, VM count, and `group-alpha`; picker preselects it |
| 4    | Observe Save                             | Save is disabled; summary does not yet show a destination change phrase    |
| 5    | Cancel                                   | Modal closes                                                               |

---

### `007`: Bulk modal enables Save when moving mixed-source VMs to project root

- **Objective:** Verify that bulk Move to group for VMs in different groups starts with no shared
  preselection, enables Save when Project root is chosen, and removes folder labels from all
  selected VMs after save.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96512
- **Pre-conditions:** Two Halted VMs exist in the same namespace in different groups (e.g.
  `group-beta` and `group-alpha`).
- **Tags:** `@adminOnly`

| Step | Action                                                  | Expected Result                                |
| :--- | :------------------------------------------------------ | :--------------------------------------------- |
| 1    | Open the namespaced VirtualMachines list                | Both VM rows are visible                       |
| 2    | Select VMs from different groups and open Move to group | Picker is empty; Save is disabled              |
| 3    | Select Project root                                     | Summary mentions Project root; Save is enabled |
| 4    | Click Save                                              | Modal closes                                   |
| 5    | Read both VMs from the API                              | Neither VM has a `vm.kubevirt.io/folder` label |
