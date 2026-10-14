# Software Test Description (STD): Vm Wizard

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/vm-wizard/`
- **Feature Area:** Tier1 / Tier2 — VM creation wizard
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-13
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

### create-vm-wizard-new-vm

### create-vm-wizard-sysprep

### create-vm-wizard-template-additional-objects

### project-network-settings

### wizard-vm-detail-auto-labels

### create-vm-wizard-creation-method-switching

### create-vm-wizard-custom-config-customization-editing

### create-vm-wizard-custom-config-step-variations

### create-vm-wizard-draft-reset

### create-vm-wizard-from-template-customization-editing

### create-vm-wizard-required-field-validation

### create-vm-wizard-step-navigation-persistence

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

### `001`: Clone wizard submits the expected source, target, and description

- **Objective:** Verify that the Clone flow submits a `VirtualMachineClone` request containing the
  source VM and the target name and description entered on Review. VM startup is outside this
  wizard test's scope.
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** The test creates a halted source VM from the RHEL9 template.
- **Tags:** @tier2

| Step | Action                                                         | Expected Result                                                                                    |
| :--- | :------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| 1    | Create a halted source VM via the API                          | The source exists without waiting for storage import, scheduling, or guest startup                 |
| 2    | Select Clone existing VirtualMachine                           | Clone is selected and the wizard advances to Source                                                |
| 3    | Search for and select the source VM                            | Next becomes enabled and the wizard advances to Review                                             |
| 4    | Enter a deterministic target name and description, then submit | The review fields contain the entered values and Clone VirtualMachine submits successfully         |
| 5    | Fetch the resulting `VirtualMachineClone` request              | Its namespace, source, target, and description patch match the values submitted through the wizard |

---

---

### Module: `create-vm-wizard-custom-config.spec.ts`

**Spec file:** `tests/vm-wizard/create-vm-wizard-custom-config.spec.ts`
**Describe:** `VM Creation Wizard — Custom configuration happy path` — **Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier 1`

---

### `001`: Custom configuration wizard creates a VM through all steps

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

### `001`: Windows guest is created without accessCredentials when a default SSH key is set

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

### `001`: From Template wizard validates customization and creates a VM

- **Objective:** Verify that the template wizard rejects empty and invalid hostnames without closing
  the modal or changing the generated value, accepts a valid hostname, prevents deletion of template
  system annotations and labels, and creates the resulting VM.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-95902, CNV-96404
- **Pre-conditions:** `rhel9-server-small` is available in the catalog, and the user can create
  namespaces and VirtualMachines.
