# Software Test Description (STD): VirtIO Drivers Alert

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — VM list
- **Latest version:** CNV 5.0.0
- **Latest update:** 2026-08-26
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify the VM list VirtIO drivers warning alert: it appears only when a Windows VM is in the
current namespace list, the "Go to Downloads" link opens Settings → Downloads with a Download ISO
button, and checking "Don't show this message again" before closing persists dismissal in
localStorage across reload.

### 2.2 Scope

- **In-Scope:** VirtIO drivers alert visibility on the namespaced VM list, expandable alert body
  actions (Go to Downloads, Don't show this message again, close), Downloads tab Download ISO
  button visibility, localStorage key `kubevirt-virtio-drivers-alert-dismissed`.
- **Out-of-Scope:** Session-only close without the checkbox; empty VM list (empty state does not
  mount the list or alert); the "How to update Windows VMs" external documentation link.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project.
- **Configuration:** No special feature gates. Halted container-disk VMs are created via
  `VirtualMachineFactory`; the Windows case sets `os` / `osLabel` to `windows` so
  `vm.kubevirt.io/os` matches the UI Windows detector. No Windows guest image or boot is required.
- **Initial Setup:** `beforeAll` creates two namespaces (`setupTestNamespace`) and one halted VM in
  each (`createHaltedVm`). VMs are deleted in `afterAll` via `cleanupVmFixtures`;
  namespaces are tracked for cleanup.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/virtualmachines/virtio-drivers-alert.spec.ts`
**Describe:** `VirtIO drivers alert` — **Tags:** `@tier1`, `@nonpriv`
**Allure:** suite `VirtIO drivers alert`, feature `Tier 1`

---

### `001`: Alert is shown only when a Windows VM is in the list

- **Objective:** Verify the VirtIO drivers alert is hidden on a Linux-only VM list and visible when
  a Windows-labeled VM is listed in the namespace.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-93277
- **Pre-conditions:** Dedicated Linux and Windows namespaces each contain one halted VM; dismiss
  localStorage key is cleared
- **Tags:** `@nonpriv`

| Step | Action                                                             | Expected Result                    |
| :--- | :----------------------------------------------------------------- | :--------------------------------- |
| 1    | Open the Linux namespace VM list and wait for the Linux VM row     | VM list table shows the Linux VM   |
| 2    | Check for the VirtIO drivers alert                                 | Alert is not visible               |
| 3    | Open the Windows namespace VM list and wait for the Windows VM row | VM list table shows the Windows VM |
| 4    | Check for the VirtIO drivers alert                                 | Alert is visible                   |

---

### `002`: Go to Downloads opens the Downloads tab with the Download ISO button

- **Objective:** Verify that expanding the alert and clicking Go to Downloads navigates to the
  Settings Downloads tab and shows the Download ISO button.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-93277
- **Pre-conditions:** Windows namespace VM list shows the alert; dismiss localStorage key is cleared
- **Tags:** `@nonpriv`

| Step | Action                                                    | Expected Result                                                                     |
| :--- | :-------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| 1    | Open the Windows namespace VM list                        | Alert is visible                                                                    |
| 2    | Expand the alert and click Go to Downloads                | URL contains `virtualization-settings/downloads` and hash `#virtio-drivers-windows` |
| 3    | Observe Downloads tab content and the Download ISO button | Tab content and Download ISO button are visible                                     |

---

### `003`: Checking Don't show again and closing the alert hides it after reload

- **Objective:** Verify that checking "Don't show this message again" and closing the alert writes
  localStorage and keeps the alert hidden after reload.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-93277
- **Pre-conditions:** Windows namespace VM list shows the alert; dismiss localStorage key is cleared
  at the start of the test
- **Tags:** `@nonpriv`

| Step | Action                                                              | Expected Result             |
| :--- | :------------------------------------------------------------------ | :-------------------------- |
| 1    | Open the Windows namespace VM list                                  | Alert is visible            |
| 2    | Expand the alert, check Don't show this message again, and close it | Alert is dismissed          |
| 3    | Read `kubevirt-virtio-drivers-alert-dismissed` from localStorage    | Stored value is JSON `true` |
| 4    | Reload the VM list and wait for the Windows VM row                  | Alert is not visible        |

---

## 5. Requirements Traceability Matrix

Maps Jira tickets to the test cases that provide coverage. Tickets without a specific test case indicate
a planned coverage gap (status: Pending).

| Jira Ticket | Test Case ID | Coverage Type    | Status    |
| ----------- | ------------ | ---------------- | --------- |
| CNV-93277   | `001`        | Feature coverage | Automated |
| CNV-93277   | `002`        | Feature coverage | Automated |
| CNV-93277   | `003`        | Feature coverage | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Adam Viktora
- **Approval Signature:** Adam Viktora
