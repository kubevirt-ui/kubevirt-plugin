# Software Test Description (STD): Virtualization Settings

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtualization-settings/`
- **Feature Area:** Settings — Virtualization settings
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-07
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Automated E2E coverage for console routes under `tests/virtualization-settings/`.

### 2.2 Scope

- **In-Scope:**
  - All scenarios in specs under `tests/virtualization-settings/`.
- **Out-of-Scope:**
  - Scenarios documented in other route STD files.

## 3. Test Environment & Prerequisites

### admin-auto-labels

### cluster-settings

### ksm-toggle

### passt-binding

### recommended-capabilities-actions

### recommended-capabilities-install

### recommended-capabilities-navigation

### recommended-capabilities-tables

### settings-role-aggregation

### ssh-configuration

### user-default-labels

### user-settings

---

## 4. Test Case Definitions

### Module: `admin-auto-labels.spec.ts`

**Spec file:** `tests/virtualization-settings/admin-auto-labels.spec.ts`
**Describe:** `Admin auto-applied labels` — **Tags:** @tier2
**Allure:** suite `Auto-Applied Labels — Admin Settings`, feature `Tier 2`

---

### `001`: Shows empty state when no labels exist

- **Objective:** Shows empty state when no labels exist
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2

| Step | Action                                                      | Expected Result                   |
| :--- | :---------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Shows empty state when no labels exist | All expectations in the spec pass |

---

### `002`: Invalid key format shows validation error

- **Objective:** Invalid key format shows validation error
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2

| Step | Action                                                         | Expected Result                   |
| :--- | :------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Invalid key format shows validation error | All expectations in the spec pass |

---

### `003`: Admin adds a label key and it persists to ConfigMap

- **Objective:** Admin adds a label key and it persists to ConfigMap
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2

| Step | Action                                                                   | Expected Result                   |
| :--- | :----------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Admin adds a label key and it persists to ConfigMap | All expectations in the spec pass |

---

### `004`: Duplicate key shows validation error

- **Objective:** Duplicate key shows validation error
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2

| Step | Action                                                    | Expected Result                   |
| :--- | :-------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Duplicate key shows validation error | All expectations in the spec pass |

---

### `005`: Admin edits label value and it persists

- **Objective:** Admin edits label value and it persists
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2

| Step | Action                                                       | Expected Result                   |
| :--- | :----------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Admin edits label value and it persists | All expectations in the spec pass |

---

### `006`: Value over 63 characters shows validation error

- **Objective:** Value over 63 characters shows validation error
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2

| Step | Action                                                               | Expected Result                   |
| :--- | :------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Value over 63 characters shows validation error | All expectations in the spec pass |

---

### `007`: Admin toggles Required and it persists

- **Objective:** Admin toggles Required and it persists
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2

| Step | Action                                                      | Expected Result                   |
| :--- | :---------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Admin toggles Required and it persists | All expectations in the spec pass |

---

### `008`: Admin deletes a label and ConfigMap is empty

- **Objective:** Admin deletes a label and ConfigMap is empty
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2

| Step | Action                                                            | Expected Result                   |
| :--- | :---------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Admin deletes a label and ConfigMap is empty | All expectations in the spec pass |

---

---

### Module: `cluster-settings.spec.ts`

**Spec file:** `tests/virtualization-settings/cluster-settings.spec.ts`
**Describe:** `Cluster Settings` — **Tags:** @settings
**Allure:** suite `Cluster Settings`, feature `CNV Settings`

---

### `001`: Settings page shows Cluster, User, Recommended capabilities, and Preview features tabs

- **Objective:** Settings page shows Cluster, User, Recommended capabilities, and Preview features tabs
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-92254, CNV-80123
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @settings

| Step | Action                                                                                                      | Expected Result                   |
| :--- | :---------------------------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Settings page shows Cluster, User, Recommended capabilities, and Preview features tabs | All expectations in the spec pass |

---

### `002`: Settings search filter shows autocomplete suggestions for a query

- **Objective:** Settings search filter shows autocomplete suggestions for a query
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-92254, CNV-80123
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @settings

| Step | Action                                                                                 | Expected Result                   |
| :--- | :------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Settings search filter shows autocomplete suggestions for a query | All expectations in the spec pass |

---

### `003`: Installed version shows expected prefix and update status

- **Objective:** Installed version shows expected prefix and update status
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-92254, CNV-80123
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @settings

| Step | Action                                                                         | Expected Result                   |
| :--- | :----------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Installed version shows expected prefix and update status | All expectations in the spec pass |

---

### `004`: General settings section shows all expected sub-sections

- **Objective:** General settings section shows all expected sub-sections
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-92254, CNV-80123
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @settings

| Step | Action                                                                        | Expected Result                   |
| :--- | :---------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: General settings section shows all expected sub-sections | All expectations in the spec pass |

---

### `005`: Live migration limits can be set via UI and are reflected in the cluster

- **Objective:** Live migration limits can be set via UI and are reflected in the cluster
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-92254, CNV-80123
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @settings

| Step | Action                                                                                        | Expected Result                   |
| :--- | :-------------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Live migration limits can be set via UI and are reflected in the cluster | All expectations in the spec pass |

---

### `006`: Memory request ratio section is accessible and stepper changes value

- **Objective:** Memory request ratio section is accessible and stepper changes value
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-92254, CNV-80123
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @settings

| Step | Action                                                                                    | Expected Result                   |
| :--- | :---------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Memory request ratio section is accessible and stepper changes value | All expectations in the spec pass |

---

### `007`: Automatic images download section is accessible via Templates and images management

- **Objective:** Automatic images download section is accessible via Templates and images management
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-92254, CNV-80123
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @settings

| Step | Action                                                                                                   | Expected Result                   |
| :--- | :------------------------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Automatic images download section is accessible via Templates and images management | All expectations in the spec pass |

---

### `008`: VirtualMachine actions confirmation toggle can be enabled and disabled

- **Objective:** VirtualMachine actions confirmation toggle can be enabled and disabled
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-92254, CNV-80123
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @settings

| Step | Action                             | Expected Result                          |
| :--- | :--------------------------------- | :--------------------------------------- |
| 1    | VM folders feature flag is present | Step completes without assertion failure |

---

### `009`: Hide YAML tab toggle persists after enabling and can be restored via API

- **Objective:** Hide YAML tab toggle persists after enabling and can be restored via API
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-92254, CNV-80123
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @settings

| Step | Action                                                               | Expected Result                          |
| :--- | :------------------------------------------------------------------- | :--------------------------------------- |
| 1    | VM folders feature flag is present                                   | Step completes without assertion failure |
| 2    | Passt binding feature flag is present                                | Step completes without assertion failure |
| 3    | Native VirtualMachine templates feature flag matches the HCO version | Step completes without assertion failure |

---

### `010`: Advanced CD-ROM features toggle can be enabled and disabled

- **Objective:** Advanced CD-ROM features toggle can be enabled and disabled
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-92254, CNV-80123
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @settings

| Step | Action                                                               | Expected Result                          |
| :--- | :------------------------------------------------------------------- | :--------------------------------------- |
| 1    | VM folders feature flag is present                                   | Step completes without assertion failure |
| 2    | Passt binding feature flag is present                                | Step completes without assertion failure |
| 3    | Native VirtualMachine templates feature flag matches the HCO version | Step completes without assertion failure |

---

### `011`: Guest system log can be enabled and disabled via settings

- **Objective:** Guest system log can be enabled and disabled via settings
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-92254, CNV-80123
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @settings

| Step | Action                                                               | Expected Result                          |
| :--- | :------------------------------------------------------------------- | :--------------------------------------- |
| 1    | VM folders feature flag is present                                   | Step completes without assertion failure |
| 2    | Passt binding feature flag is present                                | Step completes without assertion failure |
| 3    | Native VirtualMachine templates feature flag matches the HCO version | Step completes without assertion failure |

---

### `012`: Automatic subscription of new RHEL VirtualMachines section is accessible

- **Objective:** Automatic subscription of new RHEL VirtualMachines section is accessible
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-92254, CNV-80123
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @settings

| Step | Action                                                               | Expected Result                          |
| :--- | :------------------------------------------------------------------- | :--------------------------------------- |
| 1    | VM folders feature flag is present                                   | Step completes without assertion failure |
| 2    | Passt binding feature flag is present                                | Step completes without assertion failure |
| 3    | Native VirtualMachine templates feature flag matches the HCO version | Step completes without assertion failure |

---

### `013`: Hide guest credentials for non-privileged users toggle can be enabled and disabled

- **Objective:** Hide guest credentials for non-privileged users toggle can be enabled and disabled
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-92254, CNV-80123
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @settings

| Step | Action                                                               | Expected Result                          |
| :--- | :------------------------------------------------------------------- | :--------------------------------------- |
| 1    | VM folders feature flag is present                                   | Step completes without assertion failure |
| 2    | Passt binding feature flag is present                                | Step completes without assertion failure |
| 3    | Native VirtualMachine templates feature flag matches the HCO version | Step completes without assertion failure |

---

### `014`: Resource management shows AAQ Application Aware Quota control

- **Objective:** Resource management shows AAQ Application Aware Quota control
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-92254, CNV-80123
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @settings

| Step | Action                                                               | Expected Result                          |
| :--- | :------------------------------------------------------------------- | :--------------------------------------- |
| 1    | VM folders feature flag is present                                   | Step completes without assertion failure |
| 2    | Passt binding feature flag is present                                | Step completes without assertion failure |
| 3    | Native VirtualMachine templates feature flag matches the HCO version | Step completes without assertion failure |

---

### `015`: SCSI persistent reservation section is accessible

- **Objective:** SCSI persistent reservation section is accessible
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-92254, CNV-80123
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @settings

| Step | Action                                                               | Expected Result                          |
| :--- | :------------------------------------------------------------------- | :--------------------------------------- |
| 1    | VM folders feature flag is present                                   | Step completes without assertion failure |
| 2    | Passt binding feature flag is present                                | Step completes without assertion failure |
| 3    | Native VirtualMachine templates feature flag matches the HCO version | Step completes without assertion failure |

---

### `016`: Preview features tab shows VM folders and Passt binding options

- **Objective:** Preview features tab shows VM folders and Passt binding options
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-92254, CNV-80123
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @settings

| Step | Action                                                               | Expected Result                          |
| :--- | :------------------------------------------------------------------- | :--------------------------------------- |
| 1    | VM folders feature flag is present                                   | Step completes without assertion failure |
| 2    | Passt binding feature flag is present                                | Step completes without assertion failure |
| 3    | Native VirtualMachine templates feature flag matches the HCO version | Step completes without assertion failure |

---

### `017`: Cross-cluster live migration flag is removed from preview features

- **Objective:** Cross-cluster live migration flag is removed from preview features
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-92254, CNV-80123
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @settings

| Step | Action                                                                                  | Expected Result                   |
| :--- | :-------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Cross-cluster live migration flag is removed from preview features | All expectations in the spec pass |

---

---

### Module: `ksm-toggle.spec.ts`

**Spec file:** `tests/virtualization-settings/ksm-toggle.spec.ts`
**Describe:** `Kernel Samepage Merging (KSM)` — **Tags:** `@cnv-settings`, `@adminOnly`
**Allure:** suite `Kernel Samepage Merging (KSM)`, feature `CNV Settings`

---

### `001`: KSM toggle updates HyperConverged ksmConfiguration

- **Objective:** Verify that turning KSM on and off from Resource management updates the UI switch
  and the HyperConverged CR to the expected `ksmConfiguration` values.
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** Cluster-admin session; HyperConverged resource is loaded in Settings (KSM
  switch becomes interactive when HCO watch has loaded).
- **Tags:** `@cnv-settings`, `@adminOnly`

| Step | Action                                                      | Expected Result                                                 |
| :--- | :---------------------------------------------------------- | :-------------------------------------------------------------- |
| 1    | Navigate to Virtualization Settings through the sidebar     | Cluster Settings page loads                                     |
| 2    | Open **Resource management**                                | KSM control (`Kernel Samepage Merging`) is visible              |
| 3    | Turn KSM **on** (wait until switch is enabled, then enable) | Switch is checked; `enableKSM()` succeeds                       |
| 4    | Poll HyperConverged `spec.ksmConfiguration` via API         | Value equals `{ "nodeLabelSelector": {} }`                      |
| 5    | Turn KSM **off**                                            | Switch is unchecked; `disableKSM()` succeeds                    |
| 6    | Poll HyperConverged `spec.ksmConfiguration` via API         | Value equals `{}`                                               |
| 7    | Suite cleanup (`afterAll`)                                  | Best-effort restore of prior `ksmConfiguration` (if applicable) |

---

---

### Module: `passt-binding.spec.ts`

**Spec file:** `tests/virtualization-settings/passt-binding.spec.ts`
**Describe:** `Passt binding preview feature` — **Tags:** `@cnv-settings` `@adminOnly`

### `001`: Passt binding toggle updates the HyperConverged annotation

- **Objective:** Turning the preview switch on and off writes `true` and `false` to
  `hco.kubevirt.io/deployPasstNetworkBinding`.

| Step | Action                                                             | Expected Result                                   |
| :--- | :----------------------------------------------------------------- | :------------------------------------------------ |
| 1    | Open **Settings → Preview features**                               | Preview features tab loads                        |
| 2    | Turn **Enable Passt binding for primary user-defined networks** on | Switch is checked and the annotation is `true`    |
| 3    | Turn the same switch off                                           | Switch is unchecked and the annotation is `false` |

---

### Module: `recommended-capabilities-actions.spec.ts`

**Spec file:** `tests/virtualization-settings/recommended-capabilities-actions.spec.ts`
**Describe:** `Recommended capabilities actions` — **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`
**Allure:** suite `Recommended capabilities`, feature `Tier 2`

