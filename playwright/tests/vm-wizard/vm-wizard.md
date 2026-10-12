# Software Test Description (STD): Vm Wizard

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/vm-wizard/`
- **Feature Area:** Tier1 / Tier2 — VM creation wizard
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-07
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Automated E2E coverage for console routes under `tests/vm-wizard/`.

### 2.2 Scope

- **In-Scope:**
  - All scenarios in specs under `tests/vm-wizard/`.
- **Out-of-Scope:**
  - Scenarios documented in other route STD files.

## 3. Test Environment & Prerequisites

### create-vm-wizard-clone-deleted-source

### create-vm-wizard-clone

### create-vm-wizard-custom-config

### create-vm-wizard-default-ssh-windows

### create-vm-wizard-virtio-boot-source

### create-vm-wizard-from-template

### create-vm-wizard-sysprep

### create-vm-wizard-template-additional-objects

### project-network-settings

### wizard-vm-detail-auto-labels

---

## 4. Test Case Definitions

### Module: `create-vm-wizard-clone-deleted-source.spec.ts`

**Spec file:** `tests/vm-wizard/create-vm-wizard-clone-deleted-source.spec.ts`
**Describe:** `VM Creation Wizard — Clone existing VirtualMachine` — **Tags:** @tier2
**Allure:** suite `VM Creation Wizard`, feature `Tier 2`

---

### `001`: Shows an error when the source VM is deleted before cloning completes

- **Objective:** Shows an error when the source VM is deleted before cloning completes
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2

| Step | Action                                                         | Expected Result                          |
| :--- | :------------------------------------------------------------- | :--------------------------------------- |
| 1    | Precondition: Create a running source VM via K8s API           | Step completes without assertion failure |
| 2    | Open Create VM wizard and select Clone existing VirtualMachine | Step completes without assertion failure |
| 3    | Select the source VM and advance to Review and create          | Step completes without assertion failure |
| 4    | In a second console tab, stop and delete the source VM         | Step completes without assertion failure |
| 5    | Submit clone and verify an error is shown                      | Step completes without assertion failure |

---

---

### Module: `create-vm-wizard-clone.spec.ts`

**Spec file:** `tests/vm-wizard/create-vm-wizard-clone.spec.ts`
**Describe:** `VM Creation Wizard — Clone existing VirtualMachine` — **Tags:** @tier2
**Allure:** suite `VM Creation Wizard`, feature `Tier 2`

---

### `001`: Clone wizard selects a source VM, creates a clone, and the clone reaches Running state

- **Objective:** Clone wizard selects a source VM, creates a clone, and the clone reaches Running state
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2

| Step | Action                                                            | Expected Result                          |
| :--- | :---------------------------------------------------------------- | :--------------------------------------- |
| 1    | Precondition: Create source VM via K8s API                        | Step completes without assertion failure |
| 2    | Step 1: Deployment details — select Clone existing VirtualMachine | Step completes without assertion failure |
| 3    | Step 2: Source — verify VM list and select source VM              | Step completes without assertion failure |
| 4    | Step 3: Review and create — verify clone summary and create       | Step completes without assertion failure |
| 5    | Verify clone VM exists and reaches Running state                  | Step completes without assertion failure |

---

---

### Module: `create-vm-wizard-custom-config.spec.ts`

**Spec file:** `tests/vm-wizard/create-vm-wizard-custom-config.spec.ts`
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

| Step | Action                                                                              | Expected Result                                                 |
| :--- | :---------------------------------------------------------------------------------- | :-------------------------------------------------------------- |
| 1    | Open the create VM wizard and select Custom configuration                           | Wizard opens; Custom configuration is selected by default       |
| 2    | Generate a VM name and continue through Guest OS                                    | OS tiles and OS type dropdown are visible; an OS is selected    |
| 3    | Select a RHEL boot volume (or no boot source if none are available)                 | Boot source step is visible; Next proceeds                      |
| 4    | Select General Purpose (U) series and medium size                                   | Instance type series cards are visible; medium size is selected |
| 5    | On Customization, open Labels and annotations, click Add annotations, then Add more | Save is disabled while the new row has an empty key             |
| 6    | Cancel the modal, continue to Review, and create the VM                             | Redirects to VM details; the VM resource exists                 |

---

---

### Module: `create-vm-wizard-default-ssh-windows.spec.ts`

**Spec file:** `tests/vm-wizard/create-vm-wizard-default-ssh-windows.spec.ts`
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

---

### Module: `create-vm-wizard-from-template.spec.ts`

**Spec file:** `tests/vm-wizard/create-vm-wizard-from-template.spec.ts`
**Describe:** `VM Creation Wizard — Create from Template happy path` — **Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier1`

