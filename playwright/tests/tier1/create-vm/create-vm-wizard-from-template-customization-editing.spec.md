# Software Test Description (STD): VM Creation Wizard — Create from Template Customization Editing

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — VM creation wizard
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-23
- **Document Status:** In Review

## 2. Introduction

### 2.1 Purpose

Verify that, in the Create from Template wizard flow, repeated edits to the Description and Boot
order fields on the Customization step render correctly after each edit and persist when navigating
Back to the Template step and Next again before proceeding through Review and create.

### 2.2 Scope

- **In-Scope:** Create from Template flow through Deployment details (name generation), Template
  catalog (the known RHEL9 template), and Customization; opening the Description modal and editing
  it twice; opening the Boot order modal and reordering devices twice; assertions that each reorder
  changes the displayed sequence; Back/Next persistence of the selected template and both edits;
  Review step display of the generated VM name and visible sections; VM creation.
- **Out-of-Scope:** Custom configuration and clone existing VM flows (covered by
  `create-vm-wizard-custom-config-customization-editing.spec.ts` and
  `create-vm-wizard-clone-step-review.spec.ts`); boundary/invalid input for the Description field;
  hostname editing and Labels/annotations protection (covered by
  `create-vm-wizard-from-template.spec.ts`).

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project; kubeadmin or
  an equivalent cluster-admin session.
- **Configuration:** The `rhel9-server-small` template must be available in the catalog.
- **Initial Setup:** The test creates its own namespace via `setupTestNamespace`; the created VM is
  tracked via `apiClient.trackResource('VirtualMachine', ...)` for automatic cleanup.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/create-vm/create-vm-wizard-from-template-customization-editing.spec.ts`
**Describe:** `VM Creation Wizard — Create from Template: Customization editing and persistence` —
**Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier 1`

---

### `001`: Description and boot order edits persist across Back/Next navigation

- **Objective:** Verify that editing the Description and Boot order fields twice on the
  Customization step renders each change immediately, survives a Back-to-Template-step and Next
  round trip together with the selected template, and does not prevent review and creation.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** The `rhel9-server-small` template is available in the catalog.
- **Tags:** `@adminOnly`

| Step | Action                                                                                          | Expected Result                                                                                                     |
| :--- | :---------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| 1    | Open the wizard; select Create from Template; generate a VM name; click Next                    | Create from Template is selected; wizard advances to the Template catalog                                           |
| 2    | Verify the catalog has cards; select `rhel9-server-small`; click Next                           | Next becomes enabled after selecting the template; wizard advances to Customization                                 |
| 3    | Open the Description modal, set it to "test", save; then reopen and set it to "test test", save | Each save renders the new description on the Details tab immediately                                                |
| 4    | Open the Boot order modal, reorder a device, save; reopen, reorder again, save                  | Each save renders the expected changed device sequence on the Details tab                                           |
| 5    | Click Back to return to the Template step, then Next to return to Customization                 | The template remains selected; both the Description ("test test") and the last boot order remain unchanged          |
| 6    | Click Next to Review, verify the generated VM name and visible sections, then create the VM     | Review shows the VM name and Details/Storage/Network/Hardware devices sections; the console redirects to VM details |
| 7    | Verify the VM exists via API                                                                    | VirtualMachine resource exists in the test namespace                                                                |

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
