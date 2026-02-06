import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { PROJECT_NAME_LABEL_KEY } from '@kubevirt-utils/constants/constants';
import { ClusterUserDefinedNetworkModel } from '@kubevirt-utils/models';
import { IPAM_MODE_DISABLED, UDNRole, UDNTopology } from '@kubevirt-utils/resources/udn/constants';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';

export const DEFAULT_MTU = 1500;
export const NODE_NETWORK_MAPPING_PARAM_KEY = 'physicalNetworkName';

export const getDefaultVMNetwork = (nodeNetworkMapping = ''): ClusterUserDefinedNetworkKind => ({
  apiVersion: `${ClusterUserDefinedNetworkModel.apiGroup}/${ClusterUserDefinedNetworkModel.apiVersion}`,
  kind: ClusterUserDefinedNetworkModel.kind,
  metadata: {
    annotations: {},
    name: '',
  },
  spec: {
    namespaceSelector: { matchLabels: { [PROJECT_NAME_LABEL_KEY]: DEFAULT_NAMESPACE } },
    network: {
      localnet: {
        ipam: {
          mode: IPAM_MODE_DISABLED,
        },
        mtu: null, // null on purpose so setting mtu to maxMTU (or DEFAULT_MTU) is done only once
        physicalNetworkName: nodeNetworkMapping,
        role: UDNRole.Secondary,
      },
      topology: UDNTopology.Localnet,
    },
  },
});

export enum ProjectMappingOption {
  AllProjects = 'all-projects',
  SelectByLabels = 'select-by-labels',
  SelectFromList = 'select-from-list',
}

export type VMNetworkForm = {
  network: ClusterUserDefinedNetworkKind;
  projectMappingOption: ProjectMappingOption;
};

export const getDefaultFormValue = (nodeNetworkMapping?: string): VMNetworkForm => ({
  network: getDefaultVMNetwork(nodeNetworkMapping),
  projectMappingOption: ProjectMappingOption.AllProjects,
});

export const MIN_VLAN_ID = 1;
export const MAX_VLAN_ID = 4094;

export const OVN_BRIDGE_MAPPINGS = 'bridge-mappings';
export const PREFIX_PHYSNET = 'physnet';