---

### `001`: Not-installed capability kebab shows Install all operators

- **Objective:** Verify a not-installed autopilot capability kebab offers Install all operators without installing.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133
- **Pre-conditions:** At least one autopilot capability is Not installed; skipped otherwise.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                            | Expected Result       |
| :--- | :-------------------------------- | :-------------------- |
| 1    | Open kebab on a Not installed row | Menu is visible       |
| 2    | Assert Install all operators      | Menu item is visible  |
| 3    | Dismiss the menu                  | No install is started |

---

### `002`: View operator details opens Software Catalog and back returns to the tab

- **Objective:** Verify View operator details navigates to Software Catalog and browser back returns to the tab.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-85806
- **Pre-conditions:** Cluster-admin user.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                                                     | Expected Result                                           |
| :--- | :--------------------------------------------------------- | :-------------------------------------------------------- |
| 1    | Expand Load balancing and open the Descheduler kebab       | Menu is visible                                           |
| 2    | Click View operator details                                | URL includes `/catalog/` and the Descheduler `selectedId` |
| 3    | Browser back (catalog may add a `&version=` history entry) | Recommended capabilities tab is visible                   |

---

### `003`: Installed Autopilot operator shows Recommended or Manual configuration

- **Objective:** Verify an installed Autopilot operator shows Recommended or Manual in the configuration column.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-85806
- **Pre-conditions:** At least one Autopilot operator is Recommended or Manual; skipped otherwise.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                                  | Expected Result                                  |
| :--- | :-------------------------------------- | :----------------------------------------------- |
| 1    | Expand auto capabilities                | Operator rows are shown                          |
| 2    | Find a Recommended or Manual operator   | Configuration cell text matches that status      |
| 3    | If Manual, assert Review recommendation | Review recommendation link is visible in the row |

