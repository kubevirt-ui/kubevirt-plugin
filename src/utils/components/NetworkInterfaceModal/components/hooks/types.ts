import { NetworkAttachmentDefinitionSpec } from 'src/views/clusteroverview/OverviewTab/inventory-card/utils/types';

import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export enum ExtraNADNamespaces {
  default = 'default',
  OPENSHIFT_MULTUS_NS = 'OPENSHIFT_MULTUS_NS',
  OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS = 'OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS',
}

export type NADListPermissionsMap = { [key in ExtraNADNamespaces]: boolean };

export type NetworkAttachmentDefinition = K8sResourceCommon & {
  spec: NetworkAttachmentDefinitionSpec;
};

export type UseNADsData = (namespace: string) => {
  loaded: boolean;
  loadError: string;
  nads: NetworkAttachmentDefinition[];
};
