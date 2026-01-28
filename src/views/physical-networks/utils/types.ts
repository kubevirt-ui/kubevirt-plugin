import { IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui-ext/kubevirt-api/nmstate';

export type NodeEnactmentStateDetails = { node: IoK8sApiCoreV1Node; status: string };
export type NodeToEnactmentStateMap = Record<string, NodeEnactmentStateDetails>;
export type NNCPToNodeEnactmentStateMap = Record<string, NodeToEnactmentStateMap>;

export type ConfigurationDetails = {
  aggregationMode: string;
  configurationName: string;
  description: string;
  enactmentState: EnactmentState;
  mtu: number;
  nncp: V1NodeNetworkConfigurationPolicy;
  nodes: IoK8sApiCoreV1Node[];
  nodeToEnactmentStateMap: NodeToEnactmentStateMap;
  numNodes: number;
  physicalNetworkName: string;
  uplink: string;
};

export type ConfigurationDetailsMap = Record<string, ConfigurationDetails>;

export type PhysicalNetwork = {
  name: string;
  nncpDetails: ConfigurationDetails[];
  nncps: V1NodeNetworkConfigurationPolicy[];
  nodeCount?: number;
  physicalNetworkNodes: IoK8sApiCoreV1Node[];
};

export type PhysicalNetworks = PhysicalNetwork[];

export enum EnactmentState {
  // t('Aborted')
  Aborted = 'Aborted',
  // t('Available')
  Available = 'Available',
  // t('Failing')
  Failing = 'Failing',
  // t('Pending')
  Pending = 'Pending',
  // t('Progressing')
  Progressing = 'Progressing',
}

export enum ConnectionOption {
  BONDING_INTERFACE = 'bonding_interface',
  BREX = 'brex',
  SINGLE_DEVICE = 'single_device',
}
