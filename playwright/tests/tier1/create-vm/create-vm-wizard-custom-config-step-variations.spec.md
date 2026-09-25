# Software Test Description (STD): VM Creation Wizard — Custom Configuration Step Variations

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — VM creation wizard
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-23
- **Document Status:** In Review

## 2. Introduction

### 2.1 Purpose

Verify that Custom configuration VMs can be created successfully with combinations of wizard
choices that differ from the primary happy path covered by `create-vm-wizard-custom-config.spec.ts`:
a Windows guest OS with no boot source, an explicit "No boot source" selection for the default OS,
and a non-default instance type series with the largest compute size.

### 2.2 Scope

- **In-Scope:** Windows guest OS tile selection with no boot source; explicit "No boot source"
  selection not blocking progression to Review; selecting a non-default instance type series
  (Memory Intensive) and the largest compute size, then verifying the created VM references a
  matching instance type via the API.
- **Out-of-Scope:** RHEL guest OS with a boot volume and medium size (covered by
  `create-vm-wizard-custom-config.spec.ts`); Description/Boot order editing (covered by
  `create-vm-wizard-custom-config-customization-editing.spec.ts`); special-character or long-text
  input (backend validation, not covered by design).

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project; kubeadmin or
  an equivalent cluster-admin session.
- **Configuration:** None beyond the default instance type series/sizes and OS tiles being present.
- **Initial Setup:** Each test creates its own namespace via `setupTestNamespace`; the created VM is
  tracked via `apiClient.trackResource('VirtualMachine', ...)` for automatic cleanup.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/create-vm/create-vm-wizard-custom-config-step-variations.spec.ts`
**Describe:** `VM Creation Wizard — Custom configuration step variations` — **Tags:** `@tier1`,
`@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier 1`

---

### `001`: Windows guest OS with no boot source reaches Review and creates a VM

- **Objective:** Verify that selecting the Windows OS tile and "No boot source" does not block
  progression through Compute resources and Customization, and successfully creates a VM.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                                                                          | Expected Result                                            |
| :--- | :------------------------------------------------------------------------------ | :--------------------------------------------------------- |
| 1    | Generate a VM name; click Next                                                  | Wizard advances to Guest OS                                |
| 2    | Select the Windows OS tile; wait for the OS type list to load; click Next       | Next enables once the OS type list finishes loading        |
| 3    | Select "No boot source"; click Next through Compute resources and Customization | Review step is reached without errors                      |
| 4    | Create the VM                                                                   | The console redirects to VM details; the VM exists via API |

---

### `002`: Explicitly selecting "No boot source" does not block progression to Review

- **Objective:** Verify that explicitly choosing "No boot source" on the Boot source step (rather
  than picking any volume) does not disable Next, and the wizard can still reach Review and create
  a VM.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                                                 | Expected Result                                            |
| :--- | :----------------------------------------------------- | :--------------------------------------------------------- |
| 1    | Generate a VM name and advance through Guest OS        | Boot source step is visible                                |
| 2    | Select "No boot source"                                | Next remains enabled                                       |
| 3    | Click Next through Compute resources and Customization | Review step is reached without errors                      |
| 4    | Create the VM                                          | The console redirects to VM details; the VM exists via API |

---

### `003`: A non-default instance type series and the largest compute size are reflected in the created VM

- **Objective:** Verify that selecting the Memory Intensive (M) instance type series and the last
  available compute-size option updates the dropdown with that exact option, and that the resulting
  VM references an instance type from that series via the API.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                                                                   | Expected Result                                       |
| :--- | :----------------------------------------------------------------------- | :---------------------------------------------------- |
| 1    | Generate a VM name; advance through Guest OS and select "No boot source" | Compute resources step is reached                     |
| 2    | Select the Memory Intensive (M) series and the largest compute size      | The dropdown displays the last available size option  |
| 3    | Click Next through Customization to Review, then create the VM           | The console redirects to VM details                   |
| 4    | Fetch the created VM via the API                                         | `spec.instancetype.name` is set and starts with `m1.` |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type    | Status    |
| ----------- | ------------ | ---------------- | --------- |
| CNV-96281   | `001`        | Feature coverage | Automated |
| CNV-96281   | `002`        | Feature coverage | Automated |
| CNV-96281   | `003`        | Feature coverage | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Vojtech Portes
- **Approval Signature:** Pending
