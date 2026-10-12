# Software Test Description (STD): Virtualization Landing

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtualization-landing/`
- **Feature Area:** Tier2 — Welcome modal / guided tour
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-03
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Automated E2E coverage for console routes under `tests/virtualization-landing/`.

### 2.2 Scope

- **In-Scope:**
  - All scenarios in specs under `tests/virtualization-landing/`.
- **Out-of-Scope:**
  - Scenarios documented in other route STD files.

## 3. Test Environment & Prerequisites

### welcome-modal

---

## 4. Test Case Definitions

### Module: `welcome-modal.spec.ts`

**Spec file:** `tests/virtualization-landing/welcome-modal.spec.ts`
**Describe:** `Welcome Modal` — **Tags:** `@tier2`, `@tier2-welcome-modal`
**Allure:** suite `Welcome Modal`, feature `Tier 2`

---

### `001`: Welcome modal dismiss flow and VirtualMachines stays usable during the tour

- **Objective:** Verify the welcome modal can start the guided tour without crashing VirtualMachines,
  that all tour steps display in order, and that checking "Do not show again" then closing the modal
  prevents it from returning.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96348
- **Pre-conditions:** User settings are reset so the welcome modal is shown on VirtualMachines.
- **Tags:** `@tier2`, `@tier2-welcome-modal`

| Step | Action                                                      | Expected Result                                                                                         |
| :--- | :---------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| 1    | Navigate to VirtualMachines                                 | Welcome modal is visible                                                                                |
| 2    | Click Start tour                                            | Tour popover is visible                                                                                 |
| 3    | Assert crash state, tree, tour-guide VM, and navigator tabs | No error boundary; tree visible; `rhel9-tour-guide` in tree; Overview and Virtual machines tabs present |
| 4    | Advance through all tour steps                              | All eight step titles display in order                                                                  |
| 5    | Reload VirtualMachines and check "Do not show again"        | Welcome modal remounts; user settings are patched; modal stays open                                     |
| 6    | Close the modal and reload                                  | Welcome modal and onboarding popovers are not shown                                                     |
