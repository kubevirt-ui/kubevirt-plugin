# Software Test Description (STD): Checkups Toast Notifications (Gating)

## 1. Project Overview

- **Project Name:** KubeVirt Plugin — Playwright E2E Tests
- **Feature Area:** Gating — Console SDK toast notification rendering
- **Version:** CNV 4.23+
- **Date:** 2026-06-16
- **Document Status:** Active

## 2. Introduction

### 2.1 Purpose

Validates that the OpenShift Console's toast system (used by the kubevirt-plugin for checkup
rerun/delete feedback) renders all PatternFly alert variants correctly. Uses React fiber
traversal to inject toasts via the Console SDK's ToastContext.

### 2.2 Scope

- **In-Scope:** Toast rendering for danger, info, success, warning variants; simultaneous rendering; dismissal.
- **Out-of-Scope:** Actual checkup CRUD operations; toast timeout behavior; backend notification delivery.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; kubevirt-plugin deployed.
- **Configuration:** Default cluster setup; Checkups page must be navigable.
- **Initial Setup:** Navigate to Checkups page and cache ToastContext via React fiber traversal.
- **Cleanup:** All toasts cleared in afterEach.

---

## 4. Test Case Definitions

**Spec file:** `tests/gating/scenario-checkups-toasts.spec.ts`
**Describe:** `Checkups toast notifications (gating)` — **Tags:** `@gating`

---

### `001`: Toast renders correctly for danger variant

- **Objective:** A danger toast injected via Console SDK ToastContext renders with correct title and content.
- **Jira References:** CNV-74440

| Step | Action                                                 | Expected Result                         |
| :--- | :----------------------------------------------------- | :-------------------------------------- |
| 1    | Fire danger toast with title "Failed to rerun checkup" | Toast visible in DOM                    |
| 2    | Verify toast text                                      | Title and content match expected values |
| 3    | Dismiss toast                                          | Toast removed from DOM                  |

---

### `002`: Toast renders correctly for info variant

- **Objective:** An info toast renders with correct title and content.
- **Jira References:** CNV-74440

| Step | Action                                             | Expected Result  |
| :--- | :------------------------------------------------- | :--------------- |
| 1    | Fire info toast with title "Checkup rerun started" | Toast visible    |
| 2    | Verify toast text                                  | Matches expected |
| 3    | Dismiss                                            | Removed          |

---

### `003`: Toast renders correctly for success variant

- **Objective:** A success toast renders with correct title.
- **Jira References:** CNV-74440

| Step | Action                                                       | Expected Result |
| :--- | :----------------------------------------------------------- | :-------------- |
| 1    | Fire success toast with title "Checkup deleted successfully" | Toast visible   |
| 2    | Dismiss                                                      | Removed         |

---

### `004`: Toast renders correctly for warning variant

- **Objective:** A warning toast renders with correct title and content.
- **Jira References:** CNV-74440

| Step | Action                                                          | Expected Result  |
| :--- | :-------------------------------------------------------------- | :--------------- |
| 1    | Fire warning toast with title "Checkup completed with warnings" | Toast visible    |
| 2    | Verify toast text                                               | Matches expected |
| 3    | Dismiss                                                         | Removed          |

---

### `005`: Multiple toasts render simultaneously without overlap

- **Objective:** Four toasts (danger, info, success, warning) fire at once and all remain visible until explicitly cleared.
- **Jira References:** CNV-74440

| Step | Action                                      | Expected Result  |
| :--- | :------------------------------------------ | :--------------- |
| 1    | Fire all four toast variants simultaneously | All four visible |
| 2    | Clear all toasts                            | None remain      |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type                            | Status    |
| :---------- | :----------- | :--------------------------------------- | :-------- |
| CNV-74440   | `001`–`004`  | Feature coverage — per-variant rendering | Automated |
| CNV-74440   | `005`        | Feature coverage — simultaneous display  | Automated |

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** **\*\*\*\***\_\_**\*\*\*\***
- **Approval Signature:** **\*\*\*\***\_\_**\*\*\*\***
