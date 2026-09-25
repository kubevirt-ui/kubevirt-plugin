# Software Test Description (STD): VM Creation Wizard — Required Field Validation

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — VM creation wizard
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-23
- **Document Status:** In Review

## 2. Introduction

### 2.1 Purpose

Verify that the wizard's Next button is disabled until each creation method's required fields are
provided: a Name for Custom configuration and Create from Template, and additionally a Template
selection for Create from Template; and that for Clone existing VirtualMachine, Name is not
required at Deployment details but a source VM selection is required on the Source step.

### 2.2 Scope

- **In-Scope:** Next-button disabled/enabled state transitions on Deployment details for all three
  creation methods; Next-button state on the Template catalog step before/after selecting a
  template; Next-button state on the Clone Source step before/after selecting a source VM.
- **Out-of-Scope:** Full wizard completion and VM creation (covered by the respective happy-path and
  customization-editing specs); field-level validation messages; boundary/invalid Name values.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project; kubeadmin or
  an equivalent cluster-admin session.
- **Configuration:** At least one template must be available for the Template check, and the RHEL9
  template must be available for creating the Clone check's source VM.
- **Initial Setup:** Each test opens the wizard from the shared job test namespace
  (`testConfig.testNamespace`). The Clone test creates and tracks a source VM in that namespace;
  all tests cancel the wizard after checking Next-button state.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/create-vm/create-vm-wizard-required-field-validation.spec.ts`
**Describe:** `VM Creation Wizard — Required field validation` — **Tags:** `@tier1`,
`@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier 1`

---

### `001`: Custom configuration — Next is disabled until a Name is provided

- **Objective:** Verify that Next is disabled on Deployment details for Custom configuration until
  a VM name is generated.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                                                              | Expected Result                  |
| :--- | :------------------------------------------------------------------ | :------------------------------- |
| 1    | Open the wizard; verify Custom configuration is selected by default | Custom configuration is selected |
| 2    | Observe the Next button before providing a Name                     | Next is disabled                 |
| 3    | Generate a VM name                                                  | Next becomes enabled             |

---

### `002`: Create from Template — Name is required, then a Template selection is required

- **Objective:** Verify that Next is disabled on Deployment details until a Name is generated, and
  then disabled again on the Template catalog step until a template is selected.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** At least one template is available in the catalog.
- **Tags:** `@adminOnly`

| Step | Action                                              | Expected Result                                           |
| :--- | :-------------------------------------------------- | :-------------------------------------------------------- |
| 1    | Select Create from Template                         | Create from Template is selected                          |
| 2    | Observe the Next button before providing a Name     | Next is disabled                                          |
| 3    | Generate a VM name, then click Next                 | Next becomes enabled; wizard advances to Template catalog |
| 4    | Observe the Next button before selecting a template | Next is disabled                                          |
| 5    | Select the first available template                 | Next becomes enabled                                      |

---

### `003`: Clone existing VirtualMachine — Name is not required, but a source VM selection is

- **Objective:** Verify that Next is already enabled on Deployment details for Clone (Name is not
  required for this method), and then disabled on the Source step until a source VM is selected.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** The test creates a source VirtualMachine from the RHEL9 template.
- **Tags:** `@adminOnly`

| Step | Action                                               | Expected Result                                                   |
| :--- | :--------------------------------------------------- | :---------------------------------------------------------------- |
| 1    | Create and track a source VM in the test namespace   | A source VM is available independently of external cluster state  |
| 2    | Select Clone existing VirtualMachine                 | Clone is selected; Next is already enabled — Name is not required |
| 3    | Click Next; verify the Source step is visible        | Source step is visible                                            |
| 4    | Observe the Next button before selecting a source VM | Next is disabled                                                  |
| 5    | Select the first available source VM                 | Next becomes enabled                                              |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type    | Status    |
| ----------- | ------------ | ---------------- | --------- |
| CNV-96281   | `001`        | Feature coverage | Automated |
| CNV-96281   | `002`        | Feature coverage | Automated |
| CNV-96281   | `003`        | Feature coverage | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Vojtech Portes
- **Approval Signature:** Pending
