# Software Test Description (STD): Virtual Machines — Migrations

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtual-machines/migrations/`
- **Feature Area:** Tier2 — VM migrations
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-07
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

Automated E2E coverage for console routes under `tests/virtual-machines/migrations/`.

### 2.2 Scope

- **In-Scope:**
  - All scenarios in specs under `tests/virtual-machines/migrations/`.
- **Out-of-Scope:**
  - Scenarios documented in other route STD files.

## 3. Test Environment & Prerequisites

### vm-live-migration

### vm-storage-migration

---

## 4. Test Case Definitions

### Module: `vm-live-migration.spec.ts`

**Spec file:** `tests/virtual-machines/migrations/vm-live-migration.spec.ts`
**Describe:** `VM live migration via UI` — **Tags:** @tier2-migration
**Allure:** suite `VM Live Migration`, feature `Tier 2`

---

### `001`: Live migrate a running VM to another node via the VM list kebab action

- **Objective:** Live migrate a running VM to another node via the VM list kebab action
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2-migration

| Step | Action                                                | Expected Result                          |
| :--- | :---------------------------------------------------- | :--------------------------------------- |
| 1    | Trigger live migration from VM list kebab             | Step completes without assertion failure |
| 2    | VM returns to Running state after migration           | Step completes without assertion failure |
| 3    | VM node changed after migration (multi-node clusters) | Step completes without assertion failure |

---

### `002`: Migrate a running VM to a specific node

- **Objective:** Migrate a running VM to a specific node
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2-migration

| Step | Action                                                       | Expected Result                   |
| :--- | :----------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Migrate a running VM to a specific node | All expectations in the spec pass |

---

---

### Module: `vm-storage-migration.spec.ts`

**Spec file:** `tests/virtual-machines/migrations/vm-storage-migration.spec.ts`
**Describe:** `VM storage migration wizard` — **Tags:** @tier2-storage-migration
**Allure:** suite `VM Storage Migration`, feature `Tier 2`

---

### `001`: Open storage migration modal, verify wizard steps, and close

- **Objective:** Open storage migration modal, verify wizard steps, and close
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2-storage-migration

| Step | Action                                                  | Expected Result                          |
| :--- | :------------------------------------------------------ | :--------------------------------------- |
| 1    | Verify Migrate Storage action is enabled for running VM | Step completes without assertion failure |
| 2    | Open storage migration modal and verify it loads        | Step completes without assertion failure |
| 3    | Wizard nav steps are present                            | Step completes without assertion failure |
| 4    | Close modal without migrating                           | Step completes without assertion failure |
| 5    | VM remains Running after cancelled migration            | Step completes without assertion failure |

---

### `002`: Perform full storage class migration and verify completion

- **Objective:** Perform full storage class migration and verify completion
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2-storage-migration

| Step | Action                                       | Expected Result                          |
| :--- | :------------------------------------------- | :--------------------------------------- |
| 1    | VM remains Running after cancelled migration | Step completes without assertion failure |

---

### `003`: Start storage migration and cancel while in progress

- **Objective:** Start storage migration and cancel while in progress
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2-storage-migration

| Step | Action                                       | Expected Result                          |
| :--- | :------------------------------------------- | :--------------------------------------- |
| 1    | VM remains Running after cancelled migration | Step completes without assertion failure |
