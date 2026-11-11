# Playwright E2E (release-4.22)

Layout follows **console Virtualization nav** under `playwright/tests/` (`virtualization-landing/`, `virtual-machines/`, …). On **4.22**, VM create flows use the **VM wizard** opened from the VirtualMachines list **`#tour-step-create-button`** (primary **Create** → `/vm-wizard`; menu **With YAML** → `VirtualMachine/~new`). CI lanes use Playwright **projects** `Gating`, `Tier1`, and `Tier2` via tags `@gating`, `@tier1`, `@tier2`. **Tier1 and Tier2 are disjoint:** each `test.describe` title must include only one of `@tier1` or `@tier2`.

**STD:** One route-named `*.md` per test folder ([docs/STD-TEMPLATE.md](docs/STD-TEMPLATE.md)). Specs import the narrowest route fixture; interaction lives in `playwright/src/page-objects/` and `playwright/src/components/`.

**Imports:** `@/` → `playwright/src/` (see `playwright/tsconfig.json`).

Global setup patches **`openshift-cnv/kubevirt-hyperconverged`** (native VirtualMachine templates / user templates via `kubevirt.kubevirt.io/jsonpatch`) and **`kubevirt-ui-features`** (`instanceTypesEnabled`, `treeViewFolders`, …) before tests run.

Set **`PLAYWRIGHT_CONSOLE_RELEASE=4.22`** so `VmWizardPage` and `ConsoleRoutes.vmWizard()` target `/vm-wizard`. Legacy `/catalog` only with `PLAYWRIGHT_LEGACY_CATALOG=1` or `PLAYWRIGHT_VM_WIZARD=0`.

```bash
./playwright-runner.sh gating --workers=1
./playwright-runner.sh auto -g @route-vm-wizard
```

## Prerequisites

- Node **>= 22**, Playwright **1.63** — `npm install` then `npm run playwright-install`
- **Remote cluster:** repo-root `.env` (`WEB_CONSOLE_URL`, credentials, `PLAYWRIGHT_CONSOLE_RELEASE=4.22`)
- **Local console:** `npm run dev` + `npm run start-console` — `IS_LOCAL=1`, no automated login

## Authentication

Global setup writes `.storage-states/*.json`; specs must not log in. See existing sections in this file for `REUSE_STORAGE_STATE`, non-priv (`Tier1NonPriv` / `Tier2NonPriv`), and teardown behavior.

## VM creation coverage (4.22)

| Area                                | Specs                                                           |
| ----------------------------------- | --------------------------------------------------------------- |
| Wizard / tree Create → `/vm-wizard` | `vm-wizard-gating.spec.ts`, `vm-creation-wizard-gating.spec.ts` |
| Wizard navigation                   | `vm-wizard-gating.spec.ts`, `vm-wizard-tier1.spec.ts`           |

Catalog-route and InstanceTypes-catalog **VM CRUD** specs were removed; InstanceType **CRD** YAML CRUD remains under `instance-types/`.

## Environment (selected)

| Variable                     | Purpose                                          |
| ---------------------------- | ------------------------------------------------ |
| `PLAYWRIGHT_CONSOLE_RELEASE` | `4.22` enables `/vm-wizard` entry by default     |
| `PLAYWRIGHT_VM_WIZARD`       | `1` / `0` to force wizard vs legacy catalog URLs |
| `IGNORE_WELCOME=1`           | Skip welcome modals when supported               |

(Full variable list: search `playwright/README.md` history or `EnvVariables` in `playwright/src/utils/env-variables.ts`.)
