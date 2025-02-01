import React, { FC } from 'react';
import xbytes from 'xbytes';

import { getMemorySize } from '@kubevirt-utils/components/CPUMemoryModal/utils/CpuMemoryUtils';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getVMMetrics } from '@virtualmachines/list/metrics';

type MemoryPercentageProps = {
  vmiMemory: string;
  vmName: string;
  vmNamespace: string;
};

const MemoryPercentage: FC<MemoryPercentageProps> = ({ vmiMemory, vmName, vmNamespace }) => {
  const { memoryUsage } = getVMMetrics(vmName, vmNamespace);

  if (isEmpty(memoryUsage) || isEmpty(vmiMemory)) return <span>{NO_DATA_DASH}</span>;

  const memoryRequested = getMemorySize(vmiMemory);

  const memoryAvailableBytes = xbytes.parseSize(
    `${memoryRequested?.size} ${memoryRequested?.unit}B`,
  );

  const percentage = (memoryUsage * 100) / memoryAvailableBytes;
  return <span>{percentage.toFixed(2)}%</span>;
};

export default MemoryPercentage;
