# Software Test Description (STD): VM Creation Wizard — Creation Method Switching

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — VM creation wizard
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-23
- **Document Status:** In Review

## 2. Introduction

### 2.1 Purpose

Verify that switching between the three creation methods (Custom configuration, Create from
Template, Clone existing VirtualMachine) on the Deployment details step dynamically updates the set
of steps shown in the wizard's left-hand step navigation.

### 2.2 Scope

- **In-Scope:** Step navigation list contents and length for each of the three creation methods, and
  restoration of the original list when switching back to Custom configuration.
- **Out-of-Scope:** Next-button gating (covered by `create-vm-wizard-required-field-validation.spec.ts`);
  full wizard completion; behavior of switching methods after leaving Deployment details.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project; kubeadmin or
  an equivalent cluster-admin session.
- **Configuration:** None beyond the wizard being reachable.
- **Initial Setup:** The test opens the wizard from the shared job test namespace
  (`testConfig.testNamespace`); no VM is created; the wizard is cancelled at the end.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/create-vm/create-vm-wizard-creation-method-switching.spec.ts`
**Describe:** `VM Creation Wizard — Creation method switching updates the step list` — **Tags:**
`@tier1`, `@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier 1`

---

### `001`: Switching between Custom configuration, Template, and Clone updates the wizard step navigation

- **Objective:** Verify that the wizard's step navigation list matches the expected step set for
  each creation method (6 steps for Custom configuration, 4 for Create from Template, 3 for Clone),
  and reverts correctly when switching back.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                                                   | Expected Result                                                                                     |
| :--- | :------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| 1    | Open the wizard; verify Custom configuration is selected | 6 steps are listed, including Guest OS, Boot source, and Compute resources                          |
| 2    | Select Create from Template                              | 4 steps are listed, including Template; Guest OS/Boot source/Compute resources are no longer listed |
| 3    | Select Clone existing VirtualMachine                     | 3 steps are listed, including Clone/Source; Template and Guest OS are no longer listed              |
| 4    | Select Custom configuration again                        | 6 steps are listed again, including Guest OS                                                        |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type    | Status    |
| ----------- | ------------ | ---------------- | --------- |
| CNV-96281   | `001`        | Feature coverage | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Vojtech Portes
- **Approval Signature:** Pending
