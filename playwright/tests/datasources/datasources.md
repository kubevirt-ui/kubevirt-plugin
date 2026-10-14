# Software Test Description (STD): DataSources

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/datasources/`
- **Feature Area:** Gating / Tier1 / Tier2 — Bootable volumes (DataSources)
- **Latest version:** CNV 4.12.0
- **Latest update:** 2026-10-15
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Read, cluster inventory, and UI CRUD for DataSources.

### 2.2 Scope

- **In-Scope:** `datasources.spec.ts` (all scenarios consolidated).

## 3. Test Environment & Prerequisites

- Admin storage state for UI mutating tests (`@admin-only`).
- Cluster OS image DataSources in `openshift-virtualization-os-images` (inventory tests).

---

## 4. Test Case Definitions

### Module: `datasources.spec.ts`

**Tags:** `@route-datasources` — modules for gating read, Tier1 YAML/labels/delete/inventory, Tier2 form and annotations (CNV-9372–9379).
