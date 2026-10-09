# Software Test Description (STD): Virtual Machines — List

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtual-machines/list/`
- **Feature Area:** Tier1 — VM list
- **Latest version:** CNV 5.0.0
- **Latest update:** 2026-10-05
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Automated E2E coverage for console routes under `tests/virtual-machines/list/`.

### 2.2 Scope

- **In-Scope:**
  - All scenarios in specs under `tests/virtual-machines/list/`.
- **Out-of-Scope:**
  - Scenarios documented in other route STD files.

## 3. Test Environment & Prerequisites

### virtio-drivers-alert

### vm-group-filter

### vm-list-csv-export

### vm-list-selection-sort

### vm-project-filter

### vm-search-language

### vm-tree-delete-project

### vm-tree-filter

---

## 4. Test Case Definitions

### Module: `virtio-drivers-alert.spec.ts`

**Spec file:** `tests/virtual-machines/list/virtio-drivers-alert.spec.ts`
**Describe:** `VirtIO drivers alert` — **Tags:** `@tier1`, `@nonpriv`
**Allure:** suite `VirtIO drivers alert`, feature `Tier 1`

---

### `001`: Alert is shown only when a Windows VM is in the list

- **Objective:** Verify the VirtIO drivers alert is hidden on a Linux-only VM list and visible when
  a Windows-labeled VM is listed in the namespace.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-93277
- **Pre-conditions:** Dedicated Linux and Windows namespaces each contain one halted VM; dismiss
  localStorage key is cleared
- **Tags:** `@nonpriv`

| Step | Action                                                             | Expected Result                    |
| :--- | :----------------------------------------------------------------- | :--------------------------------- |
| 1    | Open the Linux namespace VM list and wait for the Linux VM row     | VM list table shows the Linux VM   |
| 2    | Check for the VirtIO drivers alert                                 | Alert is not visible               |
| 3    | Open the Windows namespace VM list and wait for the Windows VM row | VM list table shows the Windows VM |
| 4    | Check for the VirtIO drivers alert                                 | Alert is visible                   |

---

### `002`: Go to Downloads opens the Downloads tab with the Download ISO button

- **Objective:** Verify that expanding the alert and clicking Go to Downloads navigates to the
  Settings Downloads tab and shows the Download ISO button.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-93277
- **Pre-conditions:** Windows namespace VM list shows the alert; dismiss localStorage key is cleared
- **Tags:** `@nonpriv`

| Step | Action                                                    | Expected Result                                                                     |
| :--- | :-------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| 1    | Open the Windows namespace VM list                        | Alert is visible                                                                    |
| 2    | Expand the alert and click Go to Downloads                | URL contains `virtualization-settings/downloads` and hash `#virtio-drivers-windows` |
| 3    | Observe Downloads tab content and the Download ISO button | Tab content and Download ISO button are visible                                     |

---

### `003`: Checking Don't show again and closing the alert hides it after reload

- **Objective:** Verify that checking "Don't show this message again" and closing the alert writes
  localStorage and keeps the alert hidden after reload.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-93277
- **Pre-conditions:** Windows namespace VM list shows the alert; dismiss localStorage key is cleared
  at the start of the test
- **Tags:** `@nonpriv`

| Step | Action                                                              | Expected Result             |
| :--- | :------------------------------------------------------------------ | :-------------------------- |
| 1    | Open the Windows namespace VM list                                  | Alert is visible            |
| 2    | Expand the alert, check Don't show this message again, and close it | Alert is dismissed          |
| 3    | Read `kubevirt-virtio-drivers-alert-dismissed` from localStorage    | Stored value is JSON `true` |
| 4    | Reload the VM list and wait for the Windows VM row                  | Alert is not visible        |

---

---

### Module: `vm-group-filter.spec.ts`

**Spec file:** `tests/virtual-machines/list/vm-group-filter.spec.ts`
**Describe:** `VM Group Filter` — **Tags:** `@gating`, `@vm-search`
**Allure:** suite `VM Group Filter`, feature `Gating`

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

---

### Module: `vm-list-csv-export.spec.ts`

**Spec file:** `tests/virtual-machines/list/vm-list-csv-export.spec.ts`
**Describe:** `VM List CSV Export` — **Tags:** `@tier1`, `vm-list`
**Allure:** suite `VM List CSV Export`, feature `Tier 1`

---

### `001`: Exporting the namespaced VM list downloads CSV with listed VMs

- **Objective:** Verify that clicking export on a namespaced VirtualMachines list with no row
  selection downloads a CSV whose filename includes the namespace, whose header includes Name,
  Conditions, and IP address and excludes Actions, and whose Halted VM row has the VM name, filtered
  Conditions (`Type=Status` or `—`), and IP address `—`.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-89111, CNV-96389
