# Software Test Description (STD): VM Creation Wizard — Clone Existing VirtualMachine Review Step

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier2 — VM creation wizard
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-23
- **Document Status:** In Review

## 2. Introduction

### 2.1 Purpose

Verify the Clone existing VirtualMachine wizard flow: selecting Clone (Name is not required at
Deployment details), selecting the first available source VM, and confirming that the Review and
create step displays the generated clone name, editable Name and Description fields, and the
expected review sections before creating the clone.

### 2.2 Scope

- **In-Scope:** Clone wizard flow (3 steps: Deployment details, Source, Review and create);
  Deployment details Next-button state for Clone (Name not required); selecting the first available
  source VM; Review step display of the auto-generated clone name, Name and Description
  editability, the Description's initial empty value, Create button label, and visible sections;
  clone VM creation.
- **Out-of-Scope:** Custom configuration and Create from Template flows (covered by
  `create-vm-wizard-custom-config-customization-editing.spec.ts` and
  `create-vm-wizard-from-template-customization-editing.spec.ts`); filtering/searching the source VM
  list by name (covered by `create-vm-wizard-clone.spec.ts`); editing the clone's Description value
  on Review.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier2` project; kubeadmin or
  an equivalent cluster-admin session.
- **Configuration:** RHEL9 template available for the API-created source VM.
- **Initial Setup:** The test creates its own namespace via `setupTestNamespace`; creates a source
  VM via `apiClient.createVmFromTemplate` and waits for it to reach Running state; both the source
  and clone VMs are tracked via `apiClient.trackResource` for automatic cleanup.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier2/create-vm/create-vm-wizard-clone-step-review.spec.ts`
**Describe:** `VM Creation Wizard — Clone existing VirtualMachine: Review step values` —
**Tags:** `@tier2`, `@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier 2`

---

### `001`: Clone wizard selects the first available source VM and the Review step displays it

- **Objective:** Verify that Next is already enabled on Deployment details for the Clone method
  (Name is not required), that selecting the first available source VM enables Next on the Source
  step, and that Review displays an auto-generated, editable clone name plus the expected sections
  before creation.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** A source VirtualMachine exists and has reached Running state.
- **Tags:** `@adminOnly`

| Step | Action                                                                          | Expected Result                                                                                                                                                                  |
| :--- | :------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Create a source VM via the API and wait for it to reach Running state           | Source VM exists and is Running                                                                                                                                                  |
| 2    | Open the wizard and select Clone existing VirtualMachine                        | Clone is selected; Next is already enabled — Name is not required for this flow                                                                                                  |
| 3    | Click Next; verify the Source step and VM list are visible                      | Source step heading and VM list are visible                                                                                                                                      |
| 4    | Select the first available VM in the list                                       | Next becomes enabled after a source VM is selected                                                                                                                               |
| 5    | Click Next to Review; verify the auto-generated name, editability, and sections | Clone name is generated and contains "clone"; Name and Description are editable; Description is initially empty; review sections are visible; Create says "Clone VirtualMachine" |
| 6    | Click Clone VirtualMachine                                                      | The console redirects to VM details                                                                                                                                              |
| 7    | Verify the clone VM exists via API                                              | VirtualMachine resource exists in the test namespace                                                                                                                             |

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
