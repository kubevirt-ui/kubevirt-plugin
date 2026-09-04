import React, { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getNetworkUsageDisplayValue } from '@virtualmachines/list/usageDisplayValues';

type NetworkUsageProps = {
  vm: V1VirtualMachine;
};

const NetworkUsage: FC<NetworkUsageProps> = ({ vm }) => (
  <span>{getNetworkUsageDisplayValue(vm)}</span>
);

export default NetworkUsage;
