# Software Test Description (STD): VM Modal Success and Error

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — VM tabs (Configuration → Storage, Edit Disk modal)
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-08-26
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify that the Edit Disk PVC-resize path uses the shared TabModal success/error contract:
API failures keep the modal open with a footer danger alert, and Cancel dismisses the dialog after
an error. Covers the cited PVC-resize regression from the modal-unification work.

### 2.2 Scope

- **In-Scope:** Edit Disk modal on a PVC-backed blank disk; PATCH failure shown as an inline danger
  alert; Save remaining usable after the failure; Cancel closing the modal after an error.
- **Out-of-Scope:** Successful volume expansion (depends on StorageClass `allowVolumeExpansion`);
  add-disk success close (covered by `vm-disk-operations.spec.ts`); other TabModal consumers
  (same shell; error/success contract is covered here via Edit Disk).

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project.
- **Configuration:** No special feature gates required. PVC PATCH responses are intercepted in the
  browser so the error path does not depend on cluster RBAC or volume expansion.
- **Initial Setup:** `beforeAll` creates a namespace, a stopped RHEL9 VM from template
  (`utils.TEMPLATE_METADATA_NAMES.RHEL9`), and a blank DataVolume. It waits until the PVC
  exists with a requested size (`pvc.spec.resources.requests.storage`) — Edit Disk shows
  PersistentVolumeClaim size from that field, so the claim does not need to be Bound. Then it
  attaches the PVC to the VM (`hotplugVolumeToVm` merge-patch). Disk name is assigned in
  `beforeAll` so both tests share a PVC-backed disk even if an earlier test fails after setup.
  Created Namespace, VirtualMachine, DataVolume, and PersistentVolumeClaim resources are tracked
  via `apiClient.trackResource(...)`. Tests in this file share that VM (`test.describe.serial`).

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/virtualmachines/vm-tabs/vm-modal-success-error.spec.ts`
**Describe:** `Tier1 VM modal success and error — stopped RHEL9` — **Tags:** `@tier1`, `@nonpriv`
**Allure:** suite `VM modal success and error`, feature `Tier 1`

---

### `001`: PVC resize API error stays in the Edit Disk modal

- **Objective:** Verify that a failed PVC expand PATCH keeps Edit Disk open, shows the shared
  modal danger alert, and re-enables Save so the user can retry.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-76355, CNV-76358
- **Pre-conditions:** Stopped RHEL9 VM exists and is reachable via the VM tree view; a PVC-backed
  blank disk from `beforeAll` exists so Edit Disk shows PersistentVolumeClaim size.
- **Tags:** `@tier1`, `@nonpriv`

| Step | Action                                                                         | Expected Result                                                             |
| :--- | :----------------------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| 1    | Navigate to the VM via tree view                                               | VM details are shown                                                        |
| 2    | Intercept PATCH requests to persistentvolumeclaims with HTTP 403               | Subsequent expand submits fail at the API                                   |
| 3    | Open Edit Disk, wait for PersistentVolumeClaim size, increase size, click Save | Browser PATCH to the PVC is fulfilled with 403                              |
| 4    | Observe the modal after the failed submit                                      | Edit Disk remains open; danger alert matches the intercept; Save is enabled |

---

### `002`: Cancel after a PVC resize error dismisses the modal

- **Objective:** Verify that Cancel closes Edit Disk after a PVC expand error so the user is not
  trapped in the failed dialog.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-76355, CNV-76358
- **Pre-conditions:** Same VM and PVC-backed disk from `beforeAll` (`diskName` is not assigned in
  `001`); a fresh browser page navigates to that VM before submitting.
- **Tags:** `@tier1`, `@nonpriv`

| Step | Action                                                           | Expected Result                                     |
| :--- | :--------------------------------------------------------------- | :-------------------------------------------------- |
| 1    | Navigate to the shared VM via tree view                          | VM details are shown                                |
| 2    | Intercept PATCH requests to persistentvolumeclaims with HTTP 403 | Subsequent expand submits fail                      |
| 3    | Open Edit Disk, increase PVC size, click Save                    | Intercepted PATCH is 403; danger alert; modal stays |
| 4    | Click Cancel                                                     | Edit Disk heading becomes hidden                    |

---

## 5. Requirements Traceability Matrix

Maps Jira tickets to the test cases that provide coverage. Tickets without a specific test case indicate
a planned coverage gap (status: Pending).

| Jira Ticket | Test Case ID | Coverage Type           | Status    |
| ----------- | ------------ | ----------------------- | --------- |
| CNV-76355   | `001`        | Feature coverage        | Automated |
| CNV-76355   | `002`        | Feature coverage        | Automated |
| CNV-76358   | `001`        | Bugfix regression guard | Automated |
| CNV-76358   | `002`        | Bugfix regression guard | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Gal Kremer
- **Approval Signature:** Gal Kremer
