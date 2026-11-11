# Software Test Description (STD): Virtualization settings

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtualization-settings/`
- **Feature Area:** Settings (`@cnv-settings`) — read-only deep coverage + tab smoke
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

CNV Settings at `/k8s/all-namespaces/virtualization-settings`. Specs assert sections, search, and controls are visible and enabled **without** toggling cluster or user state (aligned with kubevirt-ui Settings / gating STD). Smoke coverage loads Cluster and User tabs.

### 2.2 Scope

- **In-Scope:** `virtualization-settings-gating.spec.ts`, `virtualization-settings.spec.ts` (`@/fixtures/virtualization-settings-fixture`).
- **Out-of-Scope:** Full HCO/API mutation settings from kubevirt-ui main (`cluster-settings` / `user-settings` write paths).

## 3. Test Environment & Prerequisites

- Kubeadmin storage state (`@admin-only`).
- Direct settings route (overview `/virtualization-settings` may 404 on some builds).

---

## 4. Test Case Definitions

### Module: `virtualization-settings-gating.spec.ts`

**Tags:** `@route-virtualization-settings` `@cnv-settings` `@admin-only`  
**Execution:** Playwright project **`Settings`** (`./playwright-runner.sh settings`). File uses `mode: 'serial'` so section drill-ins do not race under `--workers=4`. Tests do not mutate cluster or user settings.

| #     | Scenario (kubevirt-ui parity)                                                    | Behavior                                                                                                 |
| :---- | :------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| 1     | AAQ / Quotas                                                                     | AAQ control interactive; quotas list asserted only when **Manage quotas** is already present (no enable) |
| 2     | Tabs Cluster / User / Preview                                                    | Tab names present                                                                                        |
| 3     | Configuration search                                                             | Autocomplete menuitems                                                                                   |
| 4     | Installed version                                                                | Prefix + status text                                                                                     |
| 5     | Virtualization features                                                          | Operator list + Configure features                                                                       |
| 6     | General + cluster sections                                                       | Section buttons + general sub-sections                                                                   |
| 7     | Live migration                                                                   | Inputs visible/enabled (no save)                                                                         |
| 8     | Memory density                                                                   | Toggle interactive (no change)                                                                           |
| 9     | Automatic images download                                                        | Sub-section + cron switch interactive                                                                    |
| 10–15 | VM actions confirm, YAML, CD-ROM, guest log, RHEL subscription, hide credentials | Controls visible/enabled only                                                                            |
| 16–18 | KSM, AAQ, SCSI PR                                                                | Resource / SCSI controls interactive                                                                     |
| 19–20 | Preview features                                                                 | Folders / Passt / templates switches; no CCLM label                                                      |
| 21–24 | SSH keys, permissions, getting started, welcome/tour                             | Section content; toggles enabled only                                                                    |
| —     | Auto-compute CPU limits                                                          | Switch visible under Resource management                                                                 |

### Module: `virtualization-settings.spec.ts`

**Tags:** `@route-virtualization-settings` `@cnv-settings` `@admin-only`

| Summary                   |
| :------------------------ |
| Cluster tab shell visible |
| User tab shell visible    |
