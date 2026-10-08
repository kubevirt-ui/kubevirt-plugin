# Software Test Description (STD): VM Creation Wizard — VirtIO Recommendation and Boot Source

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — VM creation wizard
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-07
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify the Create from Template wizard's VirtIO recommendation alerts and template-drawer boot source
controls: Windows templates surface disk and network alerts that Switch all to VirtIO dismisses,
RHEL templates do not show those alerts, the Change boot source modal can be opened and cancelled
without altering the displayed source, and switching the Windows root disk to VirtIO persists on the
created VM.

### 2.2 Scope

- **In-Scope:** Create from Template wizard steps 1–3 for `windows2k22-server-medium` and
  `rhel9-server-small`; Storage and Network VirtIO recommendation alerts and Switch all to VirtIO;
  Windows root disk interface in the wizard Storage table; template-drawer boot source visibility and
  the Change boot source modal open/cancel path; Review and create for the Windows VirtIO switch;
  redirect to VM details; VM existence; VMI `rootdisk` bus.
- **Out-of-Scope:** Confirming a new bootable volume in the Change boot source modal (select volume
  and Save); asserting the NIC model cell after Switch all to VirtIO; the VirtIO Learn more
  documentation link; templates other than `windows2k22-server-medium` and `rhel9-server-small`;
  hostname, labels, and annotations on the same wizard (covered by
  `create-vm-wizard-from-template.spec.ts`).

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with the CNV operator installed; Playwright `Tier1` project; kubeadmin
  or an equivalent cluster-admin session.
- **Configuration:** Catalog templates `windows2k22-server-medium` and `rhel9-server-small` are
  available. The Windows template's root disk defaults to SATA. The RHEL9 template is sourceRef-backed
  so its drawer boot source is editable. Console URL and authentication credentials are configured
  for Playwright.
- **Initial Setup:** Each test creates an isolated namespace via `setupTestNamespace`. The created VM
  in `005` is tracked via `apiClient.trackResource('VirtualMachine', ...)` for automatic cleanup.
  Namespaces are tracked on `apiClient` as well.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/create-vm/create-vm-wizard-virtio-boot-source.spec.ts`
**Describe:** `VM Creation Wizard — VirtIO recommendation and boot source features` — **Tags:**
`@tier1`, `@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier 1`

---

### `001`: Windows template shows VirtIO disk and network alerts that Switch all to VirtIO dismisses

- **Objective:** Verify that a Windows Server 2022 template shows the Storage and Network VirtIO
  recommendation alerts, and that Switch all to VirtIO hides each alert.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96180
- **Pre-conditions:** `windows2k22-server-medium` is available in the catalog, and the user can create
  namespaces.
- **Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`

| Step | Action                                                                                                | Expected Result                                                                                |
| :--- | :---------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| 1    | Create an isolated namespace and open the create VM wizard from the namespaced VM list                | The creation wizard is visible                                                                 |
| 2    | Select From Template, generate a VM name, and continue                                                | From Template is selected and the wizard advances to the template catalog                      |
| 3    | Verify the template catalog and select `windows2k22-server-medium`                                    | The Templates heading is visible; Next becomes enabled                                         |
| 4    | Continue to Customization and open the Storage tab                                                    | Customization is visible and the Storage tab is active                                         |
| 5    | Observe the VirtIO disk recommendation alert and click Switch all to VirtIO                           | Alert title is "Non-VirtIO disk interfaces detected"; the alert disappears after the switch    |
| 6    | Open the Network tab, observe the VirtIO network recommendation alert, and click Switch all to VirtIO | Alert title is "Non-VirtIO network interfaces detected"; the alert disappears after the switch |

---

### `002`: RHEL template does not show VirtIO recommendation alerts

- **Objective:** Verify that a RHEL9 template does not show VirtIO recommendation alerts on the
  Storage or Network customization tabs.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96180
- **Pre-conditions:** `rhel9-server-small` is available in the catalog, and the user can create
  namespaces.
