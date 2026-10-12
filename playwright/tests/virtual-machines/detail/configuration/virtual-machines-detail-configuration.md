# Software Test Description (STD): Virtual Machines — Detail — Configuration

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtual-machines/detail/configuration/`
- **Feature Area:** Tier1 — VM configuration
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-07
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

Automated E2E coverage for console routes under `tests/virtual-machines/detail/configuration/`.

### 2.2 Scope

- **In-Scope:**
  - All scenarios in specs under `tests/virtual-machines/detail/configuration/`.
- **Out-of-Scope:**
  - Scenarios documented in other route STD files.

## 3. Test Environment & Prerequisites

### vm-configuration-details

### vm-configuration-lifecycle

### vm-configuration-scheduling

### vm-configuration-storage

### vm-configuration-sysprep

---

## 4. Test Case Definitions

### Module: `vm-configuration-details.spec.ts`

**Spec file:** `tests/virtual-machines/detail/configuration/vm-configuration-details.spec.ts`
**Describe:** `VM Configuration — stopped RHEL9 VM / VM Configuration — running RHEL9 VM` — **Tags:** @tier1
**Allure:** suite `Test VM Configuration tab`, feature `Tier 1`

---

### `001`: Stopped VM configuration CRUD

- **Objective:** Stopped VM configuration CRUD
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-81927
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1

| Step | Action                                                        | Expected Result                          |
| :--- | :------------------------------------------------------------ | :--------------------------------------- |
| 1    | Verify configuration search finds SSH                         | Step completes without assertion failure |
| 2    | Verify scheduling, eviction, headless, and boot mode sub-tabs | Step completes without assertion failure |
| 3    | Edit description, boot mode, hostname, workload, and headless | Step completes without assertion failure |
| 4    | Verify hostname change via UI                                 | Step completes without assertion failure |
| 5    | Verify workload and machine type in configuration details     | Step completes without assertion failure |
| 6    | Edit description, boot mode, workload, and headless           | Step completes without assertion failure |
| 7    | Verify Add CD-ROM modal has unified radio buttons             | Step completes without assertion failure |

---

### `002`: Running VM configuration CRUD

- **Objective:** Running VM configuration CRUD
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-81927
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1

| Step | Action                                                    | Expected Result                          |
| :--- | :-------------------------------------------------------- | :--------------------------------------- |
| 1    | Verify workload and machine type in configuration details | Step completes without assertion failure |
| 2    | Edit description, boot mode, workload, and headless       | Step completes without assertion failure |
| 3    | Verify Add CD-ROM modal has unified radio buttons         | Step completes without assertion failure |
| 4    | Verify                                                    | Step completes without assertion failure |

---

### `003`: Add CD-ROM

- **Objective:** Add CD-ROM
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-81927
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1

| Step | Action                          | Expected Result                   |
| :--- | :------------------------------ | :-------------------------------- |
| 1    | Run Playwright test: Add CD-ROM | All expectations in the spec pass |

---

---

### Module: `vm-configuration-lifecycle.spec.ts`

**Spec file:** `tests/virtual-machines/detail/configuration/vm-configuration-lifecycle.spec.ts`
**Describe:** `VM full lifecycle: start, pause, unpause, restart, stop / VM Configuration — startInPause and CPU/memory lifecycle` — **Tags:** @tier1
**Allure:** suite `VM full lifecycle: start, pause, unpause, restart, stop / VM Configuration — startInPause and CPU/memory lifecycle`, feature `Tier 1`

---

### `001`: VM lifecycle transitions through all states via actions dropdown

- **Objective:** VM lifecycle transitions through all states via actions dropdown
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1

| Step | Action                                                                                | Expected Result                   |
| :--- | :------------------------------------------------------------------------------------ | :-------------------------------- |
| 1    | Run Playwright test: VM lifecycle transitions through all states via actions dropdown | All expectations in the spec pass |

---

### `002`: Headless mode toggle and startInPause on Fedora VM

- **Objective:** Headless mode toggle and startInPause on Fedora VM
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1

| Step | Action                                                                  | Expected Result                   |
| :--- | :---------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Headless mode toggle and startInPause on Fedora VM | All expectations in the spec pass |

---

### `003`: Increase CPU and memory, restart VM, and verify VMI reflects changes

- **Objective:** Increase CPU and memory, restart VM, and verify VMI reflects changes
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1

| Step | Action                                                                                    | Expected Result                   |
| :--- | :---------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Increase CPU and memory, restart VM, and verify VMI reflects changes | All expectations in the spec pass |

---

---

### Module: `vm-configuration-scheduling.spec.ts`

**Spec file:** `tests/virtual-machines/detail/configuration/vm-configuration-scheduling.spec.ts`
**Describe:** `Tier1 VM Configuration Scheduling — shared stopped RHEL9` — **Tags:** @tier1
**Allure:** suite `Tier1 VM Configuration Scheduling — shared stopped RHEL9`, feature `Tier 1`

---

### `001`: Configuration Scheduling: requirements and eviction strategy after patch

- **Objective:** Configuration Scheduling: requirements and eviction strategy after patch
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1

| Step | Action                                                       | Expected Result                          |
| :--- | :----------------------------------------------------------- | :--------------------------------------- |
| 1    | Verify run strategy is visible in Configuration > Scheduling | Step completes without assertion failure |
| 2    | Edit run strategy to Manual via RunStrategyModal             | Step completes without assertion failure |
| 3    | Verify run strategy updated in UI                            | Step completes without assertion failure |
| 4    | Edit run strategy to RerunOnFailure and verify               | Step completes without assertion failure |
| 5    | Cycle through all four strategies                            | Step completes without assertion failure |

---

### `002`: Edit run strategy via Configuration > Scheduling

- **Objective:** Edit run strategy via Configuration > Scheduling
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1

| Step | Action                                                       | Expected Result                          |
| :--- | :----------------------------------------------------------- | :--------------------------------------- |
| 1    | Verify run strategy is visible in Configuration > Scheduling | Step completes without assertion failure |
| 2    | Edit run strategy to Manual via RunStrategyModal             | Step completes without assertion failure |
| 3    | Verify run strategy updated in UI                            | Step completes without assertion failure |
| 4    | Edit run strategy to RerunOnFailure and verify               | Step completes without assertion failure |
| 5    | Cycle through all four strategies                            | Step completes without assertion failure |

---

---

### Module: `vm-configuration-storage.spec.ts`

**Spec file:** `tests/virtual-machines/detail/configuration/vm-configuration-storage.spec.ts`
**Describe:** `VM Storage — shared running Fedora VM` — **Tags:** @tier1-storage
**Allure:** suite `VM disks tab`, feature `Tier 1`

---

### `001`: Disk driver/bus is reflected in UI for running VM

- **Objective:** Disk driver/bus is reflected in UI for running VM
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-storage

| Step | Action                                                                 | Expected Result                   |
| :--- | :--------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Disk driver/bus is reflected in UI for running VM | All expectations in the spec pass |

---

### `002`: Disk size displayed on Configuration Storage and VMI Disks tabs, edit modal loads PVC size

- **Objective:** Disk size displayed on Configuration Storage and VMI Disks tabs, edit modal loads PVC size
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-storage

| Step | Action                                                                                                          | Expected Result                   |
| :--- | :-------------------------------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Disk size displayed on Configuration Storage and VMI Disks tabs, edit modal loads PVC size | All expectations in the spec pass |

---

### `003`: Hotplug disk shows Make persistent action

- **Objective:** Hotplug disk shows Make persistent action
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-storage

| Step | Action                                                         | Expected Result                   |
| :--- | :------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Hotplug disk shows Make persistent action | All expectations in the spec pass |

---

---

### Module: `vm-configuration-sysprep.spec.ts`

**Spec file:** `tests/virtual-machines/detail/configuration/vm-configuration-sysprep.spec.ts`
**Describe:** `VM Configuration — Sysprep` — **Tags:** @tier1
**Allure:** suite `VM Configuration — Sysprep`, feature `Tier 1`

---

### `001`: Windows VM sysprep can be created, detached, and attached from existing

- **Objective:** Windows VM sysprep can be created, detached, and attached from existing
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1

| Step | Action                                                   | Expected Result                          |
| :--- | :------------------------------------------------------- | :--------------------------------------- |
| 1    | Create a stopped Windows VM                              | Step completes without assertion failure |
| 2    | Navigate to Configuration → Initial run                  | Step completes without assertion failure |
| 3    | Create new sysprep, detach it, then attach from existing | Step completes without assertion failure |
| 4    | Verify VM spec references the sysprep ConfigMap          | Step completes without assertion failure |
