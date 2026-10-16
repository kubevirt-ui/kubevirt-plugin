# Software Test Description (STD): Catalog

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/catalog/`
- **Feature Area:** Gating / Tier1 / Tier2 — Templates catalog and customize review
- **Latest version:** CNV 4.12.0
- **Latest update:** 2026-10-15
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

E2E coverage for `/templatescatalog`, filters, customize/review wizard, and VM create flows.

### 2.2 Scope

- **In-Scope:** All specs under `tests/catalog/` (import `@/fixtures/catalog-fixture`).
- **Out-of-Scope:** VM list entry points (see `tests/virtual-machines/list/virtual-machines-list.md`).

## 3. Test Environment & Prerequisites

- Templates available in test namespace / cluster catalog.
- Non-priv scenarios use `nonpriv-state.json` from global setup.

---

## 4. Test Case Definitions

### Module: `catalog.spec.ts`

**Tags:** `@route-catalog` `@gating` `@tier1` `@non-priv` — grid read and quick-create VM (CNV-8848).

---

### Module: `catalog-filter.spec.ts`

**Tags:** `@route-catalog` `@tier1` `@tier2` — OS/text filters and filter toolbar.

---

### Module: `catalog-customize.spec.ts`

**Tags:** `@route-catalog` `@tier1` `@tier2` `@non-priv` — customize read, basic create, review network tab, full wizard walk.

---

### Module: `catalog-vm-create-windows.spec.ts`

**Tags:** Windows catalog create — tier1 admin/non-priv ISO (CNV-8925), tier2 alternate disk sources (CNV-8926–8928).
