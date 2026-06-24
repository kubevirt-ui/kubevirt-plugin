# Software Test Description (STD): Gating — Bootable Volumes Filtering

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Gating — Bootable volumes list filtering (row filters, name filters, URL params)
- **Date:** 2026-06-19
- **Document Status:** Active

## 2. Introduction

### 2.1 Purpose

Validates filtering capabilities on the Bootable Volumes list page: OS-type row filters, name text filters, URL search parameter synchronization, filter persistence across page reload, and direct navigation with pre-filled filter parameters.

### 2.2 Scope

- **In-Scope:** Spec `tests/gating/scenario-bootable-volumes-filters.spec.ts` — row filters, name filters, URL params, filter persistence, direct navigation with params.
- **Out-of-Scope:** Bootable volume creation/deletion; volume content validation; storage class configuration.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed.
- **Configuration:** At least two bootable volumes must exist with different OS types (e.g., centos and fedora).
- **Initial Setup:** `beforeEach` navigates to bootable volumes page, waits for table data, and asserts multiple rows are present.
- **Cleanup:** None required — all tests are read-only filter operations.

---

## 4. Test Case Definitions

**Spec file:** `tests/gating/scenario-bootable-volumes-filters.spec.ts`
**Describe:** `Bootable volumes filtering (gating)` — **Tags:** `@gating`

---

### `001`: Row filter by OS type narrows results

- **Objective:** Verify that applying an OS-type row filter (centos) narrows the table to show only matching rows and hides non-matching rows (fedora).
- **Pre-conditions:** `beforeEach` ensures table has multiple rows.

| Step | Action                  | Expected Result                 |
| :--- | :---------------------- | :------------------------------ |
| 1    | Apply centos row filter | Filter applied                  |
| 2    | Check for centos rows   | centos rows visible (count > 0) |
| 3    | Check for fedora rows   | fedora rows hidden (count = 0)  |

---

### `002`: Clearing row filter restores full list

- **Objective:** Verify that clearing row filters restores the full list to its original row count.
- **Pre-conditions:** `beforeEach` ensures table has multiple rows.

| Step | Action                   | Expected Result                     |
| :--- | :----------------------- | :---------------------------------- |
| 1    | Record initial row count | Initial count captured              |
| 2    | Apply centos row filter  | Filtered count is less than initial |
| 3    | Clear all filters        | Row count restored to initial count |

---

### `003`: Name filter is reflected in URL

- **Objective:** Verify that filtering by name adds the corresponding search parameter to the URL.
- **Pre-conditions:** `beforeEach` ensures table has multiple rows.

| Step | Action                  | Expected Result                      |
| :--- | :---------------------- | :----------------------------------- |
| 1    | Filter by name "centos" | Filter applied                       |
| 2    | Check URL search params | URL contains `name=centos` parameter |
| 3    | Check for centos rows   | centos rows visible (count > 0)      |

---

### `004`: Name filter persists across page reload

- **Objective:** Verify that a name filter persists after reloading the page — filtered results remain consistent.
- **Pre-conditions:** `beforeEach` ensures table has multiple rows.

| Step | Action                         | Expected Result                       |
| :--- | :----------------------------- | :------------------------------------ |
| 1    | Filter by name "centos"        | Filter applied                        |
| 2    | Reload page and wait for table | Page reloaded with table data         |
| 3    | Check for centos rows          | centos rows still visible (count > 0) |
| 4    | Check for fedora rows          | fedora rows still hidden (count = 0)  |

---

### `005`: Clearing name filter removes URL search params

- **Objective:** Verify that clearing a name filter removes the search parameters from the URL.
- **Pre-conditions:** `beforeEach` ensures table has multiple rows.

| Step | Action                           | Expected Result                               |
| :--- | :------------------------------- | :-------------------------------------------- |
| 1    | Filter by name "centos"          | URL contains search params                    |
| 2    | Clear name filter (empty string) | Filter cleared                                |
| 3    | Check URL                        | URL has no search params (empty query string) |

---

### `006`: Direct navigation with filter params pre-fills toolbar

- **Objective:** Verify that navigating directly with `?name=centos` URL parameter pre-fills the filter and shows only matching results.
- **Pre-conditions:** `beforeEach` ensures table has multiple rows.

| Step | Action                                           | Expected Result                   |
| :--- | :----------------------------------------------- | :-------------------------------- |
| 1    | Navigate to bootable volumes with `?name=centos` | Page loads with filter pre-filled |
| 2    | Check for centos rows                            | centos rows visible (count > 0)   |
| 3    | Check for fedora rows                            | fedora rows hidden (count = 0)    |

---

## 5. Requirements Traceability Matrix

| Jira Ticket                         | Test Case ID | Coverage Type                               |
| :---------------------------------- | :----------- | :------------------------------------------ |
| TBD (row filter by OS type)         | `001`        | `scenario-bootable-volumes-filters.spec.ts` |
| TBD (clearing row filter)           | `002`        | `scenario-bootable-volumes-filters.spec.ts` |
| TBD (name filter URL sync)          | `003`        | `scenario-bootable-volumes-filters.spec.ts` |
| TBD (name filter persistence)       | `004`        | `scenario-bootable-volumes-filters.spec.ts` |
| TBD (clearing name filter URL)      | `005`        | `scenario-bootable-volumes-filters.spec.ts` |
| TBD (direct navigation with params) | `006`        | `scenario-bootable-volumes-filters.spec.ts` |

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** \_\_\_\_\_\_\_\_\_\_\_\_
- **Approval Signature:** \_\_\_\_\_\_\_\_\_\_\_\_
