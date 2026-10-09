# Software Test Description (STD): Checkups

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/checkups/`
- **Feature Area:** Tier1 — Checkups
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-07
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

Automated E2E coverage for console routes under `tests/checkups/`.

### 2.2 Scope

- **In-Scope:**
  - All scenarios in specs under `tests/checkups/`.
- **Out-of-Scope:**
  - Scenarios documented in other route STD files.

## 3. Test Environment & Prerequisites

### checkups

---

## 4. Test Case Definitions

### Module: `checkups.spec.ts`

**Spec file:** `tests/checkups/checkups.spec.ts`
**Describe:** `Storage` — **Tags:** @tier1-pages-checkups
**Allure:** suite `Checkups page`, feature `Tier 1`

---

### `001`: Storage checkup lifecycle

- **Objective:** Storage checkup lifecycle
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-pages-checkups

| Step | Action                                         | Expected Result                   |
| :--- | :--------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Storage checkup lifecycle | All expectations in the spec pass |
