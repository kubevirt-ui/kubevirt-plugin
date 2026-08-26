# Software Test Description (STD): VM CD-ROM Upload

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — VM tabs (CD-ROM)
- **Latest version:** CNV 5.0.0
- **Latest update:** 2026-08-17
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify the "Add CD-ROM" flow with the "Upload new ISO" source on an existing, stopped RHEL9 VM,
including the resulting background upload toast and the ability to abort an in-progress upload.

### 2.2 Scope

- **In-Scope:** Add CD-ROM disk modal with "Upload new ISO" source, background upload progress toast,
  abort/cancel upload action, DataVolume deletion after abort.
- **Out-of-Scope:** Adding a CD-ROM with upload during new VM creation (CNV-90313) — this file covers
  upload to an already-existing VM only.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project.
- **Configuration:** No special feature gates required; uses a RHEL9 template
  (`utils.TEMPLATE_METADATA_NAMES.RHEL9`) to create a stopped VM, and a locally generated sized ISO
  fixture (`TestFileFactory.createSizedIsoFile`) so the upload stays abortable long enough for toast
  assertions.
- **Initial Setup:** Each test creates its own namespace and a stopped RHEL9 VM from template; created
  Namespace, VirtualMachine, and DataVolume resources are tracked via `apiClient.trackResource(...)` for
  automatic cleanup.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/virtualmachines/vm-tabs/vm-cdrom-upload.spec.ts`
**Describe:** `Tier1 VM CD-ROM upload — stopped RHEL9` — **Tags:** `@tier1`, `@nonpriv`
**Allure:** suite `Tier1 VM CD-ROM upload`, feature `Tier 1`

---

### `001`: Add CD-ROM with upload starts a background upload with a toast

- **Objective:** Verify that adding a CD-ROM disk via "Upload new ISO" on an existing stopped VM starts
  a background upload and surfaces a progress toast.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-89946, CNV-87382, CNV-89800
- **Pre-conditions:** VM must exist and be reachable via the VM tree view (created stopped from the
  RHEL9 template)
- **Tags:** `@nonpriv`

| Step | Action                                                              | Expected Result                                                       |
| :--- | :------------------------------------------------------------------ | :-------------------------------------------------------------------- |
| 1    | Add a CD-ROM disk using "Upload new ISO" with the sized ISO fixture | CD-ROM disk is added from the UI                                      |
| 2    | Observe the resulting toast after the modal closes                  | Uploading or success toast is shown for the ISO file                  |
| 3    | Check for the "Cancel upload" (abort) button                        | If still visible (upload in progress), the test aborts it to clean up |
| 4    | If aborted, observe the aborted toast                               | Aborted toast is shown for the ISO file                               |

---

### `002`: Aborting an in-progress CD-ROM upload from the toast cancels it

- **Objective:** Verify that the abort action in the uploading toast stops an in-progress CD-ROM upload
  and removes the underlying DataVolume.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-89946, CNV-87382, CNV-89800
- **Pre-conditions:** VM must exist and be reachable via the VM tree view (created stopped from the
  RHEL9 template)
- **Tags:** `@nonpriv`

| Step | Action                                                              | Expected Result                                  |
| :--- | :------------------------------------------------------------------ | :----------------------------------------------- |
| 1    | Add a CD-ROM disk using "Upload new ISO" with the sized ISO fixture | CD-ROM disk is added; uploading toast is visible |
| 2    | Check for the "Cancel upload" (abort) button on the toast           | Abort button is visible while uploading          |
| 3    | Click "Cancel upload"                                               | —                                                |
| 4    | Observe the resulting toast                                         | Aborted toast is shown for the ISO file          |
| 5    | Wait for the DataVolume to be removed                               | DataVolume no longer exists                      |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type    | Status    |
| ----------- | ------------ | ---------------- | --------- |
| CNV-89946   | `001`        | Feature coverage | Automated |
| CNV-89946   | `002`        | Feature coverage | Automated |
| CNV-89800   | `001`        | Feature coverage | Automated |
| CNV-89800   | `002`        | Feature coverage | Automated |
| CNV-87382   | `001`        | Feature coverage | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Gal Kremer
- **Approval Signature:** Gal Kremer
