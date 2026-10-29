# Software Test Description (STD): Virtual Machines — List

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtual-machines/list/`
- **Feature Area:** Gating / Tier1 / Tier2 — VirtualMachines list route
- **Latest version:** CNV 4.16.0
- **Latest update:** 2026-10-29
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

List read/empty state, UI create/update/delete, and column management.

### 2.2 Scope

- **In-Scope:** `vm-list.spec.ts`, `vm-list-ui.spec.ts`, `vm-list-ui.crud.suite.ts` (import `@/fixtures/vm-list-fixture`).
- **Out-of-Scope:** Catalog tile flows (`tests/catalog/`).

## 3. Test Environment & Prerequisites

- Per-test namespace from fixture; E2E label on namespace for empty-state test.
- Column management (CNV-9329) persists prefs in **`default/kubevirt-user-settings`**; non-priv setup grants patch RBAC on that ConfigMap.

---

## 4. Test Case Definitions

### Module: `vm-list.spec.ts`

**Tags:** `@route-virtual-machines-list` `@gating` — API-seeded VM visible; empty namespace UX.

### Module: `vm-list-ui.spec.ts`

**Tags:** `@route-virtual-machines-list` — gating YAML create (`vm-creation-gating.spec.ts`); tier1 catalog create; tier2 column management (CNV-9329).

### Module: `vm-list-ui.crud.suite.ts`

**Tags:** `@route-virtual-machines-list` `@tier1` — VM label update on detail, delete VM from list UI.
