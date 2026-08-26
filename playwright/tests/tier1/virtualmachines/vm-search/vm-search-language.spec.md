# Software Test Description (STD): VM Search Language

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Tier1 — Virtual machines / Search
- **Latest version:** CNV 5.0.0
- **Latest update:** 2026-08-18
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

Verify the VM list search language: query syntax (plain text, `key:value`, OR/AND, numeric
operators, exclusion), autocomplete (keys, values, examples), filter chips, clearing the search, and
that submitted queries actually show and hide VirtualMachines in the list.

### 2.2 Scope

- **In-Scope:** Search input on the namespaced VirtualMachines list, search dropdown (Search by keys,
  value suggestions, examples), filter chips produced by submitted queries, list visibility of fixture
  VMs, and the clear-search control.
- **Out-of-Scope:** Advanced Search modal field-by-field coverage (other search suites). Group
  (`group:`) filter coverage (`vm-group-filter.spec.ts`, CNV-94097). Gating smoke for
  `status:Running` lives in `tests/gating/scenario-virtualization-pages.spec.ts`.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift with CNV operator installed; Playwright `Tier1` project.
- **Configuration:** No special feature gates required.
- **Initial Setup:** `beforeAll` creates three Halted VMs in the test namespace, then waits until each
  has `printableStatus: Stopped`:
  - Fedora, 1 vCPU, 256Mi, description `database-search-lang`
  - RHEL, 8 vCPU, 8Gi, dummy GPU device, description `web-search-lang`
  - Fedora, 8 vCPU, 256Mi, description `cache-search-lang`
    `afterAll` deletes those VMs. Each test navigates to the namespaced VirtualMachines list and waits
    for the Fedora VM row. Each test ends with clearing the search.

---

## 4. Test Case Definitions

**Spec file:** `tests/tier1/virtualmachines/vm-search/vm-search-language.spec.ts`
**Describe:** `VM Search Language` — **Tags:** `@tier1`, `@vm-search`
**Allure:** suite `VM Search Language`, feature `Tier 1`

---

### `001`: Plain text search filters VMs by name

- **Objective:** Verify that submitting a VM name as plain text creates a name chip and lists only that
  VM.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** Fixture VMs exist in the test namespace
- **Tags:** `@adminOnly`

| Step | Action                        | Expected Result                                        |
| :--- | :---------------------------- | :----------------------------------------------------- |
| 1    | Submit the Fedora VM name     | Query is submitted without error                       |
| 2    | Observe filter chips          | A name filter chip containing the Fedora VM is shown   |
| 3    | Observe the VM list           | Fedora VM is visible; RHEL and high-CPU VMs are hidden |
| 4    | Click the clear search button | Search input is empty                                  |

---

### `002`: key:value search filters by status

- **Objective:** Verify that `status:Running` produces a Running chip and hides Stopped fixture VMs.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** Fixture VMs exist and are Stopped
- **Tags:** `@adminOnly`

| Step | Action                  | Expected Result                             |
| :--- | :---------------------- | :------------------------------------------ |
| 1    | Submit `status:Running` | Query is submitted without error            |
| 2    | Observe filter chips    | A filter chip containing `Running` is shown |
| 3    | Observe the VM list     | All three Stopped fixture VMs are hidden    |

---

### `003`: Comma-separated values apply OR logic within a key

- **Objective:** Verify that `status:Running,Stopped` produces both chips and lists the Stopped fixture
  VMs.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** Fixture VMs exist and are Stopped
- **Tags:** `@adminOnly`

| Step | Action                          | Expected Result                              |
| :--- | :------------------------------ | :------------------------------------------- |
| 1    | Submit `status:Running,Stopped` | Query is submitted without error             |
| 2    | Observe filter chips            | Both `Running` and `Stopped` chips are shown |
| 3    | Observe the VM list             | All three Stopped fixture VMs are visible    |

---

### `004`: Space-separated tokens apply AND logic across keys

- **Objective:** Verify that `status:Stopped os:Fedora` produces both chips and lists only Stopped
  Fedora VMs.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** Fixture VMs exist and are Stopped
- **Tags:** `@adminOnly`

