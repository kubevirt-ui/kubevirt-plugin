# Software Test Description (STD): Checkups

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/checkups/`
- **Feature Area:** Gating / Tier1 — Network latency and Storage checkups
- **Latest version:** CNV 4.18.0
- **Latest update:** 2026-10-26
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Checkups route page load and end-to-end storage/network checkup create, detail, and delete flows.

### 2.2 Scope

- **In-Scope:** `checkups.spec.ts` (`@/fixtures/checkups-fixture`).
- **Out-of-Scope:** Checkup execution results on cluster (UI lifecycle only).

## 3. Test Environment & Prerequisites

- Admin storage state (`@admin-only`).
- Network checkup: NAD provisioned in test namespace via `network-test-data` helpers.
- Storage checkup may show **Install permissions** or enabled **Run checkup** depending on cluster RBAC/operators.

---

## 4. Test Case Definitions

### Module: `checkups.spec.ts`

**Tags:** `@route-checkups`

---

### `001`: Checkups page shows Network latency and Storage tabs

- **Objective:** Gating load of checkups landing tabs and storage affordance.
- **Target version:** CNV 4.18.0
- **Tags:** `@gating`, `@admin-only`

| Step | Action               | Expected Result                            |
| :--- | :------------------- | :----------------------------------------- |
| 1    | Navigate to checkups | Network latency and Storage tabs visible   |
| 2    | Open Storage tab     | Install permissions or Run checkup enabled |

---

### `002`: Storage checkup lifecycle

- **Objective:** Create storage checkup from form, verify list/detail, delete from UI.
- **Target version:** CNV 4.18.0
- **Tags:** `@tier1`, `@admin-only`

| Step | Action                        | Expected Result                   |
| :--- | :---------------------------- | :-------------------------------- |
| 1    | Install permissions if needed | Run checkup enabled when possible |
| 2    | Submit storage form           | Checkup appears in list           |
| 3    | Open detail, delete           | Link hidden after delete          |

---

### `003`: Network latency checkup lifecycle

- **Objective:** Create network checkup with NAD, verify detail, delete.
- **Target version:** CNV 4.18.0
- **Tags:** `@tier1`, `@admin-only`

| Step | Action                           | Expected Result            |
| :--- | :------------------------------- | :------------------------- |
| 1    | Provision NAD, open network form | NAD selectable in form     |
| 2    | Run checkup                      | Listed and detail headings |
| 3    | Delete from actions menu         | Removed from network list  |
