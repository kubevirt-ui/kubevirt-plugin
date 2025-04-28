import React, { FC } from 'react';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCPUUsagePercentage } from '@virtualmachines/list/metrics';

type CPUPercentageProps = {
  vmName: string;
  vmNamespace: string;
};

const CPUPercentage: FC<CPUPercentageProps> = ({ vmName, vmNamespace }) => {
  const cpuUsagePercentage = getCPUUsagePercentage(vmName, vmNamespace);

  if (isEmpty(cpuUsagePercentage)) return <span>{NO_DATA_DASH}</span>;

  return <span>{cpuUsagePercentage.toFixed(2)}%</span>;
};

export default CPUPercentage;
