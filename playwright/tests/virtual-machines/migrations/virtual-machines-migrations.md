# Software Test Description (STD): Virtual Machines — Migrations

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtual-machines/migrations/`
- **Feature Area:** Gating + Tier2 — Live migration
- **Latest version:** CNV 4.18.0
- **Latest update:** 2026-10-15
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Live migration from VM detail Actions menu. Gating asserts the VM on `/virtualization-overview/migrations`; Tier2 monitors popover/events through completion.

### 2.2 Scope

- **In-Scope:** `vm-live-migration.spec.ts`.

---

## 4. Test Case Definitions

### Module: `vm-live-migration.spec.ts`

**Tags:** `@route-virtual-machines-migrations` `@route-virtualization-landing` `@gating` `@tier2`

| Step   | Action                                             | Expected Result                                        |
| :----- | :------------------------------------------------- | :----------------------------------------------------- |
| Gating | Migrate from Actions, open overview Migrations tab | VM listed in migrations table                          |
| Tier2  | Provision migratable VM, open detail               | Migrate action becomes enabled                         |
| Tier2  | Migrate from Actions                               | Migration completes, events/overview reflect migration |
