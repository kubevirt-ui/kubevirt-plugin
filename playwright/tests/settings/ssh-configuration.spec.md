# Software Test Description (STD): SSH Configuration Settings

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Settings — SSH configuration
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-15
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify that SSH over NodePort can only be enabled after a node address is configured and that
clearing the address turns the option off and disables it. This provides a regression guard for
CNV-96685.

### 2.2 Scope

- **In-Scope:** Cluster Settings navigation, SSH over NodePort expansion, node-address input,
  NodePort switch enabled and checked states, and the debounced ConfigMap update.
- **Out-of-Scope:** SSH connectivity to a VirtualMachine, NodePort service creation, address
  validation, LoadBalancer configuration, and non-admin behavior.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift cluster with the CNV operator installed; Playwright `Settings`
  project.
- **Configuration:** The `kubevirt-ui-features` ConfigMap exists in the configured CNV namespace.
- **Initial Setup:** User is logged in as cluster-admin. The test saves the existing
  `nodePortAddress` and `nodePortEnabled` values, initializes both to their disabled defaults, and
  restores the original values during cleanup.

---

## 4. Test Case Definitions

**Spec file:** `tests/settings/ssh-configuration.spec.ts`
**Describe:** `SSH Configuration Settings` — **Tags:** `@cnv-settings`, `@adminOnly`
**Allure:** suite `SSH Configuration Settings`, feature `CNV Settings`

---

### `001`: NodePort availability follows the node-address value

- **Objective:** Verify that the NodePort switch requires a non-empty node address and resets when
  the configured address is cleared.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-96685
- **Pre-conditions:** `nodePortAddress` is empty and `nodePortEnabled` is `false`.
- **Tags:** `@cnv-settings`, `@adminOnly`

| Step | Action                                                    | Expected Result                                        |
| :--- | :-------------------------------------------------------- | :----------------------------------------------------- |
| 1    | Navigate to Virtualization Settings through the sidebar   | Cluster Settings page loads                            |
| 2    | Expand General settings, SSH configurations, and NodePort | Node-address input and NodePort switch appear          |
| 3    | Observe the switch while the node address is empty        | Switch is disabled                                     |
| 4    | Enter a node address and wait for the debounced update    | Switch becomes enabled                                 |
| 5    | Enable SSH over NodePort                                  | Switch becomes checked                                 |
| 6    | Clear the node address and wait for the debounced update  | Switch becomes unchecked and disabled                  |
| 7    | Restore the original ConfigMap values                     | Cluster configuration is returned to its initial state |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type           | Status    |
| ----------- | ------------ | ----------------------- | --------- |
| CNV-96685   | `001`        | Bugfix regression guard | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Vojtech Portes
- **Approval Signature:** Pending
