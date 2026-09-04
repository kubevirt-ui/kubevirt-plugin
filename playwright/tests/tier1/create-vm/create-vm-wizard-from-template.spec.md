# Software Test Description (STD): VM Creation Wizard — Create from Template

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — VM creation wizard
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-08-31
- **Document Status:** In Review

## 2. Introduction

### 2.1 Purpose

Verify the Create from Template VM creation wizard happy path: selecting From Template, picking
`rhel9-server-small`, customization (including protection of system annotations and labels), review,
and successful VM creation.

### 2.2 Scope

- **In-Scope:** Wizard steps 1–4 for Create from Template, Labels and annotations tab protection for
  `vm.kubevirt.io/validations` and `vm.kubevirt.io/template`, redirect to VM details, VM resource
  existence.
- **Out-of-Scope:** Custom configuration and clone existing VM flows (covered by
  `create-vm-wizard-custom-config.spec.ts` and `create-vm-wizard-clone.spec.ts`).

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project.
- **Configuration:** Admin access; RHEL9 template `rhel9-server-small` available in the cluster
  template catalog.
- **Initial Setup:** Each test creates its own namespace via `setupTestNamespace`; the created VM is
  tracked via `apiClient.trackResource('VirtualMachine', ...)` for automatic cleanup.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/create-vm/create-vm-wizard-from-template.spec.ts`
**Describe:** `VM Creation Wizard — Create from Template happy path` — **Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier 1`

---

### `001`: From Template wizard creates a RHEL9 VM and protects system metadata

- **Objective:** Verify that a VM can be created from `rhel9-server-small` and that template system
  annotations and labels cannot be deleted from the table or the edit modal.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-95902
- **Pre-conditions:** `rhel9-server-small` template is available in the catalog.
- **Tags:** `@adminOnly`

| Step | Action                                                      | Expected Result                                                        |
| :--- | :---------------------------------------------------------- | :--------------------------------------------------------------------- |
| 1    | Open the create VM wizard and select From Template          | Wizard opens; Create from Template is selected                         |
| 2    | Verify the template catalog and select `rhel9-server-small` | Catalog toolbar and cards are visible; Next is enabled after selection |
| 3    | On Customization, open Labels and annotations               | `vm.kubevirt.io/validations` is present; table delete is disabled      |
| 4    | Open Edit annotations and check the validations row         | Modal delete is disabled; cancel closes the modal                      |
| 5    | Open Edit labels and check `vm.kubevirt.io/template`        | Table and modal delete are disabled; cancel closes the modal           |
| 6    | Continue to Review and create the VM                        | Redirects to VM details; the VM resource exists                        |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type           | Status    |
| ----------- | ------------ | ----------------------- | --------- |
| —           | `001`        | Functional smoke        | Automated |
| CNV-95902   | `001`        | Bugfix regression guard | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** **\_\_\_\_**
- **Approval Signature:** **\_\_\_\_**
