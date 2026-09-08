import React, { FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getMemoryUsageDisplayValue } from '@virtualmachines/list/usageDisplayValues';

type MemoryPercentageProps = {
  vm: V1VirtualMachine;
  vmiMemory: string | undefined;
};

const MemoryPercentage: FC<MemoryPercentageProps> = ({ vm, vmiMemory }) => (
  <span>{getMemoryUsageDisplayValue(vm, vmiMemory)}</span>
);

export default MemoryPercentage;
