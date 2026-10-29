# Software Test Description (STD): Console resource labels

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/console-resource-labels/`
- **Feature Area:** Tier1 — Console resource summary **Edit labels** modal
- **Latest version:** CNV 4.16.0
- **Latest update:** 2026-10-29
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify labels can be updated through the shared console labels modal on InstanceType and ClusterPreference detail pages.

### 2.2 Scope

- **In-Scope:** `console-resource-labels.spec.ts` (serial suite, `@/fixtures/scenario-test-fixture` extended with page objects).
- **Out-of-Scope:** VM/Template label flows covered in route-specific STDs.

## 3. Test Environment & Prerequisites

- Admin storage state for tier1 scenarios.
- API seed before UI edit; serial mode avoids `#modal-container` collisions.

---

## 4. Test Case Definitions

### Module: `console-resource-labels.spec.ts`

**Tags:** `@route-instance-types`, `@route-preferences` (nested describes)

---

### `001`: Update InstanceType labels in UI

- **Objective:** User-provided InstanceType detail shows new label after modal save.
- **Target version:** CNV 4.16.0
- **Tags:** `@tier1`

| Step | Action                   | Expected Result         |
| :--- | :----------------------- | :---------------------- |
| 1    | API create InstanceType  | CR exists               |
| 2    | Open detail, edit labels | Label visible on detail |

---

### `002`: Update ClusterPreference labels in UI

- **Objective:** Cluster preference detail shows new label after modal save.
- **Target version:** CNV 4.16.0
- **Tags:** `@tier1`, `@admin-only`

| Step | Action                       | Expected Result         |
| :--- | :--------------------------- | :---------------------- |
| 1    | API create ClusterPreference | CR exists               |
| 2    | Open detail, edit labels     | Label visible on detail |
