# Software Test Description (STD): VM List CSV Export

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — Virtual machines / List
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-18
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify that the VirtualMachines list export action downloads a CSV file of the currently listed
rows, including visible data columns such as Name, Conditions, and IP address, excluding non-data
columns such as Actions, and serializing empty cell values as an em dash (`—`). Halted VMs have no
IP, so IP is `—`. Conditions may still be present (for example `Ready=False` with a reason) and are
exported as `Type=Status` values, or `—` when none remain after the list filter.

When no rows are selected, clicking export downloads the filtered list immediately. When one or more
rows are selected, export opens a dropdown with **Export selected (n)** and **Export all (n)** so
the user can download either the checked rows or the full filtered list.

### 2.2 Scope

- **In-Scope:** Export button on the namespaced VirtualMachines list, downloaded filename, CSV
  header columns (Name, Conditions, IP address; exclusion of Actions), presence of a created Halted
  VM, IP address `—` for that Halted VM, and Conditions matching the filtered VM conditions
  (`Type=Status`, or `—` when the filtered list is empty). With a subset of rows selected: export
  dropdown options, selected-only CSV content, and export-all CSV content for two Halted VMs.
- **Out-of-Scope:** Empty-list disable (covered by Jest). Loading disabled state. CSV export on
  other virtualization list views (shared `KubevirtTableExport` component). Column-management
  hiding columns or enabling additional columns (Created, Memory, CPU, Network) before export.
  Populated Conditions / IP values on a Running VM. Select-all / filters-clear-selection behavior.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project.
- **Configuration:** No special feature gates required.
- **Initial Setup:** `beforeAll` creates one namespace and two Halted VMs. `afterAll` deletes both
  VMs. Each test opens the namespaced VirtualMachines list tab through the UI.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/virtualmachines/vm-list/vm-list-csv-export.spec.ts`
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

| Step | Action                                   | Expected Result                                                                                                                                      |
| :--- | :--------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Open the namespaced VirtualMachines list | The Halted VM row is visible                                                                                                                         |
| 2    | Click the CSV export button              | A CSV file is downloaded immediately (no dropdown)                                                                                                   |
| 3    | Observe the downloaded filename          | Filename ends with `<namespace>-virtual-machines.csv`                                                                                                |
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

| Step | Action                                              | Expected Result                                              |
| :--- | :-------------------------------------------------- | :----------------------------------------------------------- |
| 1    | Open the namespaced VirtualMachines list            | Both Halted VM rows are visible                              |
| 2    | Select one VM with its row checkbox                 | The VM is checked                                            |
| 3    | Click export and choose **Export selected**         | A CSV is downloaded whose Name column contains only that VM  |
| 4    | Click export and choose **Export all**              | A CSV is downloaded whose Name column contains both test VMs |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type             | Status    |
| ----------- | ------------ | ------------------------- | --------- |
| CNV-89111   | `001`        | Feature coverage          | Automated |
| CNV-96389   | `001`        | Bugfix regression guard   | Automated |
| CNV-96285   | `002`        | Bugfix regression guard   | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Gal Kremer
- **Approval Signature:** Gal Kremer
