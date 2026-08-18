import React, { type FC } from 'react';

import { type NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';

import { getNetworkInterfaceStateIcon } from './utils';

export type NetworkIconProps = {
  configuredState: NetworkInterfaceState;
  runtimeState?: NetworkInterfaceState;
};

const NetworkIcon: FC<NetworkIconProps> = ({ configuredState, runtimeState }) =>
  React.createElement(getNetworkInterfaceStateIcon(runtimeState ?? configuredState), {
    configuredState,
    runtimeState,
  });

export default NetworkIcon;
