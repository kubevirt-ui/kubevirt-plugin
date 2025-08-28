import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export const BASE_K8S_API_PATH = '/api/kubernetes';

export const KUBEVIRT_VM_PATH = 'kubevirt.io~v1~VirtualMachine';

export const FLAG_KUBEVIRT_DYNAMIC_ACM = 'KUBEVIRT_DYNAMIC_ACM';
export const FEATURE_KUBEVIRT_ACM_TREEVIEW = 'kubevirtACMTreeview';

export const CROSS_CLUSTER_MIGRATION_ACTION_ID = 'cross-cluster-migration';

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
