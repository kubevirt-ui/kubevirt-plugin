# Software Test Description (STD): Migration Policies

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/migration-policies/`
- **Feature Area:** Tier1 — Migration policies
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-07
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

Automated E2E coverage for console routes under `tests/migration-policies/`.

### 2.2 Scope

- **In-Scope:**
  - All scenarios in specs under `tests/migration-policies/`.
- **Out-of-Scope:**
  - Scenarios documented in other route STD files.

## 3. Test Environment & Prerequisites

### migration-policies

---

## 4. Test Case Definitions

### Module: `migration-policies.spec.ts`

**Spec file:** `tests/migration-policies/migration-policies.spec.ts`
**Describe:** `Tier1 MigrationPolicy CRUD via UI` — **Tags:** @tier1-virt-pages-admin
**Allure:** suite `Test Virtualization MigrationPolicies page`, feature `Tier 1`

---

### `001`: Create MigrationPolicy with bandwidth configuration via form

- **Objective:** Create MigrationPolicy with bandwidth configuration via form
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-virt-pages-admin

| Step | Action                      | Expected Result                          |
| :--- | :-------------------------- | :--------------------------------------- |
| 1    | Delete via actions dropdown | Step completes without assertion failure |

---

### `002`: Detail page shows bandwidth configuration

- **Objective:** Detail page shows bandwidth configuration
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-virt-pages-admin

| Step | Action                      | Expected Result                          |
| :--- | :-------------------------- | :--------------------------------------- |
| 1    | Delete via actions dropdown | Step completes without assertion failure |

---

### `003`: Create second policy with auto-converge and delete it

- **Objective:** Create second policy with auto-converge and delete it
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-virt-pages-admin

| Step | Action                      | Expected Result                          |
| :--- | :-------------------------- | :--------------------------------------- |
| 1    | Delete via actions dropdown | Step completes without assertion failure |

---

### `004`: Delete bandwidth policy via UI

- **Objective:** Delete bandwidth policy via UI
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-virt-pages-admin

| Step | Action                                              | Expected Result                   |
| :--- | :-------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Delete bandwidth policy via UI | All expectations in the spec pass |
