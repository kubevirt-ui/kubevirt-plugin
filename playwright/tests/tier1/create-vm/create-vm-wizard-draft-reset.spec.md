# Software Test Description (STD): VM Creation Wizard — Draft Reset After Close

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — VM creation wizard
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-23
- **Document Status:** In Review

## 2. Introduction

### 2.1 Purpose

Verify that the wizard's form draft is fully reset both when the wizard is closed manually via
Cancel and when a VM is created successfully, so that reopening the wizard never shows data left
over from the previous session.

### 2.2 Scope

- **In-Scope:** Reopening the wizard after Cancel and verifying the creation method reverts to
  Custom configuration and Next is disabled (Name field empty); reopening the wizard after a
  successful VM creation with a non-default Windows guest OS and verifying the same reset, plus
  that the Guest OS step's original default OS type is restored rather than carrying over Windows.
- **Out-of-Scope:** Reset behavior mid-wizard (covered implicitly by Back/Next persistence in the
  customization-editing specs, which is the opposite behavior — data should persist there); reset
  of the Clone or Template creation methods specifically (Custom configuration is used as the
  representative case since it is the default method the wizard reverts to).

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project; kubeadmin or
  an equivalent cluster-admin session.
- **Configuration:** None beyond the wizard being reachable.
- **Initial Setup:** The Cancel test opens the wizard from the shared job test namespace
  (`testConfig.testNamespace`) and creates no VM. The creation test creates its own namespace via
  `setupTestNamespace`; the created VM is tracked via `apiClient.trackResource('VirtualMachine', ...)`
  for automatic cleanup.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/create-vm/create-vm-wizard-draft-reset.spec.ts`
**Describe:** `VM Creation Wizard — Draft is reset after the wizard is closed` — **Tags:**
`@tier1`, `@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier 1`

---

### `001`: Cancelling the wizard discards entered data — reopening starts from a clean draft

- **Objective:** Verify that after selecting a non-default creation method and cancelling the
  wizard, reopening it shows Custom configuration selected again and Next disabled (empty Name).
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                                                | Expected Result                                                                             |
| :--- | :---------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| 1    | Open the wizard; select Clone existing VirtualMachine | Clone is selected                                                                           |
| 2    | Cancel the wizard                                     | Wizard closes                                                                               |
| 3    | Reopen the wizard                                     | Custom configuration is selected again (not Clone); Next is disabled (Name field was reset) |

---

### `002`: Successfully creating a VM discards the draft — reopening starts from a clean draft

- **Objective:** Verify that after completing the wizard and creating a VM, reopening the wizard
  shows Custom configuration selected, Next disabled until a new name is generated, and the Guest OS
  step's default selection restored (not carried over from the created VM).
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                                                                                                  | Expected Result                                                                 |
| :--- | :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------ |
| 1    | Record the default Guest OS, select Windows, complete the wizard with no boot source, and create the VM | The console redirects to VM details; the VM exists via API                      |
| 2    | Navigate back to the namespaced VM list and reopen the wizard                                           | Custom configuration is selected again; Next is disabled (Name field was reset) |
| 3    | Generate a new VM name and click Next                                                                   | The Guest OS step restores the recorded default and does not retain Windows     |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type    | Status    |
| ----------- | ------------ | ---------------- | --------- |
| CNV-96281   | `001`        | Feature coverage | Automated |
| CNV-96281   | `002`        | Feature coverage | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Vojtech Portes
- **Approval Signature:** Pending
