# Software Test Description (STD): Welcome Modal / Guided Tour

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier2 — Welcome modal / guided tour
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-03
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify the Virtualization welcome modal dismiss flow, that starting the guided tour walks all
steps in order, and that VirtualMachines (tree and navigator tabs) stays usable while the tour
runs.

### 2.2 Scope

- **In-Scope:** Welcome modal visibility, Start tour, tour step sequence, VirtualMachines error
  boundary absence during the tour, VM tree with the tour-guide VM (`rhel9-tour-guide`), Overview
  and Virtual machines tabs, "Do not show again" checkbox, and modal close.
- **Out-of-Scope:** Starting the tour from Settings → Getting started → Guided tour.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier2` project.
- **Configuration:** No special feature gates required.
- **Initial Setup:** `resetUserSettings` via `apiClient` so `dontShowWelcomeModal` is false. No extra
  namespaces or VMs are created; the tour injects the dummy `rhel9-tour-guide` VM into the tree.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier2/welcome-modal/welcome-modal.spec.ts`
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

---

## 5. Requirements Traceability Matrix

Maps Jira tickets to the test cases that provide coverage. Tickets without a specific test case indicate
a planned coverage gap (status: Pending).

| Jira Ticket | Test Case ID | Coverage Type           | Status    |
| ----------- | ------------ | ----------------------- | --------- |
| CNV-96348   | `001`        | Bugfix regression guard | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Gal Kremer
- **Approval Signature:** Gal Kremer