---

### `004`: Manual operator kebab shows Use recommended configuration

- **Objective:** Verify a Manual Autopilot operator kebab offers Use recommended configuration without applying it.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-85806
- **Pre-conditions:** At least one Autopilot operator is Manual; skipped otherwise.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                               | Expected Result         |
| :--- | :----------------------------------- | :---------------------- |
| 1    | Expand auto capabilities             | Operator rows are shown |
| 2    | Open kebab on a Manual operator      | Menu is visible         |
| 3    | Assert Use recommended configuration | Menu item is visible    |
| 4    | Dismiss the menu                     | YAML is not applied     |

---

### `005`: Review recommendation modal shows both YAML panes and Cancel closes it

- **Objective:** Verify the review recommendation modal content and that Cancel does not apply YAML.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-85806
- **Pre-conditions:** At least one Autopilot operator is in Manual configuration; skipped otherwise.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                                                  | Expected Result                             |
| :--- | :------------------------------------------------------ | :------------------------------------------ |
| 1    | Expand auto capabilities and open Review recommendation | Modal title and both YAML panes are visible |
| 2    | Assert Apply and Cancel                                 | Both footer buttons are visible             |
| 3    | Click Cancel                                            | Modal closes; Apply is not clicked          |

---

---

### Module: `recommended-capabilities-install.spec.ts`

