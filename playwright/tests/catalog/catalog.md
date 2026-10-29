# Software Test Description (STD): Catalog

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/catalog/`
- **Feature Area:** Gating / Tier1 / Tier2 — Templates catalog and customize review
- **Latest version:** CNV 4.15.0
- **Latest update:** 2026-10-26
- **Document Status:** Approved

## 2. Introduction

### 2.1 Purpose

E2E coverage for the VM wizard template catalog step (`/vm-wizard`), filters, customize/review steps, and VM create flows (parity with release-4.12 `templatescatalog` specs).

**Catalog entry (4.13 vs older console):** On the wizard, the first step is **Select a creation method** — tiles `data-test="creation-method-template"`, `creation-method-instance-type`, `creation-method-clone`; tests call `CatalogPage.prepareTemplateCatalogGrid()` (via `openCatalogInNamespace`) to select **Template catalog** and click **Next** before `#vm-catalog-grid`. Older clusters still expose `/templatescatalog` with **tabs** (Template catalog | InstanceTypes); the same helper selects the Template catalog tab. VM list **Create** may be a split button (wizard) or a dropdown with **From template** (legacy).

**InstanceTypes (developer preview):** Always enabled for Playwright (`instanceTypesEnabled=true` via HTTP). Catalog specs use the InstanceTypes tab on legacy `templatescatalog` or wizard `creation-method-instance-type`. Never skip tests because InstanceTypes is “off” — see `.cursor/rules/playwright-instancetypes.mdc`.

### 2.2 Scope

- **In-Scope:** All specs under `tests/catalog/` (import `@/fixtures/catalog-fixture`).
- **Out-of-Scope:** VM list entry points (see `tests/virtual-machines/list/virtual-machines-list.md`).

## 3. Test Environment & Prerequisites

- Templates available in test namespace / cluster catalog.
- Non-priv scenarios use `nonpriv-state.json` from global setup.

---

## 4. Test Case Definitions

### Module: `catalog.spec.ts`

**Tags:** `@route-catalog` `@gating` — grid read. Template quick-create **gating smoke** moved to `virtual-machines/creation/vm-creation-gating.spec.ts`; tier1 **Running** assertion stays here (CNV-8848).

### Module: `virtual-machines/creation/vm-creation-gating.spec.ts`

**Tags:** `@gating` — VM create smoke: **YAML**, **template catalog**, **boot volume** (InstanceTypes tab). See `vm-creation.md`.

---

### Module: `catalog-instance-types.spec.ts`

**Tags:** `@route-catalog` — InstanceTypes developer preview (read gating; tab switch + create tier1/tier2 admin). Requires `instanceTypesEnabled` via global setup.

---

### Module: `catalog-filter.spec.ts`

**Tags:** `@route-catalog` `@tier1` `@tier2` — OS/text filters and filter toolbar.

---

### Module: `catalog-customize.spec.ts`

**Tags:** `@route-catalog` `@tier1` `@tier2` `@non-priv` — customize read, basic create, review network tab, full wizard walk.

---

### Module: `catalog-vm-create-windows.spec.ts`

**Tags:** Windows catalog create — tier1 admin/non-priv ISO (CNV-8925), tier2 alternate disk sources (CNV-8926–8928).

---

### Module: `catalog-instance-types-crud.spec.ts`

**Tags:** `@route-catalog` — InstanceTypes catalog create/delete, customize name, alternate series (tier1/tier2 non-priv). User-provided InstanceType path is `@admin-only` (tier2).

---

### Module: `catalog-instance-types-wizard.spec.ts`

**Tags:** `@route-catalog` — wizard network customization walk, Linux create, Windows boot preference (tier1/tier2).

---

### Module: `catalog-instance-types-legacy.spec.ts`

**Tags:** `@route-catalog` — legacy `templatescatalog` InstanceTypes entry and series affordances (tier1/tier2 non-priv).

See also `catalog-instance-types.md` for InstanceTypes tab matrix.
