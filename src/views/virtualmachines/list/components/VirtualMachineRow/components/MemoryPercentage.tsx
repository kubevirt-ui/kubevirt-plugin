import React, { FC, memo } from 'react';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getVMMetrics } from '@virtualmachines/list/metrics';

type MemoryPercentageProps = {
  vmName: string;
  vmNamespace: string;
};

const MemoryPercentage: FC<MemoryPercentageProps> = ({ vmName, vmNamespace }) => {
  const { memoryRequested, memoryUsage } = getVMMetrics(vmName, vmNamespace);

  if (isEmpty(memoryRequested) || isEmpty(memoryUsage)) return <span>{NO_DATA_DASH}</span>;

  const percentage = Math.round((memoryUsage / memoryRequested) * 10000) / 100;
  return <span>{percentage}%</span>;
};

export default memo(MemoryPercentage);
