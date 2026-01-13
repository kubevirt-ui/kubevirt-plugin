import { TFunction } from 'react-i18next';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  V1beta1NodeNetworkConfigurationEnactment,
  V1NodeNetworkConfigurationPolicy,
} from '@kubevirt-ui-ext/kubevirt-api/nmstate';
import {
  getEnactmentStateNNCP,
  getEnactmentStateNode,
  getEnactmentStatus,
} from '@kubevirt-utils/resources/nnce/utils/selectors';
import {
  getAggregationMode,
  getBondName,
  getBridgePortNames,
  getMTU,
  getNodeSelector,
  getPolicyLocalnetNames,
  getUplinkConnectionOption,
} from '@kubevirt-utils/resources/nncp/utils/selectors';
import { getDescription, getLabels, getName } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm';

import { DEFAULT_OVS_INTERFACE_NAME } from '../../../utils/constants';
import {
  ConfigurationDetails,
  ConfigurationDetailsMap,
  ConnectionOption,
  EnactmentState,
  NNCPToNodeEnactmentStateMap,
  NodeToEnactmentStateMap,
  PhysicalNetwork,
  PhysicalNetworks,
} from '../../../utils/types';

const allLabelsMatchSelector = (
  selector: Record<string, string>,
  labels: Record<string, string>,
): boolean => {
  if (!selector || !labels) return false;
  return Object.entries(selector).every(([key, value]) => key in labels && labels[key] === value);
};

export const filterNodes = (
  nodes: IoK8sApiCoreV1Node[],
  selector: Record<string, string>,
): IoK8sApiCoreV1Node[] =>
  nodes.filter((node) => allLabelsMatchSelector(selector, getLabels(node)));

const getConfigurationEnactmentState = (nodeToEnactmentStateMap: NodeToEnactmentStateMap) => {
  if (!nodeToEnactmentStateMap) return undefined;

  const enactmentStates = Object.values(nodeToEnactmentStateMap)?.map(
    (enactmentState) => enactmentState.status,
  );
  if (enactmentStates.includes(EnactmentState.Failing)) return EnactmentState.Failing;
  if (enactmentStates.includes(EnactmentState.Pending)) return EnactmentState.Pending;
  if (enactmentStates.includes(EnactmentState.Progressing)) return EnactmentState.Progressing;
  if (enactmentStates.includes(EnactmentState.Aborted)) return EnactmentState.Aborted;
  return EnactmentState.Available;
};

const getBridgePortsWithoutDefaultOVSIface = (policy: V1NodeNetworkConfigurationPolicy) =>
  getBridgePortNames(policy)?.filter((port) => port !== DEFAULT_OVS_INTERFACE_NAME) || [];

const getBondUplinkDisplayText = (policy: V1NodeNetworkConfigurationPolicy) => {
  const bondPorts = getBridgePortsWithoutDefaultOVSIface(policy).join(' + ');
  const bondName = getBondName(policy);
  const aggregationMode = getAggregationMode(policy);

  return `${bondName} (${bondPorts}), mode=(${aggregationMode})`;
};

export const getUplinkDisplayText = (policy: V1NodeNetworkConfigurationPolicy, t: TFunction) => {
  const connectionOption = getUplinkConnectionOption(policy);
  switch (connectionOption) {
    case ConnectionOption.BREX:
      return t("Cluster's default network");
    case ConnectionOption.SINGLE_DEVICE:
      return getBridgePortsWithoutDefaultOVSIface(policy)?.[0];
    case ConnectionOption.BONDING_INTERFACE:
      return getBondUplinkDisplayText(policy);
    default:
      return NO_DATA_DASH;
  }
};

export const getConfigurationDetails = (
  nncp: V1NodeNetworkConfigurationPolicy,
  nodes: IoK8sApiCoreV1Node[],
  nodeToEnactmentStateMap: NodeToEnactmentStateMap,
  t: TFunction,
): ConfigurationDetails => {
  const nncpNodes = filterNodes(nodes, getNodeSelector(nncp));

  return {
    aggregationMode: getAggregationMode(nncp),
    configurationName: getName(nncp),
    description: getDescription(nncp),
    enactmentState: getConfigurationEnactmentState(nodeToEnactmentStateMap),
    mtu: getMTU(nncp),
    nncp,
    nodes: nncpNodes,
    nodeToEnactmentStateMap,
    numNodes: nncpNodes?.length || 0,
    physicalNetworkName: '',
    uplink: getUplinkDisplayText(nncp, t),
  };
};

