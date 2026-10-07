# Software Test Description (STD): VM Tree View Delete Project

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Gating — Virtual machines / Tree view
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-05
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify that the VirtualMachines tree-view "Delete project" context-menu action is only offered for
projects that contain no VirtualMachines, and that invoking the action on an empty project deletes
the namespace, removes it from the tree, and navigates the user away from it.

### 2.2 Scope

- **In-Scope:** Visibility of the `delete-project` context-menu item based on whether the project
  has VirtualMachines; end-to-end project deletion via the tree-view context menu (confirmation
  dialog, tree-node removal, URL redirect away from the deleted namespace, namespace removal from
  the cluster).
- **Out-of-Scope:** Deleting a project that still contains VirtualMachines (the action is not
  offered in that case, so the delete flow itself is not exercised). Other tree-view context-menu
  actions. Bulk/multi-project deletion.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Gating` project.
- **Configuration:** No special feature gates required. Tests run with cluster-admin privileges
  (`@adminOnly`) since namespace/project deletion requires elevated permissions.
- **Initial Setup:** Each test creates its own namespace(s) via `setupTestNamespace`, with cleanup
  tracked by the fixture resource tracker. Test 1 additionally provisions a VirtualMachine with an
  empty disk via `createVmWithEmptyDisk` in a second namespace to exercise the "has VMs" case.

---

## 4. Test Case Definitions

**Spec file:** `tests/gating/virtualmachines/vm-tree/vm-tree-delete-project.spec.ts`
**Describe:** `VM tree view delete project` — **Tags:** `@gating`
**Allure:** suite `VM tree view delete project`, feature `Gating`

---

### `001`: Delete project action is available only for projects with no VirtualMachines

- **Objective:** Verify the tree-view context menu exposes the `delete-project` action for a
  project with zero VirtualMachines, and hides that same action for a project that contains a
  VirtualMachine.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-97320
- **Pre-conditions:** An empty namespace and a namespace containing one VirtualMachine (empty disk)
  both exist on the cluster
- **Tags:** `@adminOnly`, `vm-list`

| Step | Action                                                              | Expected Result                                                                |
| :--- | :------------------------------------------------------------------ | :----------------------------------------------------------------------------- |
| 1    | Navigate to VirtualMachines and wait for the tree view to be ready  | Tree view loads and is ready for interaction                                   |
| 2    | Search the tree for the empty namespace, right-click it in the tree | Empty namespace node is visible; context menu opens                            |
| 3    | Inspect the context-menu items                                      | `delete-project` item is present for the project with 0 VirtualMachines        |
| 4    | Search the tree for the VM-containing namespace, right-click it     | Project node is visible; context menu opens                                    |
| 5    | Inspect the context-menu items                                      | `delete-project` item is absent for the project that contains a VirtualMachine |

---

### `002`: Deleting a project from the tree view removes the namespace

- **Objective:** Verify that completing the "Delete project" flow from the tree-view context menu
  (confirming the project name) deletes the namespace, removes the node from the tree, redirects
  the user away from the deleted namespace's URL, and that the namespace no longer exists on the
  cluster.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-97320
- **Pre-conditions:** An empty test namespace exists and is visible in the tree (empty-projects
  display toggled on)
- **Tags:** `@adminOnly`, `vm-list`

| Step | Action                                                                                                | Expected Result                                                                          |
| :--- | :---------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| 1    | Navigate to VirtualMachines, enable the empty-projects display, search and confirm the project exists | Project node is visible in the tree before deletion                                      |
| 2    | Right-click the project, select `Delete project`, type the project name to confirm, and submit        | Confirmation dialog closes                                                               |
| 3    | Observe the page URL and the tree                                                                     | URL no longer contains `/ns/<namespace>/`; project node is no longer visible in the tree |
| 4    | Poll the cluster for the namespace                                                                    | Namespace no longer exists on the cluster                                                |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type    | Status    |
| ----------- | ------------ | ---------------- | --------- |
| CNV-97320   | `001`        | Feature coverage | Automated |
| CNV-97320   | `002`        | Feature coverage | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Adam Viktora
- **Approval Signature:** Adam Viktora
