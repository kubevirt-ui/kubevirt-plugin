# Software Test Description (STD): Virtual Machines — Detail — Overview

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtual-machines/detail/overview/`
- **Feature Area:** Tier1 / Tier2 — VM detail overview
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-07
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

Automated E2E coverage for console routes under `tests/virtual-machines/detail/overview/`.

### 2.2 Scope

- **In-Scope:**
  - All scenarios in specs under `tests/virtual-machines/detail/overview/`.
- **Out-of-Scope:**
  - Scenarios documented in other route STD files.

## 3. Test Environment & Prerequisites

### vm-overview-lifecycle

### vm-overview-namespace

---

## 4. Test Case Definitions

### Module: `vm-overview-lifecycle.spec.ts`

**Spec file:** `tests/virtual-machines/detail/overview/vm-overview-lifecycle.spec.ts`
**Describe:** `VM Snapshots — shared stopped RHEL9 VM / VM Clone workflow — clone stopped VM, start clone, verify both exist / Running VM snapshot operations` — **Tags:** @tier2-snapshots, @tier2-vm-clone
**Allure:** suite `Test VM Snapshot`, feature `Tier 2`

---

### `001`: VM snapshot lifecycle: take, restore, create VM from snapshot

- **Objective:** VM snapshot lifecycle: take, restore, create VM from snapshot
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2-snapshots, @tier2-vm-clone

| Step | Action                           | Expected Result                          |
| :--- | :------------------------------- | :--------------------------------------- |
| 1    | take Snapshot in tab snapshots   | Step completes without assertion failure |
| 2    | restore vm from snapshot         | Step completes without assertion failure |
| 3    | create VM from snapshot          | Step completes without assertion failure |
| 4    | take snapshot and verify visible | Step completes without assertion failure |

---

### `002`: Restore VM from snapshot

- **Objective:** Restore VM from snapshot
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2-snapshots, @tier2-vm-clone

| Step | Action                           | Expected Result                          |
| :--- | :------------------------------- | :--------------------------------------- |
| 1    | take snapshot and verify visible | Step completes without assertion failure |

---

### `003`: Restore modal uses fixed InPlace policy without selector

- **Objective:** Restore modal uses fixed InPlace policy without selector
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2-snapshots, @tier2-vm-clone

| Step | Action                           | Expected Result                          |
| :--- | :------------------------------- | :--------------------------------------- |
| 1    | take snapshot and verify visible | Step completes without assertion failure |

---

### `004`: Clone a stopped VM with start-on-clone and verify the cloned VM runs

- **Objective:** Clone a stopped VM with start-on-clone and verify the cloned VM runs
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2-snapshots, @tier2-vm-clone

| Step | Action                           | Expected Result                          |
| :--- | :------------------------------- | :--------------------------------------- |
| 1    | take snapshot and verify visible | Step completes without assertion failure |

---

### `005`: Take snapshot on running Fedora VM

- **Objective:** Take snapshot on running Fedora VM
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2-snapshots, @tier2-vm-clone

| Step | Action                                                  | Expected Result                   |
| :--- | :------------------------------------------------------ | :-------------------------------- |
| 1    | Run Playwright test: Take snapshot on running Fedora VM | All expectations in the spec pass |

---

---

### Module: `vm-overview-namespace.spec.ts`

**Spec file:** `tests/virtual-machines/detail/overview/vm-overview-namespace.spec.ts`
**Describe:** `VM Overview - namespace level` — **Tags:** @tier1-vm-overview
**Allure:** suite `VM Overview - namespace level`, feature `Tier 1`

---

### `001`: Namespace VM overview health and resource charts

- **Objective:** Namespace VM overview health and resource charts
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-vm-overview

| Step | Action                                                                | Expected Result                   |
| :--- | :-------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Namespace VM overview health and resource charts | All expectations in the spec pass |
