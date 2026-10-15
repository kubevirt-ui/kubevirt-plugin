# Software Test Description (STD): VM Creation Wizard — Location project selection

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — VM creation wizard / Deployment details Location
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-14
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify that from the VM creation wizard **Location** step, the **Project** dropdown can select an
existing namespace and can create a new project via the always-visible **Create project** control
in the menu footer (filter pre-fills the modal name), with the wizard **Location** showing the
chosen or newly created project.

### 2.2 Scope

- **In-Scope:** Virtualization → Virtual Machines → Create VirtualMachine; edit Location; select
  existing project (`setupTestNamespace`); create flow via menu footer **Create project** (spec
  filters a non-existent name to assert no duplicate menu item and to pre-fill the modal); modal
  submit; Location summary and project control; API checks where applicable.
- **Out-of-Scope:** Finishing the wizard or creating a VM; Create project from tree or welcome
  modal; ACM cluster picker in Create project modal; group (folder) selection after project change.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project.
- **Configuration:** User can create projects (`@adminOnly`).
- **Initial Setup:** Existing-project case uses `setupTestNamespace`. Create case uses a generated
  name that must not exist before the test (`namespaceExists` → false). `trackResource` registers
  cleanup for created namespaces.

---

## 4. Test Case Definitions

**Spec file:** `tests/vm-wizard/create-vm-wizard-location-select-project.spec.ts`
**Describe:** `VM Creation Wizard — Location project selection` — **Tags:** `@route-vm-wizard`,
`@tier1`, `@catalog-wizard`, `@adminOnly`
**Allure:** suite `VM Creation Wizard`, feature `Tier 1`

---

### `001`: Select existing project from Location dropdown

- **Objective:** Choosing an existing namespace in the Location project dropdown updates the wizard
  Location display.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-98881 (related)
- **Pre-conditions:** Test namespace created via `setupTestNamespace`
- **Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`

| Step | Action                                                         | Expected Result                                                     |
| :--- | :------------------------------------------------------------- | :------------------------------------------------------------------ |
| 1    | Create test namespace via API                                  | Namespace exists                                                    |
| 2    | Open **Virtualization** → **Virtual Machines** → **Create VM** | Wizard opens on Deployment details; **Location** section is visible |
| 3    | Edit location; open **Project** dropdown; select the namespace | Project control shows the namespace                                 |
| 4    | Read the Location project display                              | Displayed project matches the selected namespace                    |

---

### `002`: Create project from Location dropdown selects the new project in the wizard

- **Objective:** **Create project** in the project dropdown footer creates the namespace and the
  wizard Location shows it as selected.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-98881
- **Pre-conditions:** Generated project name does not exist in the cluster yet
- **Tags:** `@tier1`, `@catalog-wizard`, `@adminOnly`

| Step | Action                                                           | Expected Result                                                          |
| :--- | :--------------------------------------------------------------- | :----------------------------------------------------------------------- |
| 1    | Generate a unique project name; assert it does not exist via API | `namespaceExists` is false                                               |
| 2    | Open **Virtualization** → **Virtual Machines** → **Create VM**   | Wizard opens on Deployment details; **Location** section is visible      |
| 3    | Edit location; open **Project** dropdown; filter by the new name | No matching project menu item; **Create project** footer control is used |
| 4    | Click **Create project**; submit the modal                       | Modal closes; project dropdown shows the new name                        |
| 5    | Read the Location project display                                | Displayed project matches the newly created name                         |
| 6    | Verify the namespace via API                                     | `namespaceExists` is true for the new name                               |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type    | Status    |
| ----------- | ------------ | ---------------- | --------- |
| CNV-98881   | `001`, `002` | Feature coverage | Automated |

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Ido Ben Bassat
- **Approval Signature:** Ido Ben Bassat
