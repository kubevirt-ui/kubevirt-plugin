# Software Test Description (STD): VM Templates

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/vm-templates/`
- **Feature Area:** Gating / Tier1 / Tier2 — OpenShift Templates list and UI CRUD
- **Latest version:** CNV 4.18.0
- **Latest update:** 2026-10-26
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Templates list read, YAML create/delete, label update, list delete, and column management.

### 2.2 Scope

- **In-Scope:** `templates.spec.ts`, `templates.crud.suite.ts`.

## 3. Test Environment & Prerequisites

- Admin storage state for mutating tests (`@admin-only`).
- Catalog template `rhel9` in `openshift` namespace for read test.

---

## 4. Test Case Definitions

### Module: `templates.spec.ts`

**Tags:** `@route-vm-templates` — gating read, gating YAML create, tier1 update/delete (`templates.crud.suite.ts`), tier2 column management (CNV-9329).

### Module: `templates.crud.suite.ts`

**Tags:** `@route-vm-templates` `@tier1` — template label update on detail, delete from list after API seed.
