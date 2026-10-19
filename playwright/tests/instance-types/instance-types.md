# Software Test Description (STD): Instance Types

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/instance-types/`
- **Feature Area:** Tier1 — Instance types
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-19
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Automated E2E coverage for console routes under `tests/instance-types/`, including cluster and user instance type management and instance type family availability for cluster admins.

### 2.2 Scope

- **In-Scope:**
  - All scenarios in specs under `tests/instance-types/`.
  - Family availability toggles on the Cluster InstanceTypes page, `kubevirt-ui-features` ConfigMap updates, Family status column labels, and hiding disabled families in the VM wizard compute step.
- **Out-of-Scope:**
  - Scenarios documented in other route STD files (for example VM wizard flows outside the compute step).

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift cluster with CNV / KubeVirt; console tests run with cluster-admin privileges where tagged `admin-only`.
- **Configuration:** `kubevirt-ui-features` ConfigMap in the CNV operator namespace exposes `disabledInstanceTypeFamilies` (JSON array of family names such as `u1`).
- **Initial Setup:** Family availability tests read the current disabled-family list before mutation and restore it in a `finally` block after each test. The wizard scenario creates a dedicated test namespace via `setupTestNamespace`.

---

## 4. Test Case Definitions

### Module: `instance-types.spec.ts`

**Spec file:** `tests/instance-types/instance-types.spec.ts`
**Describe:** `InstanceType page` — **Tags:** @tier1-pages-it
**Allure:** suite `InstanceType page`, feature `Tier 1`

---

### `001`: Cluster instance type supports create and deletion

- **Objective:** Cluster instance type supports create and deletion
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-pages-it

| Step | Action                                         | Expected Result                          |
| :--- | :--------------------------------------------- | :--------------------------------------- |
| 1    | Created instance type is visible in the list   | Step completes without assertion failure |
| 2    | Delete via API and verify removal from cluster | Step completes without assertion failure |

---

### `002`: User InstanceTypes tab shows user-created instance types and supports name filter

- **Objective:** User InstanceTypes tab shows user-created instance types and supports name filter
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** See spec `beforeEach` / `beforeAll` hooks when present
- **Tags:** @tier1-pages-it

| Step | Action                                                                                                 | Expected Result                   |
| :--- | :----------------------------------------------------------------------------------------------------- | :-------------------------------- |
| 1    | Run Playwright test: User InstanceTypes tab shows user-created instance types and supports name filter | All expectations in the spec pass |

---

### Module: `instance-type-family-availability.spec.ts`

**Spec file:** `tests/instance-types/instance-type-family-availability.spec.ts`
**Describe:** `Instance type family availability` — **Tags:** @tier1-pages-it, admin-only
**Allure:** suite `Instance type family availability`, feature `Tier 1`

---

### `001`: Cluster admins can manage family availability on the InstanceTypes page

- **Objective:** Verify that cluster admins can disable and re-enable an instance type family from the InstanceTypes page, that changes persist in `kubevirt-ui-features`, and that the Family status column reflects hidden vs shown labels.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-97279
- **Pre-conditions:** Cluster admin session; `u1` family present on the cluster; test starts from the current disabled-family list and restores it after the run.
- **Tags:** @tier1-pages-it, admin-only

| Step | Action                                                                   | Expected Result                                                                 |
| :--- | :----------------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| 1    | Ensure `u1` is not in `disabledInstanceTypeFamilies`, open InstanceTypes | Family availability section is visible; `u1` card is visible after expand       |
| 2    | Disable `u1` via the family availability control                         | ConfigMap poll shows `u1` in disabled families                                  |
| 3    | Filter instance types by `u1.` and read Family status                    | Status label contains `Hidden from selectors`                                   |
| 4    | Re-enable `u1` via the family availability control                       | ConfigMap poll no longer lists `u1`; status label contains `Shown in selectors` |

---

### `002`: Disabled instance type families are hidden in the VM wizard compute step

- **Objective:** Verify that when a family is disabled, its series card is not shown in the VM creation wizard compute step while other series (for example `m`) remain visible after the step loads.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-97279
- **Pre-conditions:** Cluster admin session; dedicated wizard namespace; `u1` disabled before opening the wizard; boot source set to none to avoid `preserveFamily` behavior.
- **Tags:** @tier1-pages-it, admin-only

| Step | Action                                                                          | Expected Result                                         |
| :--- | :------------------------------------------------------------------------------ | :------------------------------------------------------ |
| 1    | Disable `u1` on the InstanceTypes page and confirm ConfigMap lists `u1`         | Disabled family is persisted before wizard navigation   |
| 2    | Open VM wizard in the test namespace, skip boot source, reach compute resources | Compute resources step is visible                       |
| 3    | Wait for the `m` instance type series card                                      | `m` series card becomes visible (step finished loading) |
| 4    | Check visibility of the `u` (General Purpose) series card                       | `u` series card is not visible                          |
