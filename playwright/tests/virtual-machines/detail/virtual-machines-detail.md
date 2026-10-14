# Software Test Description (STD): Virtual Machines — Detail

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtual-machines/detail/`
- **Feature Area:** Gating / Tier1 / Tier2 — VM detail tabs (4.12 horizontal nav)
- **Latest version:** CNV 4.12.0
- **Latest update:** 2026-10-15
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Smoke and read coverage for VM detail tabs, sidebar YAML editor, and selected tab content.

### 2.2 Scope

- **In-Scope:** `vm-detail.spec.ts` (excludes network tab Multus CRUD — see `network/virtual-machines-detail-network.md`).
- **Out-of-Scope:** Live migration (`tests/virtual-machines/migrations/`).

## 3. Test Environment & Prerequisites

- VM example manifest applied in per-test namespace.
- Gating tab test starts VM to Running for Console/Events coverage.

---

## 4. Test Case Definitions

### Module: `vm-detail.spec.ts`

**Spec file:** `tests/virtual-machines/detail/vm-detail.spec.ts`
**Tags:** `@route-virtual-machines-detail`

---

### `001`: VM example YAML and tabs load

- **Objective:** Primary horizontal tabs render expected panel content for a running VM.
- **Target version:** CNV 4.12.0
- **Tags:** `@gating`

| Step | Action                                                                                  | Expected Result                        |
| :--- | :-------------------------------------------------------------------------------------- | :------------------------------------- |
| 1    | Open VM, start from Actions                                                             | Status Running                         |
| 2    | Visit Details, Metrics, YAML, Scheduling, Environment, Events, Console, Networks, Disks | Each panel shows expected heading/text |

---

### `002`: Toggle sidebar YAML on configuration tabs

- **Objective:** Sidebar YAML switch opens Monaco with VM YAML on Details, Scheduling, Networks, Disks, Scripts.
- **Target version:** CNV 4.12.0
- **Tags:** `@gating`

| Step | Action                                      | Expected Result                                 |
| :--- | :------------------------------------------ | :---------------------------------------------- |
| 1    | For each configuration tab with YAML switch | Toggle on shows VM YAML, toggle off hides panel |

---

### `003`: Metrics tab shows utilization section

- **Objective:** Metrics tab loads Utilization content.
- **Target version:** CNV 4.12.0
- **Tags:** `@tier1`

---

### `004`: Scheduling tab shows resource requirements

- **Objective:** Scheduling tab panel visible.
- **Target version:** CNV 4.12.0
- **Tags:** `@tier2`

---

### `005`: Scripts tab shows cloud-init section

- **Objective:** Scripts tab shows cloud-init / user data section.
- **Target version:** CNV 4.12.0
- **Jira References:** CNV-8956
- **Tags:** `@tier2`
