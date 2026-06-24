# Software Test Description (STD): Gating — Scenario virtualization pages and template list

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Gating — Read-only virtualization pages + Templates list filters
- **Version:** CNV 4.22
- **Date:** 2026-03-27
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

Document gating coverage for cluster/home overview checks, virtualization overview sub-tabs, supporting pages (instance types, bootable volumes, migration policies), CRD list pages, tree view icons, and **Templates** list filtering (all projects) — each area covered by a focused `test()`.

### 2.2 Scope

- **In-Scope:** Spec `tests/gating/scenario-virtualization-pages.spec.ts`. Spec `tests/gating/scenario-csv-export.spec.ts` — CSV export button on VM list.
- **Out-of-Scope:** VM detail tabs, SSH keys, cluster settings, catalog namespace flows (other scenario STDs).

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV; API token for `listMigrationPoliciesWithToken`.
- **Configuration:** Optional `ARCH`; template list OS filter tests branch for `s390x` vs other.
- **Initial setup:** `testConfig.testNamespace` exists and is searchable in tree view for CNV-69764.
- **Shared resources:** None — no `beforeAll`; migration policy names are read per test from the API.

---

## 4. Test Case Definitions

**Spec file:** `tests/gating/scenario-virtualization-pages.spec.ts`  
**Describe:** `Virtualization pages (gating)` — **Tags:** `@gating`  
**Annotations:** suite `Virtualization pages`, feature `Gating`, tags `['@gating']`.  
**Per-test tags:** `@nonpriv` on each `test()`.

---

### `001`: Home overview healthy conditions

- **Objective:** Cluster/home overview shows healthy conditions (HCO / kubevirt-hyperconverged expectation in step driver).
- **Test name:** `ID(CNV-7507) Home overview healthy conditions`
- **Shared resources:** None.

| Step ID      | Description                                                   | Assertions (`expect.soft`) |
| :----------- | :------------------------------------------------------------ | :------------------------- |
| ID(CNV-7507) | `navigateToClusterOverviewViaUI`; `verifyHealthyConditions()` | `true`.                    |

---

### `002`: Home overview VM link

- **Objective:** VirtualMachines entry/heading visible from home overview.
- **Test name:** `ID(CNV-10371) Home overview VM link`
- **Shared resources:** None.

| Step ID       | Description                  | Assertions (`expect.soft`) |
| :------------ | :--------------------------- | :------------------------- |
| ID(CNV-10371) | `verifyVirtualMachineLink()` | `true`.                    |

---

### `003`: Virtualization overview page loads with resource cards

- **Objective:** Virtualization overview page loads and displays resource cards (critical navigation smoke).
- **Test name:** `Virtualization overview page loads with resource cards`
- **Shared resources:** None.
- **Note:** Top Consumers tab → `cnv-settings` (`cluster-settings.spec.ts`). Migrations tab → tier1 (`migrations.spec.ts`). Settings sidebar navigation → `cnv-settings` (`cluster-settings.spec.ts`).

| Step ID | Description                         | Assertions (`expect.soft`)      |
| :------ | :---------------------------------- | :------------------------------ |
| —       | Navigate to Virtualization Overview | `verifyResourceCards` → `true`. |

---

### `004`: InstanceTypes page loaded

- **Objective:** Instance types page loads with `cx1.2xlarge` visible.
- **Test name:** `InstanceTypes page loaded`
- **Shared resources:** None.

| Step ID | Description                                                       | Assertions (`expect.soft`) |
| :------ | :---------------------------------------------------------------- | :------------------------- |
| —       | `navigateToInstanceTypesViaUI`; `verifyPageLoaded('cx1.2xlarge')` | `true`.                    |

---

### `005`: Bootable volumes page loaded

- **Objective:** Bootable volumes page loads; Fedora instance type constant visible; table structure validated (column headers, search filter).
- **Test name:** `Bootable volumes page loaded`
- **Shared resources:** None.

| Step ID | Description                                                                    | Assertions (`expect.soft`)   |
| :------ | :----------------------------------------------------------------------------- | :--------------------------- |
| —       | `navigateToBootableVolumesViaUI`; `verifyPageLoaded(FEDORA)`                   | `true`.                      |
| —       | Verify table column headers: Name, Architecture, Operating system, Description | All expected headers present |
| —       | Verify search filter input is visible                                          | `true`.                      |

---

### `005b`: Bootable volumes name filter clears correctly

