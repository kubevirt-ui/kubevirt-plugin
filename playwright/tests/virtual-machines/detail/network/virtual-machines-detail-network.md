# Software Test Description (STD): Virtual Machines — Detail — Network

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtual-machines/detail/network/`
- **Feature Area:** Tier1 — VM tabs (Configuration → Network)
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-29
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Automated E2E coverage for console routes under `tests/virtual-machines/detail/network/`.

### 2.2 Scope

- **In-Scope:**
  - All scenarios in specs under `tests/virtual-machines/detail/network/`.
- **Out-of-Scope:**
  - Scenarios documented in other route STD files.

## 3. Test Environment & Prerequisites

### vm-network-nad-broken-link

### vm-network-nad-swap

### vm-nic-name

---

## 4. Test Case Definitions

### Module: `vm-network-nad-broken-link.spec.ts`

**Spec file:** `tests/virtual-machines/detail/network/vm-network-nad-broken-link.spec.ts`
**Describe:** `VM NAD broken link` — **Tags:** `@tier1`, `@admin-only`
**Allure:** suite `VM NAD broken link`, feature `Tier 1`

---

### `001`: Show broken NAD link after referenced NAD is deleted

- **Objective:** After deleting a referenced NAD, the network column shows a disconnect state
  with the NAD name and a tooltip explaining the resource is missing.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-97325
- **Pre-conditions:** VM is Running; bridge NIC references an existing NAD
- **Tags:** `@admin-only`

| Step | Action                                               | Expected Result                                              |
| :--- | :--------------------------------------------------- | :----------------------------------------------------------- |
| 1    | Create bridge NAD, running VM, and attach Multus NIC | NIC row appears under Configuration → Network                |
| 2    | Open Configuration → Network                         | NAD name is visible as a clickable resource link             |
| 3    | Delete the NAD via Kubernetes API                    | NAD resource is removed from the cluster                     |
| 4    | Observe the NIC network column                       | Broken-link disconnect state shows the NAD name (not a link) |
| 5    | Hover the disconnect state                           | Tooltip: "This network resource has been deleted..."         |

---

---

### Module: `vm-network-nad-swap.spec.ts`

**Spec file:** `tests/virtual-machines/detail/network/vm-network-nad-swap.spec.ts`
**Describe:** `VM NAD hot-swap` — **Tags:** `@tier1`, `@admin-only`
**Allure:** suite `VM NAD hot-swap`, feature `Tier 1`

---

### `001`: Swap a running VM NIC NAD and show pending changes

- **Objective:** After changing a hot-plugged bridge NIC to a different NAD, the UI shows a
  pending-changes alert, the VM spec references the target NAD, and the network table still shows
  the runtime (source) NAD until migration.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87871
- **Pre-conditions:** VM reaches Running state; bridge NIC is attached with source NAD
- **Tags:** `@admin-only`

| Step | Action                                                            | Expected Result                                                 |
| :--- | :---------------------------------------------------------------- | :-------------------------------------------------------------- |
| 1    | Create two bridge NADs and a running empty-disk VM in a namespace | VM is Running; resources are tracked for cleanup                |
| 2    | Attach a bridge Multus NIC using the source NAD                   | NIC row appears under Configuration → Network with source NAD   |
| 3    | Open Configuration → Network and edit the NIC to the target NAD   | Edit modal saves; NAD select accepts the target option          |
| 4    | Observe pending-changes / migration-required alert                | Alert is visible on the Configuration → Network view            |
| 5    | Check the NIC network column and VM spec `multus.networkName`     | Table shows runtime (source) NAD; VM spec references target NAD |

---

---

### Module: `vm-nic-name.spec.ts`

**Spec file:** `tests/virtual-machines/detail/network/vm-nic-name.spec.ts`
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
