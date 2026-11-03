# uit-413 Playwright notes (release-4.13 branch)

**Cluster:** `uit-413-9821` · Plugin on cluster may lag **release-4.13** sources in this repo.

## Catalog entry

| Build on cluster       | URL                             | UI                                                                 |
| ---------------------- | ------------------------------- | ------------------------------------------------------------------ |
| Legacy                 | `/k8s/ns/<ns>/templatescatalog` | Tabs: **Template catalog** \| **InstanceTypes** (`/instanceTypes`) |
| Wizard (when deployed) | `/k8s/ns/<ns>/vm-wizard`        | Creation-method tiles: template / instance-type / clone            |

VM list **Create** may be **From template** (dropdown) instead of split **Create → wizard**.

Quick create after template select: modal **Quick create VirtualMachine** with textbox `virtualmachine name`.

## VM detail tabs (hybrid on uit-413)

Top-level: Overview, Details, Metrics, YAML, **Configuration**, Events, Console, Snapshots, Diagnostics.

Scheduling, Network, Disks, Scripts, etc. live under **Configuration** with vertical tabs `data-test="vm-configuration-<key>"` (`details`, `storage`, `network`, `scheduling`, `initial`, …). Deep links often use hash: `/configurations#scheduling`.

**Environment** (cloud-init / config maps) is on the **Storage** configuration sub-tab, not a top-level tab.

## Virtualization nav (4.13 plugin — feature-gated)

Additional nav entries the plugin can expose (see `src/views/navigation/`):

| `data-test`                                   | Route / resource                                                             |
| --------------------------------------------- | ---------------------------------------------------------------------------- |
| `virtualmachineclusterinstancetypes-nav-item` | Cluster + user `VirtualMachineInstancetype` lists (`KUBEVIRT_INSTANCETYPES`) |
| `virtualization-bootablevolumes-nav-item`     | `/k8s/ns/<ns>/bootablevolumes`                                               |
| `vmnetwork-nav-item`                          | `/k8s/cluster/virtualmachine-networks`                                       |
| `virtualization-settings-nav-item`            | Virtualization settings (features / `kubevirt-ui-features`)                  |

Playwright: `ConsoleRoutes.clusterInstanceTypes()`, `bootableVolumesInNamespace(ns)`, `NavigationPage.goToInstanceTypes()` / `goToBootableVolumes()`.

## InstanceTypes developer preview

- **Cluster:** ConfigMap `openshift-cnv/kubevirt-ui-features`, key `instanceTypesEnabled: "true"` — always patched in global setup and before each test (HTTP). InstanceTypes specs must not be skipped.
- **Settings (4.13 plugin):** Virtualization → Settings → **Preview features** → toggle _Enable InstanceTypes catalog developer preview_ (same ConfigMap key).
- **Catalog UI (uit-413 legacy):** `/templatescatalog/instanceTypes` — three-step flow (boot volume → series/size → VM details). First visit may show a **Developer preview** dialog with **Enable** (cluster admin). Gating asserts the compact **Developer preview** label popover (production warning) on the boot-volume step (`catalog-instance-types.spec.ts`).
- **Console URLs** use `instancetype.kubevirt.io~v1alpha2~` (not `v1beta1`) for list/detail CRUD. **Catalog entry** is `/k8s/ns/<ns>/templatescatalog/instanceTypes`.
- **`/virtualization-settings`** may **404** on uit-413; use **Overview → Settings** sub-tab for HCO/settings read gating. Standalone settings specs skip when the route is missing.

## E2E env

```bash
unset CLUSTER_URL WEB_CONSOLE_URL OPENSHIFT_PASSWORD OPENSHIFT_USERNAME
source scripts/playwright-env.sh && playwright_bootstrap_env .env
# API down but console up (rare): SKIP_OC_LOGIN=1 REUSE_STORAGE_STATE=1
./playwright-runner.sh gating --workers=2
```

If **API** and **console** time out, refresh kubeconfig (`oc login`) and regenerate storage state (drop `REUSE_STORAGE_STATE` once).
