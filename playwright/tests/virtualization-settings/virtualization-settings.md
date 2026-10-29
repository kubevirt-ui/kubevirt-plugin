# Software Test Description (STD): Virtualization settings

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtualization-settings/`
- **Feature Area:** Gating / Tier1 / Tier2 — Virtualization settings via Overview → Settings
- **Latest version:** CNV 4.16.0
- **Latest update:** 2026-10-29
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Settings sub-tab on the virtualization overview: preview features (CPU limit toggle), cluster/user configuration readability.

Standalone `/virtualization-settings` may 404 on older consoles; tests use overview horizontal **Settings** tab.

### 2.2 Scope

- **In-Scope:** `virtualization-settings.spec.ts` (`@/fixtures/virtualization-landing-fixture`).
- **Out-of-Scope:** Full HCO form CRUD (cluster settings deep links).

## 3. Test Environment & Prerequisites

- Kubeadmin storage state (`@admin-only`).
- Preview feature toggles patch **`default/kubevirt-ui-features`** (same ConfigMap as InstanceTypes `instanceTypesEnabled`; not in `openshift-cnv`).

---

## 4. Test Case Definitions

### Module: `virtualization-settings.spec.ts`

**Tags:** `@route-virtualization-settings`

---

### `001`: Enable CPU limit preview switch can be turned on and off

- **Objective:** Preview features switch patches `kubevirt-ui-features` and reflects UI state.
- **Target version:** CNV 4.16.0
- **Tags:** `@gating`, `@admin-only`

| Step | Action                           | Expected Result        |
| :--- | :------------------------------- | :--------------------- |
| 1    | Open Settings → Preview features | Switch off initially   |
| 2    | Enable CPU limit preview         | API + switch checked   |
| 3    | Disable CPU limit preview        | API + switch unchecked |

---

### `002`: Overview Settings sub-tab shows virtualization configuration

- **Objective:** Settings content region is readable (tier1).
- **Target version:** CNV 4.16.0
- **Tags:** `@tier1`, `@admin-only`

| Step | Action            | Expected Result             |
| :--- | :---------------- | :-------------------------- |
| 1    | Open Settings tab | `settingsContent()` visible |

---

### `003`: Settings sub-tab remains readable for cluster admin

- **Objective:** Duplicate smoke for preview features area visibility (tier1).
- **Target version:** CNV 4.16.0
- **Tags:** `@tier1`, `@admin-only`

---

### `004`: Settings sub-tab shows HCO or general configuration

- **Objective:** Tier2 admin can read settings shell content.
- **Target version:** CNV 4.16.0
- **Tags:** `@tier2`, `@admin-only`
