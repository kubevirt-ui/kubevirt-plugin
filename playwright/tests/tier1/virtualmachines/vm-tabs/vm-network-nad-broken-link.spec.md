# Software Test Description (STD): VM NAD Broken Link

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — VM tabs (Configuration → Network)
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-29
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

Verify that when a VM references a Multus NetworkAttachmentDefinition (NAD) that is later
deleted, the Configuration → Network table shows a broken-link disconnect state instead of a
clickable resource link, with an explanatory tooltip.

### 2.2 Scope

- **In-Scope:** Bridge NAD attached to a running VM; NAD deletion via API; VerifiedResourceLink
  disconnect UI in the network column; missing-resource tooltip.
- **Out-of-Scope:** Pod networking; NAD hot-swap pending changes; cross-namespace NAD references.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project (admin
  credentials).
- **Configuration:** Hot-cluster E2E (`@admin-only`). Requires Multus bridge NAD support.
- **Initial Setup:** Each test creates a namespace, a bridge NAD, and a running VM with an empty
  disk. A bridge Multus NIC is attached via API patch. Created resources are tracked for cleanup.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/virtualmachines/vm-tabs/vm-network-nad-broken-link.spec.ts`
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

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type    | Status    |
| ----------- | ------------ | ---------------- | --------- |
| CNV-97325   | `001`        | Feature coverage | Automated |