- **Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`

| Step | Action                                                                                 | Expected Result                                                                                         |
| :--- | :------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| 1    | Create an isolated namespace and open the create VM wizard from the namespaced VM list | The creation wizard is visible                                                                          |
| 2    | Select From Template, generate a VM name, and continue                                 | From Template is selected and the wizard advances to the template catalog                               |
| 3    | Verify the template catalog and select `rhel9-server-small`                            | Catalog controls and template cards are visible; Next becomes enabled                                   |
| 4    | Continue to Customization and read the generated hostname                              | Customization tabs are visible and the generated hostname is non-empty                                  |
| 5    | Open Edit hostname, clear the field, and submit with Enter                             | "Please provide hostname." appears; the modal remains open and the generated hostname remains unchanged |
| 6    | Enter `--` and submit with Enter                                                       | The RFC 1123 error appears; the modal remains open and the generated hostname remains unchanged         |
| 7    | Enter `hostname` and save                                                              | Save becomes enabled, the modal closes, and `hostname` is displayed in Customization                    |
| 8    | Open Labels and annotations and inspect `vm.kubevirt.io/validations`                   | The annotation is present and cannot be deleted from the table or edit modal                            |
| 9    | Inspect `vm.kubevirt.io/template` and open Edit labels                                 | The label is present and cannot be deleted from the table or edit modal                                 |
| 10   | Continue to Review, create the VM, and verify it through the API                       | The console redirects to VM details and the VM exists in the isolated namespace                         |

---

---

### Module: `create-vm-wizard-new-vm.spec.ts`

**Spec file:** `tests/vm-wizard/create-vm-wizard-new-vm.spec.ts`
**Describe:** `Create VM via wizard — new VM` — **Tags:** `@gating`, `@resource-creation`
**Allure:** suite `Resource creation (gating)`, feature `Gating`, tag `e2e-create`

---

### `001`: Create a VM via the creation wizard

- **Objective:** Verify that the custom-configuration wizard can be completed with an explicit OS,
  boot volume, instance type, and size, and that submitting Review opens the created VM's detail
  page. Guest startup is outside this test's scope.
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** At least one boot volume is available, and the user can create a
  VirtualMachine in the test namespace.
- **Tags:** `@gating`, `@resource-creation`

| Step | Action                                                                            | Expected Result                                                              |
| :--- | :-------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| 1    | Open VirtualMachines and launch the creation wizard                               | The wizard opens                                                             |
| 2    | Select Custom configuration, ensure a generated VM name, and continue             | The wizard advances to Guest OS                                              |
| 3    | Select Other Linux with Fedora and continue                                       | The wizard advances to Boot source                                           |
| 4    | Select the first available boot volume                                            | The wizard accepts the boot source and advances to Compute resources         |
| 5    | Select General Purpose series and small size, then continue through Customization | Review and create is visible                                                 |
| 6    | Disable Start after creation if selected and submit                               | The console redirects to the detail page for the newly created VM            |
| 7    | Read the VM name from the URL and track the resource                              | The VM name is visible on its detail page and is registered for test cleanup |

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

### `001`: creates namespaced additional object in the VM namespace when template omits namespace

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

### `001`: VirtIO recommendation alert appears for Windows template and switching works

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

### `002`: VirtIO recommendation alert does NOT appear for RHEL template

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

### `003`: Change boot source from template drawer

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

### `004`: Change boot source modal cancel preserves original

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

### `005`: Disk interface is VirtIO after switch and VM creation from Windows template

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

### Module: `create-vm-wizard-creation-method-switching.spec.ts`

**Spec file:** `tests/vm-wizard/create-vm-wizard-creation-method-switching.spec.ts`
**Describe:** `VM Creation Wizard — Creation method switching updates the step list` — **Tags:**
`@tier1`, `@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier 1`

---

### `001`: Switching between Custom configuration, Template, and Clone updates the wizard step navigation

- **Objective:** Verify that each creation method exposes its distinguishing wizard steps and that
  switching back restores the Custom configuration steps. The test intentionally does not assert
  an exact step count so unrelated future steps do not break it.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                                                   | Expected Result                                                              |
| :--- | :------------------------------------------------------- | :--------------------------------------------------------------------------- |
| 1    | Open the wizard; verify Custom configuration is selected | Guest OS, Boot source, and Compute resources are present                     |
| 2    | Select Create from Template                              | Template is present; Guest OS, Boot source, and Compute resources are absent |
| 3    | Select Clone existing VirtualMachine                     | Clone/Source is present; Template and Guest OS are absent                    |
| 4    | Select Custom configuration again                        | Guest OS, Boot source, and Compute resources are restored                    |

---

### Module: `create-vm-wizard-custom-config-customization-editing.spec.ts`

**Spec file:** `tests/vm-wizard/create-vm-wizard-custom-config-customization-editing.spec.ts`
**Describe:** `VM Creation Wizard — Custom configuration: Customization editing and persistence` —
**Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier 1`

---

### `001`: Description edit persists across Back/Next navigation

- **Objective:** Verify that a Description edit on Customization survives a
  Back-to-Compute-resources and Next round trip. Boot order persistence is covered by the template
  customization scenario. Review and VM provisioning are intentionally outside this persistence
  test's scope.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                                                                | Expected Result                                                             |
| :--- | :-------------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| 1    | Open the wizard; generate a VM name; advance through Guest OS         | The wizard reaches Boot source with a guest OS selected                     |
| 2    | Select no boot source, General Purpose series, and medium size        | The wizard reaches Customization without requiring cluster boot-volume data |
| 3    | Set Description to "persisted description" and save                   | The new Description renders immediately                                     |
| 4    | Click Back to Compute resources, then Next to return to Customization | The edited Description is unchanged after the navigation round trip         |

