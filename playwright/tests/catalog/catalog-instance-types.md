# Catalog — InstanceTypes (developer preview)

- **Route folder:** `tests/catalog/`
- **Latest version:** CNV 4.17.0
- **Latest update:** 2026-10-26
- **Specs:** `catalog-instance-types.spec.ts`, `catalog-instance-types-crud.spec.ts`, `catalog-instance-types-wizard.spec.ts`, `catalog-instance-types-legacy.spec.ts`
- **Fixture:** `@/fixtures/catalog-fixture`

## Prerequisites

- Global setup and each test patch `openshift-cnv/kubevirt-ui-features` → `instanceTypesEnabled=true` (required; no opt-out).
- Legacy console: `/templatescatalog/instanceTypes` tab. Wizard (when deployed): `creation-method-instance-type` tile.

## CRUD scope

| Operation                                                                      | Tier              | Spec                                            |
| ------------------------------------------------------------------------------ | ----------------- | ----------------------------------------------- |
| **Read** — grid lists OS preferences                                           | Gating            | InstanceTypes tab visible + row                 |
| **Read** — tab switch Template ↔ InstanceTypes                                 | Tier1 admin       | Tab round-trip                                  |
| **Read** — filter OS preferences on InstanceTypes tab                          | Tier1 admin       | Text filter                                     |
| **Create** — boot volume + series + VM (`catalog-instance-types-crud.spec.ts`) | Tier1 `@non-priv` | Full create/delete via legacy InstanceTypes tab |
| **Update** — custom VM name on legacy flow                                     | Tier1 `@non-priv` | Name field + create                             |
| **Customize** — wizard network tab / review create                             | Tier1 `@non-priv` | Skipped when only legacy catalog (uit-413)      |
| **Create** — Windows boot preference when present                              | Tier2 admin       | Legacy or wizard; skipped if no Windows volume  |
| **Update** — alternate boot volume / series selection                          | Tier2 `@non-priv` | Affordance before create                        |

**VirtualMachineInstancetype** CRUD (namespace list, YAML create, labels, delete) lives under `tests/instance-types/`.
