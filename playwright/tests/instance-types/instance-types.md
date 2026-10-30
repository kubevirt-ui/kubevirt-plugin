# Software Test Description (STD): InstanceTypes

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/instance-types/`
- **Feature Area:** Gating / Tier2 — VirtualMachineInstancetype (namespace) and cluster list read
- **Latest version:** CNV 4.18.0
- **Latest update:** 2026-10-26
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Cluster InstanceTypes list read, namespace InstanceType YAML create/delete, and UI delete from list. Catalog InstanceTypes tab coverage lives under `tests/catalog/catalog-instance-types*.md`.

### 2.2 Scope

- **In-Scope:** `instance-types.spec.ts`, `instance-types.crud.suite.ts` (`@/fixtures/instance-types-fixture`).
- **Out-of-Scope:** Catalog wizard flows (`tests/catalog/`).

## 3. Test Environment & Prerequisites

- `instanceTypesEnabled=true` via global setup / per-test feature patch.
- Admin for gating YAML create (`@admin-only`).

---

## 4. Test Case Definitions

### Module: `instance-types.spec.ts`

**Tags:** `@route-instance-types`

| Scenario                         | Tags                     |
| :------------------------------- | :----------------------- |
| InstanceTypes catalog route read | Gating (catalog fixture) |
| Cluster sizes listed             | Gating                   |
| Create YAML + delete in UI       | Gating admin             |

---

### Module: `instance-types.crud.suite.ts`

**Tags:** `@route-instance-types` `@tier2`

---

### `001`: Delete InstanceType from list in UI

- **Objective:** API-seeded namespace InstanceType removed via list UI delete.
- **Target version:** CNV 4.18.0
- **Tags:** `@tier2`

| Step | Action              | Expected Result     |
| :--- | :------------------ | :------------------ |
| 1    | Filter list by name | Row visible         |
| 2    | Delete from list    | API confirms absent |
