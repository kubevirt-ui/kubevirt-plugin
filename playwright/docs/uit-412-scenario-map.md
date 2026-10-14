# uit-412 Playwright scenario map (playwright-cli exploration)

**Cluster:** `uit-412-8728` · Console plugin: `kubevirt-plugin` (enabled on cluster) · CNV `4.12.36`

**Credentials (QE):**

| Role     | IDP                             | User        | Password            |
| -------- | ------------------------------- | ----------- | ------------------- |
| Admin    | `kube:admin`                    | `kubeadmin` | (cluster kubeadmin) |
| Non-priv | **`test-users`** (htpasswd IDP) | `test`      | `test`              |

Set `NON_PRIV=1`, `TEST_USERNAME=test`, `TEST_PASSWORD=test`, `TEST_IDP=test-users` for non-priv projects. Global setup provisions the **`test-users`** IDP and htpasswd user when missing (see `nonpriv-user-setup.ts`, aligned with kubevirt-ui 5.0).

---

## Console behavior (both users)

1. **Login:** OAuth page offers `kube:admin` and **`test-users`** (after setup) or legacy `test` on some clusters. After login, land on `/dashboards`. Masthead uses **“User menu”** (not `user-dropdown`); use `perspective-switcher-toggle` or URL wait in `global.setup`.
2. **Virtualization nav:** Click `[data-test-id="virtualization-nav-item"]` to expand. Sub-links (all-namespaces URLs on uit-412):

| UI label          | Path                                                                  |
| ----------------- | --------------------------------------------------------------------- |
| Overview          | `/k8s/all-namespaces/virtualization-overview`                         |
| Catalog           | `/k8s/ns/<ns>/templatescatalog`                                       |
| VirtualMachines   | `/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine`                   |
| Templates         | `/k8s/all-namespaces/template.openshift.io~v1~Template`               |
| DataSources       | `/k8s/all-namespaces/cdi.kubevirt.io~v1beta1~DataSource`              |
| MigrationPolicies | `/k8s/all-namespaces/migrations.kubevirt.io~v1alpha1~MigrationPolicy` |

3. **Prefer direct `page.goto` + project switch** for stability; nav expand is still needed for nav-only gating tests.
4. **Self-contained namespaces:** `oc new-project` + `oc adm policy add-role-to-user admin test -n <ns>` when `NON_PRIV=1` (matches Cypress `newProject`).

### Non-priv (`test`/`test`) on uit-412

playwright-cli confirms **same Virtualization submenu** as kubeadmin: Overview, Catalog, VMs, Templates, DataSources, MigrationPolicies all load (no 403 on list pages). Cypress **t1-nonpriv** still omits some **barrel** imports (`datasources.cy.ts`, `migrationpolicies.cy.ts`, `templates.cy.ts`); nested specs may still exist—align Playwright with **kubevirt-ui `release-4.12-t1-nonpriv` file list**, not only RBAC visibility.

---

## Playwright layout (main-style routes + tier tags)

Folders under `playwright/tests/` mirror **console routes**, not Cypress `tier1/` folders. CI lanes use tags: `@gating`, `@tier1`, `@tier2`, plus `@route-*` from [`route-tags.ts`](../src/data-models/route-tags.ts).

---

## Gating (`release-4.12-gating` → `tests/gating/*.cy.ts` only in CI)