export const getConfigurationDetailsMap = (
  nncps: V1NodeNetworkConfigurationPolicy[],
  nodes: IoK8sApiCoreV1Node[],
  nnces: V1beta1NodeNetworkConfigurationEnactment[],
  t: TFunction,
) => {
  const nnceStateMap = getEnactmentStateMap(nnces, nodes);
  return nncps?.reduce((acc, nncp: V1NodeNetworkConfigurationPolicy) => {
    acc[getName(nncp)] = getConfigurationDetails(nncp, nodes, nnceStateMap?.[getName(nncp)], t);
    return acc;
  }, {} as ConfigurationDetailsMap);
};

export const getConfigurationDetailsByNNCPNames = (
  nncpNames: string[],
  nncpDetailsMap: ConfigurationDetailsMap,
) => nncpNames.map((nncpName) => nncpDetailsMap[nncpName]);

export const getNNCPNames = (nncps: V1NodeNetworkConfigurationPolicy[]) =>
  nncps.map((nncp) => getName(nncp));

const getNodeByName = (name: string, nodes: IoK8sApiCoreV1Node[]) =>
  nodes.find((node) => getName(node) === name);

export const getEnactmentStateMap = (
  nnces: V1beta1NodeNetworkConfigurationEnactment[],
  nodes: IoK8sApiCoreV1Node[],
) => {
  return (
    nnces?.reduce((acc, nnce) => {
      const nncp = getEnactmentStateNNCP(nnce);
      const nodeName = getEnactmentStateNode(nnce);
      const status = getEnactmentStatus(nnce);

      if (!nncp || !nodeName) return acc;

      if (!acc[nncp]) {
        acc[nncp] = { [nodeName]: { node: getNodeByName(nodeName, nodes), status } };
      } else {
        acc[nncp][nodeName] = { node: getNodeByName(nodeName, nodes), status };
      }

      return acc;
    }, {} as NNCPToNodeEnactmentStateMap) ?? {}
  );
};

const getPhysicalNetworkNodes = (physicalNetwork: PhysicalNetwork) => {
  const nodeSet = physicalNetwork?.nncpDetails?.reduce((acc, details) => {
    details?.nodes?.forEach((node) => acc.add(node));
    return acc;
  }, new Set<IoK8sApiCoreV1Node>());
  return [...nodeSet];
};

export const getPhysicalNetworks = (
  nncps: V1NodeNetworkConfigurationPolicy[],
  nodes: IoK8sApiCoreV1Node[],
  nnces: V1beta1NodeNetworkConfigurationEnactment[],
  t: TFunction,
): PhysicalNetworks => {
  const physicalNetworks = nncps.reduce((acc, nncp: V1NodeNetworkConfigurationPolicy) => {
    const physicalNetworkNames = getPolicyLocalnetNames(nncp);

    physicalNetworkNames.forEach((physicalNetworkName) => {
      const physicalNetwork = acc.find((network) => network.name === physicalNetworkName);
      if (!physicalNetwork) {
        acc.push({
          name: physicalNetworkName,
          nncpDetails: [],
          nncps: [nncp],
          nodeCount: null,
          physicalNetworkNodes: [],
        });
      } else {
        physicalNetwork.nncps.push(nncp);
      }
    });

    return acc;
  }, [] as PhysicalNetworks);

  const nncpDetailsMap = getConfigurationDetailsMap(nncps, nodes, nnces, t);

  physicalNetworks.forEach((physicalNetwork) => {
    physicalNetwork.nncpDetails = getConfigurationDetailsByNNCPNames(
      getNNCPNames(physicalNetwork?.nncps),
      nncpDetailsMap,
    );
    physicalNetwork.nncpDetails?.forEach(
      (details) => (details.physicalNetworkName = physicalNetwork.name),
    );
    physicalNetwork.physicalNetworkNodes = getPhysicalNetworkNodes(physicalNetwork);
    physicalNetwork.nodeCount = physicalNetwork.physicalNetworkNodes?.length;
  });

  return physicalNetworks;
};
