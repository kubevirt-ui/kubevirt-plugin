# Software Test Description (STD): Virtual Machines — Migrations

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtual-machines/migrations/`
- **Feature Area:** Migrations (`@migration`) — live, compute, and storage migration
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

End-to-end migration coverage aligned with kubevirt-ui `playwright/tests/migrations/`, adapted to kvp fixtures and API helpers. Long storage migrations use a single root disk (no extra blank disk) and skip when a second StorageClass is unavailable (`E2E_STORAGE_MIGRATION_DEST`).

### 2.2 Scope

- **In-Scope:** `vm-live-migration.spec.ts`, `vm-migration-compute.spec.ts`, `vm-migration-storage.spec.ts`.
- **Out-of-Scope:** Migration policies (separate route / tier lanes), non-priv lanes.

---

## 4. Test Case Definitions

### Module: `vm-live-migration.spec.ts`

**Tags:** `@route-virtual-machines-migrations` `@migration` `@admin-only`  
**Execution:** Playwright project **`Migrations`** (`./playwright-runner.sh migrations`).

| Summary                                                                |
| :--------------------------------------------------------------------- |
| Running VM live migration listed on virtualization overview Migrations |
| Monitor migration popover / events through completion                  |

### Module: `vm-migration-compute.spec.ts`

**Tags:** `@route-virtual-machines-migrations` `@migration` `@admin-only`

| Test                                                                   |
| :--------------------------------------------------------------------- |
| Compute migration disabled on single-node clusters / enabled otherwise |
| Migration target list shows candidate nodes                            |

### Module: `vm-migration-storage.spec.ts`

**Tags:** `@route-virtual-machines-migrations` `@migration` `@admin-only`

| Test                                                                |
| :------------------------------------------------------------------ |
| Migrate storage enabled for stopped VMs (STD `003`)                 |
| Wizard blocks destination step when no volumes selected (STD `006`) |
| keepSource / deleteSource retention on migration plan               |
| Selected-volume migration updates root PVC storage class            |
| Second migration wizard opens after first completes                 |
| Online / offline migration updates root PVC storage class           |
| Storage MigrationPlan shows 100% / Completed                        |
| Cancel in-progress migration removes plan CR                        |

**Prerequisites:** Admin; cluster with CDI DataSource `rhel9`; two StorageClasses or `E2E_STORAGE_MIGRATION_DEST`; compute cordon test requires `oc`.
