# Software Test Description (STD): Virtual Machines — Detail — Configuration — VSOCK

## 1. Project Overview

- **Project Name:** KubeVirt UI — Playwright E2E Tests
- **Route folder:** `tests/virtual-machines/detail/configuration/`
- **Feature Area:** Tier1 — VM configuration — VSOCK toggle
- **Latest version:** CNV 5.1.0
- **Latest update:** 2026-10-15
- **Document Status:** Draft

## 2. Introduction

### 2.1 Purpose

Verify that enabling VSOCK in the VM creation wizard and on an existing VM’s Configuration → Details tab persists `spec.template.spec.domain.devices.autoattachVSOCK` on the VirtualMachine resource.

### 2.2 Scope

- **In-Scope:**
  - Custom configuration wizard: Customization → Details → Enable VSOCK, create VM, API assertion
  - VM Configuration → Details: disable VSOCK, API assertion
- **Out-of-Scope:**
  - VSOCK feature gate management on the cluster KubeVirt CR
  - Running VM / pending-changes / migration behavior
  - Other configuration tabs (covered in `virtual-machines-detail-configuration.md`)

## 3. Test Environment & Prerequisites

- **Environment:** OpenShift cluster with CNV / KubeVirt
- **Configuration:** `VSOCK` enabled via KubeVirt `spec.configuration.developerConfiguration.featureGates`
- **Initial Setup:** Spec `beforeAll` creates a dedicated test namespace; VMs are tracked for cleanup

---

## 4. Test Case Definitions

### Module: `vm-configuration-vsock.spec.ts`

**Spec file:** `tests/virtual-machines/detail/configuration/vm-configuration-vsock.spec.ts`
**Describe:** `VM Configuration — VSOCK` — **Tags:** @tier1, @route-virtual-machines-detail-configuration
**Allure:** suite `VM Configuration — VSOCK`, feature `Tier 1`

---

### `001`: VSOCK toggle hidden when feature gate is disabled

- **Objective:** When the VSOCK feature gate is off, the Enable VSOCK control is not shown on wizard Customization → Details.
- **Pre-conditions:** VSOCK feature gate not enabled (`isVsockFeatureEnabled`). Skipped with "VSOCK enabled" when the gate is on.

| Step | Action                                               | Expected Result        |
| :--- | :--------------------------------------------------- | :--------------------- |
| 1    | Open custom VM wizard to Customization → Details tab | VSOCK toggle not shown |

---

### `002`: Custom VM VSOCK enable and disable updates VM spec

- **Objective:** Creating a custom VM with VSOCK enabled sets `autoattachVSOCK` on the VM; disabling VSOCK on Configuration → Details sets it to `false`.
- **Target version:** CNV 5.1.0
- **Jira References:** CNV-87123
- **Pre-conditions:** KubeVirt `VSOCK` feature gate enabled (`isVsockFeatureEnabled`). Skipped with "VSOCK not enabled" when the gate is off.
- **Tags:** @tier1

| Step | Action                                                                | Expected Result                             |
| :--- | :-------------------------------------------------------------------- | :------------------------------------------ |
| 1    | Run custom VM wizard with VSOCK on Customization Details, then create | VM is created                               |
| 2    | Open Configuration → Details, verify VM via API                       | `domain.devices.autoattachVSOCK` is `true`  |
| 3    | Turn off VSOCK on Configuration → Details, verify VM via API          | `domain.devices.autoattachVSOCK` is `false` |
