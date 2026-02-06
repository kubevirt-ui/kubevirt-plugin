import { VM_NETWORKS_OTHER_TYPES_PATH, VM_NETWORKS_PATH } from '../constants';

import { VMNetworkType } from './types';

export const TAB_INDEXES = {
  OTHER_VM_NETWORK_TYPES: 1,
  OVN_LOCALNET: 0,
};

export const TAB_INDEX_BY_PATH = {
  [VM_NETWORKS_OTHER_TYPES_PATH]: TAB_INDEXES.OTHER_VM_NETWORK_TYPES,
  [VM_NETWORKS_PATH]: TAB_INDEXES.OVN_LOCALNET,
};

export const PATH_BY_TAB_INDEX = {
  [TAB_INDEXES.OTHER_VM_NETWORK_TYPES]: VM_NETWORKS_OTHER_TYPES_PATH,
  [TAB_INDEXES.OVN_LOCALNET]: VM_NETWORKS_PATH,
};

export const VALID_OTHER_VM_NETWORK_TYPES = new Set([
  VMNetworkType.LINUX_BRIDGE,
  VMNetworkType.PRIMARY_UDN,
  VMNetworkType.SECONDARY_LAYER2_OVERLAY,
  VMNetworkType.SRIOV,
]);

export const NADS_LIST_PATH = '/k8s/all-namespaces/k8s.cni.cncf.io~v1~NetworkAttachmentDefinition';
