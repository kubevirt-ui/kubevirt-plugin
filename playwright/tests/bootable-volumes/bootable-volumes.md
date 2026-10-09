# Software Test Description (STD): Bootable Volumes

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/bootable-volumes/`
- **Feature Area:** Tier1 / Tier2 — Bootable volumes
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-07
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Automated E2E coverage for console routes under `tests/bootable-volumes/`.

### 2.2 Scope

- **In-Scope:**
  - All scenarios in specs under `tests/bootable-volumes/`.
- **Out-of-Scope:**
  - Scenarios documented in other route STD files.

## 3. Test Environment & Prerequisites

### bootable-volume-lifecycle

### bootable-volumes-create-delete

### bootable-volumes-upload-to-registry

### bootable-volumes-upload

### bootable-volumes

---

## 4. Test Case Definitions

### Module: `bootable-volume-lifecycle.spec.ts`

**Spec file:** `tests/bootable-volumes/bootable-volume-lifecycle.spec.ts`
**Describe:** `Bootable Volume Cross-Module Lifecycle — create BV via API, verify in UI list, delete and verify removal` — **Tags:** @tier2-bv-lifecycle
**Allure:** suite `Bootable Volume Cross-Module Lifecycle`, feature `Tier 2`

---

### `001`: Create bootable volume via API, verify it appears in the BV list, delete and confirm removal

- **Objective:** Create bootable volume via API, verify it appears in the BV list, delete and confirm removal
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2-bv-lifecycle

| Step | Action                                                   | Expected Result                          |
| :--- | :------------------------------------------------------- | :--------------------------------------- |
| 1    | Create a bootable volume (blank DV + DataSource) via API | Step completes without assertion failure |
| 2    | Verify the bootable volume appears in the BV list        | Step completes without assertion failure |
| 3    | Delete the bootable volume via API                       | Step completes without assertion failure |
| 4    | Verify bootable volume is removed from the list          | Step completes without assertion failure |

---

---

### Module: `bootable-volumes-create-delete.spec.ts`

**Spec file:** `tests/bootable-volumes/bootable-volumes-create-delete.spec.ts`
**Describe:** `Tier1 Bootable Volumes - Create and Delete` — **Tags:** @tier1
**Allure:** suite `Test Virtualization Bootable volumes page`, feature `Tier 1`

---

### `001`: Create a bootable volume via the UI form using registry source

- **Objective:** Create a bootable volume via the UI form using registry source
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1

| Step | Action                                                                              | Expected Result                   |
| :--- | :---------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Create a bootable volume via the UI form using registry source | All expectations in the spec pass |

---

### `002`: Delete a bootable volume via kebab menu row action

- **Objective:** Delete a bootable volume via kebab menu row action
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1

| Step | Action                                                                  | Expected Result                   |
| :--- | :---------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Delete a bootable volume via kebab menu row action | All expectations in the spec pass |

---

---

### Module: `bootable-volumes-upload-to-registry.spec.ts`

**Spec file:** `tests/bootable-volumes/bootable-volumes-upload-to-registry.spec.ts`
**Describe:** `Tier1 Bootable Volumes - Upload to registry` — **Tags:** `@tier1`
**Allure:** suite `Test Virtualization Bootable volumes page`, feature `Tier 1`

---

### `001`: Save is disabled until all required fields are filled

- **Objective:** Verify the Upload to registry modal's Save button stays disabled until destination,
  username, and password are all provided.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-89946, CNV-87382, CNV-89815
- **Pre-conditions:** A bootable volume (DataVolume + DataSource) already exists in the test namespace
- **Tags:** `@nonpriv`

| Step | Action                                                           | Expected Result                                               |
| :--- | :--------------------------------------------------------------- | :------------------------------------------------------------ |
| 1    | Open the row action "Upload to registry" for the existing volume | Modal opens with all expected form fields visible             |
| 2    | Check the Save button state with an empty form                   | Save is disabled                                              |
| 3    | Fill only the registry name and check Save state                 | Save remains disabled (destination/username/password not set) |
| 4    | Fill destination, username, and password, then check Save state  | Save becomes enabled                                          |
| 5    | Cancel the modal                                                 | Modal closes without creating an export                       |

---

### `002`: Form submits successfully, closes the modal automatically, and shows an uploading or terminal toast

- **Objective:** Verify that a completed and submitted Upload to registry form closes the modal
  automatically and surfaces a background progress toast (or an expected terminal state given dummy
  credentials).
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-89946, CNV-87382, CNV-89815
- **Pre-conditions:** A bootable volume (DataVolume + DataSource) already exists in the test namespace
- **Tags:** `@nonpriv`

| Step | Action                                                                             | Expected Result                                                                                                                                                                                     |
| :--- | :--------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Fill the Upload to registry form with destination/username/password and click Save | Form submits without client-side validation errors                                                                                                                                                  |
| 2    | Observe the modal                                                                  | Modal (`#tab-modal`) closes automatically while the export continues in the background                                                                                                              |
| 3    | Observe the resulting toast                                                        | Uploading toast is shown, **or** the export reaches a terminal `error`/`aborted` toast state because the dummy registry credentials are invalid; if still uploading, the test aborts it to clean up |

---

---

### Module: `bootable-volumes-upload.spec.ts`

**Spec file:** `tests/bootable-volumes/bootable-volumes-upload.spec.ts`
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

### `004`: Closing the VM creation wizard does not cancel an unrelated bootable volume upload

- **Objective:** Verify that closing the VM creation wizard only cancels uploads that were started
  within the wizard, and does not affect a bootable volume upload started from the Bootable Volumes
  page.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-96397
- **Pre-conditions:** None
- **Tags:** `@nonpriv`

| Step | Action                                                        | Expected Result                                        |
| :--- | :------------------------------------------------------------ | :----------------------------------------------------- |
| 1    | Start a bootable volume upload from the Bootable Volumes page | Uploading toast for the image file is visible          |
| 2    | Open the VM creation wizard via the Create dropdown           | Wizard is visible                                      |
| 3    | Cancel the wizard                                             | Wizard closes                                          |
| 4    | Check the upload toast state                                  | Toast shows `uploading` or `success` — not `cancelled` |
| 5    | Abort the upload if still in progress (cleanup)               | Aborted toast is shown and DataVolume is removed       |

---

### Module: `bootable-volumes.spec.ts`

**Spec file:** `tests/bootable-volumes/bootable-volumes.spec.ts`
**Describe:** `Tier1 Virtualization Bootable Volumes Page Tests / Tier1 Bootable Volumes - Manage source row action` — **Tags:** @tier1
**Allure:** suite `Test Virtualization Bootable volumes page`, feature `Tier 1`

---

### `001`: Bootable volume created with architecture annotation shows correct architecture in list column

- **Objective:** Bootable volume created with architecture annotation shows correct architecture in list column
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1

| Step | Action                                                                                                              | Expected Result                   |
| :--- | :------------------------------------------------------------------------------------------------------------------ | :-------------------------------- |
| 1    | Run Playwright test: Bootable volume created with architecture annotation shows correct architecture in list column | All expectations in the spec pass |

---

### `002`: Manage source row action opens the modal and allows editing the source configuration

- **Objective:** Manage source row action opens the modal and allows editing the source configuration
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1

| Step | Action                                                                                                    | Expected Result                   |
| :--- | :-------------------------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Manage source row action opens the modal and allows editing the source configuration | All expectations in the spec pass |
