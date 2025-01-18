import { nadData } from '../../types/nad';

export const bridge = 'br0';

export const NAD_BRIDGE: nadData = {
  bridge: bridge,
  description: 'bridge nad',
  macSpoof: true,
  name: 'network-bridge',
  type: 'Bridge',
};

export const NAD_OVN: nadData = {
  description: 'ovn nad',
  name: 'network-ovn',
  type: 'OVN',
  //subnet: '192.168.1.1/24',
};

export const NAD_LOCALNET: nadData = {
  bridge: bridge,
  description: 'localnet nad',
  mtu: '1500',
  name: 'network-localnet',
  type: 'Localnet',
};
