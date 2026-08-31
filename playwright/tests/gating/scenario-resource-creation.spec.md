# Software Test Description (STD): Resource Creation (Gating)

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Gating — Resource creation
- **Latest version:** CNV 5.0.0
- **Latest update:** 2026-08-21
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify gating-tier smoke coverage for creating core Virtualization resources from the UI: VirtualMachines
(wizard and YAML), Templates (YAML, clone-from-existing, from-VM guidance, save-as-template),
MigrationPolicies, cluster InstanceTypes, and bootable volumes.

### 2.2 Scope

- **In-Scope:** VM creation wizard happy path (new VM, Fedora, first boot volume, `u` / small, start-after-create
  unchecked), VM YAML import, template YAML create, Create-template dropdown options "From an existing template"
  and "From a virtual machine", save VM as template from VM details, MigrationPolicy form create, cluster
  InstanceType YAML create, bootable volume YAML create.
- **Out-of-Scope:** Completing a clone from the Create-template modal (this file only opens and closes the dialog).
  Guided-tour step for template creation. Template kebab Clone (covered by
  `tests/tier1/templates/template-creation-flows.spec.ts`). Form-based InstanceType or bootable-volume create.
  Wizard OS / instance-type variants beyond Fedora / `u` small.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Gating` project.
- **Configuration:** Cluster-admin session via the gating fixture. "Save VM as template" requires the native VM
  templates preview flag (`kubevirt-ui-features` ConfigMap key `vmTemplates=true`); that case is skipped when the
  flag is off.
- **Initial Setup:** No spec-level `beforeAll`. Each test uses `testConfig.testNamespace` (or All Projects where
  noted) and tracks created resources on `apiClient` for cleanup. Gating fixture performs lightweight console
  navigation (auth heal, onboarding/tour dismiss) instead of full per-test auto-navigation.

---

## 4. Test Case Definitions

**Spec file:** `tests/gating/scenario-resource-creation.spec.ts`
**Describe:** `Resource creation (gating)` — **Tags:** `@gating`, `@resource-creation`
**Allure:** suite `Resource creation (gating)`, feature `Gating`

---

### `001`: Create a VM via the creation wizard

- **Objective:** Verify that completing the Create VM wizard redirects to the VM detail page and shows the created VM name
- **Target version:** CNV 5.0.0
- **Jira References:** —
- **Pre-conditions:** Test namespace exists; at least one bootable volume is available for the wizard
- **Tags:** `@gating`, `@resource-creation`, `e2e-create`

| Step | Action                                                                              | Expected Result                                        |
| :--- | :---------------------------------------------------------------------------------- | :----------------------------------------------------- |
| 1    | Navigate to VirtualMachines                                                         | VM list / tree view loads                              |
| 2    | Open the creation wizard from the Create dropdown                                   | Wizard opens                                           |
| 3    | Select creation method "new VM", keep the generated name, click Next                | Operating system step is shown                         |
| 4    | Select Other Linux / Fedora, click Next                                             | Boot source step is shown                              |
| 5    | Select the first available boot volume, click Next                                  | Instance type step is shown                            |
| 6    | Select series `u` and size `small`, click Next twice (skip remaining optional step) | Review step is visible                                 |
| 7    | If "Start after creation" is checked, uncheck it                                    | VM will be created stopped                             |
| 8    | Click Create                                                                        | Browser redirects to the VM detail URL; name is parsed |
| 9    | Observe the VM detail page                                                          | Created VM name is visible                             |

---

### `002`: Create a VM via YAML import

- **Objective:** Verify that importing a VM from YAML creates the VM and navigates to a URL that contains the VM name
- **Target version:** CNV 5.0.0
- **Jira References:** —
- **Pre-conditions:** Test namespace exists
- **Tags:** `@gating`, `@resource-creation`, `yaml-create`

| Step | Action                                                                            | Expected Result                                        |
| :--- | :-------------------------------------------------------------------------------- | :----------------------------------------------------- |
| 1    | Navigate to VirtualMachines in the test namespace                                 | Namespaced VM list loads                               |
| 2    | Click Create and select "With YAML" (retry once if the editor heading is missing) | "Create VirtualMachine" YAML editor heading is visible |
| 3    | Paste generated VM YAML (namespace line stripped) and click Create                | URL pathname contains the VM name                      |

---

### `003`: Create a template via YAML editor

- **Objective:** Verify that creating a template from the YAML editor persists the template and shows it in the Templates list
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-87128
- **Pre-conditions:** Test namespace exists
- **Tags:** `@gating`, `@resource-creation`

| Step | Action                                                                   | Expected Result                                         |
| :--- | :----------------------------------------------------------------------- | :------------------------------------------------------ |
| 1    | Navigate to Templates and switch to the test project                     | Templates list for the namespace loads                  |
| 2    | Click Create template (selects "With YAML" when the dropdown is present) | YAML editor opens with the example template             |
| 3    | Set the example template name (and namespace) and click Create           | Browser navigates to a URL containing the template name |
| 4    | Return to Templates, switch project, filter by the new name              | Created template row is visible                         |

---

### `004`: Clone dialog opens from Create template

- **Objective:** Verify that "Create template → From an existing template" opens the clone dialog with a source project selector
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-87128
- **Pre-conditions:** Templates page is reachable; All Projects view is available
- **Tags:** `@gating`, `@resource-creation`

| Step | Action                                                       | Expected Result                              |
| :--- | :----------------------------------------------------------- | :------------------------------------------- |
| 1    | Navigate to Templates and switch project to **All Projects** | Templates list loads for all projects        |
| 2    | Click Create template → "From an existing template"          | Clone dialog is visible                      |
| 3    | Observe the dialog                                           | "Source template project" selector is shown  |
| 4    | Close the dialog                                             | Dialog is dismissed (clone is not submitted) |

---

### `005`: From a virtual machine navigates to the VM list

- **Objective:** Verify that "Create template → From a virtual machine" navigates to the VirtualMachines list (`tab=vms`) and shows the save-as-template guidance toast
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-87128
- **Pre-conditions:** Templates page is reachable
- **Tags:** `@gating`, `@resource-creation`

| Step | Action                                           | Expected Result                                                               |
| :--- | :----------------------------------------------- | :---------------------------------------------------------------------------- |
| 1    | Navigate to Templates                            | Templates list loads                                                          |
| 2    | Click Create template → "From a virtual machine" | URL is a VirtualMachines list with `tab=vms`                                  |
| 3    | Observe toast notifications                      | Info toast explains to select a VM and choose "Save as template" from Actions |

---

### `006`: Save a VM as a template from VM details

- **Objective:** Verify that saving a running/created VM as a template from the VM detail Actions menu creates a template visible in the Templates list
- **Target version:** CNV 5.0.0
- **Jira References:** —
- **Pre-conditions:** Native VM templates preview flag is enabled (`vmTemplates=true`). Test is skipped otherwise.
- **Tags:** `@gating`, `@resource-creation`

| Step | Action                                                       | Expected Result                  |
| :--- | :----------------------------------------------------------- | :------------------------------- |
| 1    | Create a VM from template `rhel9-server-small` via API       | VM exists in the test namespace  |
| 2    | Open the VM from the tree view                               | VM detail page shows the VM name |
| 3    | Save as template with a generated name in the test namespace | Template is created              |
| 4    | Navigate to Templates and filter by the new name             | Template row is visible          |

---

### `007`: Create a migration policy via form

- **Objective:** Verify that creating a MigrationPolicy from the form persists the resource via the API
- **Target version:** CNV 5.0.0
- **Jira References:** —
- **Pre-conditions:** MigrationPolicies page is reachable
- **Tags:** `@gating`, `@resource-creation`

| Step | Action                                | Expected Result     |
| :--- | :------------------------------------ | :------------------ |
| 1    | Navigate to MigrationPolicies         | List page loads     |
| 2    | Click Create and select "With form"   | Form loads          |
| 3    | Fill the policy name and click Create | Resource is tracked |
| 4    | Query MigrationPolicy via API         | Policy exists       |

---

### `008`: Create a cluster instance type via YAML editor

- **Objective:** Verify that creating a `VirtualMachineClusterInstancetype` from YAML shows the instance type in the UI list
- **Target version:** CNV 5.0.0
- **Jira References:** —
- **Pre-conditions:** InstanceTypes page is reachable
- **Tags:** `@gating`, `@resource-creation`

| Step | Action                                                      | Expected Result              |
| :--- | :---------------------------------------------------------- | :--------------------------- |
| 1    | Navigate to InstanceTypes                                   | List page loads              |
| 2    | Click Create, paste YAML for a 1 CPU / 1Gi cluster IT, save | Resource is created          |
| 3    | Reload InstanceTypes and filter by the new name             | Instance type row is visible |

---

### `009`: Create a bootable volume via YAML editor

- **Objective:** Verify that creating a DataVolume bootable volume from YAML shows the volume in the bootable volumes list
- **Target version:** CNV 5.0.0
- **Jira References:** —
- **Pre-conditions:** Test namespace exists; Fedora registry image URL is available to the test factory
- **Tags:** `@gating`, `@resource-creation`

| Step | Action                                                                                 | Expected Result                |
| :--- | :------------------------------------------------------------------------------------- | :----------------------------- |
| 1    | Navigate to Bootable volumes in the test namespace                                     | Namespaced list loads          |
| 2    | Click Create → "With YAML", paste generated DataVolume YAML (namespace stripped), save | DataVolume is created          |
| 3    | Filter the list by the new name                                                        | Bootable volume row is visible |

---

## 5. Requirements Traceability Matrix

Maps Jira tickets to the test cases that provide coverage. Tickets without a specific test case indicate
a planned coverage gap (status: Pending).

| Jira Ticket | Test Case ID | Coverage Type    | Status    |
| ----------- | ------------ | ---------------- | --------- |
| CNV-87128   | `003`        | Feature coverage | Automated |
| CNV-87128   | `004`        | Feature coverage | Automated |
| CNV-87128   | `005`        | Feature coverage | Automated |
| —           | `001`        | Functional smoke | Automated |
| —           | `002`        | Functional smoke | Automated |
| —           | `006`        | Functional smoke | Automated |
| —           | `007`        | Functional smoke | Automated |
| —           | `008`        | Functional smoke | Automated |
| —           | `009`        | Functional smoke | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Adam Viktora
- **Approval Signature:** Adam Viktora