- **Objective:** Regression guard for CNV-87321. Filter the Bootable Volumes list by name, confirm filtering works, then clear the filter and confirm all volumes are restored (bug: clearing the filter kept showing only filtered results).
- **Test name:** `ID(CNV-87321) Bootable volumes name filter clears correctly`
- **Shared resources:** None — uses Red Hat provided system bootable volumes (fedora, rhel9).

| Step ID       | Description                                                | Assertions (`expect.soft`)                                                    |
| :------------ | :--------------------------------------------------------- | :---------------------------------------------------------------------------- |
| ID(CNV-87321) | `navigateToBootableVolumesViaUI`; `filterByName('fedora')` | Fedora row visible `true`; RHEL9 row visible `false`.                         |
| ID(CNV-87321) | `filterByName('')` (clear filter)                          | RHEL9 row visible `true` (regression guard); Fedora row still visible `true`. |

- **Note:** This test models the fix scenario. On unpatched CNV 4.22, the second step would fail — RHEL9 would remain hidden after clearing the filter. On CNV 4.23+ (with the fix from PR #3937), the full test passes.

---

### `006`: Migration policies page loaded

- **Objective:** Migration policies list page loads; names from `listMigrationPoliciesWithToken` used for `verifyPageLoaded`.
- **Test name:** `Migration policies page loaded`
- **Shared resources:** None (API read only).

| Step ID | Description                     | Assertions (`expect.soft`) |
| :------ | :------------------------------ | :------------------------- |
| —       | List policies; navigate; verify | `true`.                    |

---

### `007`: CRD Instances pages do not redirect

- **Objective:** For each instancetype/preference CRD list URL, page stays on CRD list (not redirected to `/dashboard`).
- **Test name:** `ID(CNV-81719) CRD Instances pages do not redirect`
- **Shared resources:** None.

| Step ID       | Description                                                                                                                            | Assertions (`expect.soft`)                |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------- |
| ID(CNV-81719) | Loop: `VirtualMachineClusterInstancetype`, `VirtualMachineInstancetype`, `VirtualMachineClusterPreference`, `VirtualMachinePreference` | `verifyCrdPageNotRedirected` each `true`. |

---

### `008`: TreeView nodes have distinguishable icons

- **Objective:** VMs tree (empty projects) after searching test namespace: distinct icon shapes for nodes.
- **Test name:** `ID(CNV-69764) TreeView nodes have distinguishable icons`
- **Shared resources:** None.

| Step ID       | Description                                                                                                                      | Assertions (`expect.soft`) |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------- | :------------------------- |
| ID(CNV-69764) | `navigateToVirtualMachinesWithEmptyProjectsInTree`; `searchTreeView(testNamespace)`; `doTreeViewNodesHaveDistinguishableIcons()` | `true`.                    |

---

### `009`: Filter templates by name

- **Objective:** All projects: filter by RHEL9 metadata name — RHEL9 visible, RHEL8 not; restore all-namespaces templates navigation.
- **Test name:** `ID(CNV-9118) Filter templates by name`
- **Shared resources:** None.

| Step ID      | Description                                                                     | Assertions (`expect.soft`)        |
| :----------- | :------------------------------------------------------------------------------ | :-------------------------------- |
| ID(CNV-9118) | Templates UI; `switchToAllProjects`; filter; `navigateToAllNamespacesTemplates` | RHEL9 visible; RHEL8 not visible. |

---

### `010`: Filter default templates

- **Objective:** Filter by OpenShift-provided templates (type `templates`): RHEL9 visible; non-s390x also WIN10; cleanup navigation.
- **Test name:** `ID(CNV-9118) Filter default templates`
- **Shared resources:** None.

| Step ID      | Description                                   | Assertions (`expect.soft`)                                                    |
| :----------- | :-------------------------------------------- | :---------------------------------------------------------------------------- |
| ID(CNV-9118) | `filterByDefaultTemplates` (type `templates`) | RHEL9 visible; WIN10 visible (non-s390x); `navigateToAllNamespacesTemplates`. |

---

### `011`: Filter templates by OS

- **Objective:** **s390x:** RHEL filter → RHEL9 visible, WIN2K22 not. **Else:** Windows filter → WIN2K22 visible, RHEL9 not. Cleanup navigation.
- **Test name:** `ID(CNV-9118) Filter templates by OS`
- **Shared resources:** None.

| Step ID      | Description             | Assertions (`expect.soft`)                               |
| :----------- | :---------------------- | :------------------------------------------------------- |
| ID(CNV-9118) | `filterByOS` per branch | Assertions per spec; `navigateToAllNamespacesTemplates`. |

---

### `012`: Filter templates by Provider

- **Objective:** Provider “Other” — RHEL9 and WIN10 not visible; cleanup navigation.
- **Test name:** `ID(CNV-9118) Filter templates by Provider`
- **Shared resources:** None.

| Step ID      | Description               | Assertions (`expect.soft`)                            |
| :----------- | :------------------------ | :---------------------------------------------------- |
| ID(CNV-9118) | `filterByProvider(OTHER)` | Both not visible; `navigateToAllNamespacesTemplates`. |

---

### `013`: Filter templates with no boot source

- **Objective:** Filter name Windows; “source available” text absent for templates without auto-bootsource (`verifySourceAvailableTextDoesNotExist`).
- **Test name:** `ID(CNV-8863) Filter templates with no boot source`
- **Shared resources:** None.

| Step ID      | Description                              | Assertions (`expect.soft`)                  |
| :----------- | :--------------------------------------- | :------------------------------------------ |
| ID(CNV-8863) | `filterTemplatesByName(WINDOWS)`; verify | `true`; `navigateToAllNamespacesTemplates`. |

---

### `014`: Filter templates by type and OS

- **Objective:** Filter by OpenShift-provided templates (type `templates`) then by RHEL OS → RHEL9 visible, WIN10 not visible (non-s390x); cleanup navigation. Replaces legacy "boot source" filter test (removed in OCP 4.22).
- **Test name:** `ID(CNV-9118) Filter templates by type and OS`
- **Shared resources:** None.

| Step ID      | Description                                       | Assertions (`expect.soft`)                                                        |
| :----------- | :------------------------------------------------ | :-------------------------------------------------------------------------------- |
| ID(CNV-9118) | `filterByDefaultTemplates` + `filterByOS('rhel')` | RHEL9 visible; WIN10 not visible (non-s390x); `navigateToAllNamespacesTemplates`. |

---

### `017`: TreeView namespace right-click context menu

- **Objective:** Verify that right-clicking a namespace in the tree view opens a context menu with all expected bulk action items (Create VM, Control, Snapshot, Migration, Move to folder, Edit labels, Delete).
- **Test name:** `ID(CNV-83348) TreeView namespace right-click context menu`
- **Shared resources:** None (read-only UI check).

| Step ID       | Description                                                                               | Assertions (`expect.soft`)                                                                                                                                         |
| :------------ | :---------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID(CNV-83348) | Navigate to VM list with tree view; search for test namespace; right-click namespace node | Context menu contains `create-vm`, `control-menu`, `vm-action-snapshot`, `migration-menu`, `vm-action-move-to-folder`, `vm-action-edit-labels`, `vm-action-delete` |

---

### `016`: Preferences not in navigation menu

- **Objective:** Verify that "Preferences" does not appear in the Virtualization sidebar navigation menu (removed per CNV-66348).
- **Test name:** `ID(CNV-66348) Preferences not in navigation menu`
- **Shared resources:** None (read-only UI check).

| Step ID       | Description                           | Assertions (`expect.soft`)                     |
| :------------ | :------------------------------------ | :--------------------------------------------- |
| ID(CNV-66348) | `isSidebarItemVisible('Preferences')` | Returns `false` — Preferences removed from nav |

---

### `018`: Storage MigrationPlans page loaded

- **Objective:** Verify the Storage MigrationPlans page loads via the `Migration > Storage migrations` sidebar navigation, displays the correct heading, shows the empty state when no migration plans exist, and exposes the expected default columns in the column management dialog.
- **Test name:** `ID(CNV-58545) Storage MigrationPlans page loaded`
- **Shared resources:** None (read-only UI check).

| Step ID | Description                                                            | Assertions (`expect.soft`)                                                                            |
| :------ | :--------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| —       | Navigate via sidebar: `Migration > Storage migrations`; verify heading | `verifyStorageMigrationPlansPageLoaded` returns `true`                                                |
| —       | Verify empty state message "No storage migration found"                | `isStorageMigrationEmptyStateVisible` returns `true`                                                  |
| —       | Open column management dialog; read default column names               | Columns include: Name, Namespaces, Storage migration, Target storage class, Status, Migration started |

---

### `019`: VM list and overview empty states

- **Objective:** Verify action-oriented empty states in a namespace with no VMs: (1) VM list tab shows "No virtual machines yet" with guidance and a Create button, (2) header uses a split Create button with "With YAML" dropdown, (3) Overview tab shows a "No data to display yet" info alert and "No data available" in resource allocation widgets, (4) overview alert stretches to full section width (not constrained to 60%).
- **Test name:** `ID(CNV-83128) ID(CNV-83162) ID(CNV-83532) ID(CNV-83804) VM list and overview empty states`
- **Shared resources:** Creates and tracks a dedicated namespace with no VMs.

| Step ID       | Description                                                                                    | Assertions (`expect.soft`)                                                                                                    |
| :------------ | :--------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| ID(CNV-83532) | Navigate to empty namespace VM list tab; check empty state title, body text, and create button | `isNoVMsMessageVisible` true; body contains "Create VirtualMachine" and "right-click"; `isEmptyStateCreateButtonVisible` true |
| ID(CNV-83532) | Verify header Create split-button and dropdown options                                         | `isCreateSplitButtonVisible` true; dropdown contains "With YAML"                                                              |
| ID(CNV-83162) | Click Overview tab; check "No data" alert and empty resource allocation widgets                | `isNoDataAlertVisible` true; `isResourceAllocationNoDataVisible` true                                                         |
| ID(CNV-83804) | Verify overview alert stretches to full section width (not max-width: 60%)                     | `isOverviewAlertFullWidth` true                                                                                               |

---

### `021`: Empty state project hint uses project create permission

- **Objective:** Verify that the "Don't have a project yet?" hint in the VM list empty state is gated on `canCreateProject` (ProjectRequestModel) rather than `canCreateVM`. The test mocks the SelfSubjectAccessReview API for `projectrequests.project.openshift.io` to control the permission and validates that the hint appears when `allowed: true` and disappears when `allowed: false`.
- **Test name:** `ID(CNV-84735) Empty state project hint uses project create permission`
- **Shared resources:** Creates and tracks a dedicated empty namespace.

| Step ID | Description                                                                            | Assertions (`expect.soft`)                                 |
| :------ | :------------------------------------------------------------------------------------- | :--------------------------------------------------------- |
| —       | Mock SSAR for `projectrequests` → `allowed: true`; navigate to empty namespace VM list | `isNoVMsMessageVisible` true; `isProjectHintVisible` true  |
| —       | Mock SSAR for `projectrequests` → `allowed: false`; reload page                        | `isNoVMsMessageVisible` true; `isProjectHintVisible` false |

---

### `020`: Fleet Virtualization hidden without ACM operator

- **Objective:** Verify that the "Fleet Virtualization" perspective option is NOT visible in the perspective switcher when the ACM (Advanced Cluster Management) operator is not installed. Regression test for CNV-85175 where a misspelled flag guard caused the option to always appear.
- **Test name:** `ID(CNV-85175) Fleet Virtualization hidden without ACM operator`
- **Shared resources:** None (read-only UI check).
- **Skip guard:** `test.skip(EnvVariables.onAcm)` — skipped on ACM clusters where the option is expected.

| Step ID       | Description                                                                                             | Assertions (`expect.soft`)                                           |
| :------------ | :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------- |
| —             | Verify ACM operator is not installed: `getManagedClusterNames()` returns empty list                     | `test.skip` if managed clusters found                                |
| ID(CNV-85175) | Navigate to Virtualization overview; open perspective dropdown; check for "Fleet Virtualization" option | `isPerspectiveOptionVisible('Fleet Virtualization')` returns `false` |

---

### `022`: Guided tour and onboarding popovers display conditionally

- **Objective:** Verify the fix for CNV-84432: guided tour and onboarding popovers never appear simultaneously. The test mocks the `kubevirt-user-settings` ConfigMap to simulate four user states: (1) fresh user with tour disabled — popovers should show, (2) tour steps seen that cover the VMsTab popover — popover auto-hidden, (3) welcome modal not yet dismissed — popovers suppressed, (4) all tour steps completed — everything suppressed.
- **Test name:** `ID(CNV-84432) Guided tour and onboarding popovers display conditionally`
- **Shared resources:** None (mock-based, no cluster state changes).

| Step ID       | Description                                                                                            | Assertions (`expect.soft`)                                                                 |
| :------------ | :----------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| ID(CNV-84432) | Mock `guidedTour: false`, no `onboardingPopoversHidden`, `dontShowWelcomeModal: true`; navigate to VMs | Tour NOT visible; VMsTab onboarding popover IS visible with header "Looking for your VMs?" |
| ID(CNV-84432) | Mock `tourStepsSeen: [2, 3]`; navigate to VMs                                                          | Tour NOT visible; VMsTab popover NOT visible (covered by tour steps 2, 3)                  |
| ID(CNV-84432) | Mock `dontShowWelcomeModal: false`; navigate to VMs                                                    | Popovers NOT visible (welcome experience not done)                                         |
| ID(CNV-84432) | Mock all tour steps seen + all popovers hidden; navigate to VMs                                        | Tour NOT visible; popovers NOT visible                                                     |

---

### `023`: Export button is visible and has accessible aria-label

- **Objective:** Verify the CSV export button is visible on the VM list toolbar and has an accessible `aria-label` containing "Export".
- **Spec file:** `tests/gating/scenario-csv-export.spec.ts`
- **Describe:** `CSV export on VM list (gating)` — **Tags:** `@gating`
- **Shared resources:** Ensures at least one VM exists in the test namespace (creates a minimal stopped VM via K8s API if none exist).

| Step | Action                                                    | Expected Result                          |
| :--- | :-------------------------------------------------------- | :--------------------------------------- |
| 1    | Ensure at least one VM exists in test namespace (K8s API) | VM present in namespace                  |
| 2    | Navigate to VM list                                       | VM list page visible                     |
| 3    | Switch to VM list tab                                     | VM list tab active                       |
| 4    | Check export button visibility                            | Export button visible on toolbar         |
| 5    | Check export button aria-label                            | `aria-label` attribute contains "Export" |

---

## 5. Requirements Traceability Matrix

| Jira Ticket                                                        | Test Case ID                      | Coverage Type                           | Status |
| :----------------------------------------------------------------- | :-------------------------------- | :-------------------------------------- | :----- |
| CNV-7507                                                           | `001`                             | `scenario-virtualization-pages.spec.ts` |
| CNV-10371                                                          | `002`                             | `scenario-virtualization-pages.spec.ts` |
| TBD (overview sub-tabs)                                            | `003`                             | `scenario-virtualization-pages.spec.ts` |
| TBD (instance types page)                                          | `004`                             | `scenario-virtualization-pages.spec.ts` |
| TBD (bootable volumes page)                                        | `005`                             | `scenario-virtualization-pages.spec.ts` |
| TBD (migration policies page)                                      | `006`                             | `scenario-virtualization-pages.spec.ts` |
| CNV-81719                                                          | `007`                             | `scenario-virtualization-pages.spec.ts` |
| CNV-69764                                                          | `008`                             | `scenario-virtualization-pages.spec.ts` |
| CNV-9118                                                           | `009`, `010`, `011`, `012`, `014` | `scenario-virtualization-pages.spec.ts` |
| CNV-8863                                                           | `013`                             | `scenario-virtualization-pages.spec.ts` |
| CNV-83348 — Tree view right-click bulk actions                     | `017`                             | `scenario-virtualization-pages.spec.ts` |
| CNV-66348 — Preferences removed from nav                           | `016`                             | `scenario-virtualization-pages.spec.ts` |
| CNV-58545 — Storage MigrationPlans page                            | `018`                             | `scenario-virtualization-pages.spec.ts` |
| CNV-83128 — Empty states refresh                                   | `019`                             | `scenario-virtualization-pages.spec.ts` |
| CNV-83162 — Overview empty/metrics-not-available states            | `019`                             | `scenario-virtualization-pages.spec.ts` |
| CNV-83532 — VM list empty state + split Create button              | `019`                             | `scenario-virtualization-pages.spec.ts` |
| CNV-83804 — Overview alert full-width                              | `019`                             | `scenario-virtualization-pages.spec.ts` |
| CNV-84735 — Empty state project hint permission                    | `021`                             | `scenario-virtualization-pages.spec.ts` |
| CNV-85175 — Fleet Virtualization hidden without ACM                | `020`                             | `scenario-virtualization-pages.spec.ts` |
| CNV-84432 — Guided tour vs onboarding popovers conditional display | `022`                             | `scenario-virtualization-pages.spec.ts` |
| TBD (CSV export)                                                   | `023`                             | `scenario-csv-export.spec.ts`           |

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** **\*\*\*\***\_\_**\*\*\*\***
- **Approval Signature:** **\*\*\*\***\_\_**\*\*\*\***
