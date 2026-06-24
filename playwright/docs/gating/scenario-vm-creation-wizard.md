# Software Test Description (STD): Gating — VM Creation Wizard

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Gating — VM Creation Wizard (unified wizard)
- **Feature ID:** [CNV-82506](https://issues.redhat.com/browse/CNV-82506), [CNV-67254](https://issues.redhat.com/browse/CNV-67254), [CNV-61108](https://issues.redhat.com/browse/CNV-61108), [CNV-84974](https://issues.redhat.com/browse/CNV-84974), [CNV-84499](https://issues.redhat.com/browse/CNV-84499), [CNV-84242](https://issues.redhat.com/browse/CNV-84242), [CNV-83731](https://issues.redhat.com/browse/CNV-83731), [CNV-83743](https://issues.redhat.com/browse/CNV-83743), [CNV-83756](https://issues.redhat.com/browse/CNV-83756), [CNV-85822](https://issues.redhat.com/browse/CNV-85822), [CNV-85812](https://issues.redhat.com/browse/CNV-85812), [CNV-85419](https://issues.redhat.com/browse/CNV-85419)
- **Date:** 2026-03-23
- **Document Status:** Active

## 2. Introduction

### 2.1 Purpose

Validates the unified VM creation wizard UI by navigating through **all wizard steps** without creating any VMs. Ensures every step is accessible, renders the expected UI elements, back-navigation works across all steps, and cancel navigates away cleanly.

### 2.2 Scope

- **In-Scope:** Spec `tests/gating/scenario-vm-creation-wizard.spec.ts` — full wizard step lifecycle (Deployment Details → Guest OS → Boot Source → Compute Resources → Customization → Review and Create), back-navigation, cancel. Spec `tests/gating/scenario-wizard-location.spec.ts` — wizard location panel, back button state, close button absence.
- **Out-of-Scope:** Actual VM creation through the wizard (covered in Tier1 with E2E verification); template-based wizard flows; clone flows (covered in Tier1).

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with OpenShift Virtualization (CNV-82506 unified wizard flow).
- **Bootable volumes:** At least one bootable volume must be available (used by the Boot Source step).
- **Navigation:** VMs → Create button (left side of split button) → `/vm-wizard` page.

---

## 4. Test Case Definitions

### `001`: New VM wizard full step navigation and UI validation

- **Objective:** Verify the wizard opens, all 6 navigable steps render correctly with their expected UI elements, back-navigation returns to Step 1 from the final step, and cancel closes the wizard without creating resources.
- **Pre-conditions:** Tag `@nonpriv` (runs for non-privileged users too).

| Step | Action                                                     | Expected Result                                                                                                                                                                                                                                 |
| :--- | :--------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Navigate to VM list and click Create button                | Wizard page visible at `/vm-wizard`                                                                                                                                                                                                             |
| 1a   | ID(CNV-83743) Verify wizard header has no close (X) button | `.pf-v6-c-wizard__close` is absent — wizard can only be closed via Cancel button                                                                                                                                                                |
| 2    | Verify Deployment Details step                             | Creation method tiles visible (New VM, From Template, Clone); step `vm-creation-deployment-details-step` active; Location section visible with Edit button                                                                                      |
| 3    | Select "New VirtualMachine"                                | ID(CNV-83756) Selected card has PF `.pf-m-selected` highlight; then click Next → Guest OS step                                                                                                                                                  |
| 4    | Verify Guest OS step                                       | Step `vm-creation-guest-os-step` active; OS tiles visible (RHEL, Windows, Other Linux); OS type dropdown visible                                                                                                                                |
| 5    | Select RHEL + rhel.9, click Next                           | Navigates to Boot Source step                                                                                                                                                                                                                   |
| 6    | Verify Boot Source step                                    | Step `vm-creation-boot-source-step` active; "Boot source" heading visible; table columns (Volume name, Architecture, OS, Storage class, Size, Description); "Add volume" button; "No boot source" option; volume count > 0                      |
| 7    | Click Next                                                 | Navigates to Compute Resources step                                                                                                                                                                                                             |
| 8    | Verify Compute Resources step                              | Step `vm-creation-compute-resources-step` active; heading visible; tabs (Red Hat / User provided); all 7 instance type series; U series default; size dropdown with CPUs/Memory                                                                 |
| 9    | Click Next                                                 | Navigates to Customization step                                                                                                                                                                                                                 |
| 10   | Verify Customization step                                  | "Customization" heading visible; all 7 tabs; "Find settings" search input; Details tab fields (Description, Hostname, Headless mode, Guest system log access, Deletion protection [CNV-61108]); Hardware devices and Boot management sections   |
| 11   | Click Next                                                 | Navigates to Review and Create step                                                                                                                                                                                                             |
| 12   | Verify Review and Create step                              | "Review and create" heading visible; expandable sections (Details, Storage, Network, Hardware devices); "Start after creation" checkbox; VM name editable; Name label shows required indicator [CNV-84974]; button text "Create VirtualMachine" |
| 13   | Navigate back 5 times                                      | Deployment Details step active again                                                                                                                                                                                                            |
| 14   | Cancel wizard                                              | Wizard closes; navigates back to VM list; no resources created                                                                                                                                                                                  |

**Architecture:**

```
Test (scenario-vm-creation-wizard.spec.ts)
  → VmCreationWizardPage (wizard navigation + UI validation)
    → VmCreationWizardPage (locators + page interactions)
  → VirtualMachinesPage / VmTreePage (navigate to VM list)
```

---

### `002`: Tree view right-click "Create VirtualMachine" opens new wizard

- **Objective:** Regression test for CNV-84243 (tree view right-click "Create VirtualMachine" opened the old catalog page instead of the new wizard). The fix updates the action to call `setProject(namespace)` + `navigate(getVMWizardURL())` so it routes to `/vm-wizard`. Verifies the wizard opens from the tree view context menu without creating any VMs.
- **Pre-conditions:** Tag `@nonpriv`; a stopped VM is created via API in a dedicated namespace so the project appears in the tree view with the "Create VirtualMachine" context menu action.

| Step | Action                                                                                    | Expected Result                                                                  |
| :--- | :---------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| 1    | Create namespace + stopped VM via API                                                     | VM exists in namespace (needed for context menu to show "Create VirtualMachine") |
| 2    | Navigate to VM list and search for namespace in tree view                                 | Tree view shows the namespace node                                               |
| 3    | Right-click namespace node and click "Create VirtualMachine" (`data-test-id="create-vm"`) | New wizard page opens (not old catalog)                                          |
| 4    | Cancel wizard                                                                             | Wizard closes cleanly                                                            |

---

### `003`: Wizard namespace syncs with tree view selection — no header project selector

- **Objective:** Validate the fix for CNV-84499 (namespace dropdown at the top of the wizard did not sync with the Location value). The fix removes the header project selector entirely — the wizard now inherits the active namespace from the OpenShift console context (set via tree view selection). Verifies: (1) no top-bar namespace dropdown on the wizard page, (2) Location section reflects the tree-selected namespace.
- **Pre-conditions:** Tag `@nonpriv`.

| Step | Action                                                                               | Expected Result                                               |
| :--- | :----------------------------------------------------------------------------------- | :------------------------------------------------------------ |
| 1    | Navigate to VM list, enable empty projects in tree, search and select test namespace | Tree view highlights the test namespace node                  |
| 2    | Open wizard via Create button                                                        | Wizard page opens at `/vm-wizard`                             |
| 3    | Verify no `[data-test-id="namespace-bar-dropdown"]` on wizard page                   | Header project selector is absent (removed by CNV-84499 fix)  |
| 4    | Read Location section project value                                                  | Shows the test namespace (inherited from tree view selection) |
| 5    | Cancel wizard                                                                        | Wizard closes cleanly                                         |

---

### `005`: Template selection enables wizard navigation buttons

- **Objective:** Regression test for CNV-83731 (selecting a template in the wizard did not show Next/Create buttons). The fix converts template tiles to PF selectable cards and the details panel to a PF drawer so wizard navigation buttons remain visible. Verifies: (1) template catalog renders cards, (2) selecting a template enables the Next button, (3) template drawer is visible alongside buttons, (4) wizard can proceed past the template step.
- **Pre-conditions:** Tag `@nonpriv`.

| Step | Action                                   | Expected Result                                  |
| :--- | :--------------------------------------- | :----------------------------------------------- |
| 1    | Navigate to VM list and open wizard      | Wizard page visible                              |
| 2    | Select "From Template" and click Next    | Template catalog step visible with cards         |
| 3    | Verify templates are available           | Card count > 0                                   |
| 4    | Click `rhel9-server-small` template card | Next button is **enabled** (not disabled)        |
| 5    | Verify template details drawer           | PF drawer panel visible alongside wizard buttons |
| 6    | Cancel wizard                            | Wizard closes cleanly                            |

---

### `004`: New VM flow — Next disabled without required step data

- **Objective:** Verify the fix for CNV-84242 (wizard allowed proceeding without defining required data) in the New VirtualMachine flow. The fix adds `isNextDisabled` to each step footer: Guest OS requires OS type + preference; Boot Source requires a volume selected (when "use boot source" is true); Compute Resources requires series + size. Validates that Next is disabled before required selections and enabled after.
- **Pre-conditions:** Tag `@nonpriv`.

| Step | Action                                                             | Expected Result                     |
| :--- | :----------------------------------------------------------------- | :---------------------------------- |
| 1    | Navigate to VM list and open wizard                                | Wizard page visible                 |
| 2    | Select "New VirtualMachine" and navigate to Guest OS step          | Guest OS step active                |
| 3    | Check Next button state (no OS selected)                           | Next button is **disabled**         |
| 4    | Select RHEL + rhel.9 and click Next                                | Navigates to Boot Source step       |
| 5    | Check Next button state (boot source required, no volume selected) | Next button is **disabled**         |
| 6    | Select "No boot source" and click Next                             | Navigates to Compute Resources step |
| 7    | Check Next button state (no series/size selected)                  | Next button is **disabled**         |
| 8    | Select General Purpose (u) series + small size                     | Next button becomes **enabled**     |
| 9    | Cancel wizard                                                      | Wizard closes cleanly               |

---

### `006`: From Template flow — Next disabled without template selection

- **Objective:** Verify the fix for CNV-84242 in the From Template flow. The fix adds `isNextDisabled: isEmpty(selectedTemplate)` to the template step footer. Validates that Next is disabled on the template catalog until a template is selected.
- **Pre-conditions:** Tag `@nonpriv`.

| Step | Action                                         | Expected Result                 |
| :--- | :--------------------------------------------- | :------------------------------ |
| 1    | Navigate to VM list and open wizard            | Wizard page visible             |
| 2    | Select "From Template" and click Next          | Template catalog step visible   |
| 3    | Check Next button state (no template selected) | Next button is **disabled**     |
| 4    | Select `rhel9-server-small` template           | Next button becomes **enabled** |
| 5    | Cancel wizard                                  | Wizard closes cleanly           |

---

### `007`: Clone flow — Next disabled without source VM selection

- **Objective:** Verify the fix for CNV-84242 in the Clone flow. The fix adds `isNextDisabled: isEmpty(vmSignal.value)` to the clone source step footer. Validates that Next is disabled on the Source step when no VM is selected for cloning.
- **Pre-conditions:** Tag `@nonpriv`.

| Step | Action                                                | Expected Result             |
| :--- | :---------------------------------------------------- | :-------------------------- |
| 1    | Navigate to VM list and open wizard                   | Wizard page visible         |
| 2    | Select "Clone existing VirtualMachine" and click Next | Clone Source step visible   |
| 3    | Check Next button state (no source VM selected)       | Next button is **disabled** |
| 4    | Cancel wizard                                         | Wizard closes cleanly       |

---

### `009`: Guest OS selection is reset when wizard is reopened

- **Objective:** Regression test for CNV-85419 (the `useInstanceTypeVMStore` holding `operatingSystemType` and preference was never cleared on wizard init/close, causing the Guest OS selection to persist across wizard sessions). The fix adds a `resetInstanceTypeVMState` action called on wizard mount and on close/cancel. Verifies that after selecting an OS, cancelling, and reopening the wizard, the Guest OS step starts fresh with no OS pre-selected (Next button disabled).
- **Pre-conditions:** Tag `@nonpriv`. No VM is created.

| Step | Action                                                          | Expected Result                                                                    |
| :--- | :-------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| 1    | Navigate to VM list and open wizard                             | Wizard page visible                                                                |
| 2    | Select "New VirtualMachine" and navigate to Guest OS step       | Guest OS step active                                                               |
| 3    | Select RHEL + rhel.9                                            | Next button becomes **enabled** (OS is selected)                                   |
| 4    | Cancel wizard                                                   | Wizard closes cleanly                                                              |
| 5    | Reopen wizard                                                   | Wizard page visible                                                                |
| 6    | Select "New VirtualMachine" and navigate to Guest OS step again | Guest OS step active                                                               |
| 7    | ID(CNV-85419) Check Next button state                           | Next button is **disabled** — no OS pre-selected (state was reset on close/reopen) |
| 8    | Cancel wizard                                                   | Wizard closes cleanly                                                              |

---

### `008`: VM name RFC 1123 validation and Tab-not-required on Review and Create step

- **Objective:** Verify that the VM name field on the Review and Create step enforces RFC 1123 DNS label rules (CNV-85822) and that Create is enabled immediately after typing a valid name without pressing Tab (CNV-85812). Invalid names must show an inline error and disable the Create button. Valid names must clear the error and enable Create on input change — no blur/Tab required.
- **Pre-conditions:** Tag `@nonpriv`. No VM is created — wizard is cancelled after validation.

| Step | Action                                                                                                                                           | Expected Result                                        |
| :--- | :----------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------- |
| 1    | Navigate to VM list and open wizard; navigate through all steps (New VM / RHEL 9 / no boot / compute / customization) to reach Review and Create | Review and Create step visible                         |
| 2    | Clear the VM name field (type empty string)                                                                                                      | Required error message shown; Create button disabled   |
| 3    | Type an invalid RFC 1123 name (`InvalidName_123` — uppercase and underscore)                                                                     | Validation error message shown; Create button disabled |
| 4    | Type a valid RFC 1123 name (`valid-vm-name`) without pressing Tab                                                                                | No error shown; Create button enabled                  |
| 5    | Cancel wizard                                                                                                                                    | Wizard closes cleanly                                  |

---

### `010`: Boot source step shows empty state for OS with no available volumes

- **Objective:** Verify that when a Guest OS with no bootable volumes is selected (e.g., Other Linux → alpine), the Boot source step renders the "No volumes found for the chosen OS" empty state instead of a volume table. Validates the empty state heading, body text (references "Add volume"), the Add volume button, and the "No boot source" fallback option.
- **Pre-conditions:** No VM is created. The cluster has no bootable volumes matching "alpine".

| Step | Action                                                                  | Expected Result                                      |
| :--- | :---------------------------------------------------------------------- | :--------------------------------------------------- |
| 1    | Open wizard, select Custom configuration, generate name, click Next     | Guest OS step active                                 |
| 2    | Select "Other Linux" tile and choose "alpine" from dropdown, click Next | Boot source step active                              |
| 3    | Check for empty state heading                                           | "No volumes found for the chosen OS" heading visible |
| 4    | Check empty state body text                                             | Body text contains "Add volume"                      |
| 5    | Check "Add volume" button                                               | "Add volume" button visible in empty state           |
| 6    | Check "No boot source" option                                           | "No boot source" fallback option visible             |
| 7    | Cancel wizard                                                           | Wizard closes cleanly                                |

---

### `011`: Add volume modal locks Preference to match Guest OS selection

- **Objective:** Verify that when a Guest OS is selected in the wizard (e.g., RHEL → rhel.10), opening the "Add volume" modal on the Boot source step pre-fills and disables the Preference dropdown with the matching VirtualMachineClusterPreference, and shows helper text "Automatically set by the VM Guest OS selection."
- **Pre-conditions:** No VM is created.

| Step | Action                                                              | Expected Result                                                     |
| :--- | :------------------------------------------------------------------ | :------------------------------------------------------------------ |
| 1    | Open wizard, select Custom configuration, generate name, click Next | Guest OS step active                                                |
| 2    | Select "RHEL" tile and choose "rhel.10" from dropdown, click Next   | Boot source step active                                             |
| 3    | Click "Add volume" button                                           | Add volume modal opens                                              |
| 4    | Check Preference dropdown disabled state                            | Preference dropdown has `pf-m-disabled` class                       |
| 5    | Check Preference dropdown value                                     | Value contains "rhel.10"                                            |
| 6    | Check Preference helper text                                        | Helper text reads "Automatically set by the VM Guest OS selection." |
| 7    | Cancel modal, cancel wizard                                         | Wizard closes cleanly                                               |

---

### `012`: Back button is disabled on step 1

- **Objective:** Verify that the wizard's Back button is disabled on the first step (Deployment Details), preventing navigation to a non-existent previous step.
- **Pre-conditions:** `beforeEach` navigates to VM list and opens wizard.

| Step | Action                            | Expected Result                                |
| :--- | :-------------------------------- | :--------------------------------------------- |
| 1    | Verify wizard is visible          | Wizard page visible at `/vm-wizard`            |
| 2    | Check Back button state on step 1 | Back button is **disabled** (no previous step) |

**Architecture:**

```
Test (scenario-wizard-location.spec.ts)
  → VmCreationWizardPage (wizard visibility + navigation controls)
  → VirtualMachinesPage (navigate to VM list)
```

---

### `013`: Edit Location panel shows project and folder fields

- **Objective:** Verify that the Edit Location panel in the wizard's Deployment Details step contains a project dropdown and a folder combobox, enabling users to set the VM's target namespace and folder.
- **Pre-conditions:** `beforeEach` navigates to VM list and opens wizard.

| Step | Action                                      | Expected Result                                  |
| :--- | :------------------------------------------ | :----------------------------------------------- |
| 1    | Select "New VirtualMachine" creation method | New VM card selected                             |
| 2    | Verify Edit Location button visible         | Edit Location button present in Location section |
| 3    | Open Edit Location panel                    | Location panel expands                           |
| 4    | Check for project dropdown                  | Project dropdown is present                      |
| 5    | Check for folder combobox                   | Folder combobox is present                       |
| 6    | Close Edit Location panel                   | Panel collapses cleanly                          |

---

### `014`: Wizard close button is hidden

- **Objective:** Verify that the wizard does not show a close (X) button — the wizard can only be exited via the Cancel button.
- **Pre-conditions:** `beforeEach` navigates to VM list and opens wizard.

| Step | Action                            | Expected Result                                                |
| :--- | :-------------------------------- | :------------------------------------------------------------- |
| 1    | Check for wizard close (X) button | Close button (`.pf-v6-c-wizard__close`) is absent from the DOM |

---

## 5. Requirements Traceability Matrix

| Requirement ID                                          | Test Case ID        | Spec                                               |
| :------------------------------------------------------ | :------------------ | :------------------------------------------------- |
| [CNV-82506](https://issues.redhat.com/browse/CNV-82506) | `001`               | `tests/gating/scenario-vm-creation-wizard.spec.ts` |
| [CNV-67254](https://issues.redhat.com/browse/CNV-67254) | `001`               | `tests/gating/scenario-vm-creation-wizard.spec.ts` |
| [CNV-61108](https://issues.redhat.com/browse/CNV-61108) | `001` (step 10)     | `tests/gating/scenario-vm-creation-wizard.spec.ts` |
| [CNV-84974](https://issues.redhat.com/browse/CNV-84974) | `001` (step 12)     | `tests/gating/scenario-vm-creation-wizard.spec.ts` |
| [CNV-84243](https://issues.redhat.com/browse/CNV-84243) | `002`               | `tests/gating/scenario-vm-creation-wizard.spec.ts` |
| [CNV-84499](https://issues.redhat.com/browse/CNV-84499) | `003`               | `tests/gating/scenario-vm-creation-wizard.spec.ts` |
| [CNV-84242](https://issues.redhat.com/browse/CNV-84242) | `004`, `006`, `007` | `tests/gating/scenario-vm-creation-wizard.spec.ts` |
| [CNV-83731](https://issues.redhat.com/browse/CNV-83731) | `005`               | `tests/gating/scenario-vm-creation-wizard.spec.ts` |
| [CNV-83743](https://issues.redhat.com/browse/CNV-83743) | `001` (step 1a)     | `tests/gating/scenario-vm-creation-wizard.spec.ts` |
| [CNV-83756](https://issues.redhat.com/browse/CNV-83756) | `001` (step 3)      | `tests/gating/scenario-vm-creation-wizard.spec.ts` |
| [CNV-85822](https://issues.redhat.com/browse/CNV-85822) | `008`               | `tests/gating/scenario-vm-creation-wizard.spec.ts` |
| [CNV-85812](https://issues.redhat.com/browse/CNV-85812) | `008` (step 4)      | `tests/gating/scenario-vm-creation-wizard.spec.ts` |
| [CNV-85419](https://issues.redhat.com/browse/CNV-85419) | `009`               | `tests/gating/scenario-vm-creation-wizard.spec.ts` |
| TBD (wizard location — back button)                     | `012`               | `tests/gating/scenario-wizard-location.spec.ts`    |
| TBD (wizard location — edit location panel)             | `013`               | `tests/gating/scenario-wizard-location.spec.ts`    |
| TBD (wizard location — close button hidden)             | `014`               | `tests/gating/scenario-wizard-location.spec.ts`    |
