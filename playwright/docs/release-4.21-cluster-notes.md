# Playwright notes (release-4.21)

**Target:** OpenShift **4.21** / CNV **4.21** (reference cluster: `uit-421`).

## Console and catalog

| Entry                 | URL                                           | Notes                                                                                   |
| --------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------- |
| Template catalog      | `/k8s/ns/<ns>/catalog/template` or `/catalog` | VM wizard: creation-method tiles → template grid `#vm-catalog-grid`                     |
| InstanceTypes catalog | `/k8s/ns/<ns>/catalog/instanceTypes`          | Requires `kubevirt-ui-features` → `instanceTypesEnabled=true` (patched in global setup) |
| Legacy (opt-in)       | `/templatescatalog`                           | Set `PLAYWRIGHT_LEGACY_CATALOG=1` when the cluster still exposes old routes             |

VM list **Create** is usually the wizard split button; older builds may use **From template** in a dropdown.

## Non-priv (`test` / `test-users`)

- Post-login perspective is **Core platform** (4.21+), not **Administrator**.
- Global setup patches ConfigMaps via kubeadmin `oc` before browser login; browser post-login ConfigMap PATCH is skipped for non-priv.
- Namespaces: `oc adm policy add-role-to-user admin test -n <ns>` in the test fixture.

## VM detail

Top-level tabs include **Configuration**; Scheduling, Network, Disks, Scripts, etc. are vertical sub-tabs (`vm-configuration-*`). Environment / cloud-init is under **Configuration → Storage**.

## InstanceTypes

- Console list URLs use `instancetype.kubevirt.io~v1beta1~VirtualMachineInstancetype` (and cluster-scoped `VirtualMachineClusterInstancetype`).
- **Tier2** UI delete of user InstanceTypes from the list is **kubeadmin-only** (`@admin-only`); non-priv lanes use catalog create flows instead.

## Local / CI env

```bash
source scripts/playwright-env.sh && playwright_bootstrap_env .env
./playwright-runner.sh gating --workers=2
./playwright-runner.sh tier1-nonpriv --workers=1
```

Regenerate storage state after setup changes: remove `.storage-states/*.json` or omit `REUSE_STORAGE_STATE` once.
