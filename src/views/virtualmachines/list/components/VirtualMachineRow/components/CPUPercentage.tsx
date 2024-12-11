import React, { FC, memo } from 'react';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getVMMetrics } from '@virtualmachines/list/metrics';

type CPUPercentageProps = {
  vmName: string;
  vmNamespace: string;
};

const CPUPercentage: FC<CPUPercentageProps> = ({ vmName, vmNamespace }) => {
  const { cpuRequested, cpuUsage } = getVMMetrics(vmName, vmNamespace);

  if (isEmpty(cpuRequested) || isEmpty(cpuUsage)) return <span>{NO_DATA_DASH}</span>;

  const percentage = (cpuUsage * 100) / cpuRequested;
  return <span>{percentage.toFixed(2)}%</span>;
};

export default memo(CPUPercentage);