- **Pre-conditions:** Two Halted VMs exist in a dedicated test namespace; no table rows are selected
- **Tags:** `@adminOnly`

| Step | Action                                   | Expected Result                                                                                                                                                                                              |
| :--- | :--------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Open the namespaced VirtualMachines list | The Halted VM row is visible                                                                                                                                                                                 |
| 2    | Click the CSV export button              | A CSV file is downloaded immediately (no dropdown)                                                                                                                                                           |
| 3    | Observe the downloaded filename          | Filename ends with `<namespace>-virtual-machines.csv`                                                                                                                                                        |
| 4    | Observe CSV headers and the VM row       | Header includes Name, Conditions, and IP address, and does not include Actions. The Halted VM row has the VM name, Conditions matching the filtered VM conditions (`Type=Status` or `—`), and IP address `—` |

---

### `002`: Export dropdown downloads selected VMs or the full filtered list

- **Objective:** Verify that with one of two listed VMs checked, the export control opens a dropdown
  and **Export selected** downloads only the checked VM while **Export all** downloads both VMs.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96285
- **Pre-conditions:** Two Halted VMs exist in a dedicated test namespace and both are visible in the
  namespaced list
- **Tags:** `@adminOnly`

| Step | Action                                      | Expected Result                                              |
| :--- | :------------------------------------------ | :----------------------------------------------------------- |
| 1    | Open the namespaced VirtualMachines list    | Both Halted VM rows are visible                              |
| 2    | Select one VM with its row checkbox         | The VM is checked                                            |
| 3    | Click export and choose **Export selected** | A CSV is downloaded whose Name column contains only that VM  |
| 4    | Click export and choose **Export all**      | A CSV is downloaded whose Name column contains both test VMs |

---

---

### Module: `vm-list-selection-sort.spec.ts`

**Spec file:** `tests/virtual-machines/list/vm-list-selection-sort.spec.ts`
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

---

### Module: `vm-project-filter.spec.ts`

**Spec file:** `tests/virtual-machines/list/vm-project-filter.spec.ts`
**Describe:** `VM Project Filter` — **Tags:** `@gating`, `@vm-search`
**Allure:** suite `VM Project Filter`, feature `Gating`

---

### `001`: Clicking a project node applies a Project filter

- **Objective:** Verify that clicking a project in the tree sets `project=` in the URL, shows a
  Project chip, and lists only that project's VMs.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-93586
- **Pre-conditions:** Halted VMs exist in two test namespaces
- **Tags:** `@adminOnly`

| Step | Action                                                | Expected Result                              |
| :--- | :---------------------------------------------------- | :------------------------------------------- |
| 1    | Click Local cluster, then click project A in the tree | Project A is selected                        |
| 2    | Observe the URL                                       | URL contains `project=<project-A>`           |
| 3    | Observe filter chips                                  | A Project chip containing project A is shown |
| 4    | Observe the VM list                                   | VM A is visible; VM B is hidden              |

---

### `002`: Project filter toggle stays enabled after a tree selection

- **Objective:** Verify that the Project toolbar filter is not disabled when a project is selected
  in the tree view.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-93586
- **Pre-conditions:** Halted VMs exist in two test namespaces
- **Tags:** `@adminOnly`

| Step | Action                                                | Expected Result                      |
| :--- | :---------------------------------------------------- | :----------------------------------- |
| 1    | Click Local cluster, then click project A in the tree | Project filter is applied            |
| 2    | Observe the Project toolbar toggle                    | The Project filter toggle is enabled |

---

### `003`: Clicking Local cluster clears the Project filter

- **Objective:** Verify that clicking Local cluster after a project selection removes `project=` from
  the URL and shows VMs from both test projects.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-93586
- **Pre-conditions:** Halted VMs exist in two test namespaces
- **Tags:** `@adminOnly`

| Step | Action                                                | Expected Result                                                                                    |
| :--- | :---------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| 1    | Click Local cluster, then click project A in the tree | Project filter is applied                                                                          |
| 2    | Click Local cluster                                   | Local cluster is selected                                                                          |
| 3    | Observe the URL                                       | URL does not contain `project=`                                                                    |
| 4    | Observe the search input                              | Search box has no Project filter (no `project:` query and no project A chip)                       |
| 5    | Search each fixture name (one at a time)              | VM A then VM B are listed (avoids all-namespaces pagination; name filter uses the first chip only) |

---

### `004`: Adding a second Project filter from a namespaced URL navigates to all-namespaces

