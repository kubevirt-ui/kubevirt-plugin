import { TFunction } from 'react-i18next';

import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
  OVNBridgeMapping,
  V1beta1NodeNetworkState,
  V1NodeNetworkConfigurationPolicy,
  V1NodeNetworkConfigurationPolicySpec,
} from '@kubevirt-ui-ext/kubevirt-api/nmstate';
import { MAX_MTU } from '@kubevirt-utils/constants/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ValidatedOptions } from '@patternfly/react-core';

import { MAX_VLAN_ID, MIN_VLAN_ID, OVN_BRIDGE_MAPPINGS, PREFIX_PHYSNET } from '../constants';

const getBridgePorts = (bridgeInterfaces: NodeNetworkConfigurationInterface[]) =>
  bridgeInterfaces.flatMap((iface) => {
    const ports = iface.bridge?.port;

    if (ports?.length !== 1) {
      return [];
    }

    const port = ports[0];

    return port['link-aggregation']?.port?.map((p) => p.name) ?? port.name;
  });

export const getBridgeMTU = (
  bridgeName: string,
  nncpSpec: V1NodeNetworkConfigurationPolicySpec,
  nodeNetworkState: V1beta1NodeNetworkState,
) => {
  if (bridgeName === 'br-ex') {
    return (
      (nodeNetworkState?.status?.currentState?.interfaces?.find(
        (iface: NodeNetworkConfigurationInterface) =>
          iface.name === bridgeName && iface.type === InterfaceType.OVS_INTERFACE,
      )?.mtu as number) ?? Infinity
    );
  }

  const interfaces: NodeNetworkConfigurationInterface[] = nncpSpec.desiredState?.interfaces;
  const bridgeInterfaces = interfaces?.filter(
    (iface) => iface.name === bridgeName && iface.type === InterfaceType.OVS_BRIDGE,
  );

  if (isEmpty(bridgeInterfaces)) {
    return Infinity;
  }

  const ports = getBridgePorts(bridgeInterfaces);
  const portInterfaces = interfaces.filter((iface) => ports.includes(iface.name));

  const mtus = portInterfaces.map((iface) => iface.mtu ?? Infinity);

  return Math.min(...mtus);
};

const getBridgeMappings = (nncpSpec: V1NodeNetworkConfigurationPolicySpec): OVNBridgeMapping[] =>
  nncpSpec?.desiredState?.ovn?.[OVN_BRIDGE_MAPPINGS] ?? [];

export const getBridgeNames = (
  localnet: string,
  nncpSpec: V1NodeNetworkConfigurationPolicySpec,
): string[] =>
  getBridgeMappings(nncpSpec)
    .filter((mapping) => mapping.localnet === localnet)
    .map((mapping) => mapping.bridge);

export const getNNCPSpecListForLocalnetObject = (
  policies: V1NodeNetworkConfigurationPolicy[],
): Record<string, V1NodeNetworkConfigurationPolicySpec[]> =>
  policies?.reduce((result, policy) => {
    const mappings = getBridgeMappings(policy.spec);

    return mappings.reduce((acc, mapping) => {
      const localnet = mapping.localnet;

      if (!localnet.startsWith(PREFIX_PHYSNET)) {
        if (!acc[localnet]) {
          acc[localnet] = [];
        }
        if (!acc[localnet].includes(policy.spec)) {
          acc[localnet].push(policy.spec);
        }
      }

      return acc;
    }, result);
  }, {} as Record<string, V1NodeNetworkConfigurationPolicySpec[]>) ?? {};

export const getMTUValidatedInfo = (mtu: number, maxMTUFromLocalnet: number, t: TFunction) => {
  if (mtu > MAX_MTU) {
    return {
      message: t('MTU is higher than {{MAX_MTU}} bytes, which is a maximum possible MTU.', {
        MAX_MTU,
      }),
      validated: ValidatedOptions.error,
    };
  }

  if (mtu > maxMTUFromLocalnet) {
    return {
      message: t(
        'MTU is higher than {{maxMTUFromLocalnet}} bytes, which is a maximum that the selected node network can guarantee. This may cause packet fragmentation.',
        {
          maxMTUFromLocalnet,
        },
      ),
      validated: ValidatedOptions.warning,
    };
  }

  return {
    message: undefined,
    validated: ValidatedOptions.default,
  };
};

export const getVLANIDValidatedOption = (value: number) =>
  isNaN(value) || (value >= MIN_VLAN_ID && value <= MAX_VLAN_ID)
    ? ValidatedOptions.default
    : ValidatedOptions.error;
