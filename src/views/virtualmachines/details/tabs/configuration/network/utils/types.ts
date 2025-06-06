import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';

export type SimpleNICPresentation = {
  config?: NetworkPresentation;
  configLinkState?: string;
  iface: { macAddress?: string; model?: string };
  interfaceName?: string;
  isInterfaceEphemeral: boolean;
  isPending: boolean;
  isSRIOV: boolean;
  network: { multus?: { networkName: string }; name: string };
  runtimeLinkState?: string;
  type: string;
};
