# Software Test Description (STD): VM Creation Wizard — Create from Template

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — VM creation wizard
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-08
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify the Create from Template VM creation wizard happy path: selecting From Template, picking
`rhel9-server-small`, validating and saving a custom hostname, protecting system annotations and
labels, reviewing the configuration, and successfully creating the VM.

### 2.2 Scope

- **In-Scope:** Wizard steps 1–4 for Create from Template; generated hostname; required and RFC 1123
  hostname validation on submission with Enter; valid hostname persistence; Labels and annotations
  tab protection for `vm.kubevirt.io/validations` and `vm.kubevirt.io/template`; redirect to VM
  details; VM resource existence.
- **Out-of-Scope:** Custom configuration and clone existing VM flows (covered by
  `create-vm-wizard-custom-config.spec.ts` and `create-vm-wizard-clone.spec.ts`); hostname validation
  on blur without submission; maximum-length and trailing-hyphen hostname validation; editing the
  hostname from an existing VM's details page.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with the CNV operator installed; Playwright `Tier1` project; kubeadmin
  or an equivalent cluster-admin session.
- **Configuration:** RHEL9 template `rhel9-server-small` is available in the cluster template
  catalog; the console URL and authentication credentials are configured for Playwright.
- **Initial Setup:** Each test creates an isolated namespace via `setupTestNamespace`; the created VM
  is tracked via `apiClient.trackResource('VirtualMachine', ...)` for automatic cleanup.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/create-vm/create-vm-wizard-from-template.spec.ts`
**Describe:** `VM Creation Wizard — Create from Template happy path` — **Tags:** `@tier1`,
`@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier1`

---

### `001`: Create a RHEL9 VM from a template with validated hostname and protected system metadata

- **Objective:** Verify that the template wizard rejects empty and invalid hostnames without closing
  the modal or changing the generated value, accepts a valid hostname, prevents deletion of template
  system annotations and labels, and creates the resulting VM.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-95902, CNV-96404
- **Pre-conditions:** `rhel9-server-small` is available in the catalog, and the user can create
  namespaces and VirtualMachines.
- **Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`

| Step | Action                                                                                 | Expected Result                                                                                       |
| :--- | :------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| 1    | Create an isolated namespace and open the create VM wizard from the namespaced VM list | The creation wizard is visible                                                                        |
| 2    | Select From Template, generate a VM name, and continue                                 | From Template is selected and the wizard advances to the template catalog                             |
| 3    | Verify the template catalog and select `rhel9-server-small`                            | Catalog controls and template cards are visible; Next becomes enabled                                 |
| 4    | Continue to Customization and read the generated hostname                              | Customization tabs are visible and the generated hostname is non-empty                                |
| 5    | Open Edit hostname, clear the field, and submit with Enter                             | The required-field error appears; the modal remains open and the generated hostname remains unchanged |
| 6    | Enter `--` and submit with Enter                                                       | The RFC 1123 error appears; the modal remains open and the generated hostname remains unchanged       |
| 7    | Enter `hostname` and save                                                              | Save becomes enabled, the modal closes, and `hostname` is displayed in Customization                  |
| 8    | Open Labels and annotations and inspect `vm.kubevirt.io/validations`                   | The annotation is present and cannot be deleted from the table or edit modal                          |
| 9    | Inspect `vm.kubevirt.io/template` and open Edit labels                                 | The label is present and cannot be deleted from the table or edit modal                               |
| 10   | Continue to Review, create the VM, and verify it through the API                       | The console redirects to VM details and the VM exists in the isolated namespace                       |

---

## 5. Requirements Traceability Matrix

Maps Jira tickets to the test cases that provide coverage. Tickets without a specific test case
indicate a planned coverage gap (status: Pending).

| Jira Ticket | Test Case ID | Coverage Type           | Status    |
| ----------- | ------------ | ----------------------- | --------- |
| —           | `001`        | Functional smoke        | Automated |
| CNV-95902   | `001`        | Bugfix regression guard | Automated |
| CNV-96404   | `001`        | Bugfix regression guard | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Adam Viktora
- **Approval Signature:** Adam Viktora
