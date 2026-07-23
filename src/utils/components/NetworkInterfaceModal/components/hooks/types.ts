import { NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';

export enum ExtraNADNamespaces {
  default = 'default',
  OPENSHIFT_MULTUS_NS = 'OPENSHIFT_MULTUS_NS',
  OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS = 'OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS',
}

export type NADListPermissionsMap = { [key in ExtraNADNamespaces]: boolean };

export type UseNADsData = (
  namespace: string,
  cluster?: string,
) => {
  loaded: boolean;
  loadError: string;
  nads: NetworkAttachmentDefinitionKind[];
  primaryNADs: NetworkAttachmentDefinitionKind[];
};
