import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export const BASE_K8S_API_PATH = '/api/kubernetes';

export const FLEET_BASE_PATH = '/fleet-virtualization';

export const FLEET_VIRTUAL_MACHINES_PATH = `${FLEET_BASE_PATH}/virtualmachines`;
export const FLEET_TEMPLATES_PATH = `${FLEET_BASE_PATH}/templates`;
export const FLEET_BOOTABLE_VOLUMES_PATH = `${FLEET_BASE_PATH}/bootablevolumes`;
export const FLEET_INSTANCETYPES_PATH = `${FLEET_BASE_PATH}/instancetypes`;
export const FLEET_MIGRATION_POLICIES_PATH = `${FLEET_BASE_PATH}/migrationpolicies`;
export const FLEET_CHECKUPS_PATH = `${FLEET_BASE_PATH}/checkups`;
export const FLEET_OVERVIEW_PATH = `${FLEET_BASE_PATH}/overview`;
export const FLEET_CATALOG_PATH = `${FLEET_BASE_PATH}/catalog`;

export const KUBEVIRT_VM_PATH = 'kubevirt.io~v1~VirtualMachine';

export const FLAG_KUBEVIRT_DYNAMIC_ACM = 'KUBEVIRT_DYNAMIC_ACM';

export const FLAG_KUBEVIRT_DISALLOW_DYNAMIC_ACM = 'KUBEVIRT_DISALLOW_DYNAMIC_ACM';
export const CROSS_CLUSTER_MIGRATION_ACTION_ID = 'cross-cluster-migration';

export const CONSOLE_URL_CLAIM = 'consoleurl.cluster.open-cluster-management.io';

export const ManagedClusterModel: K8sModel = {
  abbr: 'MC',
  apiGroup: 'cluster.open-cluster-management.io',
  apiVersion: 'v1',
  crd: true,
  kind: 'ManagedCluster',
  label: 'ManagedCluster',
  labelPlural: 'ManagedClusters',
  namespaced: false,
  plural: 'managedclusters',
};
