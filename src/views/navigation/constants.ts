/**
 * Navigation IDs for the Virtualization section in the admin perspective.
 * These are used as `id`, `insertAfter`, and `insertBefore` values
 * across extension files to define navigation order.
 *
 * The Virtualization perspective reuses the same navigation structure
 * with IDs suffixed by VIRT_PERSPECTIVE_SUFFIX (see adaptNavForPerspective).
 */
export const NAV_ID = {
  BOOTABLE_VOLUMES: 'virtualization-bootablevolumes',
  CHECKUPS: 'virtualization-checkups',
  INSTANCE_TYPES: 'virtualmachineclusterinstancetypes',
  MIGRATION_POLICIES: 'migrationpolicies',
  QUOTAS: 'quotas',
  SECTION: 'virtualization',
  SEPARATOR_1: 'virtualization-separator-1',
  SEPARATOR_2: 'virtualization-separator-2',
  SEPARATOR_3: 'virtualization-separator-3',
  SETTINGS: 'virtualization-settings',
  TEMPLATES: 'templates',
  VIRTUAL_MACHINES: 'virtualmachines',
  VM_NETWORKS: 'vmnetwork',
} as const;

export const VIRT_SECTION_ID = 'virtualization';
