# Software Test Description (STD): Bootable volumes

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/bootable-volumes/`
- **Feature Area:** Gating / Tier1 / Tier2 — Bootable volumes (DataSource-backed) in project
- **Latest version:** CNV 4.15.0
- **Latest update:** 2026-10-26
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Bootable volumes list read and Add volume flows (YAML affordance, registry form create) with DataSource verification.

### 2.2 Scope

- **In-Scope:** `bootable-volumes.spec.ts`, `bootable-volumes-read.suite.ts` (`@/fixtures/bootable-volumes-fixture`).
- **Out-of-Scope:** Cluster-wide DataSources inventory (`tests/datasources/`).

## 3. Test Environment & Prerequisites

- Per-test namespace from fixture.
- Admin storage state for mutating scenarios (`@admin-only`).
- Registry URL and preference names from `DATASOURCE_FORM` constants.

---

## 4. Test Case Definitions

### Module: `bootable-volumes-read.suite.ts`

**Tags:** `@route-bootable-volumes` `@gating` `@tier1` `@tier2` `@non-priv`

---

### `001`: Bootable volumes list loads in project

- **Objective:** Namespace bootable volumes page shows title and Add volume control.
- **Target version:** CNV 4.15.0

| Step | Action                             | Expected Result           |
| :--- | :--------------------------------- | :------------------------ |
| 1    | Open bootable volumes in namespace | List title visible        |
| 2    | Assert Add volume button           | Create affordance visible |

---

### Module: `bootable-volumes.spec.ts`

**Tags:** `@route-bootable-volumes`

---

### `002`: Add volume With YAML opens DataVolume create

- **Objective:** Add volume → With YAML navigates to DataVolume YAML create.
- **Target version:** CNV 4.15.0
- **Tags:** `@gating`, `@admin-only`

| Step | Action                   | Expected Result                 |
| :--- | :----------------------- | :------------------------------ |
| 1    | Open With YAML from list | DataVolume YAML heading visible |

---

### `003`: Add volume With form creates bootable volume from registry

- **Objective:** Form create persists DataSource on API (gating smoke).
- **Target version:** CNV 4.15.0
- **Tags:** `@gating`, `@admin-only`

| Step | Action                 | Expected Result         |
| :--- | :--------------------- | :---------------------- |
| 1    | Complete form save     | API DataSource exists   |
| 2    | Open DataSource detail | Title shows volume name |

---

### `004`: Edit DataSource labels after Add volume With form

- **Objective:** Labels edited on DataSource detail after boot volume form create.
- **Target version:** CNV 4.15.0
- **Tags:** `@tier1`, `@admin-only`

---

### `005`: Add volume With form — DataSources list verify

- **Objective:** Registry import visible on DataSources list (tier1).
- **Target version:** CNV 4.15.0
- **Tags:** `@tier1`, `@admin-only`

---

### `006`: Form create and delete from DataSources list

- **Objective:** Tier2 create via boot volumes form, delete from DataSources list.
- **Target version:** CNV 4.15.0
- **Tags:** `@tier2`, `@admin-only`
