# Software Test Description (STD): DataSources

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/datasources/`
- **Feature Area:** Gating / Tier1 / Tier2 — Bootable volumes (DataSources)
- **Latest version:** CNV 4.15.0
- **Latest update:** 2026-10-26
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Read, cluster inventory, and UI CRUD for DataSources.

### 2.2 Scope

- **In-Scope:** `datasources.spec.ts`, `datasources.crud.suite.ts`.

## 3. Test Environment & Prerequisites

- UI mutating CRUD suite runs under Tier1 (admin) and Tier1NonPriv (project `storageState`).
- Cluster OS image DataSources in `openshift-virtualization-os-images` (inventory tests).

---

## 4. Test Case Definitions

### Module: `datasources.spec.ts`

**Tags:** `@route-datasources` — gating read/inventory/YAML create (CNV-9372, CNV-9378); Tier1 labels/delete; Tier2 form and annotations (CNV-9373–9379).