- **Objective:** Verify that selecting another project in the toolbar while the path is
  `/ns/<project-A>` broadens the path to `/all-namespaces` and keeps both project filters.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-93586
- **Pre-conditions:** Halted VMs exist in two test namespaces
- **Tags:** `@adminOnly`

| Step | Action                                                 | Expected Result                                              |
| :--- | :----------------------------------------------------- | :----------------------------------------------------------- |
| 1    | Open the namespaced VirtualMachines list for project A | Path is `/ns/<project-A>` and `project=<project-A>` is set   |
| 2    | Open the Project filter and select project B           | Project B is added to the filter                             |
| 3    | Observe the URL                                        | Path is `/all-namespaces`; `project=` includes both projects |
| 4    | Observe the VM list                                    | VM A and VM B are visible                                    |

---

---

### Module: `vm-search-language.spec.ts`

**Spec file:** `tests/virtual-machines/list/vm-search-language.spec.ts`
**Describe:** `VM Search Language` — **Tags:** `@gating`, `@vm-search`
**Allure:** suite `VM Search Language`, feature `Gating`

---

### `001`: Plain text search filters VMs by name

- **Objective:** Verify that submitting a VM name as plain text creates a name chip and lists only that
  VM.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** Fixture VMs exist in the test namespace
- **Tags:** `@adminOnly`

| Step | Action                        | Expected Result                                        |
| :--- | :---------------------------- | :----------------------------------------------------- |
| 1    | Submit the Fedora VM name     | Query is submitted without error                       |
| 2    | Observe filter chips          | A name filter chip containing the Fedora VM is shown   |
| 3    | Observe the VM list           | Fedora VM is visible; RHEL and high-CPU VMs are hidden |
| 4    | Click the clear search button | Search input is empty                                  |

---

### `002`: key:value search filters by status

- **Objective:** Verify that `status:Running` produces a Running chip and hides Stopped fixture VMs.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** Fixture VMs exist and are Stopped
- **Tags:** `@adminOnly`

| Step | Action                  | Expected Result                             |
| :--- | :---------------------- | :------------------------------------------ |
| 1    | Submit `status:Running` | Query is submitted without error            |
| 2    | Observe filter chips    | A filter chip containing `Running` is shown |
| 3    | Observe the VM list     | All three Stopped fixture VMs are hidden    |

---

### `003`: Comma-separated values apply OR logic within a key

- **Objective:** Verify that `status:Running,Stopped` produces both chips and lists the Stopped fixture
  VMs.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** Fixture VMs exist and are Stopped
- **Tags:** `@adminOnly`

| Step | Action                          | Expected Result                              |
| :--- | :------------------------------ | :------------------------------------------- |
| 1    | Submit `status:Running,Stopped` | Query is submitted without error             |
| 2    | Observe filter chips            | Both `Running` and `Stopped` chips are shown |
| 3    | Observe the VM list             | All three Stopped fixture VMs are visible    |

---

### `004`: Space-separated tokens apply AND logic across keys

- **Objective:** Verify that `status:Stopped os:Fedora` produces both chips and lists only Stopped
  Fedora VMs.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** Fixture VMs exist and are Stopped
- **Tags:** `@adminOnly`

| Step | Action                            | Expected Result                                     |
| :--- | :-------------------------------- | :-------------------------------------------------- |
| 1    | Submit `status:Stopped os:Fedora` | Query is submitted without error                    |
| 2    | Observe filter chips              | Both a `Stopped` chip and a `Fedora` chip are shown |
| 3    | Observe the VM list               | Both Fedora VMs are visible; the RHEL VM is hidden  |

---

### `005`: Numeric filter with > operator for vCPU

- **Objective:** Verify that `vcpu>4` produces a CPU chip and lists only VMs with more than 4 vCPUs.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** Fixture VMs exist
- **Tags:** `@adminOnly`

| Step | Action           | Expected Result                                                   |
| :--- | :--------------- | :---------------------------------------------------------------- |
| 1    | Submit `vcpu>4`  | Query is submitted without error                                  |
| 2    | Observe chips    | A CPU chip containing `>` and `4` is shown                        |
| 3    | Observe the list | RHEL and high-CPU Fedora VMs are visible; 1-vCPU Fedora is hidden |

---

### `006`: Numeric filter with >= operator for memory

- **Objective:** Verify that `memory>=8GiB` produces a memory chip and lists only the 8Gi VM.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** Fixture VMs exist
- **Tags:** `@adminOnly`

