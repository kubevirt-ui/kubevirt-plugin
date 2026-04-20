import React, { FCC } from 'react';

import { NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';

import { getNetworkInterfaceStateIcon } from './utils';

export type NetworkIconProps = {
  configuredState: NetworkInterfaceState;
  runtimeState?: NetworkInterfaceState;
};

const NetworkIcon: FCC<NetworkIconProps> = ({ configuredState, runtimeState }) => {
  const Icon = getNetworkInterfaceStateIcon(runtimeState ?? configuredState);

  return <Icon configuredState={configuredState} runtimeState={runtimeState} />;
};

export default NetworkIcon;
