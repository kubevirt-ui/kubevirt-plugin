import { TFunction } from 'react-i18next';

import { parseNADConfig } from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import {
  ClusterUserDefinedNetworkModel,
  NetworkAttachmentDefinitionModel,
  UserDefinedNetworkModel,
} from '@kubevirt-utils/models';
import { NADRole, NADTopology, NetworkTypeKeys } from '@kubevirt-utils/resources/nad/constants';
import { IPAM_MODE_DISABLED, UDNRole, UDNTopology } from '@kubevirt-utils/resources/udn/constants';
import { getNetwork } from '@kubevirt-utils/resources/udn/selectors';
import {
  ClusterUserDefinedNetworkKind,
  UserDefinedNetworkKind,
} from '@kubevirt-utils/resources/udn/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import { NetworkAttachmentDefinitionKind } from '@overview/OverviewTab/inventory-card/utils/types';

import { OtherVMNetwork, VMNetworkType } from './types';

const getVMNetworkTypeFromUDN = (
  udn: ClusterUserDefinedNetworkKind | UserDefinedNetworkKind,
): VMNetworkType => {
  const networkSpec = getNetwork(udn);
  const topology = networkSpec.topology;

  if (topology === UDNTopology.Localnet) {
    return VMNetworkType.LOCALNET;
  }

  if (networkSpec.layer2?.role === UDNRole.Primary) {
    return VMNetworkType.PRIMARY_UDN;
  }

  if (
    topology === UDNTopology.Layer2 &&
    networkSpec.layer2?.role === UDNRole.Secondary &&
    networkSpec.layer2?.ipam?.mode === IPAM_MODE_DISABLED
  ) {
    return VMNetworkType.SECONDARY_LAYER2_OVERLAY;
  }

  return VMNetworkType.INVALID;
};

const getVMNetworkTypeFromNAD = (nad: NetworkAttachmentDefinitionKind): VMNetworkType => {
  const config = parseNADConfig(nad);
  if (!config) return VMNetworkType.INVALID;

  const { role, topology, type } = config;

  if (type === NetworkTypeKeys.cnvBridgeNetworkType) {
    return VMNetworkType.LINUX_BRIDGE;
  }

  if (type === NetworkTypeKeys.sriovNetworkType) {
    return VMNetworkType.SRIOV;
  }

  if (type === NetworkTypeKeys.ovnKubernetesNetworkType) {
    if (topology === NADTopology.localnet) {
      return VMNetworkType.LOCALNET;
    }

    if (role !== NADRole.primary && topology === NADTopology.layer2) {
      return VMNetworkType.SECONDARY_LAYER2_OVERLAY;
    }
  }

  return VMNetworkType.INVALID;
};

const isNAD = (network: OtherVMNetwork): network is NetworkAttachmentDefinitionKind => {
  return network.kind === NetworkAttachmentDefinitionModel.kind;
};

export const getVMNetworkType = (network: OtherVMNetwork): VMNetworkType => {
  if (isNAD(network)) {
    return getVMNetworkTypeFromNAD(network);
  }
  return getVMNetworkTypeFromUDN(network);
};

export const getVMNetworkTypeLabel = (networkType: VMNetworkType, t: TFunction) =>
  ({
    [VMNetworkType.INVALID]: NO_DATA_DASH,
    [VMNetworkType.LINUX_BRIDGE]: t('Linux bridge'),
    [VMNetworkType.LOCALNET]: t('Localnet'),
    [VMNetworkType.PRIMARY_UDN]: t('Primary user-defined network'),
    [VMNetworkType.SECONDARY_LAYER2_OVERLAY]: t('Secondary layer2 overlay'),
    [VMNetworkType.SRIOV]: t('SR-IOV'),
  }[networkType]);

export const hasUDNOwner = (nad: NetworkAttachmentDefinitionKind): boolean =>
  nad?.metadata?.ownerReferences?.some(
    (owner) =>
      owner.kind === ClusterUserDefinedNetworkModel.kind ||
      owner.kind === UserDefinedNetworkModel.kind,
  ) ?? false;