| Step | Action                            | Expected Result                                     |
| :--- | :-------------------------------- | :-------------------------------------------------- |
| 1    | Submit `status:Stopped os:Fedora` | Query is submitted without error                    |
| 2    | Observe filter chips              | Both a `Stopped` chip and a `Fedora` chip are shown |
| 3    | Observe the VM list               | Both Fedora VMs are visible; the RHEL VM is hidden  |

---

### `005`: Numeric filter with > operator for vCPU

- **Objective:** Verify that `vcpu>4` produces a CPU chip and lists only VMs with more than 4 vCPUs.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** Fixture VMs exist
- **Tags:** `@adminOnly`

| Step | Action           | Expected Result                                                   |
| :--- | :--------------- | :---------------------------------------------------------------- |
| 1    | Submit `vcpu>4`  | Query is submitted without error                                  |
| 2    | Observe chips    | A CPU chip containing `>` and `4` is shown                        |
| 3    | Observe the list | RHEL and high-CPU Fedora VMs are visible; 1-vCPU Fedora is hidden |

---

### `006`: Numeric filter with >= operator for memory

- **Objective:** Verify that `memory>=8GiB` produces a memory chip and lists only the 8Gi VM.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** Fixture VMs exist
- **Tags:** `@adminOnly`

| Step | Action                | Expected Result                                      |
| :--- | :-------------------- | :--------------------------------------------------- |
| 1    | Submit `memory>=8GiB` | Query is submitted without error                     |
| 2    | Observe filter chips  | A memory chip containing `>=` and `8` is shown       |
| 3    | Observe the VM list   | RHEL VM is visible; both 256Mi Fedora VMs are hidden |

---

### `007`: Exclusion of an unmatched status leaves matching VMs listed

- **Objective:** Verify that `-status:Error` produces an Exclude Error chip and does not hide Stopped
  fixture VMs.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** Fixture VMs exist and are Stopped (none are Error)
- **Tags:** `@adminOnly`

| Step | Action                 | Expected Result                               |
| :--- | :--------------------- | :-------------------------------------------- |
| 1    | Submit `-status:Error` | Query is submitted without error              |
| 2    | Observe filter chips   | A chip showing `Exclude` and `Error` is shown |
| 3    | Observe the VM list    | All three Stopped fixture VMs remain visible  |

---

### `008`: Exclusion with has key (-has:gpu) hides VMs that have a GPU

- **Objective:** Verify that `-has:gpu` produces an Exclude gpu chip and hides the VM that has a GPU
  device.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** Fixture VMs exist; the RHEL VM has a dummy GPU
- **Tags:** `@adminOnly`

| Step | Action            | Expected Result                                        |
| :--- | :---------------- | :----------------------------------------------------- |
| 1    | Submit `-has:gpu` | Query is submitted without error                       |
| 2    | Observe chips     | A chip showing `Exclude` and `gpu` is shown            |
| 3    | Observe the list  | Both Fedora VMs are visible; the RHEL GPU VM is hidden |

---

### `009`: Exclusion prefix -name: hides the named VM

- **Objective:** Verify that `-name:<vm>` produces an Exclude name chip and hides only that VM.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** Fixture VMs exist
- **Tags:** `@adminOnly`

| Step | Action                                | Expected Result                                      |
| :--- | :------------------------------------ | :--------------------------------------------------- |
| 1    | Submit `-name:` with the RHEL VM name | Query is submitted without error                     |
| 2    | Observe filter chips                  | An Exclude chip containing the RHEL VM name is shown |
| 3    | Observe the VM list                   | Both Fedora VMs are visible; the RHEL VM is hidden   |

---

### `010`: description: key searches descriptions explicitly

- **Objective:** Verify that `description:database` produces a description chip and lists only the VM
  whose description contains that text.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** Fixture VMs exist
- **Tags:** `@adminOnly`

| Step | Action                        | Expected Result                                             |
| :--- | :---------------------------- | :---------------------------------------------------------- |
| 1    | Submit `description:database` | Query is submitted without error                            |
| 2    | Observe filter chips          | A description chip containing `database` is shown           |
| 3    | Observe the VM list           | Fedora database VM is visible; the other two VMs are hidden |

---

### `011`: Clear button empties the search input