**Spec file:** `tests/virtualization-settings/recommended-capabilities-install.spec.ts`
**Describe:** `Recommended capabilities install` — **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`
**Allure:** suite `Recommended capabilities`, feature `Tier 2`

---

### `001`: Install selected starts install for one not-installed autopilot capability

- **Objective:** Verify Install selected starts OLM install for one not-installed autopilot capability.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133, CNV-85806
- **Pre-conditions:** At least one autopilot capability is Not installed (prefer Migrate VMs); skipped otherwise.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                                                  | Expected Result                                          |
| :--- | :------------------------------------------------------ | :------------------------------------------------------- |
| 1    | Select the first not-installed autopilot capability     | Install selected becomes enabled                         |
| 2    | Click Install selected                                  | Toast "Installation started …" and/or Installing spinner |
| 3    | Poll capability status until `OPERATOR_INSTALL` timeout | Status is no longer Not installed                        |
| 4    | afterEach deletes new Autopilot Subscriptions           | Cluster is restored                                      |

---

---

### Module: `recommended-capabilities-navigation.spec.ts`

**Spec file:** `tests/virtualization-settings/recommended-capabilities-navigation.spec.ts`
**Describe:** `Recommended capabilities navigation` / `Recommended capabilities is hidden from non-privileged users` — **Tags:** `@tier2`, `@tier2-recommended-capabilities`, `@adminOnly`, `@nonpriv`
**Allure:** suite `Recommended capabilities`, feature `Tier 2`

---

### `001`: Sidebar Settings tab shows heading and both capability cards

- **Objective:** Verify the Recommended capabilities tab loads with the page heading and both cards.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133
- **Pre-conditions:** Cluster-admin user.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                                        | Expected Result                                               |
| :--- | :-------------------------------------------- | :------------------------------------------------------------ |
| 1    | Open Settings from the Virtualization sidebar | Settings page loads                                           |
| 2    | Click the Recommended capabilities tab        | Tab content is visible                                        |
| 3    | Assert heading and both card titles           | Manage Virtualization capabilities; auto and additional cards |

---

### `002`: Settings search for Recommended capabilities opens the tab

- **Objective:** Verify Settings search navigates to the Recommended capabilities tab.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133
- **Pre-conditions:** Cluster-admin user.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                                                          | Expected Result                                      |
| :--- | :-------------------------------------------------------------- | :--------------------------------------------------- |
| 1    | Open Settings from the sidebar                                  | Settings page loads                                  |
| 2    | Search for "Recommended capabilities" and select the suggestion | Tab content is visible                               |
| 3    | Assert the URL                                                  | Path includes `/virtualization-settings/recommended` |

---

### `003`: Installed auto-table capability has no kebab and still expands operators

- **Objective:** Verify an installed autopilot capability is view-only at the capability row and still expands.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-85806
- **Pre-conditions:** At least one autopilot capability is Installed; skipped otherwise.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                                         | Expected Result                  |
| :--- | :--------------------------------------------- | :------------------------------- |
| 1    | Find an Installed capability in the auto table | A matching row is visible        |
| 2    | Assert kebab count on that row                 | No kebab is rendered             |
| 3    | Expand the row                                 | Operator rows are visible        |
| 4    | Open the operator kebab                        | View operator details is present |

---

### `004`: Non-privileged user does not see admin-only Settings tabs

- **Objective:** Verify non-privileged users do not see Recommended capabilities, Cluster, or Preview features.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133
- **Pre-conditions:** `NON_PRIV=1`.
- **Tags:** `@tier2`, `@nonpriv`, `@tier2-recommended-capabilities`

| Step | Action                               | Expected Result                                                        |
| :--- | :----------------------------------- | :--------------------------------------------------------------------- |
| 1    | Open Settings from the sidebar       | Settings page loads                                                    |
| 2    | Collect visible `settings-tab-*` IDs | `recommended`, `cluster`, and `features` are absent; `user` is present |

---

---

### Module: `recommended-capabilities-tables.spec.ts`

**Spec file:** `tests/virtualization-settings/recommended-capabilities-tables.spec.ts`
**Describe:** `Recommended capabilities tables` — **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`
**Allure:** suite `Recommended capabilities`, feature `Tier 2`

