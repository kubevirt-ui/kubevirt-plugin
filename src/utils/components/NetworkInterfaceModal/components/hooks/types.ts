export enum ExtraNADNamespaces {
  default = 'default',
  OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS = 'OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS',
  OPENSHIFT_MULTUS_NS = 'OPENSHIFT_MULTUS_NS',
}

export type NADListPermissionsMap = { [key in ExtraNADNamespaces]: boolean };
