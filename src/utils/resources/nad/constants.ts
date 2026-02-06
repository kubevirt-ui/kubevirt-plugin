export enum NetworkTypeKeys {
  cnvBridgeNetworkType = 'bridge',
  ovnKubernetesNetworkType = 'ovn-k8s-cni-overlay',
  ovnKubernetesSecondaryLocalnet = 'ovn-k8s-cni-overlay-localnet',
  sriovNetworkType = 'sriov',
}

export enum NADTopology {
  layer2 = 'layer2',
  layer3 = 'layer3',
  localnet = 'localnet',
}

export enum NADRole {
  primary = 'primary',
  secondary = 'secondary',
}

export const PrimaryTopologies = [NADTopology.layer2, NADTopology.layer3];
export const SecondaryTopologies = [NADTopology.localnet];
