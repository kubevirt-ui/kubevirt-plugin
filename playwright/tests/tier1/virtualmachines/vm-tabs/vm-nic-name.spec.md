# Software Test Description (STD): VM Network Interface Name

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — VM tabs (Network interface modal)
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-25
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify the network-interface `Name` field, moved to Advanced settings by CNV-97308, enforces
required and duplicate-name validation when adding a network interface, and that Edit Network
Interface exposes the same field as enabled with no validation error once the interface exists.

### 2.2 Scope

- **In-Scope:** Add Network Interface modal Advanced settings Name field; required-name
  validation; duplicate-name validation against an existing NIC; creating a bridge-NAD NIC with a
  unique name; Edit Network Interface modal Name field enabled state and validation state.
- **Out-of-Scope:** Network interface deletion; NAD hot-swap on a running VM (covered by
  `vm-network-nad-swap.spec.ts`); non-bridge NAD types; pod networking.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project (admin
  credentials).
- **Configuration:** `@admin-only` — creates a NetworkAttachmentDefinition via the API.
- **Initial Setup:** Each test creates a namespace, a bridge NetworkAttachmentDefinition, and a
  stopped VM with an empty disk and the default pod-network NIC named `default`. Created
  resources are tracked via `apiClient.trackResource(...)` for automatic cleanup.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/virtualmachines/vm-tabs/vm-nic-name.spec.ts`
**Describe:** `Tier1 VM network interface name validation` — **Tags:** `@tier1`, `@admin-only`
**Allure:** suite `VM Network Interface Name`, feature `Tier 1`

---

### `001`: Validate and edit a network-interface name

- **Objective:** Adding a network interface with a blank or duplicate name shows the matching
  validation error, saving with a unique name creates the NIC, and Edit Network Interface then
  shows the Name field enabled with no validation error.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-97308
- **Pre-conditions:** Stopped VM has the default pod-network NIC named `default` and a bridge NAD
  is available in the namespace.
- **Tags:** `@admin-only`

| Step | Action                                                                                           | Expected Result                                                                     |
| :--- | :----------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| 1    | Open Add Network Interface, wait for the bridge NAD to auto-select, and expand Advanced settings | Name input is displayed.                                                            |
| 2    | Clear the Name field                                                                             | `This field is required` is displayed.                                              |
| 3    | Enter `default` (the existing NIC's name)                                                        | `This name is already used by another network interface` is displayed.              |
| 4    | Enter a unique name and save                                                                     | Both validation errors clear; NIC is created and listed in Configuration → Network. |
| 5    | Open Edit Network Interface for the created NIC and expand Advanced settings                     | Name input is enabled and neither validation error is displayed.                    |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type    | Status    |
| ----------- | ------------ | ---------------- | --------- |
| CNV-97308   | `001`        | Feature coverage | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Adam Viktora
- **Approval Signature:** Adam Viktora
