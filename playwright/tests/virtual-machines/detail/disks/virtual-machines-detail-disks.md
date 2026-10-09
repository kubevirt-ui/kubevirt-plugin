# Software Test Description (STD): Virtual Machines — Detail — Disks

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtual-machines/detail/disks/`
- **Feature Area:** Tier1 — VM tabs (CD-ROM)
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-07
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Automated E2E coverage for console routes under `tests/virtual-machines/detail/disks/`.

### 2.2 Scope

- **In-Scope:**
  - All scenarios in specs under `tests/virtual-machines/detail/disks/`.
- **Out-of-Scope:**
  - Scenarios documented in other route STD files.

## 3. Test Environment & Prerequisites

### vm-cdrom-upload

### vm-disk-name

### vm-disk-operations

### vm-disk-serial

---

## 4. Test Case Definitions

### Module: `vm-cdrom-upload.spec.ts`

**Spec file:** `tests/virtual-machines/detail/disks/vm-cdrom-upload.spec.ts`
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

### `003`: Creating a new VM does not cancel an in-progress CD-ROM upload on another VM

- **Objective:** Verify that opening and leaving the VM creation wizard does not cancel a background
  CD-ROM ISO upload that was started on an existing VM (CNV-96397).
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-96397
- **Pre-conditions:** VM must exist and be reachable via the VM tree view (created stopped from the
  RHEL9 template)
- **Tags:** `@nonpriv`

| Step | Action                                                              | Expected Result                                                       |
| :--- | :------------------------------------------------------------------ | :-------------------------------------------------------------------- |
| 1    | Add a CD-ROM disk using "Upload new ISO" with the sized ISO fixture | CD-ROM disk is added; uploading toast is visible                      |
| 2    | Navigate to the VM list and open the VM creation wizard             | Wizard is visible                                                     |
| 3    | Cancel / leave the wizard                                           | Wizard closes (unmount cleanup runs)                                  |
| 4    | Observe the upload toast                                            | Uploading or success toast is shown; upload is not aborted/canceled   |
| 5    | Check for the "Cancel upload" (abort) button                        | If still visible (upload in progress), the test aborts it to clean up |

---

---

### Module: `vm-disk-name.spec.ts`

**Spec file:** `tests/virtual-machines/detail/disks/vm-disk-name.spec.ts`
**Describe:** `Tier1 VM disk name validation` — **Tags:** `@tier1`, `@nonpriv`
**Allure:** suite `VM Disk Name`, feature `Tier 1`

---

### `001`: Validate and edit a disk name

- **Objective:** Adding a blank disk with a blank or duplicate name shows the matching validation
  error, saving with a unique name creates the disk, and Edit Disk then shows the Name field
  enabled with no validation error.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-97308
- **Pre-conditions:** Stopped VM has an existing disk named `emptydisk`.
- **Tags:** `@nonpriv`

| Step | Action                                                           | Expected Result                                                                      |
| :--- | :--------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| 1    | Open Add Disk → Empty disk (blank) and expand Advanced settings  | Name input is displayed.                                                             |
| 2    | Clear the Name field                                             | `This field is required` is displayed.                                               |
| 3    | Enter `emptydisk` (the existing disk's name)                     | `This name is already used by another disk` is displayed.                            |
| 4    | Enter a unique name and save                                     | Both validation errors clear; disk is created and listed in Configuration → Storage. |
| 5    | Open Edit Disk for the created disk and expand Advanced settings | Name input is enabled and neither validation error is displayed.                     |

---

---

### Module: `vm-disk-operations.spec.ts`

**Spec file:** `tests/virtual-machines/detail/disks/vm-disk-operations.spec.ts`
**Describe:** `Tier1 VM Disk Operations — stopped RHEL9` — **Tags:** @tier1
**Allure:** suite `VM Disk Operations`, feature `Tier 1`

---

### `001`: Pod networking visible, add blank disk with storage class, detach disk

- **Objective:** Pod networking visible, add blank disk with storage class, detach disk
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1

| Step | Action                                                                                      | Expected Result                   |
| :--- | :------------------------------------------------------------------------------------------ | :-------------------------------- |
| 1    | Run Playwright test: Pod networking visible, add blank disk with storage class, detach disk | All expectations in the spec pass |

---

---

### Module: `vm-disk-serial.spec.ts`

**Spec file:** `tests/virtual-machines/detail/disks/vm-disk-serial.spec.ts`
**Describe:** `Tier1 VM Disk Serial — add blank disk with serial and edit it` — **Tags:** @tier1
**Allure:** suite `VM Disk Serial Number`, feature `Tier 1`

---

### `001`: add blank disk with serial, verify in table, then edit serial

- **Objective:** add blank disk with serial, verify in table, then edit serial
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1

| Step | Action                                                                             | Expected Result                   |
| :--- | :--------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: add blank disk with serial, verify in table, then edit serial | All expectations in the spec pass |
