# Software Test Description (STD): Virtualization landing

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtualization-landing/`
- **Feature Area:** Gating / Tier1 / Tier2 — Virtualization overview and nav smoke
- **Latest version:** CNV 4.18.0
- **Latest update:** 2026-10-26
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Overview dashboard, sub-tabs (Top consumers, Migrations, Settings), tier1 cards, and catalog create entry from virtualization landing.

### 2.2 Scope

- **In-Scope:** `virtualization-landing.spec.ts`, `virtualization-landing-virtctl.suite.ts`.

## 3. Test Environment & Prerequisites

- Kubeadmin storage state for Quick Starts card (`@admin-only`).
- Cluster virtualization overview plugin route `/virtualization-overview`.

---

## 4. Test Case Definitions

### Module: `virtualization-landing.spec.ts`

**Tags:** `@route-virtualization-landing` — gating nav smoke, overview read/tabs, catalog entry, overview cards (tier1), Migrations/Settings (tier2).

### Module: `virtualization-landing-virtctl.suite.ts`

**Tags:** `@route-virtualization-landing` — virtctl header link navigates to console `/command-line-tools` on **Gating** (kubeadmin) and **Tier1NonPriv / Tier2NonPriv** (`registerForTier1AndTier2NonPriv`). Non-priv setup grants `consoleclidownloads` list RBAC so `CONSOLE_CLI_DOWNLOAD` enables the overview link. Fails if the cluster has no `ConsoleCLIDownload` CR.
