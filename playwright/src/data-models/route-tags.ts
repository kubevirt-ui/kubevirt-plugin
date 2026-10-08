/**
 * Route-aligned Playwright tags — mirror `playwright/tests/<route>/` folders.
 *
 * Filter examples:
 *   ./playwright-runner-hc-e2e.sh auto -g @route-vm-wizard
 *   ./playwright-runner-hc-e2e.sh Tier1 -g @route-bootable-volumes
 */

const ROUTE_TAG_BY_REL_DIR = {
  api: '@route-api',
  'bootable-volumes': '@route-bootable-volumes',
  checkups: '@route-checkups',
  'instance-types': '@route-instance-types',
  'migration-policies': '@route-migration-policies',
  quotas: '@route-quotas',
  'virtualization-landing': '@route-virtualization-landing',
  'virtualization-settings': '@route-virtualization-settings',
  'virtual-machines/actions': '@route-virtual-machines-actions',
  'virtual-machines/detail': '@route-virtual-machines-detail',
  'virtual-machines/detail/configuration': '@route-virtual-machines-detail-configuration',
  'virtual-machines/detail/diagnostics': '@route-virtual-machines-detail-diagnostics',
  'virtual-machines/detail/disks': '@route-virtual-machines-detail-disks',
  'virtual-machines/detail/network': '@route-virtual-machines-detail-network',
  'virtual-machines/detail/overview': '@route-virtual-machines-detail-overview',
  'virtual-machines/list': '@route-virtual-machines-list',
  'virtual-machines/migrations': '@route-virtual-machines-migrations',
  'vm-templates': '@route-vm-templates',
  'vm-wizard': '@route-vm-wizard',
} as const;

export const ROUTE_API_TAG = ROUTE_TAG_BY_REL_DIR.api;
export const ROUTE_BOOTABLE_VOLUMES_TAG = ROUTE_TAG_BY_REL_DIR['bootable-volumes'];
export const ROUTE_CHECKUPS_TAG = ROUTE_TAG_BY_REL_DIR.checkups;
export const ROUTE_INSTANCE_TYPES_TAG = ROUTE_TAG_BY_REL_DIR['instance-types'];
export const ROUTE_MIGRATION_POLICIES_TAG = ROUTE_TAG_BY_REL_DIR['migration-policies'];
export const ROUTE_QUOTAS_TAG = ROUTE_TAG_BY_REL_DIR.quotas;
export const ROUTE_VIRTUALIZATION_LANDING_TAG = ROUTE_TAG_BY_REL_DIR['virtualization-landing'];
export const ROUTE_VIRTUALIZATION_SETTINGS_TAG = ROUTE_TAG_BY_REL_DIR['virtualization-settings'];
export const ROUTE_VIRTUAL_MACHINES_ACTIONS_TAG = ROUTE_TAG_BY_REL_DIR['virtual-machines/actions'];
export const ROUTE_VIRTUAL_MACHINES_DETAIL_TAG = ROUTE_TAG_BY_REL_DIR['virtual-machines/detail'];
export const ROUTE_VIRTUAL_MACHINES_DETAIL_CONFIGURATION_TAG =
  ROUTE_TAG_BY_REL_DIR['virtual-machines/detail/configuration'];
export const ROUTE_VIRTUAL_MACHINES_DETAIL_DIAGNOSTICS_TAG =
  ROUTE_TAG_BY_REL_DIR['virtual-machines/detail/diagnostics'];
export const ROUTE_VIRTUAL_MACHINES_DETAIL_DISKS_TAG =
  ROUTE_TAG_BY_REL_DIR['virtual-machines/detail/disks'];
export const ROUTE_VIRTUAL_MACHINES_DETAIL_NETWORK_TAG =
  ROUTE_TAG_BY_REL_DIR['virtual-machines/detail/network'];
export const ROUTE_VIRTUAL_MACHINES_DETAIL_OVERVIEW_TAG =
  ROUTE_TAG_BY_REL_DIR['virtual-machines/detail/overview'];
export const ROUTE_VIRTUAL_MACHINES_LIST_TAG = ROUTE_TAG_BY_REL_DIR['virtual-machines/list'];
export const ROUTE_VIRTUAL_MACHINES_MIGRATIONS_TAG =
  ROUTE_TAG_BY_REL_DIR['virtual-machines/migrations'];
export const ROUTE_VM_TEMPLATES_TAG = ROUTE_TAG_BY_REL_DIR['vm-templates'];
export const ROUTE_VM_WIZARD_TAG = ROUTE_TAG_BY_REL_DIR['vm-wizard'];