---

### `001`: Create a RHEL9 VM from a template with validated hostname and protected system metadata

- **Objective:** Verify that the template wizard rejects empty and invalid hostnames without closing
  the modal or changing the generated value, accepts a valid hostname, prevents deletion of template
  system annotations and labels, and creates the resulting VM.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-95902, CNV-96404
- **Pre-conditions:** `rhel9-server-small` is available in the catalog, and the user can create
  namespaces and VirtualMachines.
- **Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`

| Step | Action                                                                                 | Expected Result                                                                                       |
| :--- | :------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| 1    | Create an isolated namespace and open the create VM wizard from the namespaced VM list | The creation wizard is visible                                                                        |
| 2    | Select From Template, generate a VM name, and continue                                 | From Template is selected and the wizard advances to the template catalog                             |
| 3    | Verify the template catalog and select `rhel9-server-small`                            | Catalog controls and template cards are visible; Next becomes enabled                                 |
| 4    | Continue to Customization and read the generated hostname                              | Customization tabs are visible and the generated hostname is non-empty                                |
| 5    | Open Edit hostname, clear the field, and submit with Enter                             | The required-field error appears; the modal remains open and the generated hostname remains unchanged |
| 6    | Enter `--` and submit with Enter                                                       | The RFC 1123 error appears; the modal remains open and the generated hostname remains unchanged       |
| 7    | Enter `hostname` and save                                                              | Save becomes enabled, the modal closes, and `hostname` is displayed in Customization                  |
| 8    | Open Labels and annotations and inspect `vm.kubevirt.io/validations`                   | The annotation is present and cannot be deleted from the table or edit modal                          |
| 9    | Inspect `vm.kubevirt.io/template` and open Edit labels                                 | The label is present and cannot be deleted from the table or edit modal                               |
| 10   | Continue to Review, create the VM, and verify it through the API                       | The console redirects to VM details and the VM exists in the isolated namespace                       |

---

---

### Module: `create-vm-wizard-sysprep.spec.ts`

**Spec file:** `tests/vm-wizard/create-vm-wizard-sysprep.spec.ts`
**Describe:** `VM Creation Wizard — Sysprep` — **Tags:** @tier1
**Allure:** suite `VM Creation Wizard — Sysprep`, feature `Tier 1`

---

### `001`: Windows wizard with no boot source supports sysprep create, detach, and attach

- **Objective:** Windows wizard with no boot source supports sysprep create, detach, and attach
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1

| Step | Action                                                   | Expected Result                          |
| :--- | :------------------------------------------------------- | :--------------------------------------- |
| 1    | Step 1: Deployment details — custom configuration        | Step completes without assertion failure |
| 2    | Step 2: Guest OS — select Windows                        | Step completes without assertion failure |
| 3    | Step 3: Boot source — no boot source                     | Step completes without assertion failure |
| 4    | Step 4: Compute resources — select instance type         | Step completes without assertion failure |
| 5    | Step 5: Customization — sysprep lifecycle on Initial run | Step completes without assertion failure |
| 6    | Step 6: Review and create the Windows VM                 | Step completes without assertion failure |
| 7    | Verify created VM references the sysprep ConfigMap       | Step completes without assertion failure |

---

---

### Module: `create-vm-wizard-template-additional-objects.spec.ts`

**Spec file:** `tests/vm-wizard/create-vm-wizard-template-additional-objects.spec.ts`
**Describe:** `VM Creation Wizard — Template additional objects` — **Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier1`, tag `@CNV-97155`

