/**
 * Route-aligned tags — mirror `playwright/tests/<route>/` folders (main layout).
 * release-4.13 suite (1:1 with release-4.12 route folders; no bootable-volumes/settings extras).
 * VM creation uses the wizard route (`/vm-wizard`); `catalog/` specs cover the template-catalog step.
 */
export const ROUTE_VIRTUALIZATION_LANDING_TAG = '@route-virtualization-landing';
export const ROUTE_VIRTUALIZATION_SETTINGS_TAG = '@route-virtualization-settings';
export const ROUTE_CATALOG_TAG = '@route-catalog';
export const ROUTE_VM_TEMPLATES_TAG = '@route-vm-templates';
export const ROUTE_MIGRATION_POLICIES_TAG = '@route-migration-policies';
export const ROUTE_DATASOURCES_TAG = '@route-datasources';
export const ROUTE_INSTANCE_TYPES_TAG = '@route-instance-types';
export const ROUTE_PREFERENCES_TAG = '@route-preferences';
export const ROUTE_BOOTABLE_VOLUMES_TAG = '@route-bootable-volumes';
export const ROUTE_VIRTUAL_MACHINES_LIST_TAG = '@route-virtual-machines-list';
export const ROUTE_VIRTUAL_MACHINES_DETAIL_TAG = '@route-virtual-machines-detail';
/** VM detail → Network interfaces tab (`tests/virtual-machines/detail/network/`). */
export const ROUTE_VIRTUAL_MACHINES_DETAIL_NETWORK_TAG = '@route-virtual-machines-detail-network';
/** Combined `@route-*` tags for network specs (detail parent + network sub-route). */
export const ROUTE_VIRTUAL_MACHINES_DETAIL_NETWORK_ROUTE_TAGS = `${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${ROUTE_VIRTUAL_MACHINES_DETAIL_NETWORK_TAG}`;
export const ROUTE_VIRTUAL_MACHINES_MIGRATIONS_TAG = '@route-virtual-machines-migrations';
