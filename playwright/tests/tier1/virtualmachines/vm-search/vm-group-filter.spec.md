# Software Test Description (STD): VM Group Filter

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — Virtual machines / Search
- **Latest version:** CNV 5.0.0
- **Latest update:** 2026-08-18
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify the dedicated Group (folder) filter for VirtualMachines: the `group` search-language key,
Group selection in the Advanced Search modal, and applying/clearing the filter from the tree view.

### 2.2 Scope

- **In-Scope:** `group` key in search suggestions, `group:<folder>` and comma-separated OR queries,
  filter chips and list visibility, Advanced Search Group field (single and multi-select), tree-view
  folder/project clicks, and URL `group=` query parameter updates.
- **Out-of-Scope:** General search-language syntax (plain text, status, numeric operators, exclusion)
  covered by `vm-search-language.spec.ts` / CNV-74174. Project filter ↔ tree-view sync
  (`vm-project-filter.spec.ts`, CNV-93583). Creating or renaming folders.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project.
- **Configuration:** The UI preview feature "Enable groups in VirtualMachines tree view"
  (`treeViewFolders`) must be enabled. This is a plugin flag on the `kubevirt-ui-features`
  ConfigMap in the CNV namespace, not an HCO/KubeVirt feature gate. Playwright cluster setup
  enables it via `setupKubevirtUiConfig`. Groups themselves are represented by the
  `vm.openshift.io/folder` label on VirtualMachines.
