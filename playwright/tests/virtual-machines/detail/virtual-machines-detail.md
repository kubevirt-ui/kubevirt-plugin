# Software Test Description (STD): Virtual Machines — Detail

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtual-machines/detail/`
- **Feature Area:** Gating / Tier1 / Tier2 — VM detail tabs (4.12 horizontal nav)
- **Latest version:** CNV 4.15.0
- **Latest update:** 2026-10-26
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Smoke and read coverage for VM detail tabs, sidebar YAML editor, and selected tab content.

### 2.2 Scope

- **In-Scope:** `vm-detail.spec.ts`, `vm-detail-tabs-crud.spec.ts`, `vm-detail-tabs-crud.suite.ts`, `vm-detail-configuration-initial-run.spec.ts`, `vm-detail-configuration-ssh.spec.ts` (excludes network Multus CRUD — see `network/virtual-machines-detail-network.md`).
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
- **Target version:** CNV 4.13.0
- **Tags:** `@gating`

| Step | Action                                                                                  | Expected Result                        |
| :--- | :-------------------------------------------------------------------------------------- | :------------------------------------- |
| 1    | Open VM, start from Actions                                                             | Status Running                         |
| 2    | Visit Details, Metrics, YAML, Scheduling, Environment, Events, Console, Networks, Disks | Each panel shows expected heading/text |

---

### `002`: Toggle sidebar YAML on configuration tabs

- **Objective:** Sidebar YAML switch opens Monaco with VM YAML on Details, Scheduling, Networks, Disks, Scripts.
- **Target version:** CNV 4.13.0
- **Tags:** `@gating`

| Step | Action                                      | Expected Result                                 |
| :--- | :------------------------------------------ | :---------------------------------------------- |
| 1    | For each configuration tab with YAML switch | Toggle on shows VM YAML, toggle off hides panel |

---

### `003`: Metrics tab shows utilization section

- **Objective:** Metrics tab loads Utilization content.
- **Target version:** CNV 4.13.0
- **Tags:** `@tier1`

---

### `004`: Scheduling tab shows resource requirements

- **Objective:** Scheduling tab panel visible.
- **Target version:** CNV 4.13.0
- **Tags:** `@tier2`

---

### `vm-detail-tabs-crud.spec.ts`

| Tags     | Coverage                                                                                                                                                     |
| :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@tier1` | Metadata labels; Disks → Add disk modal; Snapshots create + API delete                                                                                       |
| `@tier2` | Disks attach/detach (cirros VM); Scripts cloud-init user; Scheduling node selector; Environment ConfigMap; read-only Details/YAML/Events/Console/Diagnostics |

**Networks CRUD:** `network/vm-network-interfaces.spec.ts` (Multus add/delete).

---

### `005`: Scripts tab shows cloud-init section

- **Objective:** Scripts tab shows cloud-init / user data section.
- **Target version:** CNV 4.13.0
- **Jira References:** CNV-8956
- **Tags:** `@tier2`

---

### Module: `vm-detail-configuration-initial-run.spec.ts`

**Tags:** `@route-virtual-machines-detail` `@tier1`

| Test                                                  | Coverage                                                  |
| :---------------------------------------------------- | :-------------------------------------------------------- |
| Initial run tab shows Cloud-init and Sysprep          | Read sections on Configuration → Initial run              |
| Cloud-init modal offers Form view and Script          | Read configure-via radios in edit modal                   |
| Initial run tab updates cloud-init user via form view | Form `#cloudinit-user` + Apply                            |
| Initial run cloud-init script view download and apply | Script radio → YAML Save → Download → Apply; API userData |

---

### Module: `vm-detail-configuration-ssh.spec.ts`

**Tags:** `@route-virtual-machines-detail` `@tier1` `@non-priv`

---

### `00N`: Public SSH key from InstanceTypes catalog shows on Configuration SSH tab

- **Objective:** SSH authorized key secret name appears on VM Configuration → SSH after catalog InstanceTypes create with public key.
- **Target version:** CNV 4.15.0
- **Tags:** `@tier1`, `@non-priv`

| Step | Action                                            | Expected Result                    |
| :--- | :------------------------------------------------ | :--------------------------------- |
| 1    | Create VM from InstanceTypes catalog with SSH key | VM exists on API                   |
| 2    | Open Configuration → SSH tab                      | Authorized key secret name visible |

---

### Module: `vm-detail-tabs-crud.suite.ts`

**Tags:** `@route-virtual-machines-detail` — tier1/tier2 tab CRUD (metadata, disks, snapshots, scheduling, environment). Environment ConfigMap scenario is `@admin-only` on tier2.
