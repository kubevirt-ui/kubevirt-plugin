# Software Test Description (STD): Virtualization landing

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtualization-landing/`
- **Feature Area:** Gating / Tier1 / Tier2 — Virtualization overview and nav smoke
- **Latest version:** CNV 4.13.0
- **Latest update:** 2026-10-15
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Overview dashboard, sub-tabs (Top consumers, Migrations, Settings), tier1 cards, and catalog create entry from virtualization landing.

### 2.2 Scope

- **In-Scope:** `virtualization-landing.spec.ts` (all scenarios consolidated).

## 3. Test Environment & Prerequisites

- Kubeadmin storage state for Quick Starts card (`@admin-only`).
- Cluster virtualization overview plugin route `/virtualization-overview`.

---

## 4. Test Case Definitions

### Module: `virtualization-landing.spec.ts`

**Tags:** `@route-virtualization-landing` — gating nav smoke, overview read/tabs, catalog entry, Top consumers (gating), overview cards (tier1), Migrations/Settings (tier2).
