# Software Test Description (STD): Gating — Set Default StorageClass

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Gating — StorageClass default management
- **Date:** 2026-06-19
- **Document Status:** Active

## 2. Introduction

### 2.1 Purpose

Validates the ability to change the default StorageClass via the UI and verifies the default label updates accordingly. Restores the original default StorageClass via K8s API patch after the test.

### 2.2 Scope

- **In-Scope:** Spec `tests/gating/scenario-set-default-sc.spec.ts` — switching the default StorageClass, verifying the default label, and restoring the original.
- **Out-of-Scope:** StorageClass creation/deletion; PVC provisioning; volume binding modes.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed.
- **Configuration:** At least two StorageClasses must exist — one marked as default and one non-default candidate.
- **Cleanup:** Original default StorageClass restored via K8s API patch in the final test step.

---

## 4. Test Case Definitions

**Spec file:** `tests/gating/scenario-set-default-sc.spec.ts`
**Describe:** `Set default StorageClass (gating)` — **Tags:** `@gating`

---

### `001`: Switch default SC to non-default, verify label, then restore original

- **Objective:** Verify that switching the default StorageClass via the UI updates the default label, and that restoring the original default via K8s API patch correctly re-applies the label.
- **Pre-conditions:** At least two StorageClasses exist (one default, one non-default).

| Step | Action                                                                                       | Expected Result                                 |
| :--- | :------------------------------------------------------------------------------------------- | :---------------------------------------------- |
| 1    | List all StorageClasses via K8s API                                                          | StorageClass list retrieved                     |
| 2    | Identify the current default SC (annotation `is-default-class`)                              | Default SC found                                |
| 3    | Identify a non-default candidate SC                                                          | At least one non-default SC available           |
| 4    | Navigate to StorageClasses page                                                              | StorageClasses list visible                     |
| 5    | Set the non-default candidate as default via UI ("Set as default")                           | Action completes successfully                   |
| 6    | Verify the candidate SC shows the default label                                              | Default label visible next to candidate SC name |
| 7    | Restore original SC as default via K8s API patch (remove candidate default, re-add original) | Patch applied successfully                      |
| 8    | Verify the original SC shows the default label again                                         | Default label visible next to original SC name  |

---

## 5. Requirements Traceability Matrix

| Jira Ticket          | Test Case ID | Coverage Type                     |
| :------------------- | :----------- | :-------------------------------- |
| TBD (set default SC) | `001`        | `scenario-set-default-sc.spec.ts` |

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** \_\_\_\_\_\_\_\_\_\_\_\_
- **Approval Signature:** \_\_\_\_\_\_\_\_\_\_\_\_
