# Software Test Description (STD): Virtual Machines — Detail — Diagnostics

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtual-machines/detail/diagnostics/`
- **Feature Area:** Tier1 — VM console / diagnostics
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-07
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

Automated E2E coverage for console routes under `tests/virtual-machines/detail/diagnostics/`.

### 2.2 Scope

- **In-Scope:**
  - All scenarios in specs under `tests/virtual-machines/detail/diagnostics/`.
- **Out-of-Scope:**
  - Scenarios documented in other route STD files.

## 3. Test Environment & Prerequisites

### vm-console-diagnostics

---

## 4. Test Case Definitions

### Module: `vm-console-diagnostics.spec.ts`

**Spec file:** `tests/virtual-machines/detail/diagnostics/vm-console-diagnostics.spec.ts`
**Describe:** `Tier1 Diagnostics Tab Redesign` — **Tags:** @tier1
**Allure:** suite `Tier1 Diagnostics Tab Redesign`, feature `Tier 1`

---

### `001`: Diagnostics overview cards, severity filter, and search

- **Objective:** Diagnostics overview cards, severity filter, and search
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1

| Step | Action                                                                       | Expected Result                   |
| :--- | :--------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Diagnostics overview cards, severity filter, and search | All expectations in the spec pass |
