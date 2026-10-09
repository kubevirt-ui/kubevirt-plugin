# Software Test Description (STD): Instance Types

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/instance-types/`
- **Feature Area:** Tier1 — Instance types
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-07
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

Automated E2E coverage for console routes under `tests/instance-types/`.

### 2.2 Scope

- **In-Scope:**
  - All scenarios in specs under `tests/instance-types/`.
- **Out-of-Scope:**
  - Scenarios documented in other route STD files.

## 3. Test Environment & Prerequisites

### instanceType

---

## 4. Test Case Definitions

### Module: `instanceType.spec.ts`

**Spec file:** `tests/instance-types/instanceType.spec.ts`
**Describe:** `InstanceType page` — **Tags:** @tier1-pages-it
**Allure:** suite `InstanceType page`, feature `Tier 1`

---

### `001`: Cluster instance type supports create and deletion

- **Objective:** Cluster instance type supports create and deletion
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-pages-it

| Step | Action                                         | Expected Result                          |
| :--- | :--------------------------------------------- | :--------------------------------------- |
| 1    | Created instance type is visible in the list   | Step completes without assertion failure |
| 2    | Delete via API and verify removal from cluster | Step completes without assertion failure |

---

### `002`: User InstanceTypes tab shows user-created instance types and supports name filter

- **Objective:** User InstanceTypes tab shows user-created instance types and supports name filter
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-pages-it

| Step | Action                                                                                                 | Expected Result                   |
| :--- | :----------------------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: User InstanceTypes tab shows user-created instance types and supports name filter | All expectations in the spec pass |