---

### `001`: Auto table lists Load balancing, Migrate VMs, and Virtualization dashboards

- **Objective:** Verify the autopilot table lists the three automatic capabilities.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133, CNV-85806
- **Pre-conditions:** Cluster-admin user.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                        | Expected Result                                        |
| :--- | :---------------------------- | :----------------------------------------------------- |
| 1    | Open Recommended capabilities | Auto table is visible                                  |
| 2    | Assert capability titles      | Load balancing, Migrate VMs, Virtualization dashboards |

---

### `002`: Expanding Load balancing shows Descheduler and MetalLB

- **Objective:** Verify Load balancing expands to its Autopilot operators.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-85806
- **Pre-conditions:** Cluster-admin user.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                | Expected Result                    |
| :--- | :-------------------- | :--------------------------------- |
| 1    | Expand Load balancing | Operator rows are shown            |
| 2    | Assert operator names | Descheduler and MetalLB are listed |

---

### `003`: Searching Migrate filters the auto table and clearing restores rows

- **Objective:** Verify capability search filters and restore.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133
- **Pre-conditions:** Cluster-admin user.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action               | Expected Result                            |
| :--- | :------------------- | :----------------------------------------- |
| 1    | Search for "Migrate" | Migrate VMs visible; Load balancing hidden |
| 2    | Clear search         | Load balancing is visible again            |

