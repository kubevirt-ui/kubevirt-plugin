# Software Test Description (STD): VM NAD Hot-Swap Pending Changes

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — VM tabs (Configuration → Network)
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-03
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify that editing a running VM's bridge NIC NetworkAttachmentDefinition (NAD) from
Configuration → Network shows the pending-changes / migration-required alert and updates the VM
spec, while the network table continues to show the runtime NAD until migration applies the
change.

### 2.2 Scope

- **In-Scope:** Hot-plugged bridge Multus NIC on a running VM; Configuration → Network Edit NAD
  select; pending-changes alert; VM spec `multus.networkName` update; runtime vs desired NAD
  display in the network table.
- **Out-of-Scope:** Completing live migration after NAD swap; OVN overlay NAD types; pod
  networking; NIC delete flow (covered elsewhere).

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project (admin
  credentials).
- **Configuration:** Hot-cluster E2E (`@admin-only`). Requires Multus bridge NAD support.
- **Initial Setup:** Each test creates a namespace, two bridge NADs, and a running VM with an
  empty disk (no DataSource clone). A bridge Multus NIC is attached via API patch. Created
  resources are tracked via `apiClient.trackResource(...)` for automatic cleanup.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/virtualmachines/vm-tabs/vm-network-nad-swap.spec.ts`
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

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type    | Status    |
| ----------- | ------------ | ---------------- | --------- |
| CNV-87871   | `001`        | Feature coverage | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Gal Kremer
- **Approval Signature:** Gal Kremer
