# Catalog — InstanceTypes (developer preview)

- **Route folder:** `tests/catalog/`
- **Latest version:** CNV 4.16.0
- **Latest update:** 2026-10-29
- **Specs:** `catalog-instance-types.spec.ts`, `catalog-instance-types-crud.spec.ts`, `catalog-instance-types-wizard.spec.ts`, `catalog-instance-types-legacy.spec.ts`
- **Fixture:** `@/fixtures/catalog-fixture`

## Prerequisites

- Global setup and each test patch **`default/kubevirt-ui-features`** → `instanceTypesEnabled=true` (required; no opt-out). Matches plugin `useFeatures` RBAC in **`default`**.
- Non-priv users list boot volumes under **Volumes project** `openshift-virtualization-os-images` (PatternFly project dropdown on the InstanceTypes tab).
- Legacy console: `/templatescatalog/instanceTypes` tab. Wizard (when deployed): `creation-method-instance-type` tile and wizard customization steps.

## CRUD scope

| Operation                                                                      | Tier              | Spec                                            |
| ------------------------------------------------------------------------------ | ----------------- | ----------------------------------------------- |
| **Read** — grid lists OS preferences                                           | Gating            | InstanceTypes tab visible + row                 |
| **Read** — tab switch Template ↔ InstanceTypes                                 | Tier1 admin       | Tab round-trip                                  |
| **Read** — filter OS preferences on InstanceTypes tab                          | Tier1 admin       | Text filter                                     |
| **Create** — boot volume + series + VM (`catalog-instance-types-crud.spec.ts`) | Tier1 `@non-priv` | Full create/delete via legacy InstanceTypes tab |
| **Update** — custom VM name on legacy flow                                     | Tier1 `@non-priv` | Name field + create                             |
| **Customize** — wizard network tab / review create                             | Tier1 `@non-priv` | Wizard path when deployed; legacy name/details fallback via `catalog-instance-type-flow.ts` |
| **Create** — Windows boot preference when present                              | Tier2 admin       | Legacy or wizard; skipped if no Windows volume  |
| **Update** — alternate boot volume / series selection                          | Tier2 `@non-priv` | Affordance before create                        |

**VirtualMachineInstancetype** CRUD (namespace list, YAML create, labels, delete) lives under `tests/instance-types/`.
