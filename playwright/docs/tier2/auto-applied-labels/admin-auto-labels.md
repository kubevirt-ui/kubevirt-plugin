---
title: 'Admin Auto-Applied Labels — Settings'
jira: 'CNV-94368'
polarion: ''
owner: ''
lastReviewed: '2026-08-12'
testFile: 'playwright/tests/tier2/auto-applied-labels/admin-auto-labels.spec.ts'
---

## Overview

Tests admin Settings page management operations (add, edit value, toggle Required, delete) and validation rules (duplicate key, invalid format, value length) as a single progressive flow. The ConfigMap starts empty, each test builds on the previous state. Only one setup and one cleanup call are needed for the entire suite.

## Prerequisites

- Admin access to the cluster (Settings page requires cluster-admin privileges)
- CNV operator installed with `kubevirt-ui-features` ConfigMap available

## Test Cases

### 001 — Shows empty state when no labels exist

**Objective:** Verify the section renders an empty state message when ConfigMap has no labels.

### 002 — Invalid key format shows validation error

**Objective:** Verify that a key with spaces (invalid K8s label format) shows a validation error.

### 003 — Admin adds a label key and it persists to ConfigMap

**Objective:** Verify that adding a new key through the UI writes it to the ConfigMap.

### 004 — Duplicate key shows validation error

**Objective:** Verify that entering an existing key triggers a duplicate validation error.

### 005 — Admin edits label value and it persists

**Objective:** Verify that editing a label value persists to the ConfigMap.

### 006 — Value over 63 characters shows validation error

**Objective:** Verify that a value exceeding 63 characters triggers a validation error.

### 007 — Admin toggles Required and it persists

**Objective:** Verify that toggling the Required switch persists to the ConfigMap.

### 008 — Admin deletes a label and ConfigMap is empty

**Objective:** Verify that deleting a label removes it from the ConfigMap.

## Requirements Traceability Matrix

| Case | Jira      | Test Function                                        | Status |
| ---- | --------- | ---------------------------------------------------- | ------ |
| 001  | CNV-94368 | "Shows empty state when no labels exist"             | Active |
| 002  | CNV-94368 | "Invalid key format shows validation error"          | Active |
| 003  | CNV-94368 | "Admin adds a label key and it persists to ConfigMap" | Active |
| 004  | CNV-94368 | "Duplicate key shows validation error"               | Active |
| 005  | CNV-94368 | "Admin edits label value and it persists"            | Active |
| 006  | CNV-94368 | "Value over 63 characters shows validation error"    | Active |
| 007  | CNV-94368 | "Admin toggles Required and it persists"             | Active |
| 008  | CNV-94368 | "Admin deletes a label and ConfigMap is empty"       | Active |
