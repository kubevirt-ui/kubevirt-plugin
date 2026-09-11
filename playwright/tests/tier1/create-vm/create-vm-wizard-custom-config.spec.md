# Software Test Description (STD): VM Creation Wizard — Custom Configuration

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — VM creation wizard
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-09
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify the custom configuration VM creation wizard happy path and ensure that customization is
preserved or regenerated correctly when the user returns to earlier wizard steps.

### 2.2 Scope

- **In-Scope:** Wizard steps 1–6 for Custom configuration; Labels and annotations tab empty-key
  validation; persistence of hostname, description, ephemeral storage, and boot order after
  unchanged navigation and a compute-size change; selective storage and boot-order regeneration
  after independently changing Guest OS and boot source; redirect to VM details; VM resource
  existence.
- **Out-of-Scope:** Asynchronous and concurrent template generation; generated network-group
  reconciliation; creation method and location invalidation; asynchronous generation-input loading.
  These implementation branches are covered by focused unit tests in
  `useCreateVMFromTemplate.test.ts`, `reconcileGeneratedVM.test.ts`, `useGenerateVM.test.ts`, and
  `useVMGenerationNavClick.test.ts`.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project.
- **Configuration:** Admin access; a RHEL boot volume must be available for the reconciliation test.
  The happy-path test selects "No boot source" and continues when no boot volumes exist.
- **Initial Setup:** Each test creates its own namespace via `setupTestNamespace`. The happy-path
  test tracks its created VM via `apiClient.trackResource('VirtualMachine', ...)` for automatic
  cleanup; the reconciliation test stops before VM creation.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/create-vm/create-vm-wizard-custom-config.spec.ts`
**Describe:** `VM Creation Wizard — Custom configuration` — **Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier 1`

---

### `001`: Custom configuration wizard creates a RHEL VM through all steps

- **Objective:** Verify that a VM can be created through the Custom configuration wizard and that
  empty annotation keys cannot be saved on the Labels and annotations tab.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-95902
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                                                                              | Expected Result                                                 |
| :--- | :---------------------------------------------------------------------------------- | :-------------------------------------------------------------- |
| 1    | Open the create VM wizard and select Custom configuration                           | Wizard opens; Custom configuration is selected by default       |
| 2    | Generate a VM name and continue through Guest OS                                    | OS tiles and OS type dropdown are visible; an OS is selected    |
| 3    | Select a RHEL boot volume (or no boot source if none are available)                 | Boot source step is visible; Next proceeds                      |
| 4    | Select General Purpose (U) series and medium size                                   | Instance type series cards are visible; medium size is selected |
| 5    | On Customization, open Labels and annotations, click Add annotations, then Add more | Save is disabled while the new row has an empty key             |
| 6    | Cancel the modal, continue to Review, and create the VM                             | Redirects to VM details; the VM resource exists                 |

---

### `002`: Customization is preserved and reconciled after revisiting previous steps

- **Objective:** Verify that generated VM updates preserve unrelated user customization and replace
  generated storage as a consistent group when Guest OS and boot source change independently.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** A RHEL boot volume is available and the user can create namespaces.
- **Tags:** `@adminOnly`

| Step | Action                                                                                   | Expected Result                                                                                                      |
| :--- | :--------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| 1    | Select Other Linux, No boot source, U series, and medium compute                         | The wizard reaches Customization with generated storage                                                              |
| 2    | Set hostname and description; add bootable ephemeral disk `test`                         | All customized values and the custom boot order are displayed                                                        |
| 3    | Visit Compute resources without changing it and return to Customization                  | Hostname, description, disk, and boot order persist                                                                  |
| 4    | Change compute size from medium to large and return to Customization                     | Unrelated customization, including storage and boot order, persists                                                  |
| 5    | Change only Guest OS from Other Linux to RHEL, keep No boot source, and reselect U/large | Hostname and description persist; disk `test` and its custom boot order are removed                                  |
| 6    | Add bootable ephemeral disk `test` again                                                 | The disk and its custom boot order are displayed                                                                     |
| 7    | Keep RHEL and U/large, select a RHEL boot volume, then return to Customization           | Hostname and description persist; generated `rootdisk` is present; disk `test` and its custom boot order are removed |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type           | Status    |
| ----------- | ------------ | ----------------------- | --------- |
| —           | `001`        | Functional smoke        | Automated |
| CNV-95902   | `001`        | Bugfix regression guard | Automated |
| CNV-96281   | `002`        | Bugfix regression guard | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Adam Viktora
- **Approval Signature:** Adam Viktora
