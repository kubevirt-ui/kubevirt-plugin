# InstanceTypes (VirtualMachineInstancetype)

- **Specs:** `instance-types.spec.ts`
- **Nav:** Virtualization → InstanceTypes (`virtualmachineclusterinstancetypes-nav-item`) or direct list URLs in `ConsoleRoutes`.
- **Catalog tab:** Covered in `catalog-instance-types.spec.ts` (developer preview / bootable preferences).

| Scenario                         | Tags                                     |
| -------------------------------- | ---------------------------------------- |
| Cluster sizes listed             | Gating                                   |
| Create YAML + delete (namespace) | Gating, Tier1 admin                      |
| Update labels in UI              | Tier1 admin (API create, UI edit labels) |
| Delete from list in UI           | Tier2 admin (API create, UI delete)      |

Global setup enables `instanceTypesEnabled` when `kubevirt-ui-features` exists (created if missing).
