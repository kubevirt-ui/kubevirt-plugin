import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';

export type SimpleNICPresentation = {
  config?: NetworkPresentation;
  configLinkState?: string;
  iface: { macAddress?: string; model?: string };
  interfaceName?: string;
  isAutoAttached: boolean;
  isInterfaceEphemeral: boolean;
  isPending: boolean;
  isSRIOV: boolean;
  metadata?: { name?: string };
  network: { multus?: { networkName: string }; name: string; pod?: object };
  runtimeLinkState?: string;
  type: string;
};