| Cypress source                        | CNV / scope          | Playwright target                                                                                     | Tags                                                                       | PO / hooks / infra                                                                                                                                                                                                                                                                                                 |
| ------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `gating/create-vm-from-catalog.cy.ts` | CNV-8848, 8850, 8851 | `catalog/catalog.spec.ts` (+ customize in `catalog-customize.spec.ts`)                                | `@gating` `@route-catalog`                                                 | Catalog route only (`templatescatalog`): `#vm-catalog-grid`, `#filter-text-input`, `[data-test-id="customize-vm-btn"]` / `[data-test-id="quick-create-vm-btn"]`, `[data-test-id="vm-name-input"]` (4.12 drawer), legacy `#vm-customize-NAME`; template tiles `.vm-catalog-grid-tile`; per-test NS; wait VM Running |
| `gating/tabs-are-loaded.cy.ts`        | Tab smoke            | `virtualization-landing/virtualization-landing.spec.ts` + `virtual-machines/detail/vm-detail.spec.ts` | `@gating` `@route-virtualization-landing` `@route-virtual-machines-detail` | VM YAML create (`Create` → `With YAML` → `[data-test="save-changes"]`); tabs `[data-test-id="horizontal-link-*"]`; start `[data-test-id="vm-action-start"]`; overview status `[data-test-id="virtual-machine-overview-details-status"]`                                                                            |

**Not in gating specPattern but in repo tree:** `regression/nad.cy.ts`, `regression/pvc-upload.cy.ts`, full tier1/tier2 trees—defer unless CI job runs them.

---

## Tier 1 (`release-4.12-t1` → `tests/tier1/*.cy.ts` barrels)

| Cypress module                              | Representative CNVs                                | Playwright route folder                                                                                | Tags                            | Admin-only?                             | Notes                                                                                                   |
| ------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `catalog/catalog-filter.cy.ts`              | 8464–8467, 8641, 8860–8863                         | `catalog/catalog-filter.spec.ts`                                                                       | `@tier1` `@route-catalog`       | No                                      | `data-test-id="osName-*"`, `workload-*`, `#filter-text-input`                                           |
| `catalog/catalog-disksource.cy.ts`          | disk source flows                                  | `catalog/catalog-disk-source.spec.ts`                                                                  | `@tier1` `@route-catalog`       | No                                      | Customize flow on catalog (in-drawer / wizard steps, not a separate nav route)                          |
| `catalog/catalog-examples.cy.ts`            | examples                                           | `catalog/catalog-examples.spec.ts`                                                                     | `@tier1` `@route-catalog`       | **Partial** (`adminOnlyIT` in file)     | Split admin vs non-priv tests                                                                           |
| `catalog/catalog-tabs.cy.ts`                | wizard tabs                                        | `catalog/catalog-customize-create-basic.spec.ts` (T1), `catalog/catalog-customize-wizard.spec.ts` (T2) | `@tier1` / `@tier2` `@non-priv` | No                                      | Tile → customize params → review wizard → create                                                        |
| `datasources/datasources.cy.ts`             | 9372–9379                                          | `migration-policies` N/A → **`datasources/`** new folder or `cdi-datasources` under route map          | `@tier1`                        | **adminOnlyIT**                         | List/create/edit/delete; cluster DS in `openshift-virtualization-os-images`                             |
| `migrationpolicies/migrationpolicies.cy.ts` | 9384–9388                                          | `migration-policies/migration-policies.spec.ts`                                                        | `@tier1`                        | **adminOnlyIT**                         | Empty state on uit-412; create form `/k8s/cluster/migrations.kubevirt.io~v1alpha1~MigrationPolicy/form` |
| `overview/overview.cy.ts`                   | 7924–7940, 7927, 7929, 7931, 9294–9297, 9361, 9363 | `virtualization-landing/virtualization-landing.spec.ts`                                                | `@tier1` `@tier2`               | **7927 Quick Starts** admin             | Cards: `data-test="getting-started"`, `[data-test-id="kv-overview-status-card"]`, quick-starts card     |
| `templates/template-list.cy.ts`             | list                                               | `vm-templates/templates-list.spec.ts`                                                                  | `@tier1`                        | **adminOnlyIT**                         | OpenShift Template CRD list                                                                             |
| `templates/template-clone.cy.ts`            | 8874+                                              | `vm-templates/template-clone.spec.ts`                                                                  | `@tier1`                        | **adminOnlyIT**                         |                                                                                                         |
| `templates/template-edit-bsr.cy.ts`         | BSR edit                                           | `vm-templates/template-edit-boot-source.spec.ts`                                                       | `@tier1`                        | No                                      |                                                                                                         |
| `virtualmachines/edit-details.cy.ts`        | 8839–8846                                          | `virtual-machines/detail/overview/`                                                                    | `@tier1`                        | No                                      |                                                                                                         |
| `virtualmachines/vm-actions.cy.ts`          | 8885–8886                                          | `virtual-machines/actions/`                                                                            | `@tier1`                        | No                                      | Clone, migrate actions                                                                                  |
| `virtualmachines/vm-list-kebab.cy.ts`       | kebab                                              | `virtual-machines/list/`                                                                               | `@tier1`                        | No                                      |                                                                                                         |
| `virtualmachines/vm-overview.cy.ts`         | overview cards                                     | `virtual-machines/detail/overview/`                                                                    | `@tier1`                        | No                                      |                                                                                                         |
| `virtualmachines/vm-start-in-pause.cy.ts`   | pause                                              | `virtual-machines/actions/`                                                                            | `@tier1`                        | **adminOnlyIT**                         |                                                                                                         |
| `virtualmachines/vm-status.cy.ts`           | status                                             | `virtual-machines/list/`                                                                               | `@tier1`                        | No                                      |                                                                                                         |
| `virtualmachines/vm-tab-details.cy.ts`      | details tab                                        | `virtual-machines/detail/configuration/`                                                               | `@tier1`                        | No                                      |                                                                                                         |
| `virtualmachines/vm-tab-metrics.cy.ts`      | metrics                                            | `virtual-machines/detail/` (metrics tab)                                                               | `@tier1`                        | No                                      |                                                                                                         |
| `virtualmachines/vm-windows.cy.ts`          | 8925–8928                                          | `catalog/catalog-vm-create-windows.spec.ts` (T1 + T2 modules)                                          | `@tier1` / `@tier2` `@non-priv` | admin + non-priv (T1); T2 disk variants | T1: HTTP URL; T2: registry, blank PVC, PVC clone; review rootdisk; list/detail validation               |
| `virtualmachines/vm-yaml.cy.ts`             | YAML                                               | `virtual-machines/list/vm-create-yaml.spec.ts`                                                         | `@tier1`                        | **adminOnlyIT**                         |                                                                                                         |

