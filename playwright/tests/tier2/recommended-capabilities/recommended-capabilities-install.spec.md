# Software Test Description (STD): Recommended capabilities — Install

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier2 — Recommended capabilities
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-08
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

Verify that Install selected creates an OLM Subscription for a single not-installed autopilot
capability, that the UI leaves Not installed, and that created Subscriptions are deleted after the
test. Prefer Migrate VMs because it maps to one operator.

### 2.2 Scope

- **In-Scope:** Selecting one not-installed autopilot capability, Install selected, toast or
  Installing spinner, status poll, Subscription cleanup.
- **Out-of-Scope:** Installing the full default bundle, clicking Apply in the review recommendation
  modal, installing additional/manual capabilities.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator; Playwright `Tier2` project.
- **Configuration:** Cluster-admin user. Run this spec with `--workers=1` so it cannot overlap
  other Recommended capabilities tests.
- **Initial Setup:** Snapshot existing Subscription UIDs. After each test, delete newly created
  Subscriptions whose package name is an Autopilot operator. Failed deletions fail `afterEach`
  (404 Not Found is ignored). Skip if every autopilot capability is already installed.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier2/recommended-capabilities/recommended-capabilities-install.spec.ts`
**Describe:** `Recommended capabilities install` — **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`
**Allure:** suite `Recommended capabilities`, feature `Tier 2`

---

### `001`: Install selected starts install for one not-installed autopilot capability

- **Objective:** Verify Install selected starts OLM install for one not-installed autopilot capability.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87133, CNV-85806
- **Pre-conditions:** At least one autopilot capability is Not installed (prefer Migrate VMs); skipped otherwise.
- **Tags:** `@tier2`, `@adminOnly`, `@tier2-recommended-capabilities`

| Step | Action                                                  | Expected Result                                          |
| :--- | :------------------------------------------------------ | :------------------------------------------------------- |
| 1    | Select the first not-installed autopilot capability     | Install selected becomes enabled                         |
| 2    | Click Install selected                                  | Toast "Installation started …" and/or Installing spinner |
| 3    | Poll capability status until `OPERATOR_INSTALL` timeout | Status is no longer Not installed                        |
| 4    | afterEach deletes new Autopilot Subscriptions           | Cluster is restored                                      |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type    | Status |
| ----------- | ------------ | ---------------- | ------ |
| CNV-87133   | `001`        | Feature coverage | Draft  |
| CNV-85806   | `001`        | Feature coverage | Draft  |

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** **\*\***\_\_\_\_**\*\***
- **Approval Signature:** **\*\***\_\_\_\_**\*\***
