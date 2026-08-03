---
title: 'VM Creation Wizard & Detail — Auto-Applied Labels'
jira: 'CNV-94368'
polarion: ''
owner: ''
lastReviewed: '2026-08-12'
testFile: 'playwright/tests/tier2/auto-applied-labels/wizard-vm-detail-auto-labels.spec.ts'
---

## Overview

Consolidated tests for wizard drawer behavior, label protection, VM creation label propagation, and VM detail metadata tab. Uses 3 tests with `test.step()` for granular reporting while minimizing redundant wizard navigations and VM creations.

## Prerequisites

- Admin access to the cluster
- CNV operator installed with `kubevirt-ui-features` ConfigMap available
- Bootable volumes available for VM creation (RHEL-based)
- RHEL9 template available in the `openshift` namespace

## Test Cases

### Test 1 — Wizard drawer and label protection

Single wizard session covering:
- Next button disabled when required labels have no value
- Required labels drawer opens automatically on Customization step
- Filling required label values and closing drawer enables Next
- Auto-applied keys cannot be deleted from Labels tab
- Admin-set values cannot be edited
- Admin-empty values can be edited

### Test 2 — VM creation applies correct labels

Single VM creation covering:
- Required label with user-filled value appears on VM
- Admin-set label appears on VM
- Optional label without value is excluded from VM

### Test 3 — VM detail metadata tab enforces label restrictions

Single API-created VM with all label types covering:
- Auto-applied labels show correct values
- Auto-applied keys cannot be deleted
- Admin-empty value labels are editable
- User-added labels remain deletable

## Requirements Traceability Matrix

| Case | Jira      | Test Step                                        | Status |
| ---- | --------- | ------------------------------------------------ | ------ |
| 001  | CNV-94368 | "Next button is disabled..."                     | Active |
| 002  | CNV-94368 | "Required labels drawer opens automatically"     | Active |
| 003  | CNV-94368 | "Next button is enabled after filling..."        | Active |
| 004  | CNV-94368 | "Auto-applied keys cannot be deleted"            | Active |
| 005  | CNV-94368 | "Admin-set values cannot be edited"              | Active |
| 006  | CNV-94368 | "Admin-empty values can be edited"               | Active |
| 007  | CNV-94368 | "Required label applied"                         | Active |
| 008  | CNV-94368 | "Admin-set label applied"                        | Active |
| 009  | CNV-94368 | "Optional empty label excluded"                  | Active |
| 010  | CNV-94368 | "Auto-applied labels show correct values"        | Active |
| 011  | CNV-94368 | "Auto-applied keys cannot be deleted (detail)"   | Active |
| 012  | CNV-94368 | "Admin-empty value labels are editable (detail)" | Active |
| 013  | CNV-94368 | "User-added labels remain deletable"             | Active |