**Remove Cypress serial setup:** drop `a-setup/setup.cy.ts` / `z-cleanup/cleanup.cy.ts` as specs; replace with fixture `testNamespace` + `apiClient` helpers (see [`scenario-test-fixture.ts`](../src/fixtures/scenario-test-fixture.ts)).

### Tier 1 non-priv (`release-4.12-t1-nonpriv`)

| Included in Cypress lane                                                          | Playwright                                                                |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| All tier1 **catalog** nested specs + barrels                                      | Same specs; `Tier1NonPriv` excludes `@admin-only`                         |
| **No** barrels: `datasources.cy.ts`, `migrationpolicies.cy.ts`, `templates.cy.ts` | Tag describes `@admin-only`; Playwright `grepInvert` on non-priv projects |
| VM/catalog **create** (`vm-yaml`, catalog quick-create, Create → From catalog)    | `@non-priv` + tier tag; runs on `Tier1NonPriv` / `Tier2NonPriv`           |
| `ci-safe-mode-harness.cy.ts`                                                      | Optional CI harness spec (not product)                                    |
| `virtualmachines/*`, `overview`, catalog                                          | Run with `test` storage state + NS admin binding                          |

---

## Tier 2 (`release-4.12-t2` → `tests/tier2/*/*.cy.ts`)

