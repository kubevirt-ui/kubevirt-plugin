# Software Test Description (STD): Gating — Scenario catalog browsing

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Gating — Catalog (templates + instance types)
- **Version:** CNV 4.22
- **Date:** 2026-03-27
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

Document automated gating coverage for namespace catalog template filtering (focused tests per filter/view), template creation and project-scoped catalog visibility (single test with `test.step` sub-assertions), and instance type catalog browsing.

### 2.2 Scope

- **In-Scope:** Spec `tests/gating/scenario-catalog-browsing.spec.ts` — each `test()` and nested `test.step()` where used.
- **Out-of-Scope:** Tier1 catalog deep dives; non-catalog virtualization pages (see `scenario-virtualization-pages.md`).

## 3. Test Environment & Prerequisites

> **Navigation**: The template catalog is accessed via VirtualMachines → Create → From template.
> There is no dedicated Catalog sidebar item.

- **Environment:** OpenShift cluster with OpenShift Virtualization; console access; configured `testNamespace` / `TEST_NS`.
- **Configuration:** Optional `ARCH` (`x86_64` default); when `ARCH=s390x`, Windows- and combined OS/workload branches in the spec differ from non-s390x.
- **Initial setup:** Valid login and project context; catalog templates (RHEL, Windows where applicable, Fedora, CentOS Stream 9, etc.) as on a typical cluster.
- **Shared resources:** None at describe level. The **Template creation and project filtering** test creates templates in the test namespace and registers `cleanup.trackTemplate` for teardown.

### Tier Exception Note

Template catalog tests are read-only UI checks per test. **Template creation and project filtering** creates multiple templates in the shared test namespace (tracked for cleanup); that test exceeds a strict read-only gating contract but keeps creation and catalog assertions in one flow.

---

## 4. Test Case Definitions

**Spec file:** `tests/gating/scenario-catalog-browsing.spec.ts`  
**Describe:** `Catalog browsing (gating)` — **Tags:** `@gating`  
**Annotations:** suite `Catalog browsing`, feature `Gating`, tags `['@gating']` (per test via `utils.withAnnotations`).  
**Per-test tags:** `@nonpriv` on each `test()`.

---

### `001`: Architecture filter exists

- **Objective:** Templates tab shows architecture filter category.
- **Pre-conditions:** Navigate catalog → Templates tab.
- **Test name:** `ID(CNV-12357) Architecture filter exists`
- **Shared resources:** None.

| Step ID       | Description                        | Assertions (`expect.soft`)       |
| :------------ | :--------------------------------- | :------------------------------- |
| ID(CNV-12357) | `verifyArchitectureFilterExists()` | Filter category exists (`true`). |

---

### `002`: Grid and list view switching

- **Objective:** List view and grid view both show RHEL 8 template.
- **Test name:** `ID(CNV-8863) Grid and list view switching`
- **Shared resources:** None.

| Step ID      | Description                                 | Assertions (`expect.soft`)       |
| :----------- | :------------------------------------------ | :------------------------------- |
| ID(CNV-8863) | `switchView('list')` / `switchView('grid')` | RHEL 8 visible in list and grid. |

---

### `003`: Filter by OS name

- **Objective:** RHEL filter shows RHEL 8 and RHEL 9; Windows filter (non-s390x) shows WIN11 and WIN2K22; Fedora filter yields exactly one Fedora card.
- **Test name:** `ID(CNV-8464) Filter by OS name`
- **Shared resources:** None.

| Step ID      | Description                     | Assertions (`expect.soft`)                                       |
| :----------- | :------------------------------ | :--------------------------------------------------------------- |
| ID(CNV-8464) | `filterByOSName` toggles per OS | Cards visible/count per spec; Windows branch skipped on `s390x`. |

---

### `004`: Filter by text

- **Objective:** Search by RHEL8 metadata name shows RHEL 8 card.
- **Test name:** `ID(CNV-8467) Filter by text`
- **Shared resources:** None.

| Step ID      | Description                      | Assertions (`expect.soft`) |
| :----------- | :------------------------------- | :------------------------- |
| ID(CNV-8467) | `searchTemplate(RHEL8 metadata)` | RHEL 8 card visible.       |

---

### `005`: Filter by boot source

- **Objective:** Boot source available filter shows RHEL 8, RHEL 9, Fedora, CentOS Stream 9.
- **Test name:** `ID(CNV-8641) Filter by boot source`
- **Shared resources:** None.

| Step ID      | Description                                                | Assertions (`expect.soft`)          |
| :----------- | :--------------------------------------------------------- | :---------------------------------- |
| ID(CNV-8641) | Clear search; `filterByBootSourceAvailable(true)` then off | All four templates visible when on. |

---

### `006`: Filter by OS and Workload

- **Objective:** Combined OS + workload behavior: **s390x** — Server workload, then RHEL + Server (RHEL9 visible, Fedora not). **Non-s390x** — Desktop vs Server with Windows templates, combined Windows + Server, then Desktop again per spec branches.
- **Test name:** `ID(CNV-8466) Filter by OS and Workload`
- **Shared resources:** None.