---

### Module: `create-vm-wizard-custom-config-step-variations.spec.ts`

**Spec file:** `tests/vm-wizard/create-vm-wizard-custom-config-step-variations.spec.ts`
**Describe:** `VM Creation Wizard — Custom configuration step variations` — **Tags:** `@tier1`,
`@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier 1`

---

### `001`: Windows guest OS with no boot source reaches Review

- **Objective:** Verify that selecting the Windows OS tile and "No boot source" does not block
  progression through Compute resources and Customization. VM submission is covered separately.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                                                                    | Expected Result                                     |
| :--- | :------------------------------------------------------------------------ | :-------------------------------------------------- |
| 1    | Generate a VM name; click Next                                            | Wizard advances to Guest OS                         |
| 2    | Select the Windows OS tile; wait for the OS type list to load; click Next | Next enables once the OS type list finishes loading |
| 3    | Select "No boot source" and choose a compatible instance type and size    | Compute resources accepts the explicit selection    |
| 4    | Continue through Customization                                            | Review is reached without provisioning a VM         |

---

### `002`: A non-default instance type and size are reflected in the submitted VM

- **Objective:** Verify that selecting the stable `m1.large` instance type through the Memory
  Intensive series is reflected exactly in the `VirtualMachine` submitted by the wizard.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                                                                   | Expected Result                            |
| :--- | :----------------------------------------------------------------------- | :----------------------------------------- |
| 1    | Generate a VM name; advance through Guest OS and select "No boot source" | Compute resources is reached               |
| 2    | Select Memory Intensive and size `large`                                 | The wizard accepts the explicit selection  |
| 3    | Continue through Customization and submit                                | A `VirtualMachine` resource is created     |
| 4    | Fetch the submitted VM via the API                                       | `spec.instancetype.name` equals `m1.large` |

---

### Module: `create-vm-wizard-draft-reset.spec.ts`

**Spec file:** `tests/vm-wizard/create-vm-wizard-draft-reset.spec.ts`
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
  shows Custom configuration selected and Next disabled until a new name is generated. The test
  uses the shorter template flow and does not repeat unrelated Guest OS, boot-source, compute, or
  Description coverage.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                                                                      | Expected Result                                                                 |
| :--- | :-------------------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| 1    | Select Create from Template, choose `rhel9-server-small`, and create the VM | Submission succeeds and the console redirects to VM details                     |
| 2    | Navigate back to the namespaced VM list and reopen the wizard               | Custom configuration is selected again; Next is disabled because Name was reset |

---

### Module: `create-vm-wizard-from-template-customization-editing.spec.ts`

