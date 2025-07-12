import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export const BASE_ACM_VM_PATH = '/multicloud/infrastructure/virtualmachines';
export const BASE_K8S_API_PATH = '/api/kubernetes';

export const FLAG_KUBEVIRT_DYNAMIC_ACM = 'KUBEVIRT_DYNAMIC_ACM';

export const ManagedClusterModel: K8sModel = {
  abbr: 'MC',
  apiGroup: 'clusterview.open-cluster-management.io',
  apiVersion: 'v1',
  crd: true,
  kind: 'ManagedCluster',
  label: 'ManagedCluster',
  labelPlural: 'ManagedClusters',
  namespaced: false,
  plural: 'managedclusters',
};
