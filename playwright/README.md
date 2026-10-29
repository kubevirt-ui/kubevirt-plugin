# Playwright E2E (release-4.16)

Layout follows **console Virtualization nav** under `playwright/tests/` (`virtualization-landing/`, `catalog/`, `virtual-machines/`, …). **release-4.16** targets OpenShift Virtualization **4.16** with the **VM wizard** (`/vm-wizard`, template step `#vm-catalog-grid`) when deployed; tests still support legacy **`/templatescatalog`** tabs via the same page objects. CI lanes use Playwright **projects** `Gating`, `Tier1`, and `Tier2` via tags `@gating`, `@tier1`, `@tier2` (not `tests/gating/` folders). **Tier1 and Tier2 are disjoint:** each `test.describe` title must include only one of `@tier1` or `@tier2`; projects use `grepInvert` so dual-tagged suites are excluded from both lanes.

**STD (Software Test Description):** One route-named `*.md` per test folder (main template: [docs/STD-TEMPLATE.md](docs/STD-TEMPLATE.md)). Each `*.spec.ts` in that folder is a **module** in section 4 of the STD. Prefer **one spec file per route area** with multiple `test.describe` blocks (tier tags in the describe title) instead of many tiny spec files.

**Page objects / components (main-style):** UI interaction lives in `playwright/src/components/` (`BaseComponent` — `testId()`, `consoleTestId()`, `robustClick()`, loading waits) and `playwright/src/page-objects/` (`BasePage` extends `BaseComponent`). Route-scoped fixtures inject POs on the test instance (e.g. `@/fixtures/vm-detail-fixture`, `@/fixtures/catalog-fixture`, `@/fixtures/datasources-fixture`). Specs import the narrowest route fixture and use `catalogPage`, `vmDetailPage`, etc. from the test callback — do not `new` page objects in specs. Shared flows belong in page objects; keep `.spec.ts` files to imports and `test`/`test.describe` only (tier-shared cases use `*.suite.ts` + `test-scenarios/tier-registration.ts`).

Shared UI: `FilterToolbarComponent` (list name filter, column management, catalog OS/text filters via `CatalogPage`), `ModalComponent` (delete confirm), `LabelsModalComponent` (edit labels). `ResourceListPage` composes filter + modal helpers.

**Imports:** specs and helpers under `playwright/` use the `@/` alias for `playwright/src/` (see `playwright/tsconfig.json`), e.g. `import { GATING_TAG } from '@/data-models/allure-constants'`.

Route filters (main-style):

```bash
./playwright-runner.sh auto -g @route-catalog
./playwright-runner.sh Gating -g @route-virtualization-landing
```

## Prerequisites

