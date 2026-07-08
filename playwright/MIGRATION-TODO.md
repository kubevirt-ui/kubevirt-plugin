# Migration TODO List

Tracks the migration of Playwright specs from `kubevirt-ui` to `kubevirt-plugin` migration projects.

Source: `kubevirt-ui/playwright/tests/`
Target: `kubevirt-plugin/playwright/tests/migration-*/`

## Gating (5 specs)

- [x] `gating/scenario-checkups-toasts.spec.ts` → `migration-gating/checkups-toasts.spec.ts`
- [ ] `gating/scenario-create-vm-browsing.spec.ts`
- [ ] `gating/scenario-virtualization-pages.spec.ts`
- [ ] `gating/scenario-vm-creation-wizard.spec.ts`
- [ ] `gating/scenario-vm-management.spec.ts`

## Tier 1 (13 specs)

- [ ] `tier1/bootable-volumes/bootable-volumes.spec.ts`
- [ ] `tier1/checkups/checkups.spec.ts`
- [ ] `tier1/create-vm/create-vm-wizard-custom-config.spec.ts`
- [ ] `tier1/create-vm/create-vm-wizard-from-template.spec.ts`
- [ ] `tier1/create-vm/create-vm-yaml.ts`
- [ ] `tier1/instanceTypes/instanceType.spec.ts`
- [ ] `tier1/migrationpolicies/migration-policies.spec.ts`
- [ ] `tier1/templates/template-creation-flows.spec.ts`
- [ ] `tier1/templates/templates.spec.ts`
- [ ] `tier1/virtualmachines/vm-actions/vm-lifecycle-actions.spec.ts`
- [ ] `tier1/virtualmachines/vm-tabs/vm-configuration-details.spec.ts`
- [ ] `tier1/virtualmachines/vm-tabs/vm-configuration-scheduling.spec.ts`
- [ ] `tier1/virtualmachines/vm-tabs/vm-console-diagnostics.spec.ts`

## Tier 2 (7 specs)

- [ ] `tier2/create-vm/create-vm-wizard-clone.spec.ts`
- [ ] `tier2/networking/vm-networks-crud.spec.ts`
- [ ] `tier2/templates/template-detail-page.spec.ts`
- [ ] `tier2/virtualmachines/vm-configuration-lifecycle.spec.ts`
- [ ] `tier2/virtualmachines/vm-configuration-storage.spec.ts`
- [ ] `tier2/virtualmachines/vm-console-diagnostics.spec.ts`
- [ ] `tier2/virtualmachines/vm-overview-lifecycle.spec.ts`

## Settings (3 specs)

- [ ] `settings/aaq-quotas.spec.ts`
- [ ] `settings/cluster-settings.spec.ts`
- [ ] `settings/user-settings.spec.ts`

## Nonpriv (5 specs)

- [ ] `nonpriv/nonpriv-bootable-volumes-crud.spec.ts`
- [ ] `nonpriv/nonpriv-catalog-wizard.spec.ts`
- [ ] `nonpriv/nonpriv-instance-types-crud.spec.ts`
- [ ] `nonpriv/nonpriv-overview-templates.spec.ts`
- [ ] `nonpriv/nonpriv-templates-crud.spec.ts`

## Migrations (2 specs)

- [ ] `migrations/vm-migration-compute.spec.ts`
- [ ] `migrations/vm-migration-storage.spec.ts`

---

**Total: 35 specs** | **Migrated: 1** | **Remaining: 34**
