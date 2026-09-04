# Software Test Description (STD): VM Creation Wizard — Default SSH Key on Windows Guests

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — VM Creation Wizard
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-03
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify that when a project has a default SSH public key, creating a Windows VirtualMachine through
the Create VirtualMachine wizard does not attach SSH `accessCredentials`. Windows guests have no
cloud-init (`cloudInitNoCloud`) volume, and KubeVirt rejects `noCloud` SSH propagation without one.

### 2.2 Scope

- **In-Scope:** Custom configuration wizard path for a Windows guest OS; default SSH key present in
  user settings for the test namespace; create succeeds; created VM spec has no
  `spec.template.spec.accessCredentials`.
- **Out-of-Scope:** Linux/RHEL guests that still receive the default key via cloud-init. SSH tab UI,
  sysprep, and Windows password credentials.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project; kubeadmin (or
  equivalent cluster-admin) session.
- **Configuration:** A default SSH key is written into `kubevirt-user-settings` for the current
  console user in the test namespace (`setupDefaultSSHKey`). No extra feature gates.
- **Initial Setup:** Uses the job test namespace (`testConfig.testNamespace`) so HC E2E does not
  depend on an extra `pw-*` project (those are swept cluster-wide on teardown). The default SSH
  mapping is cleared in `afterEach`. The created VirtualMachine is tracked with
  `apiClient.trackResource` for cleanup.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/create-vm/create-vm-wizard-default-ssh-windows.spec.ts`
**Describe:** `VM Creation Wizard — default SSH key is not applied to Windows VMs` — **Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier 1`

---

### `001`: Windows guest is created without SSH accessCredentials when a default SSH key is set

- **Objective:** Confirm that a Windows VM created through the wizard does not include SSH
  `accessCredentials` even when a default SSH key is configured for the project.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-95191
- **Pre-conditions:** Default SSH secret exists and is set as the user's default key for the test
  namespace; Windows OS tile is available in the wizard.
- **Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`

| Step | Action                                                                                     | Expected Result                                                                       |
| :--- | :----------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------ |
| 1    | Set a default SSH key for the current user in the job test namespace                       | User settings point at the SSH secret in `testConfig.testNamespace`                   |
| 2    | Open Virtualization, go to the namespaced VM list URL, and start Create VirtualMachine     | Wizard is visible                                                                     |
| 3    | Step 1 — keep Custom configuration, select the test project, generate a VM name, then Next | Custom configuration card is selected; project is the test namespace; wizard advances |
| 4    | Step 2 — select Windows, then Next                                                         | OS tiles are visible; Windows is selected                                             |
| 5    | Step 3 — select the first Windows boot volume, or no boot source if none exist, then Next  | Boot source step is visible; a source (or none) is chosen                             |
| 6    | Step 4 — select General Purpose (U series) and the largest size, then Next                 | Compute step is visible; size dropdown text contains `CPUs`                           |
| 7    | Step 5 — leave Customization unchanged, then Next                                          | Customization step is visible                                                         |
| 8    | Step 6 — review and click Create VirtualMachine                                            | Review step is visible; console redirects to VM details                               |
| 9    | Read the VM name from the URL and fetch the VirtualMachine from the API                    | VM exists in the test namespace                                                       |
| 10   | Assert `spec.template.spec.accessCredentials`                                              | Field is undefined (default SSH key was not applied)                                  |

---

## 5. Requirements Traceability Matrix

Maps Jira tickets to the test cases that provide coverage. Tickets without a specific test case indicate
a planned coverage gap (status: Pending).

| Jira Ticket | Test Case ID | Coverage Type           | Status    |
| ----------- | ------------ | ----------------------- | --------- |
| CNV-95191   | `001`        | Bugfix regression guard | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Batya Nahmias
- **Approval Signature:** Batya Nahmias
