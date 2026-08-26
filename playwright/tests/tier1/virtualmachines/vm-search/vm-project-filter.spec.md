# Software Test Description (STD): VM Project Filter

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — Virtual machines / Search
- **Latest version:** CNV 5.0.0
- **Latest update:** 2026-08-21
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify that selecting a project in the VirtualMachines tree view applies a Project toolbar filter
instead of disabling the filter, and that changing the Project filter from the toolbar can broaden
the list URL from a namespaced path to all-namespaces.

### 2.2 Scope

- **In-Scope:** Tree-view project and Local cluster clicks, Project toolbar toggle remaining enabled,
  URL `project=` query parameter updates, Project filter chips, list visibility across two
  projects, and toolbar multi-select that navigates from `/ns/<project>` to `/all-namespaces`.
- **Out-of-Scope:** Cluster filter (ACM / Fleet Virtualization only; no ACM Playwright job). Group
  filter coverage (`vm-group-filter.spec.ts`). Search-language syntax (`vm-search-language.spec.ts`).

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project.
- **Configuration:** No special feature gates required. Tests run on standalone virtualization
  (not ACM).
- **Initial Setup:** `beforeAll` creates two namespaces, each with one Halted VM. `afterAll` deletes
  those VMs. Each test opens the VirtualMachines list tab; individual cases start from Local cluster
  or a namespaced list as specified.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/virtualmachines/vm-search/vm-project-filter.spec.ts`
**Describe:** `VM Project Filter` — **Tags:** `@tier1`, `@vm-search`
**Allure:** suite `VM Project Filter`, feature `Tier 1`

---

### `001`: Clicking a project node applies a Project filter

- **Objective:** Verify that clicking a project in the tree sets `project=` in the URL, shows a
  Project chip, and lists only that project's VMs.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-93586
- **Pre-conditions:** Halted VMs exist in two test namespaces
- **Tags:** `@adminOnly`

| Step | Action                                                | Expected Result                              |
| :--- | :---------------------------------------------------- | :------------------------------------------- |
| 1    | Click Local cluster, then click project A in the tree | Project A is selected                        |
| 2    | Observe the URL                                       | URL contains `project=<project-A>`           |
| 3    | Observe filter chips                                  | A Project chip containing project A is shown |
| 4    | Observe the VM list                                   | VM A is visible; VM B is hidden              |

---

### `002`: Project filter toggle stays enabled after a tree selection

- **Objective:** Verify that the Project toolbar filter is not disabled when a project is selected
  in the tree view.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-93586
- **Pre-conditions:** Halted VMs exist in two test namespaces
- **Tags:** `@adminOnly`

| Step | Action                                                | Expected Result                      |
| :--- | :---------------------------------------------------- | :----------------------------------- |
| 1    | Click Local cluster, then click project A in the tree | Project filter is applied            |
| 2    | Observe the Project toolbar toggle                    | The Project filter toggle is enabled |

---

### `003`: Clicking Local cluster clears the Project filter

- **Objective:** Verify that clicking Local cluster after a project selection removes `project=` from
  the URL and shows VMs from both test projects.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-93586
- **Pre-conditions:** Halted VMs exist in two test namespaces
- **Tags:** `@adminOnly`

| Step | Action                                                | Expected Result                 |
| :--- | :---------------------------------------------------- | :------------------------------ |
| 1    | Click Local cluster, then click project A in the tree | Project filter is applied       |
| 2    | Click Local cluster                                   | Local cluster is selected       |
| 3    | Observe the URL                                       | URL does not contain `project=` |
| 4    | Observe the VM list                                   | VM A and VM B are visible       |

---

### `004`: Adding a second Project filter from a namespaced URL navigates to all-namespaces

- **Objective:** Verify that selecting another project in the toolbar while the path is
  `/ns/<project-A>` broadens the path to `/all-namespaces` and keeps both project filters.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-93586
- **Pre-conditions:** Halted VMs exist in two test namespaces
- **Tags:** `@adminOnly`

| Step | Action                                                 | Expected Result                                              |
| :--- | :----------------------------------------------------- | :----------------------------------------------------------- |
| 1    | Open the namespaced VirtualMachines list for project A | Path is `/ns/<project-A>` and `project=<project-A>` is set   |
| 2    | Open the Project filter and select project B           | Project B is added to the filter                             |
| 3    | Observe the URL                                        | Path is `/all-namespaces`; `project=` includes both projects |
| 4    | Observe the VM list                                    | VM A and VM B are visible                                    |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type    | Status    |
| ----------- | ------------ | ---------------- | --------- |
| CNV-93586   | `001`        | Feature coverage | Automated |
| CNV-93586   | `002`        | Feature coverage | Automated |
| CNV-93586   | `003`        | Feature coverage | Automated |
| CNV-93586   | `004`        | Feature coverage | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Adam Viktora
- **Approval Signature:** Adam Viktora
