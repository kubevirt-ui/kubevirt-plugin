# Software Test Description (STD): VM Disk Name

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — VM tabs (Disk modal)
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-25
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify the disk `Name` field, moved to Advanced settings by CNV-97308, enforces required and
duplicate-name validation when adding a blank disk, and that Edit Disk exposes the same field as
enabled with no validation error once the disk exists.

### 2.2 Scope

- **In-Scope:** Add Disk modal Advanced settings Name field; required-name validation;
  duplicate-name validation against an existing disk; creating a blank disk with a unique name;
  Edit Disk modal Name field enabled state and validation state.
- **Out-of-Scope:** Disk deletion; non-blank disk sources (cloned/imported/uploaded); disk
  resizing or interface/bus changes.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project.
- **Configuration:** `@nonpriv` — no elevated cluster permissions required.
- **Initial Setup:** Each test creates a namespace and a stopped VM with an existing `emptydisk`
  disk. Created resources are tracked via `apiClient.trackResource(...)` for automatic cleanup.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/virtualmachines/vm-tabs/vm-disk-name.spec.ts`
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

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type           | Status    |
| ----------- | ------------ | ----------------------- | --------- |
| CNV-97308   | `001`        | Bugfix regression guard | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Adam Viktora
- **Approval Signature:** Adam Viktora