---

### `001`: Create a VM from a template and inherit namespace for additional Secret

- **Objective:** Verify that a namespaced Secret defined in a template without
  `metadata.namespace` is created in the VM's namespace when the VM is created through the
  from-template wizard.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-97155
- **Pre-conditions:** User has permission to create namespaces, Templates, VirtualMachines, and
  Secrets. The VM creation wizard and template catalog are available in the Virtualization
  perspective.
- **Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`, `@CNV-97155`

| Step | Action                                                                                                              | Expected Result                                                                                |
| :--- | :------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------- |
| 1    | Create an isolated namespace and a custom OpenShift Template via API (VM + Secret without namespace)                | Template exists in the namespace; Secret object in template has no `metadata.namespace`        |
| 2    | Switch to Virtualization, open the namespaced VM list, and launch the creation wizard                               | Wizard opens                                                                                   |
| 3    | Select From Template, set the project to the test namespace, generate a VM name, click Next                         | Wizard advances to the template catalog                                                        |
| 4    | Filter the catalog to the test project, select User templates scope, search by name, and select the custom template | Template catalog is visible; custom template card is selectable; Next is enabled               |
| 5    | Proceed through Customization with defaults and click Next                                                          | Customization step is visible; wizard advances to Review                                       |
| 6    | Review the configuration and click Create VirtualMachine                                                            | Browser redirects to the VM detail page                                                        |
| 7    | Verify the VM exists via API                                                                                        | VirtualMachine resource exists in the test namespace                                           |
| 8    | Verify the Secret exists via API in the test namespace                                                              | Secret resource exists; `metadata.namespace` equals the VM namespace (not empty or a wrong NS) |

---

---

### Module: `project-network-settings.spec.ts`

**Spec file:** `tests/vm-wizard/project-network-settings.spec.ts`
**Describe:** `Project network settings` — **Tags:** @tier1
**Allure:** suite `Project network settings`, feature `Tier 1`

---

### `001`: uses Pod networking when project has no network annotations

- **Objective:** uses Pod networking when project has no network annotations
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1

| Step | Action                                                    | Expected Result                          |
| :--- | :-------------------------------------------------------- | :--------------------------------------- |
| 1    | VM creation uses the project default NAD                  | Step completes without assertion failure |
| 2    | Add NIC modal still offers Pod networking                 | Step completes without assertion failure |
| 3    | VM creation falls back to the available project NAD       | Step completes without assertion failure |
| 4    | Add NIC modal hides Pod networking and auto-selects a NAD | Step completes without assertion failure |
| 5    | VM creation uses the project default NAD                  | Step completes without assertion failure |
| 6    | Add NIC modal hides Pod networking and auto-selects a NAD | Step completes without assertion failure |

---

### `002`: uses project default-network for default NIC while Pod networking stays allowed

- **Objective:** uses project default-network for default NIC while Pod networking stays allowed
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1

| Step | Action                                                    | Expected Result                          |
| :--- | :-------------------------------------------------------- | :--------------------------------------- |
| 1    | VM creation uses the project default NAD                  | Step completes without assertion failure |
| 2    | Add NIC modal still offers Pod networking                 | Step completes without assertion failure |
| 3    | VM creation falls back to the available project NAD       | Step completes without assertion failure |
| 4    | Add NIC modal hides Pod networking and auto-selects a NAD | Step completes without assertion failure |
| 5    | VM creation uses the project default NAD                  | Step completes without assertion failure |
| 6    | Add NIC modal hides Pod networking and auto-selects a NAD | Step completes without assertion failure |

---

### `003`: hides Pod networking and selects available NAD when pod network is disallowed

- **Objective:** hides Pod networking and selects available NAD when pod network is disallowed
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1

| Step | Action                                                    | Expected Result                          |
| :--- | :-------------------------------------------------------- | :--------------------------------------- |
| 1    | VM creation falls back to the available project NAD       | Step completes without assertion failure |
| 2    | Add NIC modal hides Pod networking and auto-selects a NAD | Step completes without assertion failure |
| 3    | VM creation uses the project default NAD                  | Step completes without assertion failure |
| 4    | Add NIC modal hides Pod networking and auto-selects a NAD | Step completes without assertion failure |

---

### `004`: honors default-network and hides Pod networking when disallowed

- **Objective:** honors default-network and hides Pod networking when disallowed
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1

| Step | Action                                                    | Expected Result                          |
| :--- | :-------------------------------------------------------- | :--------------------------------------- |
| 1    | VM creation uses the project default NAD                  | Step completes without assertion failure |
| 2    | Add NIC modal hides Pod networking and auto-selects a NAD | Step completes without assertion failure |

---

---

### Module: `wizard-vm-detail-auto-labels.spec.ts`

**Spec file:** `tests/vm-wizard/wizard-vm-detail-auto-labels.spec.ts`
**Describe:** `Auto-applied labels — wizard & VM detail` — **Tags:** @tier2
**Allure:** suite `Auto-Applied Labels — Wizard & VM Detail`, feature `Tier 2`

---

### `001`: Wizard drawer and label protection

- **Objective:** Wizard drawer and label protection
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2

| Step | Action                                                           | Expected Result                          |
| :--- | :--------------------------------------------------------------- | :--------------------------------------- |
| 1    | Next button is disabled when required labels have no value       | Step completes without assertion failure |
| 2    | Required labels drawer opens automatically                       | Step completes without assertion failure |
| 3    | Fill required label and close drawer                             | Step completes without assertion failure |
| 4    | Next button still disabled with unfilled required label          | Step completes without assertion failure |
| 5    | Navigate to Labels and annotations tab                           | Step completes without assertion failure |
| 6    | Auto-applied keys cannot be deleted                              | Step completes without assertion failure |
| 7    | Admin-set values cannot be edited                                | Step completes without assertion failure |
| 8    | Admin-empty values can be edited                                 | Step completes without assertion failure |
| 9    | New label key stays editable when it matches an auto-applied key | Step completes without assertion failure |
| 10   | Auto-applied labels show correct values                          | Step completes without assertion failure |
| 11   | Auto-applied keys cannot be deleted                              | Step completes without assertion failure |
| 12   | Admin-empty value labels are editable                            | Step completes without assertion failure |
| 13   | User-added labels remain deletable                               | Step completes without assertion failure |
| 14   | New label key stays editable when it matches an auto-applied key | Step completes without assertion failure |

---

### `002`: VM creation applies correct labels

- **Objective:** VM creation applies correct labels
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2

| Step | Action                                                           | Expected Result                          |
| :--- | :--------------------------------------------------------------- | :--------------------------------------- |
| 1    | Auto-applied labels show correct values                          | Step completes without assertion failure |
| 2    | Auto-applied keys cannot be deleted                              | Step completes without assertion failure |
| 3    | Admin-empty value labels are editable                            | Step completes without assertion failure |
| 4    | User-added labels remain deletable                               | Step completes without assertion failure |
| 5    | New label key stays editable when it matches an auto-applied key | Step completes without assertion failure |

---

### `003`: VM detail metadata tab enforces label restrictions

- **Objective:** VM detail metadata tab enforces label restrictions
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2

| Step | Action                                                           | Expected Result                          |
| :--- | :--------------------------------------------------------------- | :--------------------------------------- |
| 1    | Auto-applied labels show correct values                          | Step completes without assertion failure |
| 2    | Auto-applied keys cannot be deleted                              | Step completes without assertion failure |
| 3    | Admin-empty value labels are editable                            | Step completes without assertion failure |
| 4    | User-added labels remain deletable                               | Step completes without assertion failure |
| 5    | New label key stays editable when it matches an auto-applied key | Step completes without assertion failure |

---

### Module: `create-vm-wizard-virtio-boot-source.spec.ts`

**Spec file:** `tests/vm-wizard/create-vm-wizard-virtio-boot-source.spec.ts`
**Describe:** `VM Creation Wizard — VirtIO recommendation and boot source features` — **Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`
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
