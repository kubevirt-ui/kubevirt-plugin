# Software Test Description (STD): Bootable Volumes — Upload to Registry

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — Bootable volumes
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-08-26
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify the "Upload to registry" export flow for an existing bootable volume: form validation, save
behavior, modal close-on-submit, and the resulting background export toast.

### 2.2 Scope

- **In-Scope:** Upload to registry modal field validation (Save enabled/disabled), submit behavior,
  modal auto-close on submit, background toast state after submit (uploading or terminal
  error/aborted).
- **Out-of-Scope:** Successful export against a real container registry, password show/hide toggle, and
  Stepper "In progress" vs "Completed" state rendering (CNV-89815 UX items not asserted here).

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project.
- **Configuration:** No special feature gates required. Uses a dummy Quay destination
  (`docker://quay.io/kubevirt-plugin-pw-tests/dummy-export:latest`) with placeholder credentials — no
  real registry access is required or exercised.
- **Initial Setup:** Each test creates its own namespace via `setupTestNamespace`, then creates a blank
  DataVolume and a corresponding DataSource via the API (`createBootableVolumeViaApi`) to have an
  existing bootable volume to export. Created resources are tracked via `apiClient.trackResource(...)`
  for automatic cleanup.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/bootable-volumes/bootable-volumes-upload-to-registry.spec.ts`
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

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type    | Status    |
| ----------- | ------------ | ---------------- | --------- |
| CNV-89946   | `001`        | Feature coverage | Automated |
| CNV-89946   | `002`        | Feature coverage | Automated |
| CNV-89815   | `001`        | Feature coverage | Automated |
| CNV-89815   | `002`        | Feature coverage | Automated |
| CNV-87382   | `002`        | Feature coverage | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Gal Kremer
- **Approval Signature:** Gal Kremer