| Step | Action                | Expected Result                                      |
| :--- | :-------------------- | :--------------------------------------------------- |
| 1    | Submit `memory>=8GiB` | Query is submitted without error                     |
| 2    | Observe filter chips  | A memory chip containing `>=` and `8` is shown       |
| 3    | Observe the VM list   | RHEL VM is visible; both 256Mi Fedora VMs are hidden |

---

### `007`: Exclusion of an unmatched status leaves matching VMs listed

- **Objective:** Verify that `-status:Error` produces an Exclude Error chip and does not hide Stopped
  fixture VMs.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** Fixture VMs exist and are Stopped (none are Error)
- **Tags:** `@adminOnly`

| Step | Action                 | Expected Result                               |
| :--- | :--------------------- | :-------------------------------------------- |
| 1    | Submit `-status:Error` | Query is submitted without error              |
| 2    | Observe filter chips   | A chip showing `Exclude` and `Error` is shown |
| 3    | Observe the VM list    | All three Stopped fixture VMs remain visible  |

---

### `008`: Exclusion with has key (-has:gpu) hides VMs that have a GPU

- **Objective:** Verify that `-has:gpu` produces an Exclude gpu chip and hides the VM that has a GPU
  device.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** Fixture VMs exist; the RHEL VM has a dummy GPU
- **Tags:** `@adminOnly`

| Step | Action            | Expected Result                                        |
| :--- | :---------------- | :----------------------------------------------------- |
| 1    | Submit `-has:gpu` | Query is submitted without error                       |
| 2    | Observe chips     | A chip showing `Exclude` and `gpu` is shown            |
| 3    | Observe the list  | Both Fedora VMs are visible; the RHEL GPU VM is hidden |

---

### `009`: Exclusion prefix -name: hides the named VM

- **Objective:** Verify that `-name:<vm>` produces an Exclude name chip and hides only that VM.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** Fixture VMs exist
- **Tags:** `@adminOnly`

| Step | Action                                | Expected Result                                      |
| :--- | :------------------------------------ | :--------------------------------------------------- |
| 1    | Submit `-name:` with the RHEL VM name | Query is submitted without error                     |
| 2    | Observe filter chips                  | An Exclude chip containing the RHEL VM name is shown |
| 3    | Observe the VM list                   | Both Fedora VMs are visible; the RHEL VM is hidden   |

---

### `010`: description: key searches descriptions explicitly

- **Objective:** Verify that `description:database` produces a description chip and lists only the VM
  whose description contains that text.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** Fixture VMs exist
- **Tags:** `@adminOnly`

| Step | Action                        | Expected Result                                             |
| :--- | :---------------------------- | :---------------------------------------------------------- |
| 1    | Submit `description:database` | Query is submitted without error                            |
| 2    | Observe filter chips          | A description chip containing `database` is shown           |
| 3    | Observe the VM list           | Fedora database VM is visible; the other two VMs are hidden |

---

### `011`: Clear button empties the search input

- **Objective:** Verify that the clear search control removes typed query text from the input.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                                   | Expected Result                        |
| :--- | :--------------------------------------- | :------------------------------------- |
| 1    | Type `status:Running` without submitting | Search input value is `status:Running` |
| 2    | Click the clear search button            | Search input is empty                  |

---

### `012`: Search dropdown shows key suggestions on focus

- **Objective:** Verify that focusing the search input opens the dropdown with expected search keys.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                        | Expected Result                                              |
| :--- | :---------------------------- | :----------------------------------------------------------- |
| 1    | Focus the search input        | Search dropdown (`[data-test="search-dropdown"]`) is visible |
| 2    | Observe the Search by section | Keys section is visible; `name` and `status` keys are shown  |
| 3    | Press Escape                  | Dropdown is dismissed                                        |

---

### `013`: Search dropdown shows value suggestions after typing key:

- **Objective:** Verify that typing `status:` shows value autocomplete including Running and Stopped.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                             | Expected Result                             |
| :--- | :--------------------------------- | :------------------------------------------ |
| 1    | Type `status:` in the search input | Dropdown is visible with value suggestions  |
| 2    | Observe suggested values           | Suggestions include `Running` and `Stopped` |
| 3    | Press Escape                       | Dropdown is dismissed                       |

---

### `014`: Combined search applies status, numeric, and exclusion filters

- **Objective:** Verify that `status:Stopped vcpu>4 -has:gpu` produces all three chips and lists only
  the Stopped high-CPU VM that does not have a GPU.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** Fixture VMs exist and are Stopped
- **Tags:** `@adminOnly`

