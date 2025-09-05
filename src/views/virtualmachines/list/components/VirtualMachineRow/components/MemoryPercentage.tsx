import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getMemoryUsagePercentage } from '@virtualmachines/list/metrics';
import { isRunning } from '@virtualmachines/utils';

type MemoryPercentageProps = {
  vm: V1VirtualMachine;
  vmiMemory: string;
};

const MemoryPercentage: FC<MemoryPercentageProps> = ({ vm, vmiMemory }) => {
  const memoryUsagePercentage = getMemoryUsagePercentage(vm, vmiMemory);

  if (isEmpty(memoryUsagePercentage) || !isRunning(vm)) return <span>{NO_DATA_DASH}</span>;

  return <span>{memoryUsagePercentage.toFixed(2)}%</span>;
};

export default MemoryPercentage;
