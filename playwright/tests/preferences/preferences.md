# Software Test Description (STD): Cluster preferences

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/preferences/`
- **Feature Area:** Gating / Tier1 / Tier2 — VirtualMachineClusterPreference list and UI CRUD
- **Latest version:** CNV 4.16.0
- **Latest update:** 2026-10-29
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Cluster-scoped OS preferences list read and UI create/update/delete for `VirtualMachineClusterPreference`.

### 2.2 Scope

- **In-Scope:** `preferences.spec.ts`, `preferences-read.suite.ts` (`@/fixtures/preferences-fixture`).
- **Out-of-Scope:** Namespace-scoped preferences (not exposed on this route in 4.16).

## 3. Test Environment & Prerequisites

- Admin storage state for YAML create and delete (`@admin-only`).
- Gating/Tier1/Tier2 non-priv read uses `registerForGatingAndNonPrivTiers` in the read suite.
- Cluster OS preferences (e.g. rhel, fedora, centos) visible under `openshift-virtualization-os-images` for non-admin list projection.

---

## 4. Test Case Definitions

### Module: `preferences-read.suite.ts`

**Spec file:** `tests/preferences/preferences-read.suite.ts` (imported from `preferences.spec.ts`)
**Tags:** `@route-preferences` `@gating` `@tier1` `@tier2` `@non-priv`

---

### `001`: Cluster preferences list includes common OS preferences

- **Objective:** Cluster preferences list loads and shows at least one common OS preference row.
- **Target version:** CNV 4.16.0
- **Tags:** `@gating`, `@tier1`, `@tier2`, `@non-priv`

| Step | Action                                   | Expected Result                         |
| :--- | :--------------------------------------- | :-------------------------------------- |
| 1    | Navigate to Cluster preferences          | List ready                              |
| 2    | Assert `commonOsPreferenceRow()` visible | rhel/fedora/centos preference row shown |

---

### Module: `preferences.spec.ts`

**Tags:** `@route-preferences`

---

### `002`: Create VirtualMachineClusterPreference with YAML and delete in UI

- **Objective:** Import YAML creates a cluster preference; UI delete removes it from API.
- **Target version:** CNV 4.16.0
- **Tags:** `@gating`, `@admin-only`

| Step | Action                         | Expected Result              |
| :--- | :----------------------------- | :--------------------------- |
| 1    | Pre-clean preference via API   | CR absent                    |
| 2    | Create from YAML on list route | Detail title matches name    |
| 3    | Delete from list in UI         | API poll confirms CR deleted |

---

### `003`: Delete ClusterPreference from list in UI

- **Objective:** Admin can delete an API-seeded cluster preference from the list UI.
- **Target version:** CNV 4.16.0
- **Tags:** `@tier2`, `@admin-only`

| Step | Action                  | Expected Result           |
| :--- | :---------------------- | :------------------------ |
| 1    | Seed preference via API | API poll confirms exists  |
| 2    | Delete from list in UI  | API poll confirms deleted |