- **Objective:** Verify that the clear search control removes typed query text from the input.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                                   | Expected Result                        |
| :--- | :--------------------------------------- | :------------------------------------- |
| 1    | Type `status:Running` without submitting | Search input value is `status:Running` |
| 2    | Click the clear search button            | Search input is empty                  |

---

### `012`: Search dropdown shows key suggestions on focus

- **Objective:** Verify that focusing the search input opens the dropdown with expected search keys.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                        | Expected Result                                              |
| :--- | :---------------------------- | :----------------------------------------------------------- |
| 1    | Focus the search input        | Search dropdown (`[data-test="search-dropdown"]`) is visible |
| 2    | Observe the Search by section | Keys section is visible; `name` and `status` keys are shown  |
| 3    | Press Escape                  | Dropdown is dismissed                                        |

---

### `013`: Search dropdown shows value suggestions after typing key:

- **Objective:** Verify that typing `status:` shows value autocomplete including Running and Stopped.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                             | Expected Result                             |
| :--- | :--------------------------------- | :------------------------------------------ |
| 1    | Type `status:` in the search input | Dropdown is visible with value suggestions  |
| 2    | Observe suggested values           | Suggestions include `Running` and `Stopped` |
| 3    | Press Escape                       | Dropdown is dismissed                       |

---

### `014`: Combined search applies status, numeric, and exclusion filters

- **Objective:** Verify that `status:Stopped vcpu>4 -has:gpu` produces all three chips and lists only
  the Stopped high-CPU VM that does not have a GPU.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** Fixture VMs exist and are Stopped
- **Tags:** `@adminOnly`

| Step | Action                                  | Expected Result                                                  |
| :--- | :-------------------------------------- | :--------------------------------------------------------------- |
| 1    | Submit `status:Stopped vcpu>4 -has:gpu` | Query is submitted without error                                 |
| 2    | Observe filter chips                    | Stopped, `> 4` CPU, and Exclude gpu chips are shown              |
| 3    | Observe the VM list                     | High-CPU Fedora VM is visible; 1-vCPU Fedora and RHEL are hidden |

---

### `015`: Search examples are shown in the dropdown

- **Objective:** Verify that the search dropdown surfaces example query patterns.
- **Target version:** CNV 5.0.0
- **Jira References:** CNV-74174
- **Pre-conditions:** None
- **Tags:** `@adminOnly`

| Step | Action                       | Expected Result                                |
| :--- | :--------------------------- | :--------------------------------------------- |
| 1    | Focus the search input       | Search dropdown is visible                     |
| 2    | Observe the examples section | At least one example query (`code`) is visible |
| 3    | Press Escape                 | Dropdown is dismissed                          |

---

## 5. Requirements Traceability Matrix

| Jira Ticket | Test Case ID | Coverage Type    | Status    |
| ----------- | ------------ | ---------------- | --------- |
| CNV-74174   | `001`        | Feature coverage | Automated |
| CNV-74174   | `002`        | Feature coverage | Automated |
| CNV-74174   | `003`        | Feature coverage | Automated |
| CNV-74174   | `004`        | Feature coverage | Automated |
| CNV-74174   | `005`        | Feature coverage | Automated |
| CNV-74174   | `006`        | Feature coverage | Automated |
| CNV-74174   | `007`        | Feature coverage | Automated |
| CNV-74174   | `008`        | Feature coverage | Automated |
| CNV-74174   | `009`        | Feature coverage | Automated |
| CNV-74174   | `010`        | Feature coverage | Automated |
| CNV-74174   | `011`        | Feature coverage | Automated |
| CNV-74174   | `012`        | Feature coverage | Automated |
| CNV-74174   | `013`        | Feature coverage | Automated |
| CNV-74174   | `014`        | Feature coverage | Automated |
| CNV-74174   | `015`        | Feature coverage | Automated |

**Coverage Type values:**

- `Feature coverage` — test validates a feature delivered by the ticket
- `Bugfix regression guard` — test asserts the specific bug fixed by the ticket does not regress
- `Functional smoke` — test validates baseline behavior; no specific Jira ticket drives it

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** Adam Viktora
- **Approval Signature:** Adam Viktora
