export enum UDNTopology {
  Layer2 = 'Layer2',
  Layer3 = 'Layer3',
  Localnet = 'Localnet',
}

export enum UDNRole {
  Primary = 'Primary',
  Secondary = 'Secondary',
}

export const IPAM_MODE_DISABLED = 'Disabled';
export const VLAN_MODE_ACCESS = 'Access';

export const UDN_LABEL = 'k8s.ovn.org/user-defined-network';