- **Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`

| Step | Action                                                                                 | Expected Result                                                           |
| :--- | :------------------------------------------------------------------------------------- | :------------------------------------------------------------------------ |
| 1    | Create an isolated namespace and open the create VM wizard from the namespaced VM list | The creation wizard is visible                                            |
| 2    | Select From Template, generate a VM name, and continue                                 | From Template is selected and the wizard advances to the template catalog |
| 3    | Select `rhel9-server-small` and continue                                               | The wizard advances to Customization                                      |
| 4    | Open the Storage tab                                                                   | The VirtIO disk recommendation alert is not visible                       |
| 5    | Open the Network tab                                                                   | The VirtIO network recommendation alert is not visible                    |

---

### `003`: Template catalog exposes an editable boot source and opens the Change boot source modal

- **Objective:** Verify that a sourceRef-backed RHEL9 template shows a non-empty editable boot source
  in the catalog drawer and that Edit opens the Change boot source modal.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96180
- **Pre-conditions:** `rhel9-server-small` is available in the catalog with an editable boot source,
  and the user can create namespaces.
- **Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`

| Step | Action                                                                                 | Expected Result                                                           |
| :--- | :------------------------------------------------------------------------------------- | :------------------------------------------------------------------------ |
| 1    | Create an isolated namespace and open the create VM wizard from the namespaced VM list | The creation wizard is visible                                            |
| 2    | Select From Template, generate a VM name, and continue                                 | From Template is selected and the wizard advances to the template catalog |
| 3    | Select `rhel9-server-small` and read the drawer boot source                            | The boot source control is visible and its text is non-empty              |
| 4    | Click the boot source control                                                          | The Change boot source modal is open                                      |

---

### `004`: Cancelling the Change boot source modal leaves the original boot source unchanged

- **Objective:** Verify that cancelling the Change boot source modal closes it and leaves the
  template-drawer boot source text unchanged.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96180
- **Pre-conditions:** `rhel9-server-small` is available in the catalog with an editable boot source,
  and the user can create namespaces.
- **Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`

| Step | Action                                                                                 | Expected Result                                                           |
| :--- | :------------------------------------------------------------------------------------- | :------------------------------------------------------------------------ |
| 1    | Create an isolated namespace and open the create VM wizard from the namespaced VM list | The creation wizard is visible                                            |
| 2    | Select From Template, generate a VM name, and continue                                 | From Template is selected and the wizard advances to the template catalog |
| 3    | Select `rhel9-server-small` and record the drawer boot source text                     | The boot source text is captured                                          |
| 4    | Open the Change boot source modal and cancel                                           | The modal opens, then closes after cancel                                 |
| 5    | Read the drawer boot source text again                                                 | The text matches the value recorded before the modal opened               |

---

### `005`: Switching the Windows root disk to VirtIO persists through VM creation

- **Objective:** Verify that a Windows Server 2022 root disk defaults to SATA, Switch all to VirtIO
  changes it to virtio in the wizard, creating the VM succeeds, and the VMI `rootdisk` bus is virtio.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96180
- **Pre-conditions:** `windows2k22-server-medium` is available in the catalog, and the user can create
  namespaces and VirtualMachines.
- **Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`

| Step | Action                                                                                 | Expected Result                                                                                     |
| :--- | :------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| 1    | Create an isolated namespace and open the create VM wizard from the namespaced VM list | The creation wizard is visible                                                                      |
| 2    | Select From Template, generate a VM name, and continue                                 | From Template is selected and the wizard advances to the template catalog                           |
| 3    | Select `windows2k22-server-medium` and continue                                        | The wizard advances to Customization                                                                |
| 4    | Open the Storage tab and read the `rootdisk` interface                                 | The interface value is `sata`                                                                       |
| 5    | Click Switch all to VirtIO and wait for the disk alert to disappear                    | The `rootdisk` interface value is `virtio`                                                          |
| 6    | Continue to Review and create the VM                                                   | Review is visible; the console redirects to VM details                                              |
| 7    | Read the VM name from the URL, confirm the VM exists, and read the VMI `rootdisk` bus  | The VM name is non-empty, the VM exists in the isolated namespace, and the VMI disk bus is `virtio` |

---

## 5. Requirements Traceability Matrix

Maps Jira tickets to the test cases that provide coverage. Tickets without a specific test case
indicate a planned coverage gap (status: Pending).

| Jira Ticket | Test Case ID | Coverage Type    | Status    |
| ----------- | ------------ | ---------------- | --------- |
| CNV-96180   | `001`        | Feature coverage | Automated |
| CNV-96180   | `002`        | Feature coverage | Automated |
| CNV-96180   | `003`        | Feature coverage | Automated |
| CNV-96180   | `004`        | Feature coverage | Automated |
| CNV-96180   | `005`        | Feature coverage | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Gal Kremer
- **Approval Signature:** Gal Kremer
