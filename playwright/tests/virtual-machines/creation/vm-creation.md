# VM creation flows (gating vs tiers)

## Gating (`@gating`)

Smoke **create** only (API cleanup in `finally`). Entry paths validated on **CNV 4.17.0**:

| Path                                  | Spec                                                                                      |
| ------------------------------------- | ----------------------------------------------------------------------------------------- |
| **YAML**                              | `vm-creation-gating.spec.ts` — VM list → import YAML                                      |
| **Template**                          | `vm-creation-gating.spec.ts` — `templatescatalog` quick create (CNV-8848)                 |
| **Boot volume**                       | `vm-creation-gating.spec.ts` — InstanceTypes tab → bootable preference + series           |
| **Boot volume — dev preview tooltip** | `catalog/catalog-instance-types.spec.ts` — Developer preview label popover on volume step |

## Tier1 / Tier2 — full CRUD

| Path                                      | Spec                                          |
| ----------------------------------------- | --------------------------------------------- |
| YAML create + UI delete, labels           | `list/vm-list-ui.spec.ts`                     |
| Template quick create → Running           | `catalog/catalog.spec.ts` (tier1)             |
| Template customize / review               | `catalog/catalog-customize.spec.ts`           |
| Boot volume create + UI delete            | `catalog/catalog-instance-types-crud.spec.ts` |
| Boot volume customize name                | `catalog-instance-types-crud.spec.ts` (tier1) |
| Alternate series (read/create affordance) | `catalog-instance-types-crud.spec.ts` (tier2) |
