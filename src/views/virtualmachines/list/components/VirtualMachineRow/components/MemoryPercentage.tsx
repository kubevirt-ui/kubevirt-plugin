import React, { FC } from 'react';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getMemoryUsagePercentage } from '@virtualmachines/list/metrics';

type MemoryPercentageProps = {
  vmiMemory: string;
  vmName: string;
  vmNamespace: string;
};

const MemoryPercentage: FC<MemoryPercentageProps> = ({ vmiMemory, vmName, vmNamespace }) => {
  const memoryUsagePercentage = getMemoryUsagePercentage(vmName, vmNamespace, vmiMemory);

  if (isEmpty(memoryUsagePercentage)) return <span>{NO_DATA_DASH}</span>;

  return <span>{memoryUsagePercentage.toFixed(2)}%</span>;
};

export default MemoryPercentage;
