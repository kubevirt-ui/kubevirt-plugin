# Software Test Description (STD): Kernel Samepage Merging (KSM) Settings

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Settings — Resource management — Kernel Samepage Merging (KSM)
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-23
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

Verify that cluster admins can enable and disable **Kernel Samepage Merging (KSM)** from
**Settings → Resource management**, and that each change is reflected on the HyperConverged CR
(`spec.ksmConfiguration`) with the same values the UI sends via JSON patch.

### 2.2 Scope

- **In-Scope:** Virtualization Settings sidebar navigation, Resource management section expansion,
  KSM switch visibility, enabling/disabling KSM through the UI, switch checked state, and
  HyperConverged `spec.ksmConfiguration` after each toggle (`{ nodeLabelSelector: {} }` when on,
  `{}` when off).
- **Out-of-Scope:** KSM effect on running VirtualMachines or node memory, node label selectors
  other than cluster-wide enablement, non-admin RBAC, multicluster perspective selection, and
  Lightspeed help popover content.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift cluster with the CNV operator installed; Playwright `Settings`
  project.
- **Configuration:** HyperConverged CR `kubevirt-hyperconverged` exists in the configured CNV
  namespace (HCO v1beta1).
- **Initial Setup:** User is logged in as cluster-admin (`@adminOnly`). Global Playwright setup
  completes console login and namespace preparation. An `afterAll` hook attempts best-effort
  restoration of `spec.ksmConfiguration`; cluster teardown rules may also reset HyperConverged
  settings after the suite.

---

## 4. Test Case Definitions

**Spec file:** `tests/settings/ksm-toggle.spec.ts`
**Describe:** `Kernel Samepage Merging (KSM)` — **Tags:** `@cnv-settings`, `@adminOnly`
**Allure:** suite `Kernel Samepage Merging (KSM)`, feature `CNV Settings`

---

### `001`: KSM toggle updates HyperConverged ksmConfiguration

- **Objective:** Verify that turning KSM on and off from Resource management updates the UI switch
  and the HyperConverged CR to the expected `ksmConfiguration` values.
- **Target version:** CNV 5.1.0
- **Jira References:** —
- **Pre-conditions:** Cluster-admin session; HyperConverged resource is loaded in Settings (KSM
  switch becomes interactive when HCO watch has loaded).
- **Tags:** `@cnv-settings`, `@adminOnly`

| Step | Action                                                                 | Expected Result                                                                 |
| :--- | :--------------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| 1    | Navigate to Virtualization Settings through the sidebar                | Cluster Settings page loads                                                     |
| 2    | Open **Resource management**                                           | KSM control (`Kernel Samepage Merging`) is visible                              |
| 3    | Turn KSM **on** (wait until switch is enabled, then enable)            | Switch is checked; `enableKSM()` succeeds                                       |
| 4    | Poll HyperConverged `spec.ksmConfiguration` via API                  | Value equals `{ "nodeLabelSelector": {} }`                                      |
| 5    | Turn KSM **off**                                                       | Switch is unchecked; `disableKSM()` succeeds                                    |
| 6    | Poll HyperConverged `spec.ksmConfiguration` via API                  | Value equals `{}`                                                               |
| 7    | Suite cleanup (`afterAll`)                                             | Best-effort restore of prior `ksmConfiguration` (if applicable)                 |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type      | Status    |
| ----------- | ------------ | ------------------ | --------- |
| —           | `001`        | Functional smoke   | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Maya Rubinstein
- **Approval Signature:** Pending
