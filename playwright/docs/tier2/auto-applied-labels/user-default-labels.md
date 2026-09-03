---
title: 'User Default VM Labels — Settings'
jira: 'CNV-94368'
polarion: ''
owner: ''
lastReviewed: '2026-08-12'
testFile: 'playwright/tests/tier2/auto-applied-labels/user-default-labels.spec.ts'
---

## Overview

Tests the User Settings tab for default VM labels. Verifies that users can see admin-configured labels, edit values only when admin left them empty, and that edited values persist to the `kubevirt-user-settings` ConfigMap. Tests are grouped by shared ConfigMap state to minimize redundant writes.

## Prerequisites

- OpenShift with CNV operator installed
- `kubevirt-ui-features` and `kubevirt-user-settings` ConfigMaps available

## Test Cases

### 001 — Shows empty message when no admin labels configured

**Objective:** Verify informational message when no labels are configured.

### 002 — Displays admin-configured label keys

**Objective:** Verify all admin-configured keys appear in the user section.

### 003 — Cannot edit value where admin set a value

**Objective:** Verify the edit button is hidden for labels with admin-set values.

### 004 — Can edit value where admin left value empty

**Objective:** Verify the user can edit values that admin left empty.

### 005 — User-edited value persists to user-settings ConfigMap

**Objective:** Verify edited values persist to `kubevirt-user-settings` ConfigMap.

## Requirements Traceability Matrix

| Case | Jira      | Test Function                                             | Status |
| ---- | --------- | --------------------------------------------------------- | ------ |
| 001  | CNV-94368 | "Shows empty message when no admin labels configured"     | Active |
| 002  | CNV-94368 | "Displays admin-configured label keys"                    | Active |
| 003  | CNV-94368 | "Cannot edit value where admin set a value"               | Active |
| 004  | CNV-94368 | "Can edit value where admin left value empty"             | Active |
| 005  | CNV-94368 | "User-edited value persists to user-settings ConfigMap"   | Active |
