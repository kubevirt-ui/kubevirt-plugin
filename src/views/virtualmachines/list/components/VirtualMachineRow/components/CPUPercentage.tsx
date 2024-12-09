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

  const percentage = Math.round((cpuUsage * 10000) / cpuRequested) / 100;
  return <span>{percentage}%</span>;
};

export default memo(CPUPercentage);
