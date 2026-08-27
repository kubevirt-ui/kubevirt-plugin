# Software Test Description (STD): VM List CSV Export

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — Virtual machines / List
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-08-26
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify that the VirtualMachines list export action downloads a CSV file of the currently listed
rows, including data columns such as Name and excluding non-data columns such as Actions.

### 2.2 Scope

- **In-Scope:** Export button on the namespaced VirtualMachines list, downloaded filename, CSV
  header columns, and presence of the created Halted VM in the file.
- **Out-of-Scope:** Empty-list disable (covered by Jest). Loading disabled state. CSV export on
  other virtualization list views (shared `KubevirtTableExport` component). Column-management
  hiding columns before export.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project.
- **Configuration:** No special feature gates required.
- **Initial Setup:** `beforeAll` creates one namespace and one Halted VM. `afterAll` deletes the VM.
  Each test opens the namespaced VirtualMachines list tab through the UI.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/virtualmachines/vm-list/vm-list-csv-export.spec.ts`
**Describe:** `VM List CSV Export` — **Tags:** `@tier1`, `vm-list`
**Allure:** suite `VM List CSV Export`, feature `Tier 1`

---

### `001`: Exporting the namespaced VM list downloads CSV with listed VMs

- **Objective:** Verify that clicking export on a namespaced VirtualMachines list downloads a CSV
  whose filename includes the namespace, whose header includes Name and excludes Actions, and
  whose rows include the Halted VM created for the test.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-89111
- **Pre-conditions:** A Halted VM exists in a dedicated test namespace
- **Tags:** `@adminOnly`

| Step | Action                                   | Expected Result                                                          |
| :--- | :--------------------------------------- | :----------------------------------------------------------------------- |
| 1    | Open the namespaced VirtualMachines list | The Halted VM row is visible                                             |
| 2    | Click the CSV export button              | A CSV file is downloaded                                                 |
| 3    | Observe the downloaded filename          | Filename ends with `<namespace>-virtual-machines.csv`                    |
| 4    | Observe CSV headers and rows             | Header includes Name, does not include Actions; VM name is in a data row |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type    | Status    |
| ----------- | ------------ | ---------------- | --------- |
| CNV-89111   | `001`        | Feature coverage | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Gal Kremer
- **Approval Signature:** Gal Kremer