---

### `004`: Status filter updates the capabilities count text

- **Objective:** Verify the Status filter changes the "X out of Y …" count.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133
- **Pre-conditions:** Cluster-admin user.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                      | Expected Result                     |
| :--- | :-------------------------- | :---------------------------------- |
| 1    | Read the default count text | Text matches "out of"               |
| 2    | Filter by Not installed     | Count text includes "not installed" |

---

### `005`: Install selected stays disabled until a not-installed capability is checked

- **Objective:** Verify Install selected stays disabled with the expected tooltip until a not-installed row is selected.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133
- **Pre-conditions:** Skips the enablement assertion if no not-installed autopilot capability exists.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                                        | Expected Result                             |
| :--- | :-------------------------------------------- | :------------------------------------------ |
| 1    | Assert Install selected with no selection     | `aria-disabled="true"`                      |
| 2    | Hover the button                              | Tooltip "Select capabilities to install"    |
| 3    | Check a Not installed capability (if present) | Install selected is no longer aria-disabled |

---

### `006`: Additional table lists the eight manual capabilities

- **Objective:** Verify the additional (manual setup) table lists all eight capabilities.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133
- **Pre-conditions:** Cluster-admin user.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                        | Expected Result                                        |
| :--- | :---------------------------- | :----------------------------------------------------- |
| 1    | Open Recommended capabilities | Additional table is visible                            |
| 2    | Assert all eight titles       | Backup, NFD, HA, NMState, Kata, hub, NUMA, local disks |

---

### `007`: Expanding High availability shows health, fence, and maintenance operators

- **Objective:** Verify High availability expands to its three operators.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133
- **Pre-conditions:** Cluster-admin user.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                   | Expected Result                                               |
| :--- | :----------------------- | :------------------------------------------------------------ |
| 1    | Expand High availability | Operator rows are shown                                       |
| 2    | Assert operator names    | Node health check, Fence agents remediation, Node maintenance |

---

### `008`: Operator name link opens Software Catalog

- **Objective:** Verify an additional-table operator name navigates to Software Catalog.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133
- **Pre-conditions:** Cluster-admin user; Node health check package is resolvable in Software Catalog.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                           | Expected Result                                                     |
| :--- | :------------------------------- | :------------------------------------------------------------------ |
| 1    | Expand High availability         | Operator rows are shown                                             |
| 2    | Click the Node health check name | URL includes `/catalog/` and `selectedId=node-healthcheck-operator` |

---

---

### Module: `settings-role-aggregation.spec.ts`

**Spec file:** `tests/virtualization-settings/settings-role-aggregation.spec.ts`
**Describe:** `Settings — Role Aggregation` — **Tags:** `@gating`
**Allure:** suite `Test Virtualization Settings page`, feature `Gating`

---

### `001`: Preview feature ON enables grant toggle on Cluster tab

- **Objective:** Verify that enabling the "Control default Virtualization permissions" preview toggle makes the grant toggle interactive on the Cluster tab
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-92775
- **Pre-conditions:** "Control default Virtualization permissions" preview toggle is OFF
- **Tags:** `@gating`

