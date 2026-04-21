import React, { FC } from 'react';

import { NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';

import { getNetworkInterfaceStateIcon } from './utils';

export type NetworkIconProps = {
  configuredState: NetworkInterfaceState;
  runtimeState?: NetworkInterfaceState;
};

const NetworkIcon: FC<NetworkIconProps> = ({ configuredState, runtimeState }) => {
  const Icon = getNetworkInterfaceStateIcon(runtimeState ?? configuredState);

  return <Icon configuredState={configuredState} runtimeState={runtimeState} />;
};

export default NetworkIcon;
