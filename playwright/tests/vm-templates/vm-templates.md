# Software Test Description (STD): Vm Templates

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/vm-templates/`
- **Feature Area:** Tier1 — VM templates
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-07
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Automated E2E coverage for console routes under `tests/vm-templates/`.

### 2.2 Scope

- **In-Scope:**
  - All scenarios in specs under `tests/vm-templates/`.
- **Out-of-Scope:**
  - Scenarios documented in other route STD files.

## 3. Test Environment & Prerequisites

### template-creation-flows

### template-detail-tabs

### templates

---

## 4. Test Case Definitions

### Module: `template-creation-flows.spec.ts`

**Spec file:** `tests/vm-templates/template-creation-flows.spec.ts`
**Describe:** `Template creation flows` — **Tags:** @tier1-templates
**Allure:** suite `Template creation flows`, feature `Tier 1`

---

### `001`: Save existing VM as a template from the VM detail page

- **Objective:** Save existing VM as a template from the VM detail page
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-templates

| Step | Action                                                                      | Expected Result                   |
| :--- | :-------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Save existing VM as a template from the VM detail page | All expectations in the spec pass |

---

### `002`: Clone a template via the kebab menu

- **Objective:** Clone a template via the kebab menu
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-templates

| Step | Action                                                   | Expected Result                   |
| :--- | :------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Clone a template via the kebab menu | All expectations in the spec pass |

---

### `003`: Create a template using the YAML editor

- **Objective:** Create a template using the YAML editor
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-templates

| Step | Action                                                       | Expected Result                   |
| :--- | :----------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Create a template using the YAML editor | All expectations in the spec pass |

---

### `004`: Delete a template via the UI

- **Objective:** Delete a template via the UI
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-templates

| Step | Action                                            | Expected Result                   |
| :--- | :------------------------------------------------ | :-------------------------------- |
| 1    | Run Playwright test: Delete a template via the UI | All expectations in the spec pass |

---

---

### Module: `template-detail-tabs.spec.ts`

**Spec file:** `tests/vm-templates/template-detail-tabs.spec.ts`
**Describe:** `Template detail tabs` — **Tags:** @tier1-templates
**Allure:** suite `Template detail tabs`, feature `Tier 1`

---

### `001`: Template creation and project filtering

- **Objective:** Template creation and project filtering
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-templates

| Step | Action                                                       | Expected Result                   |
| :--- | :----------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Template creation and project filtering | All expectations in the spec pass |

---

### `002`: Custom template detail page shows all tabs with expected content

- **Objective:** Custom template detail page shows all tabs with expected content
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-templates

| Step | Action                                                                                | Expected Result                   |
| :--- | :------------------------------------------------------------------------------------ | :-------------------------------- |
| 1    | Run Playwright test: Custom template detail page shows all tabs with expected content | All expectations in the spec pass |

---

---

### Module: `templates.spec.ts`

**Spec file:** `tests/vm-templates/templates.spec.ts`
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
  shows `4 CPU / 8 GiB Memory`.
- **Target version:** CNV 5.0.0
- **Pre-conditions:** Shared templates namespace exists
- **Tags:** `@tier1`, `@tier1-templates`

| Step | Action                                             | Expected Result                         |
| :--- | :------------------------------------------------- | :-------------------------------------- |
| 1    | Switch to the shared test project (skipped on ACM) | Project context is the shared namespace |
| 2    | Create a user Template via API                     | Template exists in the cluster          |
| 3    | Open the template from the filtered Templates list | Template details page loads             |
| 4    | Edit CPU and memory to `4` and `8` GiB and save    | Values are submitted                    |
| 5    | Observe CPU and memory on the details page         | `4 CPU / 8 GiB Memory` is visible       |

---

### `005`: VirtualMachineTemplate CPU and memory can be edited on the details page

- **Objective:** Verify that saving CPU `4` and memory `8` GiB on a native VirtualMachineTemplate
  details page shows `4 CPU / 8 GiB Memory`.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-87440
- **Pre-conditions:** KubeVirt `Template` feature gate is enabled (`isNativeVmTemplatesEnabled`).
  If it is not, the test is skipped with reason "Native VM templates not enabled".
- **Tags:** `@tier1`, `@tier1-templates`

| Step | Action                                             | Expected Result                         |
| :--- | :------------------------------------------------- | :-------------------------------------- |
| 1    | Switch to the shared test project (skipped on ACM) | Project context is the shared namespace |
| 2    | Create a VirtualMachineTemplate via API            | Native template resource is created     |
| 3    | Open the template from the filtered Templates list | Template details page loads             |
| 4    | Edit CPU and memory to `4` and `8` GiB and save    | Values are submitted                    |
| 5    | Observe CPU and memory on the details page         | `4 CPU / 8 GiB Memory` is visible       |

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
