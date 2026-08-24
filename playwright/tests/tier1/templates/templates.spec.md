# Software Test Description (STD): Templates — Create, Edit, and Lifecycle

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — Templates
- **Latest version:** CNV 5.0.0
- **Latest update:** 2026-08-26
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify template management in the Virtualization UI: creating a user template from the
example YAML, instantiating VMs from templates, showing a non-default root disk name, editing
CPU and memory on Template and VirtualMachineTemplate details, and deleting a user template.

### 2.2 Scope

- **In-Scope:** Create from example YAML (details page after submit), API instantiate-and-run a VM
  from a Fedora template, Disks tab visibility of a custom root disk name plus VM creation from
  that template, inline CPU/memory edit on Template and VirtualMachineTemplate details, cluster
  create of a dedicated-CPU template, VM details/scheduling inherited from that template, and UI
  delete with empty-list plus cluster removal.
- **Out-of-Scope:** Clone / create-from-existing / save-VM-as-template (`template-creation-flows.spec.ts`).
  Remaining template detail tabs (YAML, Networks, Scripts, Parameters, Scheduling)
  (`template-detail-tabs.spec.ts`). Details-page edits other than CPU/memory (boot mode, workload,
  headless). Creating a VM through the customize-template wizard UI (this file instantiates VMs via
  API). Native VirtualMachineTemplate create and delete via the UI.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project.
- **Configuration:** Tests switch into the shared project unless running on ACM
  (`utils.EnvVariables.onAcm`). The VirtualMachineTemplate CPU/memory case is skipped unless the
  KubeVirt `Template` feature gate is enabled (`isNativeVmTemplatesEnabled`). Dedicated-resource
  templates use workload `highperformance`, `dedicatedCpuPlacement: true`, and eviction strategy
  `LiveMigrate`.
