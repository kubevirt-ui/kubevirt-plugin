# Software Test Description (STD): VM Creation Wizard — Template Additional Objects

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — VM creation wizard
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-18
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

Verify that when a user creates a VirtualMachine from an OpenShift Template that includes additional
namespaced objects without an explicit `metadata.namespace`, those objects are created in the VM's
target namespace during wizard submission.

### 2.2 Scope

- **In-Scope:** API setup of a custom OpenShift Template containing a VirtualMachine and a Secret
  additional object (Secret has no `metadata.namespace`); Create from Template wizard flow (steps
  1–4); project selection in deployment details and template catalog; VM creation; API verification
  that the Secret exists in the same namespace as the created VM.
- **Out-of-Scope:** Additional object types other than Secret; templates where the additional object
  already has an explicit namespace (covered by unit tests in
  `templateAdditionalObjects.test.ts`); VirtualMachineTemplate (v1beta1) resources; legacy catalog UI;
  verifying owner references on the created Secret; templates with multiple additional objects.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with the CNV operator installed; Playwright `Tier1` project; kubeadmin
  or an equivalent cluster-admin session.
- **Configuration:** CNV-97155 product changes are present (template additional objects created
  during wizard submit — #4734, #4745). Console URL and authentication credentials are configured
  for Playwright.
- **Initial Setup:** Each test creates an isolated namespace via `setupTestNamespace`. The custom
  template, Secret, and created VM are tracked on `apiClient` for automatic cleanup. The template is
  created via API in the test namespace. The wizard catalog defaults to "Default templates";
  the test selects the "User templates" scope filter so the custom template is visible.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/create-vm/create-vm-wizard-template-additional-objects.spec.ts`
**Describe:** `VM Creation Wizard — Template additional objects` — **Tags:** `@tier1`,
`@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier1`, tag `@CNV-97155`

---

### `001`: Create a VM from a template and inherit namespace for additional Secret

- **Objective:** Verify that a namespaced Secret defined in a template without
  `metadata.namespace` is created in the VM's namespace when the VM is created through the
  from-template wizard.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-97155
- **Pre-conditions:** User has permission to create namespaces, Templates, VirtualMachines, and
  Secrets. The VM creation wizard and template catalog are available in the Virtualization
  perspective.
- **Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`, `@CNV-97155`

| Step | Action                                                                                                              | Expected Result                                                                                |
| :--- | :------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------- |
| 1    | Create an isolated namespace and a custom OpenShift Template via API (VM + Secret without namespace)                | Template exists in the namespace; Secret object in template has no `metadata.namespace`        |
| 2    | Switch to Virtualization, open the namespaced VM list, and launch the creation wizard                               | Wizard opens                                                                                   |
| 3    | Select From Template, set the project to the test namespace, generate a VM name, click Next                         | Wizard advances to the template catalog                                                        |
| 4    | Filter the catalog to the test project, select User templates scope, search by name, and select the custom template | Template catalog is visible; custom template card is selectable; Next is enabled               |
| 5    | Proceed through Customization with defaults and click Next                                                          | Customization step is visible; wizard advances to Review                                       |
| 6    | Review the configuration and click Create VirtualMachine                                                            | Browser redirects to the VM detail page                                                        |
| 7    | Verify the VM exists via API                                                                                        | VirtualMachine resource exists in the test namespace                                           |
| 8    | Verify the Secret exists via API in the test namespace                                                              | Secret resource exists; `metadata.namespace` equals the VM namespace (not empty or a wrong NS) |

---

## 5. Requirements Traceability Matrix

Maps Jira tickets to the test cases that provide coverage. Tickets without a specific test case
indicate a planned coverage gap (status: Pending).

| Jira Ticket | Test Case ID | Coverage Type           | Status    |
| ----------- | ------------ | ----------------------- | --------- |
| CNV-97155   | `001`        | Bugfix regression guard | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** —
- **Approval Signature:** —
