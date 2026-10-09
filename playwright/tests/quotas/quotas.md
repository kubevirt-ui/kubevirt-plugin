# Software Test Description (STD): Quotas

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/quotas/`
- **Feature Area:** Settings — Quotas
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-07
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

Automated E2E coverage for console routes under `tests/quotas/`.

### 2.2 Scope

- **In-Scope:**
  - All scenarios in specs under `tests/quotas/`.
- **Out-of-Scope:**
  - Scenarios documented in other route STD files.

## 3. Test Environment & Prerequisites

### aaq-quotas

---

## 4. Test Case Definitions

### Module: `aaq-quotas.spec.ts`

**Spec file:** `tests/quotas/aaq-quotas.spec.ts`
**Describe:** `Application Aware Quota` — **Tags:** @settings
**Allure:** suite `Application Aware Quota`, feature `CNV Settings`

---

### `001`: Enabling AAQ from Resource management shows Quotas page with expected content and create options

- **Objective:** Enabling AAQ from Resource management shows Quotas page with expected content and create options
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @settings

| Step | Action                                          | Expected Result                          |
| :--- | :---------------------------------------------- | :--------------------------------------- |
| 1    | Verify empty state content                      | Step completes without assertion failure |
| 2    | Verify Create quota button and dropdown options | Step completes without assertion failure |
