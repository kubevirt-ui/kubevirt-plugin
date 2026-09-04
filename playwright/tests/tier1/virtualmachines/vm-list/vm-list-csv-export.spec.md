# Software Test Description (STD): VM List CSV Export

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — Virtual machines / List
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-04
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify that the VirtualMachines list export action downloads a CSV file of the currently listed
rows, including visible data columns such as Name, Conditions, and IP address, excluding non-data
columns such as Actions, and serializing empty cell values as an em dash (`—`).

### 2.2 Scope

- **In-Scope:** Export button on the namespaced VirtualMachines list, downloaded filename, CSV
  header columns (Name, Conditions, IP address; exclusion of Actions), presence of the created
  Halted VM, and empty Conditions / IP address cell values for that Halted VM.
- **Out-of-Scope:** Empty-list disable (covered by Jest). Loading disabled state. CSV export on
  other virtualization list views (shared `KubevirtTableExport` component). Column-management
  hiding columns or enabling additional columns (Created, Memory, CPU, Network) before export.
  Populated Conditions / IP values on a Running VM.

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
  whose filename includes the namespace, whose header includes Name, Conditions, and IP address and
  excludes Actions, and whose Halted VM row has the VM name plus em dashes for Conditions and IP
  address.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-89111, CNV-96389
- **Pre-conditions:** A Halted VM exists in a dedicated test namespace
- **Tags:** `@adminOnly`

| Step | Action                                   | Expected Result                                                                                                                                      |
| :--- | :--------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Open the namespaced VirtualMachines list | The Halted VM row is visible                                                                                                                         |
| 2    | Click the CSV export button              | A CSV file is downloaded                                                                                                                             |
| 3    | Observe the downloaded filename          | Filename ends with `<namespace>-virtual-machines.csv`                                                                                                |
| 4    | Observe CSV headers and the VM row       | Header includes Name, Conditions, and IP address, and does not include Actions. The Halted VM row has the VM name, Conditions `—`, and IP address `—` |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type             | Status    |
| ----------- | ------------ | ------------------------- | --------- |
| CNV-89111   | `001`        | Feature coverage          | Automated |
| CNV-96389   | `001`        | Bugfix regression guard   | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Gal Kremer
- **Approval Signature:** Gal Kremer
