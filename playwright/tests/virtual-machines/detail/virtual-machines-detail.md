# Software Test Description (STD): Virtual Machines — Detail

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtual-machines/detail/`
- **Feature Area:** Tier1 — VM detail
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-07
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Automated E2E coverage for console routes under `tests/virtual-machines/detail/`.

### 2.2 Scope

- **In-Scope:**
  - All scenarios in specs under `tests/virtual-machines/detail/`.
- **Out-of-Scope:**
  - Scenarios documented in other route STD files.

## 3. Test Environment & Prerequisites

### vm-detail-tabs

### vm-modal-success-error

---

## 4. Test Case Definitions

### Module: `vm-detail-tabs.spec.ts`

**Spec file:** `tests/virtual-machines/detail/vm-detail-tabs.spec.ts`
**Describe:** `VM and VMI detail tabs` — **Tags:** @tier1
**Allure:** suite `VM and VMI detail tabs`, feature `Tier 1`

---

### `001`: VM and VMI detail tabs show expected content

- **Objective:** VM and VMI detail tabs show expected content
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1

| Step | Action                                                            | Expected Result                   |
| :--- | :---------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: VM and VMI detail tabs show expected content | All expectations in the spec pass |

---

---

### Module: `vm-modal-success-error.spec.ts`

**Spec file:** `tests/virtual-machines/detail/vm-modal-success-error.spec.ts`
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