- Node **>= 18** (Playwright **1.62+** with Allure **3.8.x**; run `npm run playwright-install` after `npm install`)
- **Remote cluster (privileged):** console credentials in repo-root `.env` — global setup uses UI login + `/api/kubernetes` only (no `oc`). **Non-priv** lanes still use `oc` for IDP/RBAC prep (see below).
- **Local console:** `npm run dev` + `npm run start-console` — no `oc`, no automated login (see [Local console](#local-console-gating--tier1--tier2) below)

If you see `unknown command 'test-server'`, the installed `@playwright/test` is too old for the Cursor/Playwright extension — run `npm install` and `npm run playwright-install` after pulling.

## Authentication (main-style)

1. **`global.setup.ts`** runs the **rule engine** (same layout as kubevirt-ui `main`): `rule-engine/setup-rules.ts` → AUTH → CLUSTER → BROWSER → REPORTING.
2. **`playwright.config.ts`** sets `use.storageState` so every test `page` is already signed in.
3. **`global.teardown.ts`** runs `teardown-rules-{namespace,cluster,files}.ts` (NAMESPACE → CLUSTER → FILES).
4. **`cluster-prep.ts`** — optional pre-suite cleanup (`SKIP_CLUSTER_PREP=1` to skip).
5. **Specs must not perform login** — only navigate and assert.

**Login page:** Console redirects to **oauth-openshift** (`Log in with` → links such as **kube:admin** and **test-users** when configured). Privileged setup clicks **kube:admin** and uses `OPENSHIFT_USERNAME` / `OPENSHIFT_PASSWORD`. If no chooser appears, setup fills the kubeadmin form directly. Non-priv setup selects **`test-users`** (htpasswd user **`test`**) after `ensure-nonpriv-idp-user`; use **`./playwright-runner.sh tier1-nonpriv`** so `NON_PRIV=1` and `TEST_IDP` are set.

Kubeconfig path: `.kubeconfigs/test-config` (main-style). Teardown **deletes storage state** unless you use `DEBUG=1` (keeps kubeconfig) — re-run global setup after a full teardown locally.

```bash
# Refresh session file
rm -f .storage-states/*.json
npm run test-playwright -- --project=Gating

# Reuse existing session (skip login in setup)
REUSE_STORAGE_STATE=1 npm run test-playwright -- --project=Gating
```

Non-priv uses projects **`Tier1NonPriv`** / **`Tier2NonPriv`** with `.storage-states/nonpriv-state.json`. They match Tier1/Tier2 via `@tier1` / `@tier2` but **`grepInvert: /@admin-only/`** excludes kubeadmin-only specs (DataSources/MigrationPolicies/Templates CRUD, live migration, etc.). Creation for non-priv is covered by **`@non-priv`** catalog/VM flows (quick-create, Create → From catalog, YAML create, customize wizard).

**Global setup (`NON_PRIV=1`):** kubeadmin `oc login` → **`ensure-nonpriv-idp-user`** creates/updates the **`test-users`** htpasswd IDP and user **`test`** / **`test`** (kubevirt-ui 5.0) → browser login via `TEST_IDP=test-users` → navigate to **`/k8s/cluster/projects`** (Administrator perspective; default post-login is often Developer on 4.16+) → `nonpriv-state.json`. Use **`./playwright-runner.sh tier1-nonpriv`** so env vars are set. Regenerate storage state after perspective/login changes (delete `.storage-states/nonpriv-state.json` or omit `REUSE_STORAGE_STATE`):


```bash
NON_PRIV=1 TEST_USERNAME=test TEST_PASSWORD=test npm run test-playwright -- --project=Tier1NonPriv --workers=1

# Then reuse session for faster runs
REUSE_STORAGE_STATE=1 ./playwright-runner.sh tier1-nonpriv --workers=4
./playwright-runner.sh tier2-nonpriv --workers=4
```

Namespaces get `oc adm policy add-role-to-user admin test -n <ns>` via the `test` fixture when `NON_PRIV=1`.

### CRUD coverage (by route)

| Route folder              | Gating                                                                   | Tier1                                                                                                      | Tier2                                                                         |
| ------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `virtualization-landing/` | nav, all overview sub-tabs, **Settings Cluster/User**, catalog entry     | overview cards                                                                                             | (Migrations read moved to gating)                                             |
| `catalog/`                | grid read; **create** via `vm-creation-gating` (template + boot vol.)    | filters, customize btn, **customize → create**                                                             | filter toolbar, **review wizard tabs → create**                               |
| `virtual-machines/`       | list read, detail tabs, **YAML create**                                  | metrics, labels, delete, **detail tab CRUD** (metadata, snapshots, disks modal), **Create → From catalog** | scripts/scheduling/env CRUD, disks attach/detach, column mgmt, live migration |
| `vm-templates/`           | list read, **YAML create**                                               | labels + delete                                                                                            | column management                                                             |
| `instance-types/`         | catalog route read, cluster list read, **user InstanceType YAML create** | labels, delete                                                                                             | delete from list                                                              |
| `preferences/`            | cluster list read, **ClusterPreference YAML create**                     | label update, delete                                                                                       | delete from list                                                              |
| `bootable-volumes/`       | list read, **Add volume → With YAML**, **With form** (registry smoke)    | **With form** → DataSources list verify                                                                    | **With form** create + DataSources delete                                     |
| `migration-policies/`     | list read, **YAML create**                                               | label update, delete                                                                                       | form create, edit policy                                                      |
| `datasources/`            | cluster DS list, **YAML create**                                         | labels, delete, inventory                                                                                  | form create, annotations                                                      |

**Counts (approx.):** Gating **17** (incl. UI creates per route), Tier1 **17**, Tier2 **17** (incl. 1 skipped live-migrate).  
Setup/teardown uses the worker-scoped `apiClient` fixture from `scenario-test-fixture.ts` (`RequestContextClient` → console `/api/kubernetes` proxy), matching kubevirt-plugin `main` naming. Residual `oc` is only for non-priv RBAC (`oc adm policy`) and global teardown janitor.

**UI create specs** assert in the spec with `expect.poll` on `apiClient.*Exists()` and `expect(...)` on page-object locators (list row, detail heading, etc.).

```typescript
import { test, expect } from '@/fixtures/datasources-fixture';
```

## Environment (`.env`)

Create a **gitignored** `.env` at the repo root. Variables are loaded via:

- [`playwright/load-env.ts`](load-env.ts) (imported by `playwright.config.ts`, `global.setup`, and tests)
- `npm run test-playwright*` also passes `node --env-file=.env` when the file exists
- [`playwright-runner.sh`](../playwright-runner.sh) runs `source .env`

**UI mode:** prefer `npm run test-playwright-ui` so the test server process gets `.env`. Raw `npx playwright test --ui` only loads env if `playwright.config.ts` runs (it should, after the `load-env` import).

Shell variables **override** `.env` (`scripts/playwright-env.sh` + `load-env.ts` `override: false`). Use inline `IS_LOCAL=1` even when `.env` has `IS_LOCAL=0`:

```bash
IS_LOCAL=1 ./playwright-runner.sh gating --workers=4
IS_LOCAL=1 npm run test-playwright-headless -- --project=Gating
```

### Remote cluster (typical)

```bash
WEB_CONSOLE_URL=https://console-openshift-console.apps.<cluster-domain>
CLUSTER_URL=https://api.<cluster-domain>:6443   # optional; derived from WEB_CONSOLE_URL when omitted

OPENSHIFT_USERNAME=kubeadmin
OPENSHIFT_PASSWORD=<secret>

IS_LOCAL=0
```

Alternatives: `BRIDGE_BASE_ADDRESS` / `BRIDGE_KUBEADMIN_PASSWORD` (CI), or `CLUSTER_NAME` + `CLUSTER_DOMAIN` to build the console URL (`EnvVariables` in [`playwright/src/utils/env-variables.ts`](src/utils/env-variables.ts)).

### Local plugin + console

`npm run dev` + `npm run start-console` — auth disabled on the bridge; global setup writes `.storage-states/test-state.json` (no `oc`, no OAuth). Keep `oc login` on the host only if the bridge needs a cluster token.

```bash
IS_LOCAL=1
WEB_CONSOLE_URL=http://localhost:9000

SKIP_CLUSTER_PREP=1
SKIP_NONPRIV_IDP_SETUP=1
SKIP_GLOBAL_TEARDOWN=true
REUSE_STORAGE_STATE=1   # after the first run
```

`IS_LOCAL=1` always skips `oc` (even if `WEB_CONSOLE_URL` is still a remote host). For remote browser-only runs without `IS_LOCAL`, use `SKIP_OC_LOGIN=1` and `REUSE_STORAGE_STATE=1`.

### Non-priv lanes

```bash
NON_PRIV=1
TEST_USERNAME=test
TEST_PASSWORD=test
TEST_IDP=test-users
# SKIP_NONPRIV_IDP_SETUP=1   # cluster already has test-users + test user
```

Use `./playwright-runner.sh tier1-nonpriv` / `tier2-nonpriv` so env is set consistently.

### Auth, setup, and debug

| Variable                                       | Purpose                                                                                                                                                                                        |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REUSE_STORAGE_STATE=1`                        | Skip login in global setup if `.storage-states/*.json` exists                                                                                                                                  |
| `SKIP_GLOBAL_SETUP=true`                       | Requires pre-existing storage state                                                                                                                                                            |
| `SKIP_GLOBAL_TEARDOWN=true`                    | Skip teardown (common for local dev)                                                                                                                                                           |
| `SKIP_OC_LOGIN=1`                              | Skip `oc login` / CI kubeconfig copy (browser-only setup)                                                                                                                                      |
| `SKIP_CLUSTER_PREP=1`                          | Skip `cluster-prep.ts` janitor before a run                                                                                                                                                    |
| `DEBUG=1`                                      | Keep `.kubeconfigs/test-config` on teardown                                                                                                                                                    |
| `DEBUG_MODE=1` / `HEADED=1` / `HEADLESS=false` | Headed / visible browser (with `launchOptions`)                                                                                                                                                |
| `CNV_NAMESPACE`                                | HCO / HyperConverged namespace (default `openshift-cnv`; not the `kubevirt-ui-features` ConfigMap namespace)                                                                                     |
| InstanceTypes                                  | **Always on:** global setup + tests patch **`default/kubevirt-ui-features`** → `instanceTypesEnabled=true` (HTTP). Non-priv boot volumes use project **`openshift-virtualization-os-images`**. See `.cursor/rules/playwright-instancetypes.mdc` |
| `PLAYWRIGHT_VM_WIZARD`                         | Set `1` to force **`/vm-wizard`** catalog entry when the cluster still exposes legacy **`/templatescatalog`** only                                                                               |
| `TEST_NAMESPACE`                               | Optional fixed namespace for tests                                                                                                                                                             |
| `WORKERS`                                      | Playwright worker count (default **4**)                                                                                                                                                        |

### release-4.16 console notes

- **Catalog:** Wizard creation-method tiles or legacy **Template catalog / InstanceTypes** tabs; `CatalogPage` helpers pick the path at runtime.
- **VM detail:** Top-level **Configuration** tab with vertical sub-tabs (`storage`, `network`, `scheduling`, `initial`, …). Cloud-init / Environment lives under **Configuration → Storage**.
- **Features ConfigMap:** Plugin reads **`default/kubevirt-ui-features`**; setup ensures reader RBAC and patches `instanceTypesEnabled` there (`CNV_NAMESPACE` is for HCO only).
- **Non-priv:** Global setup provisions **`test-users`** htpasswd IDP unless `SKIP_NONPRIV_IDP_SETUP=1`; post-login navigation uses **`/k8s/cluster/projects`** for Administrator perspective.

Kubeconfig path: `.kubeconfigs/test-config`. Storage state: `.storage-states/test-state.json` (priv) / `nonpriv-state.json` (non-priv).

### Reporting and CI

| Variable                               | Purpose                                                               |
| -------------------------------------- | --------------------------------------------------------------------- |
| `USE_ALLURE=0`                         | Use `test-results/` instead of `allure-results/`                      |
| `ARTIFACTS_DIR=1`                      | Ensure artifact dirs exist                                            |
| `PLAYWRIGHT_OUTPUT_DIR`                | Override Playwright `outputDir`                                       |
| `CI=1`                                 | `forbidOnly`; retries default to 0 unless `PLAYWRIGHT_RETRIES` is set |
| `PLAYWRIGHT_RETRIES`                   | Retry count                                                           |
| `PW_SHARDS` / `PLAYWRIGHT_SHARD_INDEX` | Sharding; JUnit → `junit-results/junit-shard-<index>.xml`             |
| `PLAYWRIGHT_PROJECT`                   | Default project when using npm scripts / container runner             |

### Quay image publish (`playwright/containers/test-quay-build.sh`)

```bash
QUAY_REGISTRY=quay.io
QUAY_USERNAME=org+robot_name
QUAY_PASSWORD=<secret>
QUAY_REPOSITORY=org/kubevirt-plugin-playwright
```

Do not commit robot credentials; set them only in local `.env` or CI secrets.

## Reporting (Allure + JUnit, kubevirt-ui main)

- Default: Playwright `outputDir` and Allure results → repo-root **`allure-results/`** (`USE_ALLURE=0` → **`test-results/`**).
- JUnit for CI → **`junit-results/junit.xml`** (sharded runs: `junit-shard-<index>.xml`).
- Global setup writes **`environment.properties`** / **`environment.json`** into the results dir (cluster version, CNV, user mode, optional shard info).
- Specs can use `withAllure({ feature, tags })` from `@/utils/allure` or `@/utils/test-helpers`; tier tags stay in describe titles for project `grep`.
- Auto fixture label: **`userMode`** = `priv` | `nonpriv`.

```bash
# After a run (requires Allure CLI: https://docs.qameta.io/allure/)
allure serve allure-results
```

## Container image (CI / reproducible runs)

See **[playwright/containers/README.md](containers/README.md)** — `Containerfile` + `run-tests-container.sh` (kubevirt-ui pattern, Playwright base aligned with root `package.json`, slim npm deps for 4.16).

```bash
playwright/containers/run-tests-container.sh build
playwright/containers/run-tests-container.sh test --project=Tier1 --workers=4
```

## Local console (Gating / Tier1 / Tier2)

Same lanes as CI, against `http://localhost:9000` with the plugin on port **9001**. `start-console.sh` runs the bridge with **auth disabled** — global setup opens the console once and writes `.storage-states/test-state.json` (no `oc`, no OAuth password). Re-runs skip login when `REUSE_STORAGE_STATE=1` and that file exists.

1. `oc login` to your cluster (for the bridge token only — Playwright does not call `oc` when `IS_LOCAL=1`).
2. Set [local `.env`](#local-plugin--console) values (or `IS_LOCAL=1 ./playwright-runner.sh …`).
3. Start the stack: `npm run dev` and `npm run start-console`.
4. Run lanes:

```bash
./playwright-runner.sh gating --workers=4
./playwright-runner.sh tier1 --workers=4
./playwright-runner.sh tier2 --workers=4
```

`IS_LOCAL=1` always disables `oc` (including when `WEB_CONSOLE_URL` is still a remote cluster). For remote browser-only runs without `IS_LOCAL`, use `SKIP_OC_LOGIN=1` and `REUSE_STORAGE_STATE=1`.

## Run (remote cluster)

```bash
npm install
npm run playwright-install
# create .env — see Environment section above

./playwright-runner.sh gating --workers=4
./playwright-runner.sh tier1 --workers=4
./playwright-runner.sh tier2 --workers=4
./playwright-runner.sh tier1-nonpriv --workers=4
./playwright-runner.sh tier2-nonpriv --workers=4
npm run test-playwright-ui
./playwright-runner.sh auto playwright/tests/catalog/
```
