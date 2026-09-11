import type { NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';
import type {
  ClusterUserDefinedNetworkKind,
  UserDefinedNetworkKind,
} from '@kubevirt-utils/resources/udn/types';

export enum VMNetworkType {
  INVALID = 'invalid',
  LINUX_BRIDGE = 'linux_bridge',
  LOCALNET = 'localnet',
  PRIMARY_UDN = 'primary_udn',
  SECONDARY_LAYER2_OVERLAY = 'secondary_layer2_overlay',
  SRIOV = 'sriov',
}

export type OtherVMNetwork =
  | ClusterUserDefinedNetworkKind
  | NetworkAttachmentDefinitionKind
  | UserDefinedNetworkKind;

export type OtherVMNetworkWithType = {
  type: VMNetworkType;
} & OtherVMNetwork;
