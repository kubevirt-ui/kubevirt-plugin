import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
  NodeNetworkConfigurationInterfaceBridgePort,
  V1NodeNetworkConfigurationPolicy,
} from '@kubevirt-ui-ext/kubevirt-api/nmstate';

import {
  DEFAULT_OVN_BRIDGE_NAME,
  OVN_BRIDGE_MAPPINGS,
} from '../../../../views/physical-networks/utils/constants';
import { ConnectionOption } from '../../../../views/physical-networks/utils/types';

import { LINK_AGGREGATION } from './constants';

export const getOVN = (policy: V1NodeNetworkConfigurationPolicy) => policy?.spec?.desiredState?.ovn;

export const getBridgeMappings = (policy: V1NodeNetworkConfigurationPolicy) =>
  getOVN(policy)?.[OVN_BRIDGE_MAPPINGS];

export const getPolicyLocalnetNames = (policy: V1NodeNetworkConfigurationPolicy) => {
  const bridgeMappings = getBridgeMappings(policy) || [];
  const allMappings: string[] = bridgeMappings
    .map((mapping) => mapping.localnet)
    .filter((name): name is string => Boolean(name));
  return [...new Set(allMappings)];
};

export const getPolicyInterfaces = (
  policy: V1NodeNetworkConfigurationPolicy,
): NodeNetworkConfigurationInterface[] => policy.spec?.desiredState?.interfaces || [];

export const getPolicyBridgingInterfaces = (
  policy: V1NodeNetworkConfigurationPolicy,
): NodeNetworkConfigurationInterface[] =>
  getPolicyInterfaces(policy)?.filter((iface) =>
    [InterfaceType.LINUX_BRIDGE, InterfaceType.OVS_BRIDGE].includes(iface.type),
  ) || [];

export const getPolicyBondingInterfaces = (
  policy: V1NodeNetworkConfigurationPolicy,
): NodeNetworkConfigurationInterface[] =>
  getPolicyInterfaces(policy)?.filter((iface) => iface.type === InterfaceType.BOND) || [];

export const getBridgeInterface = (
  policy: V1NodeNetworkConfigurationPolicy,
): NodeNetworkConfigurationInterface => getPolicyBridgingInterfaces(policy)?.[0];

export const getBridgePorts = (
  policy: V1NodeNetworkConfigurationPolicy,
): NodeNetworkConfigurationInterfaceBridgePort[] => getBridgeInterface(policy)?.bridge?.port || [];

export const getOVSBridgeBondPort = (
  policy: V1NodeNetworkConfigurationPolicy,
): NodeNetworkConfigurationInterfaceBridgePort =>
  getBridgePorts(policy)?.find((port) => port?.[LINK_AGGREGATION]);

export const getBondInterface = (
  policy: V1NodeNetworkConfigurationPolicy,
): NodeNetworkConfigurationInterface => getPolicyBondingInterfaces(policy)?.[0];

export const getBond = (
  policy: V1NodeNetworkConfigurationPolicy,
): NodeNetworkConfigurationInterface | NodeNetworkConfigurationInterfaceBridgePort =>
  getBondInterface(policy) || getOVSBridgeBondPort(policy);

export const getBondName = (policy: V1NodeNetworkConfigurationPolicy) => getBond(policy)?.name;

export const getLinkAggregationSettings = (policy: V1NodeNetworkConfigurationPolicy) =>
  getBondInterface(policy)?.[LINK_AGGREGATION] || getOVSBridgeBondPort(policy)?.[LINK_AGGREGATION];

export const getBridgeManagementInterface = (policy: V1NodeNetworkConfigurationPolicy) =>
  getPolicyInterfaces(policy)?.filter((iface) => iface?.type === InterfaceType.OVS_INTERFACE)?.[0];

export const getMTU = (policy: V1NodeNetworkConfigurationPolicy) =>
  getBridgeManagementInterface(policy)?.mtu;

export const getAggregationMode = (policy: V1NodeNetworkConfigurationPolicy) =>
  getLinkAggregationSettings(policy)?.mode ||
  getOVSBridgeBondPort(policy)?.[LINK_AGGREGATION]?.mode;

export const getNodeSelector = (policy: V1NodeNetworkConfigurationPolicy): Record<string, any> =>
  policy?.spec?.nodeSelector;

export const getBridgePortNames = (policy: V1NodeNetworkConfigurationPolicy): string[] =>
  getBridgePorts(policy)
    ?.map((port) => port?.name)
    .filter((name): name is string => Boolean(name));

export const getOVNBridgeMapping = (policy: V1NodeNetworkConfigurationPolicy) =>
  getBridgeMappings(policy)?.[0];

export const getOVNBridgeName = (policy: V1NodeNetworkConfigurationPolicy): string =>
  getOVNBridgeMapping(policy)?.bridge;

export const getUplinkConnectionOption = (
  policy: V1NodeNetworkConfigurationPolicy,
): ConnectionOption => {
  if (getOVNBridgeName(policy) === DEFAULT_OVN_BRIDGE_NAME) return ConnectionOption.BREX;
  if (getBondName(policy)) return ConnectionOption.BONDING_INTERFACE;
  return ConnectionOption.SINGLE_DEVICE;
};
