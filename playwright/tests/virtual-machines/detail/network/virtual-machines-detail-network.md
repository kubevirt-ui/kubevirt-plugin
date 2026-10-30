# Software Test Description (STD): Virtual Machines — Detail — Network

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtual-machines/detail/network/`
- **Feature Area:** Gating / Tier1 / Tier2 — VM detail Network interfaces tab
- **Latest version:** CNV 4.17.0
- **Latest update:** 2026-10-15
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

E2E coverage for the VM **Network interfaces** tab and add-NIC modal on OpenShift Virtualization 4.12.

### 2.2 Scope

- **In-Scope:** Scenarios in `vm-network-interfaces.spec.ts`.
- **Out-of-Scope:** Catalog review wizard networks (see `tests/catalog/catalog.md`).

## 3. Test Environment & Prerequisites

- OpenShift cluster with CNV / KubeVirt and Multus-capable NAD CRD.
- Console login via global setup storage state.
- Multus scenarios provision NAD via console Kubernetes proxy (see `RequestContextClient`).

---

## 4. Test Case Definitions

### Module: `vm-network-interfaces.spec.ts`

**Spec file:** `tests/virtual-machines/detail/network/vm-network-interfaces.spec.ts`
**Tags:** `@route-virtual-machines-detail` `@route-virtual-machines-detail-network` `@gating` / `@tier1` / `@tier2`

---

### `001`: Network interfaces tab lists pod NIC and add action

- **Objective:** Default pod NIC is listed and Add network interface is available.
- **Target version:** CNV 4.17.0
- **Tags:** `@gating`

| Step | Action                                    | Expected Result                               |
| :--- | :---------------------------------------- | :-------------------------------------------- |
| 1    | Open VM example on Network interfaces tab | Tab loads                                     |
| 2    | Inspect NIC grid                          | `default` pod NIC visible, Add button visible |

---

### `002`: Add and delete a Multus network interface (Tier1)

- **Objective:** Secondary bridge NIC can be added and removed when a NAD exists.
- **Target version:** CNV 4.17.0
- **Tags:** `@tier1` `@non-priv`

| Step | Action                                  | Expected Result     |
| :--- | :-------------------------------------- | :------------------ |
| 1    | Provision NAD and migratable VM via API | Resources ready     |
| 2    | Add NIC with NAD in modal, save         | NIC appears in grid |
| 3    | Delete NIC via row action               | NIC removed         |

---

### `003`: Add and delete a Multus network interface (Tier2)

- **Objective:** Same as `002` on Tier2 project schedule.
- **Target version:** CNV 4.17.0
- **Tags:** `@tier2`

| Step | Action        | Expected Result |
| :--- | :------------ | :-------------- |
| 1    | Same as `002` | Same as `002`   |
