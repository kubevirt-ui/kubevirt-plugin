/**
 * Route-aligned tags — mirror `playwright/tests/<route>/` folders (main layout).
 * 4.12 subset only (no bootable-volumes, settings, instance-types, etc.).
 * VM creation lives on the Catalog route (`/templatescatalog`), not a separate vm-wizard nav item.
 */
export const ROUTE_VIRTUALIZATION_LANDING_TAG = '@route-virtualization-landing';
export const ROUTE_CATALOG_TAG = '@route-catalog';
export const ROUTE_VM_TEMPLATES_TAG = '@route-vm-templates';
export const ROUTE_MIGRATION_POLICIES_TAG = '@route-migration-policies';
export const ROUTE_DATASOURCES_TAG = '@route-datasources';
export const ROUTE_VIRTUAL_MACHINES_LIST_TAG = '@route-virtual-machines-list';
export const ROUTE_VIRTUAL_MACHINES_DETAIL_TAG = '@route-virtual-machines-detail';
/** VM detail → Network interfaces tab (`tests/virtual-machines/detail/network/`). */
export const ROUTE_VIRTUAL_MACHINES_DETAIL_NETWORK_TAG = '@route-virtual-machines-detail-network';
/** Combined `@route-*` tags for network specs (detail parent + network sub-route). */
export const ROUTE_VIRTUAL_MACHINES_DETAIL_NETWORK_ROUTE_TAGS = `${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${ROUTE_VIRTUAL_MACHINES_DETAIL_NETWORK_TAG}`;
export const ROUTE_VIRTUAL_MACHINES_MIGRATIONS_TAG = '@route-virtual-machines-migrations';
