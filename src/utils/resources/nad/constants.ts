export enum NetworkTypeKeys {
  CnvBridgeNetworkType = 'bridge',
  OvnKubernetesNetworkType = 'ovn-k8s-cni-overlay',
  OvnKubernetesSecondaryLocalnet = 'ovn-k8s-cni-overlay-localnet',
  SriovNetworkType = 'sriov',
}

export enum NADTopology {
  Layer2 = 'layer2',
  Layer3 = 'layer3',
  Localnet = 'localnet',
}

export enum NADRole {
  Primary = 'primary',
  Secondary = 'secondary',
}

export const PRIMARY_UDN_KUBEVIRT_BINDING = 'primary-udn-kubevirt-binding';

export const PrimaryTopologies = [NADTopology.Layer2, NADTopology.Layer3];
export const SecondaryTopologies = [NADTopology.Localnet];
