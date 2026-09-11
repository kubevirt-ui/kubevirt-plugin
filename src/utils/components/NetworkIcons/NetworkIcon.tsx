import { createElement, type FC } from 'react';

import { type NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';

import { getNetworkInterfaceStateIcon } from './utils';

export type NetworkIconProps = {
  configuredState: NetworkInterfaceState;
  runtimeState?: NetworkInterfaceState;
};

const NetworkIcon: FC<NetworkIconProps> = ({ configuredState, runtimeState }) =>
  createElement(getNetworkInterfaceStateIcon(runtimeState ?? configuredState), {
    configuredState,
    runtimeState,
  });

export default NetworkIcon;
