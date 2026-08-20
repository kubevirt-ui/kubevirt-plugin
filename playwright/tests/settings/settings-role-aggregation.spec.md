# Software Test Description (STD): Role Aggregation Settings

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Gating — Settings
- **Latest version:** CNV 5.0.0
- **Latest update:** 2026-08-20
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify the end-to-end UI workflow for toggling KubeVirt RBAC role aggregation on and off by cluster admins.
This covers the Settings feature area at the **Gating** tier: the Preview Features gate that controls visibility of the grant toggle, the Cluster-tab toggle itself, and the resulting changes to the HyperConverged CR and ClusterRole aggregate labels.

### 2.2 Scope

- **In-Scope:** Preview Features toggle ("Control default Virtualization permissions"), Cluster-tab "Automatically grant Virtualization roles" toggle, HyperConverged CR `spec.roleAggregationStrategy` mutations, ClusterRole aggregate label presence/absence
- **Out-of-Scope:** Non-admin user flows, direct API manipulation without the UI, migration policy interactions with role aggregation

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift cluster with CNV operator installed (OCP 4.23+)
- **Configuration:** HyperConverged CR (`kubevirt-hyperconverged`) must exist in the CNV namespace; HCO API version v1
- **Initial Setup:** User logged in as cluster-admin; no additional beforeAll resource creation required

---

## 4. Test Case Definitions

**Spec file:** `tests/settings/settings-role-aggregation.spec.ts`
**Describe:** `Settings — Role Aggregation` — **Tags:** `@gating`
**Allure:** suite `Test Virtualization Settings page`, feature `Gating`

---

### `001`: Preview feature ON enables grant toggle on Cluster tab

- **Objective:** Verify that enabling the "Control default Virtualization permissions" preview toggle makes the grant toggle interactive on the Cluster tab
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-92775
- **Pre-conditions:** "Control default Virtualization permissions" preview toggle is OFF
- **Tags:** `@gating`

| Step | Action                                                                        | Expected Result                           |
| :--- | :---------------------------------------------------------------------------- | :---------------------------------------- |
| 1    | Navigate to **Settings → Preview features** tab                               | Preview features tab loads                |
| 2    | Enable the "Control default Virtualization permissions" toggle                 | Toggle switches to ON                     |
| 3    | Navigate to **Settings → Cluster** tab                                        | Cluster tab loads                         |
| 4    | Expand the "Automatically grant Virtualization roles" section                  | Section expands                           |
| 5    | Observe the grant toggle state                                                | Grant toggle is **enabled** (interactive) |

---

### `002`: Grant toggle ON sets strategy to AggregateToDefault and restores labels

- **Objective:** Verify that turning the grant toggle ON sets HCO `spec.roleAggregationStrategy` to `AggregateToDefault` and restores aggregate labels on ClusterRoles
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-92775
- **Pre-conditions:** Preview feature is enabled; grant toggle is currently OFF
- **Tags:** `@gating`

| Step | Action                                                            | Expected Result                                                     |
| :--- | :---------------------------------------------------------------- | :------------------------------------------------------------------ |
| 1    | Turn the "Automatically grant Virtualization roles" toggle **ON** | Toggle switches to ON (checked)                                     |
| 2    | Query HyperConverged CR `spec.roleAggregationStrategy` via API    | Value is `AggregateToDefault`                                       |
| 3    | Query ClusterRole `kubevirt.io:admin` labels via API              | Label `rbac.authorization.k8s.io/aggregate-to-admin` = `"true"`     |
| 4    | Query ClusterRole `kubevirt.io:edit` labels via API               | Label `rbac.authorization.k8s.io/aggregate-to-edit` = `"true"`      |
| 5    | Query ClusterRole `kubevirt.io:view` labels via API               | Label `rbac.authorization.k8s.io/aggregate-to-view` = `"true"`      |

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

| Step | Action                                                            | Expected Result                               |
| :--- | :---------------------------------------------------------------- | :-------------------------------------------- |
| 1    | Navigate to **Settings → Preview features** tab                   | Preview features tab loads                    |
| 2    | Disable the "Control default Virtualization permissions" toggle    | Toggle switches to OFF                        |
| 3    | Navigate to **Settings → Cluster** tab                            | Cluster tab loads                             |
| 4    | Expand the "Automatically grant Virtualization roles" section      | Section expands                               |
| 5    | Observe the grant toggle state                                    | Grant toggle is **disabled** (non-interactive) |

---

## 5. Requirements Traceability Matrix

Maps Jira tickets to the test cases that provide coverage. Tickets without a specific test case indicate a planned coverage gap (status: Pending).

| Jira Ticket | Test Case ID | Coverage Type    | Status    |
| ----------- | ------------ | ---------------- | --------- |
| CNV-92775   | `001`        | Feature coverage | Automated |
| CNV-92775   | `002`        | Feature coverage | Automated |
| CNV-92775   | `003`        | Feature coverage | Automated |
| CNV-92775   | `004`        | Feature coverage | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

**Prepared By:** Test automation / QE
**Reviewed By:** _______________
**Approval Signature:** _______________
