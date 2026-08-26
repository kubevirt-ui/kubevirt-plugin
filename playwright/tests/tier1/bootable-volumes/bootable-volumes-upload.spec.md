# Software Test Description (STD): Bootable Volumes — Upload Experience

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — Bootable volumes
- **Latest version:** CNV 5.0.0
- **Latest update:** 2026-08-17
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify the bootable volume "Add volume" upload flow: uploading a local image file, the resulting
progress toast, background upload behavior when the modal is closed, and the ability to abort an
in-progress upload from the toast.

### 2.2 Scope

- **In-Scope:** Add volume form (local file upload), upload progress toast, modal close-while-uploading
  behavior, abort/cancel upload action, DataVolume success/deletion outcomes, bootable volumes list row
  visibility after upload.
- **Out-of-Scope:** Warning shown when navigating away while an upload is in progress (CNV-89814).

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project.
- **Configuration:** No special feature gates required; uses a downloaded Cirros image as the upload
  fixture (`TestFileFactory.downloadCirrosImage`).
- **Initial Setup:** Each test creates its own namespace via `setupTestNamespace`; created DataVolumes are
  tracked via `apiClient.trackResource('DataVolume', ...)` for automatic cleanup.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/bootable-volumes/bootable-volumes-upload.spec.ts`
**Describe:** `Tier1 Bootable Volumes - Upload experience` — **Tags:** `@tier1`
**Allure:** suite `Test Virtualization Bootable volumes page`, feature `Tier 1`

---

### `001`: Uploads a bootable volume from a local file and completes successfully

- **Objective:** Verify that uploading a local image through the Add volume form results in a
  successful DataVolume and a visible list row.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-89946, CNV-87382, CNV-89800
- **Pre-conditions:** None
- **Tags:** `@nonpriv`

| Step | Action                                                                      | Expected Result                                                    |
| :--- | :-------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| 1    | Open "Add volume" via Create → "With form" and fill/save with a local image | Form submits without error                                         |
| 2    | Observe the uploading toast                                                 | Uploading toast for the image file is visible                      |
| 3    | Wait for the DataVolume to reach a terminal phase                           | DataVolume reaches the `Succeeded` phase                           |
| 4    | Observe the success toast                                                   | Success toast with a "View bootable volume `<name>`" link is shown |
| 5    | Re-navigate to the namespace's bootable volumes list                        | The uploaded volume's row is visible in the list                   |

---

### `002`: Closing the Add volume modal keeps the upload running in the background

- **Objective:** Verify that closing the Add volume modal after submit does not cancel the upload, and
  the upload can still be aborted from the toast.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-89946, CNV-87382, CNV-89800
- **Pre-conditions:** None
- **Tags:** `@nonpriv`

| Step | Action                                                             | Expected Result                                                         |
| :--- | :----------------------------------------------------------------- | :---------------------------------------------------------------------- |
| 1    | Submit the Add volume form                                         | Modal closes immediately on submit                                      |
| 2    | Verify the modal is no longer present                              | `#tab-modal` is hidden                                                  |
| 3    | Observe the uploading toast                                        | Uploading toast for the image file is visible while the modal is closed |
| 4    | Click "Cancel upload" in the toast, then observe the aborted toast | Aborted toast is shown                                                  |
| 5    | Wait for the DataVolume to be removed                              | DataVolume no longer exists                                             |

---

### `003`: Aborting an in-progress upload from the toast cancels it

- **Objective:** Verify that the abort action in the uploading toast stops the upload and cleans up the
  DataVolume, and that the abort control disappears once aborted.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-89946, CNV-87382, CNV-89800
- **Pre-conditions:** None
- **Tags:** `@nonpriv`

| Step | Action                                                                   | Expected Result                                |
| :--- | :----------------------------------------------------------------------- | :--------------------------------------------- |
| 1    | Start the upload via the Add volume form and observe the uploading toast | Uploading toast for the image file is visible  |
| 2    | Check for the "Cancel upload" (abort) button on the toast                | Abort button is visible while uploading        |
| 3    | Click "Cancel upload"                                                    | Aborted toast is shown for the image file      |
| 4    | Check for the abort button again                                         | Abort button is no longer visible once aborted |
| 5    | Wait for the DataVolume to be removed                                    | DataVolume no longer exists                    |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type    | Status    |
| ----------- | ------------ | ---------------- | --------- |
| CNV-89946   | `001`        | Feature coverage | Automated |
| CNV-89946   | `002`        | Feature coverage | Automated |
| CNV-89946   | `003`        | Feature coverage | Automated |
| CNV-89800   | `001`        | Feature coverage | Automated |
| CNV-89800   | `002`        | Feature coverage | Automated |
| CNV-89800   | `003`        | Feature coverage | Automated |
| CNV-87382   | `001`        | Feature coverage | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Gal Kremer
- **Approval Signature:** Gal Kremer