| Step ID      | Description      | Assertions (`expect.soft`)                                    |
| :----------- | :--------------- | :------------------------------------------------------------ |
| ID(CNV-8466) | Branch on `ARCH` | Visibility expectations per spec for each filter combination. |

---

### `007`: Show all templates

- **Objective:** “Show all templates” reveals CentOS Stream 9 card.
- **Test name:** `ID(CNV-8860) Show all templates`
- **Shared resources:** None.

| Step ID      | Description                 | Assertions (`expect.soft`) |
| :----------- | :-------------------------- | :------------------------- |
| ID(CNV-8860) | `clickAllTemplatesButton()` | CentOS Stream 9 visible.   |

---

### `008`: Template creation and project filtering

- **Objective:** Create templates (example UI, Kubernetes API user template, `oc` YAML with default provider label); verify example creation, user template on User provided tab, project template when catalog project selected.
- **Pre-conditions:** `namespace` = `testConfig.testNamespace` or `EnvVariables.testNamespace`; `cleanup.trackTemplate` for user and project templates; `ContextKey` for project template name/namespace.
- **Test name:** `Template creation and project filtering`
- **Shared resources / cleanup:** Templates tracked for cleanup; no `beforeAll` shared fixture.

| Step ID      | Description                                                                                                  | Assertions (`expect.soft`)                                                                                |
| :----------- | :----------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| — (setup)    | Project templates: `createTemplateFromExample`; `createTemplateFromResource`; `ocCli.createTemplateFromYaml` | —                                                                                                         |
| ID(CNV-9891) | `test.step` — example template                                                                               | `verifyTemplateCreationFromExample('Template details')`; Fedora display name visible.                     |
| ID(CNV-8860) | `test.step` — user template in catalog                                                                       | API verify user template; User provided tab; display name card visible.                                   |
| ID(CNV-8861) | `test.step` — per-project                                                                                    | API verify project template; `selectProjectFromCatalog`; User provided tab; project display name visible. |

---

### `009`: Instance type help text and series

- **Objective:** Instance Types tab: help text and all instance type series visible.
- **Test name:** `ID(CNV-10151) Instance type help text and series`
- **Shared resources:** None.

| Step ID       | Description                                              | Assertions (`expect.soft`) |
| :------------ | :------------------------------------------------------- | :------------------------- |
| ID(CNV-10151) | `verifyInstanceTypeHelpText`; `verifyInstanceTypeSeries` | Both `true`.               |

---

### `010`: Volume favorite and filters

- **Objective:** Filter volume by Fedora name; favorite/unfavorite flow; filter by OS (Fedora); filter by name (Fedora).
- **Test name:** `ID(CNV-10725) Volume favorite and filters`
- **Shared resources:** None (transient favorite toggle).

| Step ID       | Description                                                                                        | Assertions (`expect.soft`)                     |
| :------------ | :------------------------------------------------------------------------------------------------- | :--------------------------------------------- |
| ID(CNV-10725) | `filterVolumeByName`; `markVolumeFavoriteWithUnfavorite`; `filterVolumeByOS`; `filterVolumeByName` | Each step returns/behaves as asserted in spec. |

---

### `011`: Volume and Access mode on advanced settings

- **Objective:** Add volume flow: advanced settings; Volume mode and Access mode help links navigate to URLs containing `#volume-mode` and `#access-modes`.
- **Pre-conditions:** `testConfig.testNamespace` for catalog project dropdown.
- **Test name:** `ID(CNV-69246) Volume and Access mode on advanced settings`
- **Shared resources:** None.

| Step ID       | Description                                                      | Assertions (`expect.soft`)  |
| :------------ | :--------------------------------------------------------------- | :-------------------------- |
| ID(CNV-69246) | Select namespace; Add volume; Advanced; help icons and link URLs | URL fragments as specified. |

---

## 5. Requirements Traceability Matrix

| Jira Ticket        | Test Case ID        | Coverage Type                       | Status |
| :----------------- | :------------------ | :---------------------------------- | :----- |
| CNV-12357          | `001`               | `scenario-catalog-browsing.spec.ts` |
| CNV-8863           | `002`               | `scenario-catalog-browsing.spec.ts` |
| CNV-8464           | `003`               | `scenario-catalog-browsing.spec.ts` |
| CNV-8467           | `004`               | `scenario-catalog-browsing.spec.ts` |
| CNV-8641           | `005`               | `scenario-catalog-browsing.spec.ts` |
| CNV-8466           | `006`               | `scenario-catalog-browsing.spec.ts` |
| CNV-8860           | `007`, `008` (step) | `scenario-catalog-browsing.spec.ts` |
| CNV-9891, CNV-8861 | `008`               | `scenario-catalog-browsing.spec.ts` |
| CNV-10151          | `009`               | `scenario-catalog-browsing.spec.ts` |
| CNV-10725          | `010`               | `scenario-catalog-browsing.spec.ts` |
| CNV-69246          | `011`               | `scenario-catalog-browsing.spec.ts` |

## 6. Approvals

- **Prepared By:** Test automation / QE
- **Reviewed By:** **\*\*\*\***\_\_**\*\*\*\***
- **Approval Signature:** **\*\*\*\***\_\_**\*\*\*\***
