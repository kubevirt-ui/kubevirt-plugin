# Software Test Description (STD): Passt binding preview feature

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Feature Area:** Settings — Preview features — Passt binding
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-09-30
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

Verify that cluster admins can enable and disable **Passt binding for primary user-defined
networks** from **Settings → Preview features**, and that each change is stored on the
HyperConverged annotation `hco.kubevirt.io/deployPasstNetworkBinding`.

### 2.2 Scope

- **In-Scope:** Preview features tab, Passt binding switch, and the HyperConverged annotation
  after enabling (`true`) and disabling (`false`).
- **Out-of-Scope:** Attaching a Passt interface to a VirtualMachine, legacy
  `network.binding.passt` configuration, and the `PasstBinding` feature gate when the annotation
  is unset.

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift cluster with the CNV operator installed; Playwright `Settings`
  project.
- **Configuration:** HyperConverged CR `kubevirt-hyperconverged` exists in the configured CNV
  namespace.
- **Initial Setup:** User is logged in as cluster-admin (`@adminOnly`). An `afterAll` hook
  restores the original annotation value.

---

## 4. Test Case Definitions

**Spec file:** `tests/settings/passt-binding.spec.ts`
**Describe:** `Passt binding preview feature` — **Tags:** `@cnv-settings` `@adminOnly`

### `001`: Passt binding toggle updates the HyperConverged annotation

- **Objective:** Turning the preview switch on and off writes `true` and `false` to
  `hco.kubevirt.io/deployPasstNetworkBinding`.

| Step | Action                                                             | Expected Result                                   |
| :--- | :----------------------------------------------------------------- | :------------------------------------------------ |
| 1    | Open **Settings → Preview features**                               | Preview features tab loads                        |
| 2    | Turn **Enable Passt binding for primary user-defined networks** on | Switch is checked and the annotation is `true`    |
| 3    | Turn the same switch off                                           | Switch is unchecked and the annotation is `false` |
