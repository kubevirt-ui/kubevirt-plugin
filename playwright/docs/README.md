# Playwright Test Documentation

This folder contains Software Test Descriptions (STDs) for the KubeVirt Plugin Playwright gating test suite. STDs map test cases to automation and provide step-by-step procedures for manual or automated verification.

## Structure

| Path               | Description                                                          |
| ------------------ | -------------------------------------------------------------------- |
| [gating/](#gating) | Gating (CI) test cases — critical paths that must pass before merge. |
| Root               | Templates and developer tooling guides.                              |

---

## Gating

Gating tests verify that core virtualization pages and flows load and behave correctly. No cluster resources are created. Automation: `playwright/tests/gating/`.

| Document                                                                            | Description                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [scenario-catalog-browsing.md](gating/scenario-catalog-browsing.md)                 | Catalog Templates tab (filters, views, create/project visibility) and Instance Types tab (series, favorites, volume filters). Spec: `scenario-create-vm-browsing.spec.ts`.                     |
| [scenario-vm-creation-wizard.md](gating/scenario-vm-creation-wizard.md)             | VM creation wizard (gating): modal navigation through Deployment Details, Guest OS, Boot Source; cancel without creating VMs. Spec: `scenario-vm-creation-wizard.spec.ts`.                     |
| [scenario-virtualization-pages.md](gating/scenario-virtualization-pages.md)         | Home + virtualization overview sub-tabs, Instance types / Bootable volumes / Migration policies pages, tree view icons, Templates list filters. Spec: `scenario-virtualization-pages.spec.ts`. |
| [scenario-bootable-volumes-filters.md](gating/scenario-bootable-volumes-filters.md) | Bootable volumes filter toolbar validation. Spec: `scenario-bootable-volumes-filters.spec.ts`.                                                                                                 |
| [scenario-checkups-toasts.md](gating/scenario-checkups-toasts.md)                   | Checkups page toast notifications. Spec: `scenario-checkups-toasts.spec.ts`.                                                                                                                   |
| [scenario-set-default-sc.md](gating/scenario-set-default-sc.md)                     | Default StorageClass setting validation. Spec: `scenario-set-default-sc.spec.ts`.                                                                                                              |

---

## Developer Tooling

| Document                                                 | Description                                                                                                      |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [developer-tooling-setup.md](developer-tooling-setup.md) | Unified setup guide for Playwright MCP, CLI, and Extension — comparison, configuration, and usage for each tool. |
| [playwright-cli-setup.md](playwright-cli-setup.md)       | In-depth Playwright CLI reference (install, auth state, sessions, tracing, video).                               |

---

## Other

| Document                           | Description                             |
| ---------------------------------- | --------------------------------------- |
| [STD-TEMPLATE.md](STD-TEMPLATE.md) | Template for writing new STD documents. |

---

## STD Format

Each STD uses a **consistent format**:

1. **Project Overview** — Project name, feature area, related issue IDs.
2. **Introduction** — Purpose and scope (in-scope / out-of-scope).
3. **Test Environment & Prerequisites** — Environment and preconditions.
4. **Test Case Definitions** — One or more test cases (`001`, `002`, ...) with objective, preconditions (optional), and **step / action / expected result** tables.
5. **Requirements Traceability Matrix** — Mapping of requirement/issue IDs to test case IDs and automation spec paths.
