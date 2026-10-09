# Software Test Description (STD): Virtual Machines — Actions

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtual-machines/actions/`
- **Feature Area:** Tier1 — VM actions
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-07
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

Automated E2E coverage for console routes under `tests/virtual-machines/actions/`.

### 2.2 Scope

- **In-Scope:**
  - All scenarios in specs under `tests/virtual-machines/actions/`.
- **Out-of-Scope:**
  - Scenarios documented in other route STD files.

## 3. Test Environment & Prerequisites

### vm-delete

### vm-lifecycle-actions

### vm-lifecycle

---

## 4. Test Case Definitions

### Module: `vm-delete.spec.ts`

**Spec file:** `tests/virtual-machines/actions/vm-delete.spec.ts`
**Describe:** `Tier1 VM Single Delete` — **Tags:** @tier1-vm-actions
**Allure:** suite `VM Single Delete`, feature `Tier 1`

---

### `001`: Delete a single VM via list kebab action removes it from the list and cluster

- **Objective:** Delete a single VM via list kebab action removes it from the list and cluster
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-97104
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-vm-actions

| Step | Action                                                                                             | Expected Result                   |
| :--- | :------------------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Delete a single VM via list kebab action removes it from the list and cluster | All expectations in the spec pass |

---

---

### Module: `vm-lifecycle-actions.spec.ts`

**Spec file:** `tests/virtual-machines/actions/vm-lifecycle-actions.spec.ts`
**Describe:** `Tier1 VM Bulk Actions Tests` — **Tags:** @tier1-bulk-ops
**Allure:** suite `VM Bulk Actions`, feature `Tier 1`

---

### `001`: Bulk delete selected VMs removes them from the list

- **Objective:** Bulk delete selected VMs removes them from the list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-bulk-ops

| Step | Action                                                                   | Expected Result                   |
| :--- | :----------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Bulk delete selected VMs removes them from the list | All expectations in the spec pass |

---

---

### Module: `vm-lifecycle.spec.ts`

**Spec file:** `tests/virtual-machines/actions/vm-lifecycle.spec.ts`
**Describe:** `Tier1 VM Start/Stop/Restart Lifecycle` — **Tags:** @tier1-vm-actions
**Allure:** suite `VM Lifecycle`, feature `Tier 1`

---

### `001`: Start, stop, and restart a VM from the detail page actions dropdown

- **Objective:** Start, stop, and restart a VM from the detail page actions dropdown
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-vm-actions

| Step | Action                                                                                   | Expected Result                   |
| :--- | :--------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Start, stop, and restart a VM from the detail page actions dropdown | All expectations in the spec pass |