- **Initial Setup:** Two serial describes each call `setupTestNamespace` in `beforeAll`
  (`templates-shared` and `tpl-lifecycle-shared`). Templates and VMs are registered with
  `apiClient.trackResource(...)` for automatic cleanup.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/templates/templates.spec.ts`
**Describe:** `Tier1 Template Tests` — **Tags:** `@tier1`, `@tier1-templates`
**Allure:** suite `Test VM from example template`, feature `Tier 1`

---

### `001`: Creating a template from example YAML opens the details page

- **Objective:** Verify that submitting Create Template with the example YAML lands on a details
  page that shows Template details and Fedora VM.
- **Target version:** CNV 5.0.0
- **Pre-conditions:** Shared templates namespace exists
- **Tags:** `@tier1`, `@tier1-templates`

| Step | Action                                                                  | Expected Result                         |
| :--- | :---------------------------------------------------------------------- | :-------------------------------------- |
| 1    | Switch to the shared test project (skipped on ACM)                      | Project context is the shared namespace |
| 2    | Navigate to Templates and click Create (With YAML when a menu is shown) | YAML editor is visible                  |
| 3    | Set a unique template name in the example YAML and click Create         | Create submits without error            |
| 4    | Observe the page after create                                           | "Template details" is visible           |
| 5    | Observe the page after create                                           | "Fedora VM" is visible                  |

---

### `002`: VM created from a Fedora template reaches Running

- **Objective:** Verify that a VM instantiated from a user Fedora template is created and reaches
  Running.
- **Target version:** CNV 5.0.0
- **Pre-conditions:** Shared templates namespace exists
- **Tags:** `@tier1`, `@tier1-templates`

| Step | Action                                                   | Expected Result                         |
| :--- | :------------------------------------------------------- | :-------------------------------------- |
| 1    | Switch to the shared test project (skipped on ACM)       | Project context is the shared namespace |
| 2    | Create a Fedora user Template via API                    | Template exists in the cluster          |
| 3    | Navigate to Templates and filter by the template name    | Templates list is filtered              |
| 4    | Create a VM from the template via API with start enabled | VM resource is created                  |
| 5    | Wait until the VM is Running, then verify it exists      | VM exists and is in Running state       |

---

### `003`: Custom root disk name is shown on Disks and a VM can be created from the template

- **Objective:** Verify that a template whose root disk is named `custom-boot` shows that disk on
  the Disks tab and that a VM can still be created from the template.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-83098
- **Pre-conditions:** Shared templates namespace exists
- **Tags:** `@tier1`, `@tier1-templates`

| Step | Action                                                           | Expected Result                         |
| :--- | :--------------------------------------------------------------- | :-------------------------------------- |
| 1    | Create a user Template via API with root disk name `custom-boot` | Template exists in the cluster          |
| 2    | Switch to the shared test project (skipped on ACM)               | Project context is the shared namespace |
| 3    | Open the template from the filtered Templates list               | Template details page loads             |
| 4    | Open the Disks tab and look for disk `custom-boot`               | Disk `custom-boot` is visible           |
| 5    | Create a VM from the template via API                            | VM exists in the cluster                |

---

### `004`: User Template CPU and memory can be edited on the details page

- **Objective:** Verify that saving CPU `4` and memory `8` GiB on a user Template details page
  shows `4 CPU | 8 GiB Memory`.
- **Target version:** CNV 5.0.0
- **Pre-conditions:** Shared templates namespace exists
- **Tags:** `@tier1`, `@tier1-templates`

| Step | Action                                             | Expected Result                         |
| :--- | :------------------------------------------------- | :-------------------------------------- | ------------------------ |
| 1    | Switch to the shared test project (skipped on ACM) | Project context is the shared namespace |
| 2    | Create a user Template via API                     | Template exists in the cluster          |
| 3    | Open the template from the filtered Templates list | Template details page loads             |
| 4    | Edit CPU and memory to `4` and `8` GiB and save    | Values are submitted                    |
| 5    | Observe CPU and memory on the details page         | `4 CPU                                  | 8 GiB Memory` is visible |

---

### `005`: VirtualMachineTemplate CPU and memory can be edited on the details page

- **Objective:** Verify that saving CPU `4` and memory `8` GiB on a native VirtualMachineTemplate
  details page shows `4 CPU | 8 GiB Memory`.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-87440
- **Pre-conditions:** KubeVirt `Template` feature gate is enabled (`isNativeVmTemplatesEnabled`).
  If it is not, the test is skipped with reason "Native VM templates not enabled".
- **Tags:** `@tier1`, `@tier1-templates`

| Step | Action                                             | Expected Result                         |
| :--- | :------------------------------------------------- | :-------------------------------------- | ------------------------ |
| 1    | Switch to the shared test project (skipped on ACM) | Project context is the shared namespace |
| 2    | Create a VirtualMachineTemplate via API            | Native template resource is created     |
| 3    | Open the template from the filtered Templates list | Template details page loads             |
| 4    | Edit CPU and memory to `4` and `8` GiB and save    | Values are submitted                    |
| 5    | Observe CPU and memory on the details page         | `4 CPU                                  | 8 GiB Memory` is visible |

---

**Describe:** `Template lifecycle` — **Tags:** `@tier1`, `@tier1-templates`
**Allure:** suite `Template lifecycle`, feature `Tier 1`

---

### `006`: Template with dedicated CPU resources can be created in the cluster

- **Objective:** Verify that a user Template configured with dedicated CPU placement, high
  performance workload, and LiveMigrate eviction can be created and exists in the cluster.
- **Target version:** CNV 5.0.0
- **Pre-conditions:** Shared lifecycle namespace exists
- **Tags:** `@tier1`, `@tier1-templates`

| Step | Action                                                                 | Expected Result                         |
| :--- | :--------------------------------------------------------------------- | :-------------------------------------- |
| 1    | Switch to the shared lifecycle project (skipped on ACM)                | Project context is the shared namespace |
| 2    | Navigate to Templates                                                  | Templates page loads                    |
| 3    | Create a user Template via API with dedicated CPU and high performance | Template exists in the cluster          |

---

### `007`: VM from a dedicated-resources template shows High performance workload and dedicated scheduling

- **Objective:** Verify that a VM created from a dedicated-CPU template is visible in the UI with
  High performance workload, dedicated resources scheduling text, and a rootdisk row.
- **Target version:** CNV 5.0.0
- **Pre-conditions:** Shared lifecycle namespace exists
- **Tags:** `@tier1`, `@tier1-templates`

| Step | Action                                                        | Expected Result                                                                 |
| :--- | :------------------------------------------------------------ | :------------------------------------------------------------------------------ |
| 1    | Switch to the shared lifecycle project (skipped on ACM)       | Project context is the shared namespace                                         |
| 2    | Create a dedicated-CPU user Template via API                  | Template exists in the cluster                                                  |
| 3    | Create a VM from the template via API with start enabled      | VM exists in the cluster                                                        |
| 4    | Open the VM from the VirtualMachines tree                     | VM name is visible on the details page                                          |
| 5    | Open Configuration → Details and check workload               | Workload is High performance                                                    |
| 6    | Open Configuration → Scheduling and check dedicated resources | Text includes "Workload scheduled with dedicated resources (guaranteed policy)" |
| 7    | Observe the root disk row (`data-test` `disk-rootdisk`)       | Root disk row is visible                                                        |

---

### `008`: User template deleted from the UI is removed from the list and the cluster

- **Objective:** Verify that deleting a user template from the Templates list removes its row,
  shows an empty-filter message, and deletes the Template from the cluster.
- **Target version:** CNV 5.0.0
- **Pre-conditions:** Shared lifecycle namespace exists
- **Tags:** `@tier1`, `@tier1-templates`

| Step | Action                                                              | Expected Result                                                                       |
| :--- | :------------------------------------------------------------------ | :------------------------------------------------------------------------------------ |
| 1    | Switch to the shared lifecycle project (skipped on ACM)             | Project context is the shared namespace                                               |
| 2    | Create a user Template via API                                      | Template exists in the cluster                                                        |
| 3    | Filter the Templates list by name, open Actions, and confirm Delete | Template row detaches from the list                                                   |
| 4    | Re-navigate to Templates and filter by the same name                | Empty message is visible ("No templates found" or "You don't have any templates yet") |
| 5    | Query the Template in the cluster                                   | Template no longer exists                                                             |

---

## 5. Requirements Traceability Matrix

Maps Jira tickets to the test cases that provide coverage. Tickets without a specific test case indicate
a planned coverage gap (status: Pending).

| Jira Ticket | Test Case ID | Coverage Type           | Status    |
| ----------- | ------------ | ----------------------- | --------- |
| —           | `001`        | Functional smoke        | Automated |
| —           | `002`        | Functional smoke        | Automated |
| CNV-83098   | `003`        | Bugfix regression guard | Automated |
| —           | `004`        | Functional smoke        | Automated |
| CNV-87440   | `005`        | Feature coverage        | Automated |
| —           | `006`        | Functional smoke        | Automated |
| —           | `007`        | Functional smoke        | Automated |
| —           | `008`        | Functional smoke        | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Adam Viktora
- **Approval Signature:** Adam Viktora