| Cypress module                                    | CNV              | Playwright target                                         | Tags     | Admin-only?     | Infra                                               |
| ------------------------------------------------- | ---------------- | --------------------------------------------------------- | -------- | --------------- | --------------------------------------------------- |
| `livemigration/livemigration.cy.ts`               | 9365, 9370, 9534 | `virtual-machines/migrations/vm-live-migration.spec.ts`   | `@tier2` | **adminOnlyIT** | Multi-node migratable cluster; monitor migration UI |
| `virtualmachines/col-management.cy.ts`            | columns          | `virtual-machines/list/vm-list-column-management.spec.ts` | `@tier2` | No              |                                                     |
| `virtualmachines/vm-console-multiple-vnc.cy.ts`   | console          | `virtual-machines/detail/diagnostics/`                    | `@tier2` | No              | VNC infra                                           |
| `virtualmachines/vm-descheduler.cy.ts`            | descheduler      | `virtual-machines/detail/configuration/`                  | `@tier2` | No              |                                                     |
| `virtualmachines/vm-scripts.cy.ts`                | cloud-init/ssh   | `virtual-machines/detail/configuration/`                  | `@tier2` | No              | Mutates VM                                          |
| `virtualmachines/vm-tab-scheduling-scripts.cy.ts` | scheduling       | `virtual-machines/detail/configuration/`                  | `@tier2` | **adminOnlyIT** |                                                     |

**t2-nonpriv:** same file set as t2; run with `NON_PRIV=1` and skip admin-marked tests.

---

## Page objects to add (from exploration + Cypress)

| PO                           | Responsibility                                                        |
| ---------------------------- | --------------------------------------------------------------------- |
| `navigation-page.ts`         | Expand virt nav; **or** `gotoRoute(path)` helpers per table above     |
| `catalog-page.ts`            | Filters, template pick, customize/submit (extend URL/registry)        |
| `vm-detail-page.ts`          | Tabs, actions, status                                                 |
| `vm-list-page.ts`            | Create YAML, row/kebab, project switch                                |
| `overview-page.ts`           | Overview + sub-tabs (top-consumers, migrations, settings on overview) |
| `templates-page.ts`          | Template list/clone/edit                                              |
| `datasources-page.ts`        | CRUD on DataSource list                                               |
| `migration-policies-page.ts` | Create/list policies                                                  |

**Likely `data-test` gaps:** confirm on uit-412 via `playwright-cli snapshot` after each flow; plugin already exposes catalog `osName-*`, `workload-*`, nav `*-nav-item`, VM `horizontal-link-*`, `vm-action-start`.

---

## Auth / global setup

| Mode     | Env                                                                             | Storage file                         |
| -------- | ------------------------------------------------------------------------------- | ------------------------------------ |
| Admin    | default                                                                         | `.storage-states/test-state.json`    |
| Non-priv | `NON_PRIV=1`, `TEST_USERNAME=test`, `TEST_PASSWORD=test`, `TEST_IDP=test-users` | `.storage-states/nonpriv-state.json` |

Login IDP: `kube:admin` vs **`test-users`** via [`env-variables.ts`](../src/utils/env-variables.ts) `idp` getter. IDP/user created in global setup [`nonpriv-user-setup.ts`](../src/utils/nonpriv-user-setup.ts).

---

## Implementation order

1. **Gating:** catalog quick create (8848), pages load, VM tabs (port 8850/8851).
2. **Tier1 high value:** catalog-filter (done), overview cards, template-list, vm-actions, vm-overview.
3. **Tier1 admin cluster:** datasources, migration policies, quick starts.
4. **Tier2:** live migration last (cluster dependency).

---

## playwright-cli session artifacts

- Kubeadmin state: `playwright/docs/exploration-uit-412/kubeadmin-state.json` (optional reuse)
- CLI snapshots: `.playwright-cli/page-*.yml` under repo root from exploration session `uit412-explore` / `uit412-nonpriv`

**Re-run exploration:**

```bash
playwright-cli -s=uit412 open "https://console-openshift-console.apps.uit-412-8728.rhos-psi.cnv-qe.rhood.us"
# login via snapshot refs or run-code (see skill)
playwright-cli -s=uit412 goto .../templatescatalog
playwright-cli -s=uit412 snapshot
```
