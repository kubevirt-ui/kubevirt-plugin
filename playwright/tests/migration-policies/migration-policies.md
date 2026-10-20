# Software Test Description (STD): Migration policies

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/migration-policies/`
- **Feature Area:** Gating / Tier1 / Tier2 — MigrationPolicy list and UI CRUD
- **Latest version:** CNV 4.13.0
- **Latest update:** 2026-10-15
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Migration policies list read and full UI lifecycle (YAML, form, labels, edit modal, delete).

### 2.2 Scope

- **In-Scope:** `migration-policies.spec.ts` (CNV-9384–9388).

## 3. Test Environment & Prerequisites

- Admin storage state (`@admin-only`).
- Cluster-scoped MigrationPolicy CRD available.

---

## 4. Test Case Definitions

### Module: `migration-policies.spec.ts`

**Tags:** `@route-migration-policies` — gating read, gating/tier2 YAML create, tier1 update/delete, tier2 form and edit.
