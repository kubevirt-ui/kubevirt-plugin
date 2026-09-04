# Software Test Description (STD): VM Creation Wizard — Custom Configuration

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — VM creation wizard
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-08-31
- **Document Status:** In Review

## 2. Introduction

### 2.1 Purpose

Verify the custom configuration VM creation wizard happy path: selecting Custom configuration,
Guest OS, boot source, compute resources, customization (including annotation empty-key
validation), review, and successful VM creation.

### 2.2 Scope

- **In-Scope:** Wizard steps 1–6 for Custom configuration, Labels and annotations tab empty-key
  validation in the Edit annotations modal, redirect to VM details, VM resource existence.
- **Out-of-Scope:** Create from template and clone existing VM flows (covered by
  `create-vm-wizard-from-template.spec.ts` and `create-vm-wizard-clone.spec.ts`).

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project.
- **Configuration:** Admin access; a RHEL boot volume should be available. If no boot volumes exist,
  the test selects "No boot source" and continues.
- **Initial Setup:** Each test creates its own namespace via `setupTestNamespace`; the created VM is
  tracked via `apiClient.trackResource('VirtualMachine', ...)` for automatic cleanup.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/create-vm/create-vm-wizard-custom-config.spec.ts`
**Describe:** `VM Creation Wizard — Custom configuration happy path` — **Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier 1`

---

### `001`: Custom configuration wizard creates a RHEL VM through all steps

- **Objective:** Verify that a VM can be created through the Custom configuration wizard and that
  empty annotation keys cannot be saved on the Labels and annotations tab.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-95902
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                                                                              | Expected Result                                              |
| :--- | :---------------------------------------------------------------------------------- | :----------------------------------------------------------- |
| 1    | Open the create VM wizard and select Custom configuration                           | Wizard opens; Custom configuration is selected by default    |
| 2    | Generate a VM name and continue through Guest OS                                    | OS tiles and OS type dropdown are visible; an OS is selected |
| 3    | Select a RHEL boot volume (or no boot source if none are available)                 | Boot source step is visible; Next proceeds                   |
| 4    | Verify compute resources                                                            | Instance type series cards are visible; a size is selected   |
| 5    | On Customization, open Labels and annotations, click Add annotations, then Add more | Save is disabled while the new row has an empty key          |
| 6    | Cancel the modal, continue to Review, and create the VM                             | Redirects to VM details; the VM resource exists              |

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
