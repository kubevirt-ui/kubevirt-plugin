# Software Test Description (STD): VM Templates

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/vm-templates/`
- **Feature Area:** Gating / Tier1 / Tier2 — OpenShift Templates list and UI CRUD
- **Latest version:** CNV 4.12.0
- **Latest update:** 2026-10-15
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Templates list read, YAML create/delete, label update, list delete, and column management.

### 2.2 Scope

- **In-Scope:** `templates.spec.ts`.

## 3. Test Environment & Prerequisites

- Admin storage state for mutating tests (`@admin-only`).
- Catalog template `rhel9` in `openshift` namespace for read test.

---

## 4. Test Case Definitions

### Module: `templates.spec.ts`

**Tags:** `@route-vm-templates` — gating read, gating/tier1 YAML create, tier1 update/delete, tier2 column management (CNV-9329).