| Step | Action                                                         | Expected Result                           |
| :--- | :------------------------------------------------------------- | :---------------------------------------- |
| 1    | Navigate to **Settings → Preview features** tab                | Preview features tab loads                |
| 2    | Enable the "Control default Virtualization permissions" toggle | Toggle switches to ON                     |
| 3    | Navigate to **Settings → Cluster** tab                         | Cluster tab loads                         |
| 4    | Expand the "Automatically grant Virtualization roles" section  | Section expands                           |
| 5    | Observe the grant toggle state                                 | Grant toggle is **enabled** (interactive) |

---

### `002`: Grant toggle ON sets strategy to AggregateToDefault and restores labels

- **Objective:** Verify that turning the grant toggle ON sets HCO `spec.roleAggregationStrategy` to `AggregateToDefault` and restores aggregate labels on ClusterRoles
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-92775
- **Pre-conditions:** Preview feature is enabled; grant toggle is currently OFF
- **Tags:** `@gating`

| Step | Action                                                            | Expected Result                                                 |
| :--- | :---------------------------------------------------------------- | :-------------------------------------------------------------- |
| 1    | Turn the "Automatically grant Virtualization roles" toggle **ON** | Toggle switches to ON (checked)                                 |
| 2    | Query HyperConverged CR `spec.roleAggregationStrategy` via API    | Value is `AggregateToDefault`                                   |
| 3    | Query ClusterRole `kubevirt.io:admin` labels via API              | Label `rbac.authorization.k8s.io/aggregate-to-admin` = `"true"` |
| 4    | Query ClusterRole `kubevirt.io:edit` labels via API               | Label `rbac.authorization.k8s.io/aggregate-to-edit` = `"true"`  |
| 5    | Query ClusterRole `kubevirt.io:view` labels via API               | Label `rbac.authorization.k8s.io/aggregate-to-view` = `"true"`  |

---

### `003`: Grant toggle OFF sets strategy to Manual and removes labels

- **Objective:** Verify that turning the grant toggle OFF sets HCO `spec.roleAggregationStrategy` to `Manual` and removes aggregate labels from ClusterRoles
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-92775
- **Pre-conditions:** Preview feature is enabled; grant toggle is currently ON
- **Tags:** `@gating`

| Step | Action                                                             | Expected Result                                                |
| :--- | :----------------------------------------------------------------- | :------------------------------------------------------------- |
| 1    | Turn the "Automatically grant Virtualization roles" toggle **OFF** | Toggle switches to OFF (unchecked)                             |
| 2    | Query HyperConverged CR `spec.roleAggregationStrategy` via API     | Value is `Manual`                                              |
| 3    | Query ClusterRole `kubevirt.io:admin` labels via API               | Label `rbac.authorization.k8s.io/aggregate-to-admin` is absent |
| 4    | Query ClusterRole `kubevirt.io:edit` labels via API                | Label `rbac.authorization.k8s.io/aggregate-to-edit` is absent  |
| 5    | Query ClusterRole `kubevirt.io:view` labels via API                | Label `rbac.authorization.k8s.io/aggregate-to-view` is absent  |

---

### `004`: Preview feature OFF disables grant toggle on Cluster tab

- **Objective:** Verify that disabling the "Control default Virtualization permissions" preview toggle makes the grant toggle non-interactive on the Cluster tab
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-92775
- **Pre-conditions:** "Control default Virtualization permissions" preview toggle is ON
- **Tags:** `@gating`

| Step | Action                                                          | Expected Result                                |
| :--- | :-------------------------------------------------------------- | :--------------------------------------------- |
| 1    | Navigate to **Settings → Preview features** tab                 | Preview features tab loads                     |
| 2    | Disable the "Control default Virtualization permissions" toggle | Toggle switches to OFF                         |
| 3    | Navigate to **Settings → Cluster** tab                          | Cluster tab loads                              |
| 4    | Expand the "Automatically grant Virtualization roles" section   | Section expands                                |
| 5    | Observe the grant toggle state                                  | Grant toggle is **disabled** (non-interactive) |

---

---

### Module: `ssh-configuration.spec.ts`

**Spec file:** `tests/virtualization-settings/ssh-configuration.spec.ts`
**Describe:** `SSH Configuration Settings` — **Tags:** `@cnv-settings`, `@adminOnly`
**Allure:** suite `SSH Configuration Settings`, feature `CNV Settings`