**Spec file:** `tests/vm-wizard/create-vm-wizard-from-template-customization-editing.spec.ts`
**Describe:** `VM Creation Wizard — Create from Template: Customization editing and persistence` —
**Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier 1`

---

### `001`: Description and boot order edits persist across Back/Next navigation

- **Objective:** Verify that one Description edit and one Boot order edit survive a
  Back-to-Template-step and Next round trip together with the selected template. Review and VM
  provisioning are intentionally outside this persistence test's scope.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** The `rhel9-server-small` template is available in the catalog.
- **Tags:** `@adminOnly`

| Step | Action                                                                             | Expected Result                                                                    |
| :--- | :--------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| 1    | Select Create from Template, generate a name, and choose `rhel9-server-small`      | The wizard reaches Customization with the selected template                        |
| 2    | Set Description to "persisted description" and save                                | The new Description renders immediately                                            |
| 3    | Move the first boot device down once and save                                      | The displayed boot order reflects the single edit                                  |
| 4    | Click Back to Template, verify the selection, then Next to return to Customization | The selected template, edited Description, and edited boot order are all preserved |

---

### Module: `create-vm-wizard-required-field-validation.spec.ts`

**Spec file:** `tests/vm-wizard/create-vm-wizard-required-field-validation.spec.ts`
**Describe:** `VM Creation Wizard — Required field validation` — **Tags:** `@tier1`,
`@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier 1`

---

### `001`: Custom configuration — Next is disabled until a Name is provided

- **Objective:** Verify that Next is disabled on Deployment details for Custom configuration until
  a VM name is generated.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                                                              | Expected Result                  |
| :--- | :------------------------------------------------------------------ | :------------------------------- |
| 1    | Open the wizard; verify Custom configuration is selected by default | Custom configuration is selected |
| 2    | Observe the Next button before providing a Name                     | Next is disabled                 |
| 3    | Generate a VM name                                                  | Next becomes enabled             |

---

### `002`: Create from Template — Name is required, then a Template selection is required

- **Objective:** Verify that Next is disabled on Deployment details until a Name is generated, and
  then disabled again on the Template catalog step until a template is selected.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** At least one template is available in the catalog.
- **Tags:** `@adminOnly`

| Step | Action                                              | Expected Result                                           |
| :--- | :-------------------------------------------------- | :-------------------------------------------------------- |
| 1    | Select Create from Template                         | Create from Template is selected                          |
| 2    | Observe the Next button before providing a Name     | Next is disabled                                          |
| 3    | Generate a VM name, then click Next                 | Next becomes enabled; wizard advances to Template catalog |
| 4    | Observe the Next button before selecting a template | Next is disabled                                          |
| 5    | Select the RHEL 9 template                          | Next becomes enabled                                      |

---

### `003`: Clone existing VirtualMachine — Name is not required, but a source VM selection is

- **Objective:** Verify that Next is already enabled on Deployment details for Clone (Name is not
  required for this method), and then disabled on the Source step until a source VM is selected.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** The test creates a source VirtualMachine from the RHEL9 template.
- **Tags:** `@adminOnly`

| Step | Action                                               | Expected Result                                                   |
| :--- | :--------------------------------------------------- | :---------------------------------------------------------------- |
| 1    | Create and track a source VM in the test namespace   | A source VM is available independently of external cluster state  |
| 2    | Select Clone existing VirtualMachine                 | Clone is selected; Next is already enabled — Name is not required |
| 3    | Click Next; verify the Source step is visible        | Source step is visible                                            |
| 4    | Observe the Next button before selecting a source VM | Next is disabled                                                  |
| 5    | Search for and select the created source VM          | Next becomes enabled                                              |

---

### Module: `create-vm-wizard-step-navigation-persistence.spec.ts`

**Spec file:** `tests/vm-wizard/create-vm-wizard-step-navigation-persistence.spec.ts`
**Describe:** `VM Creation Wizard — Step navigation sidebar preserves entered data` — **Tags:**
`@tier1`, `@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier 1`

---

### `001`: Custom configuration — a Description edit survives direct step navigation

- **Objective:** Verify that using the step navigation sidebar to jump from Customization back to
  Guest OS, and then forward again to Customization, preserves a saved Description edit without
  using the Back/Next footer buttons.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                                                                                                           | Expected Result                                                          |
| :--- | :--------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| 1    | Advance through Guest OS and Boot source; explicitly choose compute values when no boot source supplied defaults | Wizard reaches Customization without attempting to click a disabled Next |
| 2    | Edit the Description to "test" and save                                                                          | Description renders "test"                                               |
| 3    | Jump directly to Guest OS with the step navigation sidebar                                                       | Guest OS becomes active                                                  |
| 4    | Jump directly to Customization                                                                                   | Customization becomes active and Description still shows "test"          |

---

### `002`: Create from Template — direct step navigation preserves the template selection

- **Objective:** Verify that jumping back to Template via the sidebar and forward to Customization
  preserves the selected template.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96281
- **Pre-conditions:** The `rhel9-server-small` template is available in the catalog.
- **Tags:** `@adminOnly`

| Step | Action                                                                        | Expected Result                                                         |
| :--- | :---------------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| 1    | Select Create from Template, generate a name, and choose `rhel9-server-small` | Wizard advances to Customization with the RHEL9 template selected       |
| 2    | Jump directly to Template with the step navigation sidebar                    | Template is active; the same template remains selected; Next is enabled |
| 3    | Jump directly to Customization                                                | Customization becomes active                                            |

---
