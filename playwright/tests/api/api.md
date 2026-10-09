# Software Test Description (STD): Api

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/api/`
- **Feature Area:** API — contract tests
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-07
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

Automated E2E coverage for console routes under `tests/api/`.

### 2.2 Scope

- **In-Scope:**
  - All scenarios in specs under `tests/api/`.
- **Out-of-Scope:**
  - Scenarios documented in other route STD files.

## 3. Test Environment & Prerequisites

### bootable-volumes-api

### bootable-volumes-crud-api

### create-vm-api

### instance-types-crud-api

### migration-policies-crud-api

### snapshots-crud-api

### storage-migration-plan-crud-api

### templates-crud-api

### vm-crud-api

### vm-detail-api

### vm-folders-api

### vm-list-api

### vm-migration-api

### vm-save-as-template-api

### vm-snapshots-extended-api

### vm-vmi-lifecycle-api

---

## 4. Test Case Definitions

### Module: `bootable-volumes-api.spec.ts`

**Spec file:** `tests/api/bootable-volumes-api.spec.ts`
**Describe:** `Bootable volumes page — API endpoints` — **Tags:** @api
**Allure:** suite `Bootable volumes page — API endpoints`, feature `API`

---

### `001`: GET DataSources (ns-scoped) with default-preference label returns list

- **Objective:** GET DataSources (ns-scoped) with default-preference label returns list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                                      | Expected Result                   |
| :--- | :------------------------------------------------------------------------------------------ | :-------------------------------- |
| 1    | Run Playwright test: GET DataSources (ns-scoped) with default-preference label returns list | All expectations in the spec pass |

---

### `002`: GET DataImportCrons (ns-scoped) returns list

- **Objective:** GET DataImportCrons (ns-scoped) returns list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                            | Expected Result                   |
| :--- | :---------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET DataImportCrons (ns-scoped) returns list | All expectations in the spec pass |

---

### `003`: GET DataVolumes (ns-scoped) returns list

- **Objective:** GET DataVolumes (ns-scoped) returns list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                        | Expected Result                   |
| :--- | :------------------------------------------------------------ | :-------------------------------- |
| 1    | Run Playwright test: GET DataVolumes (ns-scoped) returns list | All expectations in the spec pass |

---

### `004`: GET PersistentVolumeClaims (ns-scoped) returns list

- **Objective:** GET PersistentVolumeClaims (ns-scoped) returns list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                   | Expected Result                   |
| :--- | :----------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET PersistentVolumeClaims (ns-scoped) returns list | All expectations in the spec pass |

---

### `005`: GET VolumeSnapshots (ns-scoped) returns list

- **Objective:** GET VolumeSnapshots (ns-scoped) returns list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                            | Expected Result                   |
| :--- | :---------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET VolumeSnapshots (ns-scoped) returns list | All expectations in the spec pass |

---

### `006`: GET VirtualMachineClusterPreferences returns list

- **Objective:** GET VirtualMachineClusterPreferences returns list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                 | Expected Result                   |
| :--- | :--------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET VirtualMachineClusterPreferences returns list | All expectations in the spec pass |

---

### `007`: GET CDI config singleton is readable

- **Objective:** GET CDI config singleton is readable
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                    | Expected Result                   |
| :--- | :-------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET CDI config singleton is readable | All expectations in the spec pass |

---

---

### Module: `bootable-volumes-crud-api.spec.ts`

**Spec file:** `tests/api/bootable-volumes-crud-api.spec.ts`
**Describe:** `Bootable Volume — DataVolume CRUD API / Bootable Volume — DataSource CRUD API` — **Tags:** @api
**Allure:** suite `Bootable Volume — DataVolume CRUD API / Bootable Volume — DataSource CRUD API`, feature `API`

---

### `001`: READ: GET DataVolume returns correct metadata and instancetype labels

- **Objective:** READ: GET DataVolume returns correct metadata and instancetype labels
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                              | Expected Result                          |
| :--- | :---------------------------------- | :--------------------------------------- |
| 1    | CREATE DataSource via console proxy | Step completes without assertion failure |

---

### `002`: READ: DataVolume appears in namespace list

- **Objective:** READ: DataVolume appears in namespace list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                              | Expected Result                          |
| :--- | :---------------------------------- | :--------------------------------------- |
| 1    | CREATE DataSource via console proxy | Step completes without assertion failure |

---

### `003`: PATCH: add label to DataVolume

- **Objective:** PATCH: add label to DataVolume
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                              | Expected Result                          |
| :--- | :---------------------------------- | :--------------------------------------- |
| 1    | CREATE DataSource via console proxy | Step completes without assertion failure |

---

### `004`: DELETE: remove DataVolume and verify response

- **Objective:** DELETE: remove DataVolume and verify response
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                              | Expected Result                          |
| :--- | :---------------------------------- | :--------------------------------------- |
| 1    | CREATE DataSource via console proxy | Step completes without assertion failure |

---

### `005`: READ: GET DataSource returns correct metadata and instancetype labels

- **Objective:** READ: GET DataSource returns correct metadata and instancetype labels
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                                     | Expected Result                   |
| :--- | :----------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: GET DataSource returns correct metadata and instancetype labels | All expectations in the spec pass |

---

### `006`: READ: DataSource appears in namespace list

- **Objective:** READ: DataSource appears in namespace list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                          | Expected Result                   |
| :--- | :-------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: DataSource appears in namespace list | All expectations in the spec pass |

---

### `007`: READ: DataSource returned by default-preference label filter

- **Objective:** READ: DataSource returned by default-preference label filter
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                            | Expected Result                   |
| :--- | :-------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: DataSource returned by default-preference label filter | All expectations in the spec pass |

---

### `008`: PATCH: update DataSource description annotation

- **Objective:** PATCH: update DataSource description annotation
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                               | Expected Result                   |
| :--- | :------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: PATCH: update DataSource description annotation | All expectations in the spec pass |

---

### `009`: DELETE: remove DataSource and verify response

- **Objective:** DELETE: remove DataSource and verify response
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                             | Expected Result                   |
| :--- | :----------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: DELETE: remove DataSource and verify response | All expectations in the spec pass |

---

---

### Module: `create-vm-api.spec.ts`

**Spec file:** `tests/api/create-vm-api.spec.ts`
**Describe:** `VM Creation — API endpoints` — **Tags:** @api
**Allure:** suite `VM Creation — API endpoints`, feature `API`

---

### `001`: GET VirtualMachineClusterInstanceTypes returns list

- **Objective:** GET VirtualMachineClusterInstanceTypes returns list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                   | Expected Result                   |
| :--- | :----------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET VirtualMachineClusterInstanceTypes returns list | All expectations in the spec pass |

---

### `002`: GET VirtualMachineClusterPreferences returns list

- **Objective:** GET VirtualMachineClusterPreferences returns list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                 | Expected Result                   |
| :--- | :--------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET VirtualMachineClusterPreferences returns list | All expectations in the spec pass |

---

### `003`: GET VirtualMachineInstanceTypes (ns-scoped) returns list

- **Objective:** GET VirtualMachineInstanceTypes (ns-scoped) returns list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                        | Expected Result                   |
| :--- | :---------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET VirtualMachineInstanceTypes (ns-scoped) returns list | All expectations in the spec pass |

---

### `004`: GET VirtualMachinePreferences (ns-scoped) returns list

- **Objective:** GET VirtualMachinePreferences (ns-scoped) returns list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                      | Expected Result                   |
| :--- | :-------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET VirtualMachinePreferences (ns-scoped) returns list | All expectations in the spec pass |

---

### `005`: GET templates with catalog label selector returns TemplateList

- **Objective:** GET templates with catalog label selector returns TemplateList
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                              | Expected Result                   |
| :--- | :---------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET templates with catalog label selector returns TemplateList | All expectations in the spec pass |

---

### `006`: GET DataSources filtered by default-preference label returns list

- **Objective:** GET DataSources filtered by default-preference label returns list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                                 | Expected Result                   |
| :--- | :------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET DataSources filtered by default-preference label returns list | All expectations in the spec pass |

---

### `007`: GET DataImportCrons (cluster-wide) returns list

- **Objective:** GET DataImportCrons (cluster-wide) returns list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                               | Expected Result                   |
| :--- | :------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET DataImportCrons (cluster-wide) returns list | All expectations in the spec pass |

---

### `008`: GET DataVolumes (cluster-wide) returns list

- **Objective:** GET DataVolumes (cluster-wide) returns list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                           | Expected Result                   |
| :--- | :--------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET DataVolumes (cluster-wide) returns list | All expectations in the spec pass |

---

### `009`: GET StorageProfiles returns list

- **Objective:** GET StorageProfiles returns list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                | Expected Result                   |
| :--- | :---------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET StorageProfiles returns list | All expectations in the spec pass |

---

---

### Module: `instance-types-crud-api.spec.ts`

**Spec file:** `tests/api/instance-types-crud-api.spec.ts`
**Describe:** `VirtualMachineInstanceType CRUD — API` — **Tags:** @api
**Allure:** suite `VirtualMachineInstanceType CRUD — API`, feature `API`

---

### `001`: READ: GET instance types in namespace includes created type

- **Objective:** READ: GET instance types in namespace includes created type
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                           | Expected Result                   |
| :--- | :------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: GET instance types in namespace includes created type | All expectations in the spec pass |

---

### `002`: READ: GET cluster instance types list is non-empty

- **Objective:** READ: GET cluster instance types list is non-empty
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                  | Expected Result                   |
| :--- | :---------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: GET cluster instance types list is non-empty | All expectations in the spec pass |

---

### `003`: PATCH: update CPU guest count via JSON Patch

- **Objective:** PATCH: update CPU guest count via JSON Patch
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                            | Expected Result                   |
| :--- | :---------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: PATCH: update CPU guest count via JSON Patch | All expectations in the spec pass |

---

### `004`: DELETE: remove namespaced instance type via API

- **Objective:** DELETE: remove namespaced instance type via API
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                               | Expected Result                   |
| :--- | :------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: DELETE: remove namespaced instance type via API | All expectations in the spec pass |

---

### `005`: DELETE: remove cluster instance type via API

- **Objective:** DELETE: remove cluster instance type via API
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                            | Expected Result                   |
| :--- | :---------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: DELETE: remove cluster instance type via API | All expectations in the spec pass |

---

---

### Module: `migration-policies-crud-api.spec.ts`

**Spec file:** `tests/api/migration-policies-crud-api.spec.ts`
**Describe:** `MigrationPolicy CRUD — API` — **Tags:** @api
**Allure:** suite `MigrationPolicy CRUD — API`, feature `API`

---

### `001`: READ: GET migration policies list includes created policies

- **Objective:** READ: GET migration policies list includes created policies
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                           | Expected Result                   |
| :--- | :------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: GET migration policies list includes created policies | All expectations in the spec pass |

---

### `002`: PATCH: update bandwidthPerMigration via JSON Patch

- **Objective:** PATCH: update bandwidthPerMigration via JSON Patch
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                  | Expected Result                   |
| :--- | :---------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: PATCH: update bandwidthPerMigration via JSON Patch | All expectations in the spec pass |

---

### `003`: CREATE: policy with namespace selector using factory

- **Objective:** CREATE: policy with namespace selector using factory
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                    | Expected Result                   |
| :--- | :------------------------------------------------------------------------ | :-------------------------------- |
| 1    | Run Playwright test: CREATE: policy with namespace selector using factory | All expectations in the spec pass |

---

### `004`: DELETE: remove both policies via API

- **Objective:** DELETE: remove both policies via API
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                    | Expected Result                   |
| :--- | :-------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: DELETE: remove both policies via API | All expectations in the spec pass |

---

---

### Module: `snapshots-crud-api.spec.ts`

**Spec file:** `tests/api/snapshots-crud-api.spec.ts`
**Describe:** `VirtualMachineSnapshot CRUD — API` — **Tags:** @api
**Allure:** suite `VirtualMachineSnapshot CRUD — API`, feature `API`

---

### `001`: READ: snapshot appears in namespace snapshot list

- **Objective:** READ: snapshot appears in namespace snapshot list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                 | Expected Result                   |
| :--- | :--------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: snapshot appears in namespace snapshot list | All expectations in the spec pass |

---

### `002`: DELETE: remove snapshot via API

- **Objective:** DELETE: remove snapshot via API
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                               | Expected Result                   |
| :--- | :--------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: DELETE: remove snapshot via API | All expectations in the spec pass |

---

---

### Module: `storage-migration-plan-crud-api.spec.ts`

**Spec file:** `tests/api/storage-migration-plan-crud-api.spec.ts`
**Describe:** `Storage Migration Plan CRUD — API` — **Tags:** @api
**Allure:** suite `Storage Migration Plan CRUD — API`, feature `API`

---

### `001`: CREATE: multi-namespace storage migration plan

- **Objective:** CREATE: multi-namespace storage migration plan
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                              | Expected Result                   |
| :--- | :------------------------------------------------------------------ | :-------------------------------- |
| 1    | Run Playwright test: CREATE: multi-namespace storage migration plan | All expectations in the spec pass |

---

### `002`: READ: GET single multi-ns plan returns correct spec

- **Objective:** READ: GET single multi-ns plan returns correct spec
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                   | Expected Result                   |
| :--- | :----------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: GET single multi-ns plan returns correct spec | All expectations in the spec pass |

---

### `003`: READ: plan appears in multi-ns listing (UI endpoint)

- **Objective:** READ: plan appears in multi-ns listing (UI endpoint)
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                    | Expected Result                   |
| :--- | :------------------------------------------------------------------------ | :-------------------------------- |
| 1    | Run Playwright test: READ: plan appears in multi-ns listing (UI endpoint) | All expectations in the spec pass |

---

### `004`: READ: auto-created child plan exists in namespaced list

- **Objective:** READ: auto-created child plan exists in namespaced list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                       | Expected Result                   |
| :--- | :--------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: auto-created child plan exists in namespaced list | All expectations in the spec pass |

---

### `005`: DELETE: remove multi-ns plan and verify absence

- **Objective:** DELETE: remove multi-ns plan and verify absence
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                               | Expected Result                   |
| :--- | :------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: DELETE: remove multi-ns plan and verify absence | All expectations in the spec pass |

---

---

### Module: `templates-crud-api.spec.ts`

**Spec file:** `tests/api/templates-crud-api.spec.ts`
**Describe:** `Template — user template lifecycle API / Template — dedicated resources API / Template — clone API / Template — Red Hat templates read-only API` — **Tags:** @api
**Allure:** suite `Template — user template lifecycle API / Template — dedicated resources API / Template — clone API / Template — Red Hat templates read-only API`, feature `API`

---

### `001`: READ: GET single template returns correct spec

- **Objective:** READ: GET single template returns correct spec
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                       | Expected Result                          |
| :--- | :------------------------------------------- | :--------------------------------------- |
| 1    | CREATE dedicated-resources template          | Step completes without assertion failure |
| 2    | CREATE source template                       | Step completes without assertion failure |
| 3    | CLONE: GET source and re-POST under new name | Step completes without assertion failure |

---

### `002`: READ: template appears in namespace list

- **Objective:** READ: template appears in namespace list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                       | Expected Result                          |
| :--- | :------------------------------------------- | :--------------------------------------- |
| 1    | CREATE dedicated-resources template          | Step completes without assertion failure |
| 2    | CREATE source template                       | Step completes without assertion failure |
| 3    | CLONE: GET source and re-POST under new name | Step completes without assertion failure |

---

### `003`: READ: template returned by kubevirt type label filter

- **Objective:** READ: template returned by kubevirt type label filter
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                       | Expected Result                          |
| :--- | :------------------------------------------- | :--------------------------------------- |
| 1    | CREATE dedicated-resources template          | Step completes without assertion failure |
| 2    | CREATE source template                       | Step completes without assertion failure |
| 3    | CLONE: GET source and re-POST under new name | Step completes without assertion failure |

---

### `004`: READ: template has NAME and CLOUD_USER_PASSWORD parameters

- **Objective:** READ: template has NAME and CLOUD_USER_PASSWORD parameters
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                       | Expected Result                          |
| :--- | :------------------------------------------- | :--------------------------------------- |
| 1    | CREATE dedicated-resources template          | Step completes without assertion failure |
| 2    | CREATE source template                       | Step completes without assertion failure |
| 3    | CLONE: GET source and re-POST under new name | Step completes without assertion failure |

---

### `005`: READ: template objects array contains a VirtualMachine

- **Objective:** READ: template objects array contains a VirtualMachine
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                       | Expected Result                          |
| :--- | :------------------------------------------- | :--------------------------------------- |
| 1    | CREATE dedicated-resources template          | Step completes without assertion failure |
| 2    | CREATE source template                       | Step completes without assertion failure |
| 3    | CLONE: GET source and re-POST under new name | Step completes without assertion failure |

---

### `006`: PATCH: update cpu.cores via JSON Patch

- **Objective:** PATCH: update cpu.cores via JSON Patch
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                       | Expected Result                          |
| :--- | :------------------------------------------- | :--------------------------------------- |
| 1    | CREATE dedicated-resources template          | Step completes without assertion failure |
| 2    | CREATE source template                       | Step completes without assertion failure |
| 3    | CLONE: GET source and re-POST under new name | Step completes without assertion failure |

---

### `007`: PATCH: update memory via JSON Patch

- **Objective:** PATCH: update memory via JSON Patch
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                       | Expected Result                          |
| :--- | :------------------------------------------- | :--------------------------------------- |
| 1    | CREATE dedicated-resources template          | Step completes without assertion failure |
| 2    | CREATE source template                       | Step completes without assertion failure |
| 3    | CLONE: GET source and re-POST under new name | Step completes without assertion failure |

---

### `008`: PATCH: add custom label to template metadata

- **Objective:** PATCH: add custom label to template metadata
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                       | Expected Result                          |
| :--- | :------------------------------------------- | :--------------------------------------- |
| 1    | CREATE dedicated-resources template          | Step completes without assertion failure |
| 2    | CREATE source template                       | Step completes without assertion failure |
| 3    | CLONE: GET source and re-POST under new name | Step completes without assertion failure |

---

### `009`: DELETE: remove template and confirm it leaves the list

- **Objective:** DELETE: remove template and confirm it leaves the list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                       | Expected Result                          |
| :--- | :------------------------------------------- | :--------------------------------------- |
| 1    | CREATE dedicated-resources template          | Step completes without assertion failure |
| 2    | CREATE source template                       | Step completes without assertion failure |
| 3    | CLONE: GET source and re-POST under new name | Step completes without assertion failure |

---

### `010`: READ: template has highperformance workload label

- **Objective:** READ: template has highperformance workload label
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                       | Expected Result                          |
| :--- | :------------------------------------------- | :--------------------------------------- |
| 1    | CREATE source template                       | Step completes without assertion failure |
| 2    | CLONE: GET source and re-POST under new name | Step completes without assertion failure |

---

### `011`: READ: nested VM has dedicatedCpuPlacement=true

- **Objective:** READ: nested VM has dedicatedCpuPlacement=true
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                       | Expected Result                          |
| :--- | :------------------------------------------- | :--------------------------------------- |
| 1    | CREATE source template                       | Step completes without assertion failure |
| 2    | CLONE: GET source and re-POST under new name | Step completes without assertion failure |

---

### `012`: READ: nested VM has LiveMigrate eviction strategy

- **Objective:** READ: nested VM has LiveMigrate eviction strategy
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                       | Expected Result                          |
| :--- | :------------------------------------------- | :--------------------------------------- |
| 1    | CREATE source template                       | Step completes without assertion failure |
| 2    | CLONE: GET source and re-POST under new name | Step completes without assertion failure |

---

### `013`: READ: clone exists in namespace list

- **Objective:** READ: clone exists in namespace list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                    | Expected Result                   |
| :--- | :-------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: clone exists in namespace list | All expectations in the spec pass |

---

### `014`: READ: clone has same CPU and memory spec as source

- **Objective:** READ: clone has same CPU and memory spec as source
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                  | Expected Result                   |
| :--- | :---------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: clone has same CPU and memory spec as source | All expectations in the spec pass |

---

### `015`: GET: openshift namespace has VM templates

- **Objective:** GET: openshift namespace has VM templates
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                         | Expected Result                   |
| :--- | :------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET: openshift namespace has VM templates | All expectations in the spec pass |

---

### `016`: GET: RHEL9 template exists and has expected structure

- **Objective:** GET: RHEL9 template exists and has expected structure
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                     | Expected Result                   |
| :--- | :------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET: RHEL9 template exists and has expected structure | All expectations in the spec pass |

---

### `017`: GET: RHEL9 template has os and type labels

- **Objective:** GET: RHEL9 template has os and type labels
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                          | Expected Result                   |
| :--- | :-------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET: RHEL9 template has os and type labels | All expectations in the spec pass |

---

### `018`: GET: template list returns all-namespaces results when namespace omitted

- **Objective:** GET: template list returns all-namespaces results when namespace omitted
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                                        | Expected Result                   |
| :--- | :-------------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET: template list returns all-namespaces results when namespace omitted | All expectations in the spec pass |

---

---

### Module: `vm-crud-api.spec.ts`

**Spec file:** `tests/api/vm-crud-api.spec.ts`
**Describe:** `VirtualMachine CRUD — API` — **Tags:** @api
**Allure:** suite `VirtualMachine CRUD — API`, feature `API`

---

### `001`: READ: GET single VirtualMachine returns the created VM

- **Objective:** READ: GET single VirtualMachine returns the created VM
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                      | Expected Result                   |
| :--- | :-------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: GET single VirtualMachine returns the created VM | All expectations in the spec pass |

---

### `002`: PATCH: update CPU cores via JSON Patch

- **Objective:** PATCH: update CPU cores via JSON Patch
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                      | Expected Result                   |
| :--- | :---------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: PATCH: update CPU cores via JSON Patch | All expectations in the spec pass |

---

### `003`: PATCH: update memory via JSON Patch

- **Objective:** PATCH: update memory via JSON Patch
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                   | Expected Result                   |
| :--- | :------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: PATCH: update memory via JSON Patch | All expectations in the spec pass |

---

### `004`: DELETE: remove VirtualMachine and wait for deletion

- **Objective:** DELETE: remove VirtualMachine and wait for deletion
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                   | Expected Result                   |
| :--- | :----------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: DELETE: remove VirtualMachine and wait for deletion | All expectations in the spec pass |

---

---

### Module: `vm-detail-api.spec.ts`

**Spec file:** `tests/api/vm-detail-api.spec.ts`
**Describe:** `VM detail page — API endpoints` — **Tags:** @api
**Allure:** suite `VM detail page — API endpoints`, feature `API`

---

### `001`: GET VirtualMachines (ns-scoped) returns list

- **Objective:** GET VirtualMachines (ns-scoped) returns list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                            | Expected Result                   |
| :--- | :---------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET VirtualMachines (ns-scoped) returns list | All expectations in the spec pass |

---

### `002`: GET single VirtualMachine returns correct object

- **Objective:** GET single VirtualMachine returns correct object
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                | Expected Result                   |
| :--- | :-------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET single VirtualMachine returns correct object | All expectations in the spec pass |

---

### `003`: GET VirtualMachineInstanceMigrations filtered by VM name returns list

- **Objective:** GET VirtualMachineInstanceMigrations filtered by VM name returns list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                                     | Expected Result                   |
| :--- | :----------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET VirtualMachineInstanceMigrations filtered by VM name returns list | All expectations in the spec pass |

---

### `004`: GET VirtualMachineSnapshots (ns-scoped) returns list

- **Objective:** GET VirtualMachineSnapshots (ns-scoped) returns list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                    | Expected Result                   |
| :--- | :------------------------------------------------------------------------ | :-------------------------------- |
| 1    | Run Playwright test: GET VirtualMachineSnapshots (ns-scoped) returns list | All expectations in the spec pass |

---

### `005`: GET VirtualMachineRestores (ns-scoped) returns list

- **Objective:** GET VirtualMachineRestores (ns-scoped) returns list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                   | Expected Result                   |
| :--- | :----------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET VirtualMachineRestores (ns-scoped) returns list | All expectations in the spec pass |

---

### `006`: GET NetworkAttachmentDefinitions (ns-scoped) returns list

- **Objective:** GET NetworkAttachmentDefinitions (ns-scoped) returns list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                         | Expected Result                   |
| :--- | :----------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET NetworkAttachmentDefinitions (ns-scoped) returns list | All expectations in the spec pass |

---

### `007`: GET CDI config singleton is readable

- **Objective:** GET CDI config singleton is readable
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                    | Expected Result                   |
| :--- | :-------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET CDI config singleton is readable | All expectations in the spec pass |

---

### `008`: GET storage migration plans (ns-scoped) returns list

- **Objective:** GET storage migration plans (ns-scoped) returns list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                    | Expected Result                   |
| :--- | :------------------------------------------------------------------------ | :-------------------------------- |
| 1    | Run Playwright test: GET storage migration plans (ns-scoped) returns list | All expectations in the spec pass |

---

---

### Module: `vm-folders-api.spec.ts`

**Spec file:** `tests/api/vm-folders-api.spec.ts`
**Describe:** `VM folders — single folder CRUD API / VM folders — multi-folder bulk operations API` — **Tags:** @api
**Allure:** suite `VM folders — single folder CRUD API / VM folders — multi-folder bulk operations API`, feature `API`

---

### `001`: READ: both VMs appear when listing by folder label

- **Objective:** READ: both VMs appear when listing by folder label
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                         | Expected Result                          |
| :--- | :----------------------------- | :--------------------------------------- |
| 1    | CREATE ${vmNames[i]} in folder | Step completes without assertion failure |

---

### `002`: PATCH: move VM1 to a new folder (mirrors folder rename/move in UI)

- **Objective:** PATCH: move VM1 to a new folder (mirrors folder rename/move in UI)
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                         | Expected Result                          |
| :--- | :----------------------------- | :--------------------------------------- |
| 1    | CREATE ${vmNames[i]} in folder | Step completes without assertion failure |

---

### `003`: READ: VM1 no longer in folder A after move

- **Objective:** READ: VM1 no longer in folder A after move
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                         | Expected Result                          |
| :--- | :----------------------------- | :--------------------------------------- |
| 1    | CREATE ${vmNames[i]} in folder | Step completes without assertion failure |

---

### `004`: READ: VM2 still in folder A after VM1 move

- **Objective:** READ: VM2 still in folder A after VM1 move
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                         | Expected Result                          |
| :--- | :----------------------------- | :--------------------------------------- |
| 1    | CREATE ${vmNames[i]} in folder | Step completes without assertion failure |

---

### `005`: READ: VM1 now in folder B

- **Objective:** READ: VM1 now in folder B
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                         | Expected Result                          |
| :--- | :----------------------------- | :--------------------------------------- |
| 1    | CREATE ${vmNames[i]} in folder | Step completes without assertion failure |

---

### `006`: PATCH: remove folder label from VM2 (mirrors

- **Objective:** PATCH: remove folder label from VM2 (mirrors
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                            | Expected Result                   |
| :--- | :---------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: PATCH: remove folder label from VM2 (mirrors | All expectations in the spec pass |

---

### `007`: READ: folder A is now empty (mirrors

- **Objective:** READ: folder A is now empty (mirrors
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                    | Expected Result                   |
| :--- | :-------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: folder A is now empty (mirrors | All expectations in the spec pass |

---

### `008`: READ: folder X has 2 VMs, folder Y has 1 VM

- **Objective:** READ: folder X has 2 VMs, folder Y has 1 VM
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                           | Expected Result                   |
| :--- | :--------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: folder X has 2 VMs, folder Y has 1 VM | All expectations in the spec pass |

---

### `009`: PATCH: bulk-move folder-X VMs to folder-Y (mirrors bulk folder action)

- **Objective:** PATCH: bulk-move folder-X VMs to folder-Y (mirrors bulk folder action)
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                                      | Expected Result                   |
| :--- | :------------------------------------------------------------------------------------------ | :-------------------------------- |
| 1    | Run Playwright test: PATCH: bulk-move folder-X VMs to folder-Y (mirrors bulk folder action) | All expectations in the spec pass |

---

### `010`: READ: folder X is empty after bulk move

- **Objective:** READ: folder X is empty after bulk move
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                       | Expected Result                   |
| :--- | :----------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: folder X is empty after bulk move | All expectations in the spec pass |

---

### `011`: READ: folder Y has all 3 VMs after bulk move

- **Objective:** READ: folder Y has all 3 VMs after bulk move
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                            | Expected Result                   |
| :--- | :---------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: folder Y has all 3 VMs after bulk move | All expectations in the spec pass |

---

---

### Module: `vm-list-api.spec.ts`

**Spec file:** `tests/api/vm-list-api.spec.ts`
**Describe:** `VirtualMachines list page — API endpoints` — **Tags:** @api
**Allure:** suite `VirtualMachines list page — API endpoints`, feature `API`

---

### `001`: GET virtualmachines (cluster-wide) returns VirtualMachineList

- **Objective:** GET virtualmachines (cluster-wide) returns VirtualMachineList
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                             | Expected Result                   |
| :--- | :--------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET virtualmachines (cluster-wide) returns VirtualMachineList | All expectations in the spec pass |

---

### `002`: GET virtualmachineinstances (cluster-wide) returns VirtualMachineInstanceList

- **Objective:** GET virtualmachineinstances (cluster-wide) returns VirtualMachineInstanceList
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                                             | Expected Result                   |
| :--- | :------------------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET virtualmachineinstances (cluster-wide) returns VirtualMachineInstanceList | All expectations in the spec pass |

---

### `003`: GET virtualmachineinstancemigrations (cluster-wide) returns VirtualMachineInstanceMigrationList

- **Objective:** GET virtualmachineinstancemigrations (cluster-wide) returns VirtualMachineInstanceMigrationList
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                                                               | Expected Result                   |
| :--- | :------------------------------------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET virtualmachineinstancemigrations (cluster-wide) returns VirtualMachineInstanceMigrationList | All expectations in the spec pass |

---

### `004`: GET hyperconvergeds returns HyperConvergedList with at least one item

- **Objective:** GET hyperconvergeds returns HyperConvergedList with at least one item
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                                     | Expected Result                   |
| :--- | :----------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET hyperconvergeds returns HyperConvergedList with at least one item | All expectations in the spec pass |

---

### `005`: GET kubevirt CR returns KubeVirt object

- **Objective:** GET kubevirt CR returns KubeVirt object
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                       | Expected Result                   |
| :--- | :----------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET kubevirt CR returns KubeVirt object | All expectations in the spec pass |

---

### `006`: GET kubevirt-ui-features configmap is readable

- **Objective:** GET kubevirt-ui-features configmap is readable
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                              | Expected Result                   |
| :--- | :------------------------------------------------------------------ | :-------------------------------- |
| 1    | Run Playwright test: GET kubevirt-ui-features configmap is readable | All expectations in the spec pass |

---

### `007`: GET kubevirt-user-settings configmap is readable

- **Objective:** GET kubevirt-user-settings configmap is readable
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                | Expected Result                   |
| :--- | :-------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET kubevirt-user-settings configmap is readable | All expectations in the spec pass |

---

### `008`: GET migration policies returns MigrationPolicyList

- **Objective:** GET migration policies returns MigrationPolicyList
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                  | Expected Result                   |
| :--- | :---------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET migration policies returns MigrationPolicyList | All expectations in the spec pass |

---

### `009`: GET storage migration plans (cluster-wide) returns MultiNamespaceVirtualMachineStorageMigrationPlanList

- **Objective:** GET storage migration plans (cluster-wide) returns MultiNamespaceVirtualMachineStorageMigrationPlanList
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                                                                       | Expected Result                   |
| :--- | :--------------------------------------------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET storage migration plans (cluster-wide) returns MultiNamespaceVirtualMachineStorageMigrationPlanList | All expectations in the spec pass |

---

### `010`: GET templates with kubevirt label selector returns TemplateList

- **Objective:** GET templates with kubevirt label selector returns TemplateList
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                               | Expected Result                   |
| :--- | :----------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET templates with kubevirt label selector returns TemplateList | All expectations in the spec pass |

---

### `011`: GET plugin health endpoint returns 200

- **Objective:** GET plugin health endpoint returns 200
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                      | Expected Result                   |
| :--- | :---------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: GET plugin health endpoint returns 200 | All expectations in the spec pass |

---

---

### Module: `vm-migration-api.spec.ts`

**Spec file:** `tests/api/vm-migration-api.spec.ts`
**Describe:** `VirtualMachineInstanceMigration — API` — **Tags:** @api
**Allure:** suite `VirtualMachineInstanceMigration — API`, feature `API`

---

### `001`: CREATE: trigger compute migration via VMIM resource

- **Objective:** CREATE: trigger compute migration via VMIM resource
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                   | Expected Result                   |
| :--- | :----------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: CREATE: trigger compute migration via VMIM resource | All expectations in the spec pass |

---

### `002`: READ: GET single VMIM returns correct spec

- **Objective:** READ: GET single VMIM returns correct spec
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                          | Expected Result                   |
| :--- | :-------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: GET single VMIM returns correct spec | All expectations in the spec pass |

---

### `003`: READ: VMIM appears in namespace migration list

- **Objective:** READ: VMIM appears in namespace migration list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                              | Expected Result                   |
| :--- | :------------------------------------------------------------------ | :-------------------------------- |
| 1    | Run Playwright test: READ: VMIM appears in namespace migration list | All expectations in the spec pass |

---

### `004`: READ: VMIM list filtered by vmiName label selector

- **Objective:** READ: VMIM list filtered by vmiName label selector
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                  | Expected Result                   |
| :--- | :---------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: VMIM list filtered by vmiName label selector | All expectations in the spec pass |

---

### `005`: DELETE: cancel in-progress migration and verify removal

- **Objective:** DELETE: cancel in-progress migration and verify removal
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                       | Expected Result                   |
| :--- | :--------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: DELETE: cancel in-progress migration and verify removal | All expectations in the spec pass |

---

---

### Module: `vm-save-as-template-api.spec.ts`

**Spec file:** `tests/api/vm-save-as-template-api.spec.ts`
**Describe:** `VM save-as-template — spec parity API / VM save-as-template — label propagation API` — **Tags:** @api
**Allure:** suite `VM save-as-template — spec parity API / VM save-as-template — label propagation API`, feature `API`

---

### `001`: READ: template exists and wraps a VirtualMachine object

- **Objective:** READ: template exists and wraps a VirtualMachine object
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                       | Expected Result                          |
| :--- | :------------------------------------------- | :--------------------------------------- |
| 1    | CREATE source VM with OS and workload labels | Step completes without assertion failure |
| 2    | WAIT: VM exists                              | Step completes without assertion failure |
| 3    | GET VM + build template + POST               | Step completes without assertion failure |

---

### `002`: READ: template CPU cores match source VM

- **Objective:** READ: template CPU cores match source VM
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                       | Expected Result                          |
| :--- | :------------------------------------------- | :--------------------------------------- |
| 1    | CREATE source VM with OS and workload labels | Step completes without assertion failure |
| 2    | WAIT: VM exists                              | Step completes without assertion failure |
| 3    | GET VM + build template + POST               | Step completes without assertion failure |

---

### `003`: READ: template memory matches source VM

- **Objective:** READ: template memory matches source VM
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                       | Expected Result                          |
| :--- | :------------------------------------------- | :--------------------------------------- |
| 1    | CREATE source VM with OS and workload labels | Step completes without assertion failure |
| 2    | WAIT: VM exists                              | Step completes without assertion failure |
| 3    | GET VM + build template + POST               | Step completes without assertion failure |

---

### `004`: READ: template disk list matches source VM volumes

- **Objective:** READ: template disk list matches source VM volumes
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                       | Expected Result                          |
| :--- | :------------------------------------------- | :--------------------------------------- |
| 1    | CREATE source VM with OS and workload labels | Step completes without assertion failure |
| 2    | WAIT: VM exists                              | Step completes without assertion failure |
| 3    | GET VM + build template + POST               | Step completes without assertion failure |

---

### `005`: READ: template has NAME parameter

- **Objective:** READ: template has NAME parameter
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                       | Expected Result                          |
| :--- | :------------------------------------------- | :--------------------------------------- |
| 1    | CREATE source VM with OS and workload labels | Step completes without assertion failure |
| 2    | WAIT: VM exists                              | Step completes without assertion failure |
| 3    | GET VM + build template + POST               | Step completes without assertion failure |

---

### `006`: DELETE: remove saved template and confirm it leaves the list

- **Objective:** DELETE: remove saved template and confirm it leaves the list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                       | Expected Result                          |
| :--- | :------------------------------------------- | :--------------------------------------- |
| 1    | CREATE source VM with OS and workload labels | Step completes without assertion failure |
| 2    | WAIT: VM exists                              | Step completes without assertion failure |
| 3    | GET VM + build template + POST               | Step completes without assertion failure |

---

### `007`: READ: saved template has os.template.kubevirt.io/\* label

- **Objective:** READ: saved template has os.template.kubevirt.io/\* label
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                         | Expected Result                   |
| :--- | :----------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: saved template has os.template.kubevirt.io/\* label | All expectations in the spec pass |

---

### `008`: READ: saved template has workload.template.kubevirt.io/\* label

- **Objective:** READ: saved template has workload.template.kubevirt.io/\* label
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                               | Expected Result                   |
| :--- | :----------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: saved template has workload.template.kubevirt.io/\* label | All expectations in the spec pass |

---

---

### Module: `vm-snapshots-extended-api.spec.ts`

**Spec file:** `tests/api/vm-snapshots-extended-api.spec.ts`
**Describe:** `VirtualMachineSnapshot — full lifecycle API / VirtualMachineSnapshot — metadata API` — **Tags:** @api
**Allure:** suite `VirtualMachineSnapshot — full lifecycle API / VirtualMachineSnapshot — metadata API`, feature `API`

---

### `001`: READ: GET single snapshot returns correct spec

- **Objective:** READ: GET single snapshot returns correct spec
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                    | Expected Result                          |
| :--- | :------------------------ | :--------------------------------------- |
| 1    | CREATE VM                 | Step completes without assertion failure |
| 2    | WAIT: VM exists           | Step completes without assertion failure |
| 3    | CREATE snapshot           | Step completes without assertion failure |
| 4    | WAIT: snapshot readyToUse | Step completes without assertion failure |

---

### `002`: READ: snapshot appears in namespace list

- **Objective:** READ: snapshot appears in namespace list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                    | Expected Result                          |
| :--- | :------------------------ | :--------------------------------------- |
| 1    | CREATE VM                 | Step completes without assertion failure |
| 2    | WAIT: VM exists           | Step completes without assertion failure |
| 3    | CREATE snapshot           | Step completes without assertion failure |
| 4    | WAIT: snapshot readyToUse | Step completes without assertion failure |

---

### `003`: PATCH: add label to snapshot metadata via merge-patch

- **Objective:** PATCH: add label to snapshot metadata via merge-patch
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                    | Expected Result                          |
| :--- | :------------------------ | :--------------------------------------- |
| 1    | CREATE VM                 | Step completes without assertion failure |
| 2    | WAIT: VM exists           | Step completes without assertion failure |
| 3    | CREATE snapshot           | Step completes without assertion failure |
| 4    | WAIT: snapshot readyToUse | Step completes without assertion failure |

---

### `004`: CREATE restore: restore VM from snapshot

- **Objective:** CREATE restore: restore VM from snapshot
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                    | Expected Result                          |
| :--- | :------------------------ | :--------------------------------------- |
| 1    | CREATE VM                 | Step completes without assertion failure |
| 2    | WAIT: VM exists           | Step completes without assertion failure |
| 3    | CREATE snapshot           | Step completes without assertion failure |
| 4    | WAIT: snapshot readyToUse | Step completes without assertion failure |

---

### `005`: WAIT + READ: restore completes and GET single returns correct state

- **Objective:** WAIT + READ: restore completes and GET single returns correct state
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                    | Expected Result                          |
| :--- | :------------------------ | :--------------------------------------- |
| 1    | CREATE VM                 | Step completes without assertion failure |
| 2    | WAIT: VM exists           | Step completes without assertion failure |
| 3    | CREATE snapshot           | Step completes without assertion failure |
| 4    | WAIT: snapshot readyToUse | Step completes without assertion failure |

---

### `006`: READ: restore appears in namespace restore list

- **Objective:** READ: restore appears in namespace restore list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                    | Expected Result                          |
| :--- | :------------------------ | :--------------------------------------- |
| 1    | CREATE VM                 | Step completes without assertion failure |
| 2    | WAIT: VM exists           | Step completes without assertion failure |
| 3    | CREATE snapshot           | Step completes without assertion failure |
| 4    | WAIT: snapshot readyToUse | Step completes without assertion failure |

---

### `007`: DELETE restore: remove restore and confirm it leaves the list

- **Objective:** DELETE restore: remove restore and confirm it leaves the list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                    | Expected Result                          |
| :--- | :------------------------ | :--------------------------------------- |
| 1    | CREATE VM                 | Step completes without assertion failure |
| 2    | WAIT: VM exists           | Step completes without assertion failure |
| 3    | CREATE snapshot           | Step completes without assertion failure |
| 4    | WAIT: snapshot readyToUse | Step completes without assertion failure |

---

### `008`: DELETE snapshot: remove snapshot and confirm it leaves the list

- **Objective:** DELETE snapshot: remove snapshot and confirm it leaves the list
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                    | Expected Result                          |
| :--- | :------------------------ | :--------------------------------------- |
| 1    | CREATE VM                 | Step completes without assertion failure |
| 2    | WAIT: VM exists           | Step completes without assertion failure |
| 3    | CREATE snapshot           | Step completes without assertion failure |
| 4    | WAIT: snapshot readyToUse | Step completes without assertion failure |

---

### `009`: READ: snapshot spec references correct VM

- **Objective:** READ: snapshot spec references correct VM
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                         | Expected Result                   |
| :--- | :------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: snapshot spec references correct VM | All expectations in the spec pass |

---

### `010`: READ: snapshot status has readyToUse and creationTime

- **Objective:** READ: snapshot status has readyToUse and creationTime
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                     | Expected Result                   |
| :--- | :------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: snapshot status has readyToUse and creationTime | All expectations in the spec pass |

---

---

### Module: `vm-vmi-lifecycle-api.spec.ts`

**Spec file:** `tests/api/vm-vmi-lifecycle-api.spec.ts`
**Describe:** `VirtualMachine and VMI lifecycle — API` — **Tags:** @api
**Allure:** suite `VirtualMachine and VMI lifecycle — API`, feature `API`

---

### `001`: READ: GET VM returns correct initial spec

- **Objective:** READ: GET VM returns correct initial spec
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                         | Expected Result                   |
| :--- | :------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ: GET VM returns correct initial spec | All expectations in the spec pass |

---

### `002`: PATCH: add label to VM while halted

- **Objective:** PATCH: add label to VM while halted
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                   | Expected Result                   |
| :--- | :------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: PATCH: add label to VM while halted | All expectations in the spec pass |

---

### `003`: PATCH: update CPU cores while halted

- **Objective:** PATCH: update CPU cores while halted
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                    | Expected Result                   |
| :--- | :-------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: PATCH: update CPU cores while halted | All expectations in the spec pass |

---

### `004`: START: call start subresource and wait for Running

- **Objective:** START: call start subresource and wait for Running
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                  | Expected Result                   |
| :--- | :---------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: START: call start subresource and wait for Running | All expectations in the spec pass |

---

### `005`: READ VMI: exists in namespace after start

- **Objective:** READ VMI: exists in namespace after start
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                         | Expected Result                   |
| :--- | :------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ VMI: exists in namespace after start | All expectations in the spec pass |

---

### `006`: READ VMI: GET single VMI returns Running phase

- **Objective:** READ VMI: GET single VMI returns Running phase
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                              | Expected Result                   |
| :--- | :------------------------------------------------------------------ | :-------------------------------- |
| 1    | Run Playwright test: READ VMI: GET single VMI returns Running phase | All expectations in the spec pass |

---

### `007`: READ VMI: has owner reference pointing to VM

- **Objective:** READ VMI: has owner reference pointing to VM
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                            | Expected Result                   |
| :--- | :---------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ VMI: has owner reference pointing to VM | All expectations in the spec pass |

---

### `008`: READ VMI: inherits CPU cores patched on VM

- **Objective:** READ VMI: inherits CPU cores patched on VM
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                          | Expected Result                   |
| :--- | :-------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ VMI: inherits CPU cores patched on VM | All expectations in the spec pass |

---

### `009`: PATCH: update VM annotation while running

- **Objective:** PATCH: update VM annotation while running
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                         | Expected Result                   |
| :--- | :------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: PATCH: update VM annotation while running | All expectations in the spec pass |

---

### `010`: RESTART: call restart subresource and wait for Running again

- **Objective:** RESTART: call restart subresource and wait for Running again
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                                            | Expected Result                   |
| :--- | :-------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: RESTART: call restart subresource and wait for Running again | All expectations in the spec pass |

---

### `011`: READ VMI: still Running after restart

- **Objective:** READ VMI: still Running after restart
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                     | Expected Result                   |
| :--- | :--------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: READ VMI: still Running after restart | All expectations in the spec pass |

---

### `012`: STOP: stop VM and confirm VMI is removed

- **Objective:** STOP: stop VM and confirm VMI is removed
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                        | Expected Result                   |
| :--- | :------------------------------------------------------------ | :-------------------------------- |
| 1    | Run Playwright test: STOP: stop VM and confirm VMI is removed | All expectations in the spec pass |

---

### `013`: STOP: VM status shows Halted after stop

- **Objective:** STOP: VM status shows Halted after stop
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                       | Expected Result                   |
| :--- | :----------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: STOP: VM status shows Halted after stop | All expectations in the spec pass |

---

### `014`: DELETE: remove VM via API and wait for deletion

- **Objective:** DELETE: remove VM via API and wait for deletion
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @api

| Step | Action                                                               | Expected Result                   |
| :--- | :------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: DELETE: remove VM via API and wait for deletion | All expectations in the spec pass |