- **Initial Setup:** `beforeAll` creates four Halted VMs in the test namespace: two in `group-alpha`,
  one in `group-beta`, and one in `group-gamma`. `afterAll` deletes those VMs. Each test navigates to
  the namespaced VirtualMachines list (`clickVmListTab`).

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/virtualmachines/vm-search/vm-group-filter.spec.ts`
**Describe:** `VM Group Filter` — **Tags:** `@tier1`, `@vm-search`
**Allure:** suite `VM Group Filter`, feature `Tier 1`

---

### `001`: Group key is visible in search suggestions

- **Objective:** Verify that focusing the search input shows `group` in the Search by keys section.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-94097
- **Pre-conditions:** Folder-labeled VMs exist in the test namespace
- **Tags:** `@adminOnly`

| Step | Action                        | Expected Result            |
| :--- | :---------------------------- | :------------------------- |
| 1    | Focus the search input        | Search dropdown is visible |
| 2    | Observe the Search by section | The `group` key is visible |
| 3    | Press Escape                  | Dropdown is dismissed      |

---

### `002`: group:folderName filters VMs by group

- **Objective:** Verify that `group:group-alpha` applies a group chip and lists only VMs in that group.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-94097
- **Pre-conditions:** Folder-labeled VMs exist in the test namespace
- **Tags:** `@adminOnly`

| Step | Action                     | Expected Result                                   |
| :--- | :------------------------- | :------------------------------------------------ |
| 1    | Submit `group:group-alpha` | Query is submitted without error                  |
| 2    | Observe filter chips       | A group chip containing `group-alpha` is shown    |
| 3    | Observe the VM list        | Both alpha VMs are visible; the beta VM is hidden |

---

### `003`: Comma-separated groups apply OR logic

- **Objective:** Verify that `group:group-alpha,group-beta` shows both group chips and matching VMs.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-94097
- **Pre-conditions:** Folder-labeled VMs exist in the test namespace
- **Tags:** `@adminOnly`

| Step | Action                                | Expected Result                                         |
| :--- | :------------------------------------ | :------------------------------------------------------ |
| 1    | Submit `group:group-alpha,group-beta` | Query is submitted without error                        |
| 2    | Observe filter chips                  | Chips for both `group-alpha` and `group-beta` are shown |
| 3    | Observe the VM list                   | Alpha and beta VMs are visible; the gamma VM is hidden  |

---

### `004`: Clearing the group filter restores all VMs

- **Objective:** Verify that clearing search after a group query shows all VMs again.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-94097
- **Pre-conditions:** Folder-labeled VMs exist in the test namespace
- **Tags:** `@adminOnly`

| Step | Action                        | Expected Result                        |
| :--- | :---------------------------- | :------------------------------------- |
| 1    | Submit `group:group-alpha`    | Group filter is applied                |
| 2    | Click the clear search button | Search is cleared                      |
| 3    | Observe the VM list           | Alpha, beta, and gamma VMs are visible |

---

### `005`: Selecting a group in Advanced Search applies the filter

- **Objective:** Verify that choosing a group in the Advanced Search modal applies the group chip and
  filters the list.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-94097
- **Pre-conditions:** Folder-labeled VMs exist in the test namespace
- **Tags:** `@adminOnly`

| Step | Action                                  | Expected Result                                   |
| :--- | :-------------------------------------- | :------------------------------------------------ |
| 1    | Open the Advanced Search modal          | Modal is visible                                  |
| 2    | Select `group-alpha` in the Group field | Group value is selected                           |
| 3    | Click Search in the modal footer        | Modal submits the search                          |
| 4    | Observe filter chips                    | A group chip containing `group-alpha` is shown    |
| 5    | Observe the VM list                     | Both alpha VMs are visible; the beta VM is hidden |

---

### `006`: Multi-group selection in Advanced Search shows all matching VMs

- **Objective:** Verify that selecting two groups in Advanced Search lists VMs from both groups.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-94097
- **Pre-conditions:** Folder-labeled VMs exist in the test namespace
- **Tags:** `@adminOnly`

| Step | Action                                | Expected Result                                        |
| :--- | :------------------------------------ | :----------------------------------------------------- |
| 1    | Open the Advanced Search modal        | Modal is visible                                       |
| 2    | Select `group-alpha` and `group-beta` | Both groups are selected                               |
| 3    | Click Search in the modal footer      | Modal submits the search                               |
| 4    | Observe the VM list                   | Alpha and beta VMs are visible; the gamma VM is hidden |

---

### `007`: Clicking a folder node in the tree applies the group filter

- **Objective:** Verify that clicking a folder in the tree sets `group=` in the URL and filters the list.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-94097
- **Pre-conditions:** Folder-labeled VMs exist in the test namespace
- **Tags:** `@adminOnly`

| Step | Action                                                 | Expected Result                                   |
| :--- | :----------------------------------------------------- | :------------------------------------------------ |
| 1    | Expand the project in the tree and click `group-alpha` | Folder node is selected                           |
| 2    | Observe the URL                                        | URL contains `group=group-alpha`                  |
| 3    | Observe the VM list                                    | Both alpha VMs are visible; the beta VM is hidden |

---

### `008`: Clicking the project node removes the group filter

- **Objective:** Verify that clicking the project node after a folder selection clears `group=` from
  the URL and restores all VMs.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-94097
- **Pre-conditions:** Folder-labeled VMs exist in the test namespace
- **Tags:** `@adminOnly`

| Step | Action                                                | Expected Result                        |
| :--- | :---------------------------------------------------- | :------------------------------------- |
| 1    | Expand the project and click the `group-alpha` folder | Group filter is applied                |
| 2    | Click the project node                                | Project is selected                    |
| 3    | Observe the URL                                       | URL does not contain `group=`          |
| 4    | Switch to the VM list tab and observe the list        | Alpha, beta, and gamma VMs are visible |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type    | Status    |
| ----------- | ------------ | ---------------- | --------- |
| CNV-94097   | `001`        | Feature coverage | Automated |
| CNV-94097   | `002`        | Feature coverage | Automated |
| CNV-94097   | `003`        | Feature coverage | Automated |
| CNV-94097   | `004`        | Feature coverage | Automated |
| CNV-94097   | `005`        | Feature coverage | Automated |
| CNV-94097   | `006`        | Feature coverage | Automated |
| CNV-94097   | `007`        | Feature coverage | Automated |
| CNV-94097   | `008`        | Feature coverage | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Adam Viktora
- **Approval Signature:** Adam Viktora