---

### `001`: NodePort availability follows the node-address value

- **Objective:** Verify that the NodePort switch requires a non-empty node address and resets when
  the configured address is cleared.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96685
- **Pre-conditions:** `nodePortAddress` is empty and `nodePortEnabled` is `false`.
- **Tags:** `@cnv-settings`, `@adminOnly`

| Step | Action                                                    | Expected Result                                        |
| :--- | :-------------------------------------------------------- | :----------------------------------------------------- |
| 1    | Navigate to Virtualization Settings through the sidebar   | Cluster Settings page loads                            |
| 2    | Expand General settings, SSH configurations, and NodePort | Node-address input and NodePort switch appear          |
| 3    | Observe the switch while the node address is empty        | Switch is disabled                                     |
| 4    | Enter a node address and wait for the debounced update    | Switch becomes enabled                                 |
| 5    | Enable SSH over NodePort                                  | Switch becomes checked                                 |
| 6    | Clear the node address and wait for the debounced update  | Switch becomes unchecked and disabled                  |
| 7    | Restore the original ConfigMap values                     | Cluster configuration is returned to its initial state |

---

---

### Module: `user-default-labels.spec.ts`

**Spec file:** `tests/virtualization-settings/user-default-labels.spec.ts`
**Describe:** `User default VM labels settings` — **Tags:** @tier2
**Allure:** suite `Auto-Applied Labels — User`, feature `Tier 2`

---

### `001`: Shows empty message when no admin labels configured

- **Objective:** Shows empty message when no admin labels configured
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2

| Step | Action                                                                   | Expected Result                   |
| :--- | :----------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Shows empty message when no admin labels configured | All expectations in the spec pass |

---

### `002`: Displays admin-configured label keys

- **Objective:** Displays admin-configured label keys
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2

| Step | Action                                                    | Expected Result                   |
| :--- | :-------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Displays admin-configured label keys | All expectations in the spec pass |

---

### `003`: Cannot edit value where admin set a value

- **Objective:** Cannot edit value where admin set a value
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2

| Step | Action                                                         | Expected Result                   |
| :--- | :------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Cannot edit value where admin set a value | All expectations in the spec pass |

---

### `004`: Can edit value where admin left value empty

- **Objective:** Can edit value where admin left value empty
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2

| Step | Action                                                           | Expected Result                   |
| :--- | :--------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Can edit value where admin left value empty | All expectations in the spec pass |

---

### `005`: User-edited value persists to user-settings ConfigMap

- **Objective:** User-edited value persists to user-settings ConfigMap
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier2

| Step | Action                                                                     | Expected Result                   |
| :--- | :------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: User-edited value persists to user-settings ConfigMap | All expectations in the spec pass |

---

---

### Module: `user-settings.spec.ts`

**Spec file:** `tests/virtualization-settings/user-settings.spec.ts`
**Describe:** `Settings User Tests` — **Tags:** @settings
**Allure:** suite `Settings User`, feature `CNV Settings`

---

### `001`: SSH key management allows saving a public key to a project namespace

- **Objective:** SSH key management allows saving a public key to a project namespace
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @settings

| Step | Action                                                                                    | Expected Result                   |
| :--- | :---------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: SSH key management allows saving a public key to a project namespace | All expectations in the spec pass |

---

### `002`: User settings permissions section shows expected tasks

- **Objective:** User settings permissions section shows expected tasks
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @settings

| Step | Action                                                                      | Expected Result                   |
| :--- | :-------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: User settings permissions section shows expected tasks | All expectations in the spec pass |

---

### `003`: Getting started resources section shows Welcome information and Guided tour options

- **Objective:** Getting started resources section shows Welcome information and Guided tour options
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @settings

| Step | Action                                                                                                   | Expected Result                   |
| :--- | :------------------------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: Getting started resources section shows Welcome information and Guided tour options | All expectations in the spec pass |

---

### `004`: Welcome information and Guided tour toggles are present and responsive

- **Objective:** Welcome information and Guided tour toggles are present and responsive
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @settings

| Step | Action                                                                                      | Expected Result                   |
| :--- | :------------------------------------------------------------------------------------------ | :-------------------------------- |
| 1    | Run Playwright test: Welcome information and Guided tour toggles are present and responsive | All expectations in the spec pass |