| Step | Action                                  | Expected Result                                                  |
| :--- | :-------------------------------------- | :--------------------------------------------------------------- |
| 1    | Submit `status:Stopped vcpu>4 -has:gpu` | Query is submitted without error                                 |
| 2    | Observe filter chips                    | Stopped, `> 4` CPU, and Exclude gpu chips are shown              |
| 3    | Observe the VM list                     | High-CPU Fedora VM is visible; 1-vCPU Fedora and RHEL are hidden |

---

### `015`: Search examples are shown in the dropdown

- **Objective:** Verify that the search dropdown surfaces example query patterns.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                       | Expected Result                                |
| :--- | :--------------------------- | :--------------------------------------------- |
| 1    | Focus the search input       | Search dropdown is visible                     |
| 2    | Observe the examples section | At least one example query (`code`) is visible |
| 3    | Press Escape                 | Dropdown is dismissed                          |

---

### `016`: Empty state text formats exclusion filters using search language syntax

- **Objective:** Verify that when a submitted query matches zero VMs, the "No results found for ..."
  empty state renders each submitted token using search-language syntax (`key:value`, exclusions
  prefixed with `-`) instead of the pre-fix raw filter dump (e.g. `os:!RHEL` or comma-joined values).
  The empty state text may also include other active filters (e.g. `project:<name>`) depending on the
  test environment, so the check only asserts that the expected tokens are present, regardless of order
  or additional content.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96225
- **Pre-conditions:** Fixture VMs exist and are Stopped (none are Paused)
- **Tags:** `@adminOnly`

| Step | Action                           | Expected Result                                                                                                                                  |
| :--- | :------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Submit `status:Paused -os:RHEL`  | Query is submitted without error; no VM has status `Paused`, so the list is empty                                                                |
| 2    | Observe the filtered empty state | Text contains both `status:Paused` and `-os:RHEL` (order-independent; other active filters, e.g. a `project:<name>` filter, may also be present) |

---

---

### Module: `vm-tree-delete-project.spec.ts`

**Spec file:** `tests/virtual-machines/list/vm-tree-delete-project.spec.ts`
**Describe:** `VM tree view delete project` — **Tags:** `@gating`
**Allure:** suite `VM tree view delete project`, feature `Gating`

---

### `001`: Delete project action is available only for projects with no VirtualMachines

- **Objective:** Verify the tree-view context menu exposes the `delete-project` action for a
  project with zero VirtualMachines, and hides that same action for a project that contains a
  VirtualMachine.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-97320
- **Pre-conditions:** An empty namespace and a namespace containing one VirtualMachine (empty disk)
  both exist on the cluster
- **Tags:** `@adminOnly`, `vm-list`

| Step | Action                                                              | Expected Result                                                                |
| :--- | :------------------------------------------------------------------ | :----------------------------------------------------------------------------- |
| 1    | Navigate to VirtualMachines and wait for the tree view to be ready  | Tree view loads and is ready for interaction                                   |
| 2    | Search the tree for the empty namespace, right-click it in the tree | Empty namespace node is visible; context menu opens                            |
| 3    | Inspect the context-menu items                                      | `delete-project` item is present for the project with 0 VirtualMachines        |
| 4    | Search the tree for the VM-containing namespace, right-click it     | Project node is visible; context menu opens                                    |
| 5    | Inspect the context-menu items                                      | `delete-project` item is absent for the project that contains a VirtualMachine |

---

### `002`: Deleting a project from the tree view removes the namespace

- **Objective:** Verify that completing the "Delete project" flow from the tree-view context menu
  (confirming the project name) deletes the namespace, removes the node from the tree, redirects
  the user away from the deleted namespace's URL, and that the namespace no longer exists on the
  cluster.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-97320
- **Pre-conditions:** An empty test namespace exists and is visible in the tree (empty-projects
  display toggled on)
- **Tags:** `@adminOnly`, `vm-list`

| Step | Action                                                                                                | Expected Result                                                                          |
| :--- | :---------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| 1    | Navigate to VirtualMachines, enable the empty-projects display, search and confirm the project exists | Project node is visible in the tree before deletion                                      |
| 2    | Right-click the project, select `Delete project`, type the project name to confirm, and submit        | Confirmation dialog closes                                                               |
| 3    | Observe the page URL and the tree                                                                     | URL no longer contains `/ns/<namespace>/`; project node is no longer visible in the tree |
| 4    | Poll the cluster for the namespace                                                                    | Namespace no longer exists on the cluster                                                |

---

---

### Module: `vm-tree-filter.spec.ts`

**Spec file:** `tests/virtual-machines/list/vm-tree-filter.spec.ts`
**Describe:** `VM tree view filter` — **Tags:** `@gating`
**Allure:** suite `VM tree view filter`, feature `Gating`

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
