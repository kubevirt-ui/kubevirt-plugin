# Software Test Description (STD): VM Creation Wizard — Custom Configuration Customization Editing

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — VM creation wizard
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-23
- **Document Status:** In Review

## 2. Introduction

### 2.1 Purpose

Verify that, in the Custom configuration wizard flow, repeated edits to the Description and Boot
order fields on the Customization step render correctly after each edit and persist when navigating
Back to Compute resources and Next again before proceeding through Review and create.

### 2.2 Scope

- **In-Scope:** Custom configuration flow through Guest OS (async OS type load gating Next), Boot
  source (first available volume), Compute resources, and Customization; opening the Description
  modal and editing it twice; opening the Boot order modal and reordering devices twice; assertions
  that each reorder changes the displayed device sequence; Back/Next round-trip persistence of both
  edits; Review step display of the generated VM name and visible sections; VM creation.
- **Out-of-Scope:** Create from template and clone existing VM flows (covered by
  `create-vm-wizard-from-template-customization-editing.spec.ts` and
  `create-vm-wizard-clone-step-review.spec.ts`); boundary/invalid input for the Description field
  (backend validation, not covered by design); other Customization tabs (Storage, Network,
  Scheduling, SSH, Initial run, Labels and annotations).

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project; kubeadmin or
  an equivalent cluster-admin session.
- **Configuration:** At least one boot volume must be available so the boot order contains enough
  devices to exercise reordering.
- **Initial Setup:** The test creates its own namespace via `setupTestNamespace`; the created VM is
  tracked via `apiClient.trackResource('VirtualMachine', ...)` for automatic cleanup.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/create-vm/create-vm-wizard-custom-config-customization-editing.spec.ts`
**Describe:** `VM Creation Wizard — Custom configuration: Customization editing and persistence` —
**Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier 1`

---

### `001`: Description and boot order edits persist across Back/Next navigation

- **Objective:** Verify that editing the Description and Boot order fields twice on the
  Customization step renders each change immediately, survives a Back-to-Compute-resources and
  Next round trip, and does not prevent the VM from being reviewed and created.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                                                                                          | Expected Result                                                                                                     |
| :--- | :---------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| 1    | Open the wizard; keep Custom configuration selected; generate a VM name; click Next             | Custom configuration is selected by default; wizard advances to Guest OS                                            |
| 2    | Wait for the guest OS type list to finish loading, then click Next                              | Next only enables after the async OS type load completes; a guest OS is pre-selected                                |
| 3    | Select the first available boot volume; click Next                                              | Boot source step is visible; wizard advances to Compute resources                                                   |
| 4    | Leave Compute resources unchanged; click Next                                                   | Compute resources step is visible; wizard advances to Customization                                                 |
| 5    | Open the Description modal, set it to "test", save; then reopen and set it to "test test", save | Each save renders the new description on the Details tab immediately                                                |
| 6    | Open the Boot order modal, reorder a device, save; reopen, reorder again, save                  | Each save renders the expected changed device sequence on the Details tab                                           |
| 7    | Click Back to return to Compute resources, then Next to return to Customization                 | Both the Description ("test test") and the last boot order remain unchanged                                         |
| 8    | Click Next to Review, verify the generated VM name and visible sections, then create the VM     | Review shows the VM name and Details/Storage/Network/Hardware devices sections; the console redirects to VM details |
| 9    | Verify the VM exists via API                                                                    | VirtualMachine resource exists in the test namespace                                                                |

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
